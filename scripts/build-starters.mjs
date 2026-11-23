// Builds the downloadable starter project of every lesson that has one:
//   starters/_base/      the common Vite + React project (package.json, vite.config.js, index.html, src/…)
//   starters/<slug>/     what this lesson adds or replaces, plus starter.json (folder name, titles)
// The result, public/starters/<slug>.zip, is a ready git repository with one "starting point" commit,
// so a student can always get back to the start with `git restore .`.
// Run with: npm run starters (it also runs before dev and build). Needs git; no npm packages.
import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { crc32, deflateRawSync } from 'node:zlib'

const root = fileURLToPath(new URL('..', import.meta.url))
const startersDir = join(root, 'starters')
const outDir = join(root, 'public', 'starters')
const lessons = JSON.parse(readFileSync(join(root, 'shared', 'lessons.json'), 'utf8'))
const site = JSON.parse(readFileSync(join(startersDir, 'site.json'), 'utf8'))

// The same date in every build, so an unchanged starter gives the same commit and the same ZIP.
const FIXED_DATE = '2026-01-01T09:00:00Z'
const DOS_TIME = 9 << 11
const DOS_DATE = ((2026 - 1980) << 9) | (1 << 5) | 1

// ── A minimal ZIP writer (deflate, UTF-8 names) ────────────────────────────
function zip(files) {
  const locals = []
  const centrals = []
  let offset = 0
  for (const { name, data } of files) {
    const nameBuf = Buffer.from(name, 'utf8')
    const isDir = name.endsWith('/')
    const raw = data ?? Buffer.alloc(0)
    const packed = isDir ? raw : deflateRawSync(raw, { level: 9 })
    const method = isDir ? 0 : 8
    const crc = isDir ? 0 : crc32(raw)
    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(20, 4)
    local.writeUInt16LE(0x0800, 6) // names are UTF-8
    local.writeUInt16LE(method, 8)
    local.writeUInt16LE(DOS_TIME, 10)
    local.writeUInt16LE(DOS_DATE, 12)
    local.writeUInt32LE(crc, 14)
    local.writeUInt32LE(packed.length, 18)
    local.writeUInt32LE(raw.length, 22)
    local.writeUInt16LE(nameBuf.length, 26)
    local.writeUInt16LE(0, 28)
    const central = Buffer.alloc(46)
    central.writeUInt32LE(0x02014b50, 0)
    central.writeUInt16LE(20, 4)
    central.writeUInt16LE(20, 6)
    central.writeUInt16LE(0x0800, 8)
    central.writeUInt16LE(method, 10)
    central.writeUInt16LE(DOS_TIME, 12)
    central.writeUInt16LE(DOS_DATE, 14)
    central.writeUInt32LE(crc, 16)
    central.writeUInt32LE(packed.length, 20)
    central.writeUInt32LE(raw.length, 24)
    central.writeUInt16LE(nameBuf.length, 28)
    central.writeUInt32LE(isDir ? 0x10 : 0, 38) // directory attribute
    central.writeUInt32LE(offset, 42)
    locals.push(local, nameBuf, packed)
    centrals.push(central, nameBuf)
    offset += local.length + nameBuf.length + packed.length
  }
  const centralSize = centrals.reduce((sum, b) => sum + b.length, 0)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(files.length, 8)
  end.writeUInt16LE(files.length, 10)
  end.writeUInt32LE(centralSize, 12)
  end.writeUInt32LE(offset, 16)
  return Buffer.concat([...locals, ...centrals, end])
}

// Every file and folder under `dir`, as ZIP entries inside `prefix/`.
function entries(dir, prefix) {
  const out = [{ name: `${prefix}/` }]
  const walk = (current) => {
    for (const name of readdirSync(current).sort()) {
      const full = join(current, name)
      const path = `${prefix}/${relative(dir, full).split(sep).join('/')}`
      if (statSync(full).isDirectory()) {
        out.push({ name: `${path}/` })
        walk(full)
      } else out.push({ name: path, data: readFileSync(full) })
    }
  }
  walk(dir)
  return out
}

const fill = (text, values) => text.replace(/\{\{(\w+)\}\}/g, (m, key) => values[key] ?? m)
const TEXT_FILE = /\.(md|json|html|jsx?|css|txt)$|^\.gitignore$/

function git(cwd, args) {
  execFileSync('git', args, {
    cwd,
    stdio: 'pipe',
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: 'Rika Mentoring',
      GIT_AUTHOR_EMAIL: 'starter@rika-mentoring.invalid',
      GIT_AUTHOR_DATE: FIXED_DATE,
      GIT_COMMITTER_NAME: 'Rika Mentoring',
      GIT_COMMITTER_EMAIL: 'starter@rika-mentoring.invalid',
      GIT_COMMITTER_DATE: FIXED_DATE,
    },
  })
}

mkdirSync(outDir, { recursive: true })
const built = []
for (const lesson of lessons) {
  const own = join(startersDir, lesson.slug)
  if (!existsSync(own)) continue
  const meta = JSON.parse(readFileSync(join(own, 'starter.json'), 'utf8'))
  const work = mkdtempSync(join(tmpdir(), 'rika-starter-'))
  const project = join(work, meta.folder)
  try {
    cpSync(join(startersDir, '_base'), project, { recursive: true })
    cpSync(own, project, { recursive: true, filter: (src) => !src.endsWith('starter.json') })

    const values = {
      FOLDER: meta.folder,
      N: String(lesson.n).padStart(2, '0'),
      TITLE_EN: lesson.en.title,
      TITLE_HU: lesson.hu.title,
      GUIDE_URL: `${site.url}apps/${lesson.slug}/?view=guide`,
      SOLUTION_URL: `${site.url}apps/${lesson.slug}/?view=solution`,
      SITE_URL: site.url,
    }
    const walk = (dir) => {
      for (const name of readdirSync(dir)) {
        const full = join(dir, name)
        if (statSync(full).isDirectory()) walk(full)
        else if (TEXT_FILE.test(name)) writeFileSync(full, fill(readFileSync(full, 'utf8'), values))
      }
    }
    walk(project)

    // A fresh repository with one commit (no sample hooks, LF line endings kept as they are).
    git(project, ['-c', 'init.defaultBranch=main', 'init', '--quiet', '--template='])
    git(project, ['-c', 'core.autocrlf=false', 'add', '--all'])
    git(project, ['-c', 'core.autocrlf=false', 'commit', '--quiet', '-m', 'Kezdőállapot / Starting point'])

    const file = join(outDir, `${lesson.slug}.zip`)
    const data = zip(entries(project, meta.folder))
    writeFileSync(file, data)
    built.push(`${lesson.slug} (${Math.round(data.length / 1024)} KB)`)
  } finally {
    rmSync(work, { recursive: true, force: true })
  }
}
console.log(`starters: ${built.length ? built.join(', ') : 'none'}`)
