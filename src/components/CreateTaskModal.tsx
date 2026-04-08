import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { tasksApi } from '../lib/api'
import type { TaskType, TaskDifficulty } from '../types'
import './Modal.css'

interface Props {
  onClose: () => void
  onCreated: () => void
}

export function CreateTaskModal({ onClose, onCreated }: Props) {
  const [title, setTitle]         = useState('')
  const [type, setType]           = useState<TaskType>('todo')
  const [difficulty, setDifficulty] = useState<TaskDifficulty>('easy')
  const [notes, setNotes]         = useState('')
  const [dueDate, setDueDate]     = useState('')
  const [habitPos, setHabitPos]   = useState(true)
  const [habitNeg, setHabitNeg]   = useState(false)
  const [error, setError]         = useState('')

  const mut = useMutation({
    mutationFn: () =>
      tasksApi.create({
        title, type, difficulty,
        notes: notes || undefined,
        dueDate: dueDate || undefined,
        habitPositive: type === 'habit' ? habitPos : undefined,
        habitNegative: type === 'habit' ? habitNeg : undefined,
      }),
    onSuccess: onCreated,
    onError: (e: any) => setError(e.response?.data?.message ?? 'Error creating task'),
  })

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box card fade-up">
        <div className="modal-header">
          <h3 className="modal-title">New Quest</h3>
          <button className="btn btn-ghost modal-close" onClick={onClose}>✕</button>
        </div>

        <form className="modal-form" onSubmit={(e) => { e.preventDefault(); mut.mutate() }}>
          {/* Type selector */}
          <div className="field">
            <label>Type</label>
            <div className="type-selector">
              {(['habit', 'daily', 'todo'] as TaskType[]).map((t) => (
                <button
                  key={t} type="button"
                  className={`type-btn ${type === t ? 'active' : ''} badge-${t}`}
                  onClick={() => setType(t)}
                >
                  {t === 'habit' ? '⟳ Habit' : t === 'daily' ? '◈ Daily' : '◉ Todo'}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Title</label>
            <input
              required autoFocus
              value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Morning workout, Read 20 pages…"
            />
          </div>

          {/* Difficulty */}
          <div className="field">
            <label>Difficulty</label>
            <div className="diff-selector">
              {(['trivial', 'easy', 'medium', 'hard'] as TaskDifficulty[]).map((d) => (
                <button
                  key={d} type="button"
                  className={`diff-btn badge badge-${d} ${difficulty === d ? 'active' : ''}`}
                  onClick={() => setDifficulty(d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Habit direction toggles */}
          {type === 'habit' && (
            <div className="field">
              <label>Direction</label>
              <div className="habit-dirs">
                <label className="habit-dir-label">
                  <input type="checkbox" checked={habitPos} onChange={(e) => setHabitPos(e.target.checked)} />
                  <span className="habit-dir-btn habit-dir-pos">+ Positive</span>
                </label>
                <label className="habit-dir-label">
                  <input type="checkbox" checked={habitNeg} onChange={(e) => setHabitNeg(e.target.checked)} />
                  <span className="habit-dir-btn habit-dir-neg">− Negative</span>
                </label>
              </div>
            </div>
          )}

          {/* Due date for daily/todo */}
          {type !== 'habit' && (
            <div className="field">
              <label>Due Date (optional)</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          )}

          <div className="field">
            <label>Notes (optional)</label>
            <textarea
              rows={2}
              value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Any extra details…"
              style={{ resize: 'vertical' }}
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-gold" disabled={mut.isPending}>
              {mut.isPending ? '...' : '+ Create Quest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
