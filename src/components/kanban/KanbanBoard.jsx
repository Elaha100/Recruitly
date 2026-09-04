import { useState } from 'react'
import { STAGES } from './stages'
import KanbanColumn from './KanbanColumn'

export default function KanbanBoard({ candidates, onStageChange, onView }) {
  const [draggingId, setDraggingId] = useState(null)

  const handleDragStart = (e, candidateId) => {
    e.dataTransfer.setData('text/plain', candidateId)
    setDraggingId(candidateId)
  }

  const handleStageChange = (candidateId, stage) => {
    setDraggingId(null)
    onStageChange(candidateId, stage)
  }

  return (
    <div className="kanban-board">
      {STAGES.map((stage) => (
        <KanbanColumn
          key={stage.key}
          stage={stage}
          candidates={candidates.filter((c) => c.stage === stage.key)}
          onStageChange={handleStageChange}
          onDragStart={handleDragStart}
          draggingId={draggingId}
          onView={onView}
        />
      ))}
    </div>
  )
}
