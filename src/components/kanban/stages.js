// Keys match the values stored in candidates.status in the database.
export const STAGES = [
  { key: 'applied', label: 'Applied' },
  { key: 'screening', label: 'Screening' },
  { key: 'interview', label: 'Interview' },
  { key: 'offer', label: 'Offer' },
  { key: 'hired', label: 'Hired' },
  { key: 'rejected', label: 'Rejected' },
]

// Some rows predate the current stage keys and still hold the column's old
// default value ('new'). Map those legacy values onto their current
// equivalent so those candidates keep showing up on the board instead of
// silently falling out of every column's filter.
const LEGACY_STAGE_ALIASES = {
  new: 'applied',
}

export function normalizeStage(stage) {
  if (!stage) return stage
  const key = String(stage).trim().toLowerCase()
  return LEGACY_STAGE_ALIASES[key] ?? stage
}
