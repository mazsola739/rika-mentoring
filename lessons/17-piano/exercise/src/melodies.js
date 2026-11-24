// Melodies for the teaching mode (advanced level). Each note is a MIDI number:
// 60 = C4 (middle C), 62 = D4, 64 = E4, 65 = F4, 67 = G4, 69 = A4, 71 = B4, 72 = C5.
// Every melody fits in the 4th octave, so all of its keys are on screen when the octave is 4.
export const MELODIES = [
  {
    id: 'ode-to-joy',
    title: 'Ode to Joy',
    notes: [64, 64, 65, 67, 67, 65, 64, 62, 60, 60, 62, 64, 64, 62, 62, 64, 64, 65, 67, 67, 65, 64, 62, 60, 60, 62, 64, 62, 60, 60],
  },
  {
    id: 'twinkle',
    title: 'Twinkle, Twinkle, Little Star',
    notes: [60, 60, 67, 67, 69, 69, 67, 65, 65, 64, 64, 62, 62, 60],
  },
  {
    id: 'frere-jacques',
    title: 'Frère Jacques',
    notes: [60, 62, 64, 60, 60, 62, 64, 60, 64, 65, 67, 64, 65, 67, 67, 69, 67, 65, 64, 60, 67, 69, 67, 65, 64, 60],
  },
]
