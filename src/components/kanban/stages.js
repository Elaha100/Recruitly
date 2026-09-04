// Keys match the values stored in candidates.status in the database
// ('new' is the column's existing default value; displayed as "Applied").
export const STAGES = [
  { key: 'new', label: 'Applied' },
  { key: 'screening', label: 'Screening' },
  { key: 'interview', label: 'Interview' },
  { key: 'offer', label: 'Offer' },
  { key: 'hired', label: 'Hired' },
  { key: 'rejected', label: 'Rejected' },
]
