import { useState } from 'react'
import CandidateCard from './CandidateCard'

export default function KanbanColumn({ stage, candidates, onStageChange, draggingId, onDragStart, onView }) {
  const [dragOver, setDragOver] = useState(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const candidateId = e.dataTransfer.getData('text/plain')
    if (candidateId) onStageChange(candidateId, stage.key)
  }

  return (
    <div
      className={`kanban-column${dragOver ? ' drag-over' : ''}`}
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <div className="kanban-column-header">
        <span className="kanban-column-title">{stage.label}</span>
        <span className="kanban-column-count">{candidates.length}</span>
      </div>

      <div className="kanban-cards">
        {candidates.length === 0 && <div className="kanban-empty">No candidates in this stage</div>}
        {candidates.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            onStageChange={onStageChange}
            onDragStart={onDragStart}
            onView={onView}
            dragging={draggingId === candidate.id}
          />
        ))}
      </div>
    </div>
  )
}
