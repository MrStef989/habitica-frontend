import type { Task } from '../types'
import './TaskCard.css'

interface Props {
  task: Task
  onComplete: (direction?: 'positive' | 'negative') => void
  onDelete: () => void
  isCompleting: boolean
}

const typeLabels = { habit: 'Habit', daily: 'Daily', todo: 'Todo' }
const diffLabels: Record<string, string> = { trivial: 'Trivial', easy: 'Easy', medium: 'Medium', hard: 'Hard' }

function completedToday(task: Task) {
  if (!task.lastCompletedAt) return false
  const t = new Date(), l = new Date(task.lastCompletedAt)
  return t.toDateString() === l.toDateString()
}

export function TaskCard({ task, onComplete, onDelete, isCompleting }: Props) {
  const isDoneToday = task.type === 'daily' && completedToday(task)
  const isTodoDone  = task.type === 'todo' && task.completed
  const isDimmed    = isDoneToday || isTodoDone

  return (
    <div className={`task-card card ${isDimmed ? 'task-card--done' : ''}`}>
      <div className="task-card-top">
        {/* Type + Difficulty badges */}
        <div className="task-card-badges">
          <span className={`badge badge-${task.type}`}>{typeLabels[task.type]}</span>
          <span className={`badge badge-${task.difficulty}`}>{diffLabels[task.difficulty]}</span>
          {task.streak > 0 && (
            <span className="badge" style={{ background: 'rgba(232,160,48,0.1)', color: 'var(--gold)', border: '1px solid var(--gold-dim)' }}>
              ♦ {task.streak}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="task-card-actions">
          {/* Habit: +/- buttons */}
          {task.type === 'habit' && (
            <>
              {task.habitPositive && (
                <button
                  className="task-btn task-btn--pos"
                  onClick={() => onComplete('positive')}
                  disabled={isCompleting}
                  title="Positive"
                >+</button>
              )}
              {task.habitNegative && (
                <button
                  className="task-btn task-btn--neg"
                  onClick={() => onComplete('negative')}
                  disabled={isCompleting}
                  title="Negative"
                >−</button>
              )}
            </>
          )}

          {/* Daily / Todo: single complete button */}
          {task.type !== 'habit' && (
            <button
              className={`task-btn task-btn--check ${isDimmed ? 'task-btn--checked' : ''}`}
              onClick={() => onComplete()}
              disabled={isCompleting || isDimmed}
              title="Complete"
            >
              {isDimmed ? '✓' : '○'}
            </button>
          )}

          <button className="task-btn task-btn--del" onClick={onDelete} title="Delete">✕</button>
        </div>
      </div>

      <h3 className={`task-title ${isDimmed ? 'task-title--done' : ''}`}>{task.title}</h3>

      {task.notes && <p className="task-notes">{task.notes}</p>}

      {task.dueDate && (
        <p className="task-due">
          Due {new Date(task.dueDate).toLocaleDateString()}
        </p>
      )}
    </div>
  )
}
