import { STAGES } from './stages'

export default function CandidateCard({ candidate, onStageChange, onDragStart, onView, dragging }) {
  return (
    <div
      className={`kanban-card${dragging ? ' dragging' : ''}`}
      draggable
      onDragStart={(e) => onDragStart(e, candidate.id)}
      onClick={() => onView(candidate)}
    >
      <div className="kanban-card-name">{candidate.name}</div>
      <div className="kanban-card-job">{candidate.jobs?.title ?? 'No job linked'}</div>

      {candidate.linkedin_url && (
        <a
          className="kanban-card-link"
          href={candidate.linkedin_url}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          LinkedIn ↗
        </a>
      )}

      <select
        value={candidate.stage}
        onChange={(e) => onStageChange(candidate.id, e.target.value)}
        onClick={(e) => e.stopPropagation()}
      >
        {STAGES.map((stage) => (
          <option key={stage.key} value={stage.key}>
            {stage.label}
          </option>
        ))}
      </select>
    </div>
  )
}
