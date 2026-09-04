import Badge from '../ui/Badge'
import { STAGES } from '../kanban/stages'

const STAGE_TONE = {
  applied: 'info',
  screening: 'warning',
  interview: 'accent',
  offer: 'success',
  hired: 'success',
  rejected: 'danger',
}

export default function CandidateDetail({ candidate, onEdit, onClose }) {
  return (
    <div>
      <div className="field-group">
        <label>Name</label>
        <p>{candidate.name}</p>
      </div>

      <div className="field-row">
        <div className="field-group">
          <label>Email</label>
          <p>{candidate.email || '—'}</p>
        </div>
        <div className="field-group">
          <label>Phone</label>
          <p>{candidate.phone || '—'}</p>
        </div>
      </div>

      <div className="field-group">
        <label>LinkedIn</label>
        <p>
          {candidate.linkedin_url ? (
            <a href={candidate.linkedin_url} target="_blank" rel="noreferrer">
              {candidate.linkedin_url}
            </a>
          ) : (
            '—'
          )}
        </p>
      </div>

      <div className="field-row">
        <div className="field-group">
          <label>Job</label>
          <p>{candidate.jobs?.title || 'Not linked'}</p>
        </div>
        <div className="field-group">
          <label>Stage</label>
          <p>
            <Badge tone={STAGE_TONE[candidate.stage] ?? 'default'}>
              {STAGES.find((s) => s.key === candidate.stage)?.label ?? candidate.stage}
            </Badge>
          </p>
        </div>
      </div>

      <div className="field-group">
        <label>Notes</label>
        <p>{candidate.notes || '—'}</p>
      </div>

      <div className="field-group">
        <label>Added</label>
        <p>{new Date(candidate.created_at).toLocaleDateString()}</p>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Close
        </button>
        <button type="button" className="btn btn-primary" onClick={onEdit}>
          Edit candidate
        </button>
      </div>
    </div>
  )
}
