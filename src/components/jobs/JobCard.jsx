import Badge from '../ui/Badge'
import { IconBriefcase, IconLocation, IconCalendar, IconUsers, IconEdit, IconChevronRight } from '../ui/icons'

const STATUS_TONE = { active: 'success', draft: 'warning', closed: 'default' }

// Purely a visual accent so the list doesn't look monotonous - no meaning is
// attached to a job's category, so this only ever depends on the job's
// position in the list, never on its title/content (kept deliberately
// simple to avoid fragile "guess the category from the title" logic).
const TILE_VARIANTS = ['tile-purple', 'tile-blue', 'tile-pink']

export default function JobCard({ job, index, candidateCount, onEdit }) {
  const tileVariant = TILE_VARIANTS[index % TILE_VARIANTS.length]

  return (
    <div className="job-row">
      <div className={`job-row-icon ${tileVariant}`}>
        <IconBriefcase size={18} />
      </div>

      <div className="job-row-main">
        <div className="job-row-title">{job.title}</div>
        {job.description && <p className="job-row-description">{job.description}</p>}
        <div className="job-row-meta">
          {job.location && (
            <span className="job-meta-item">
              <IconLocation />
              {job.location}
            </span>
          )}
          <span className="job-meta-item">
            <IconCalendar />
            {new Date(job.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="job-row-right">
        <Badge tone={STATUS_TONE[job.status] ?? 'default'}>{job.status}</Badge>
        <span className="job-meta-item job-row-candidates">
          <IconUsers />
          {candidateCount}
        </span>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => onEdit(job)}>
          <IconEdit size={13} />
          Edit
        </button>
        <span className="job-row-chevron">
          <IconChevronRight size={16} />
        </span>
      </div>
    </div>
  )
}
