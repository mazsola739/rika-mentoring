// The tags of a post, each one a link to the list of posts with that tag.
export default function TagList({ tags, label }) {
  if (tags.length === 0) return null

  return (
    <ul className="bl-tags" aria-label={label}>
      {tags.map((tag) => (
        <li key={tag}>
          <a className="bl-tag" href={`#/tag/${encodeURIComponent(tag)}`}>
            #{tag}
          </a>
        </li>
      ))}
    </ul>
  )
}
