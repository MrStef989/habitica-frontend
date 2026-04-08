import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksApi } from '../lib/api'
import { useAuthStore } from '../store/auth.store'
import { useToastStore } from '../store/toast.store'
import type { Task, TaskType } from '../types'
import { TaskCard } from '../components/TaskCard'
import { CreateTaskModal } from '../components/CreateTaskModal'
import './TasksPage.css'

const TABS: { key: TaskType | 'all'; label: string }[] = [
  { key: 'all',   label: 'All' },
  { key: 'habit', label: '⟳ Habits' },
  { key: 'daily', label: '◈ Dailies' },
  { key: 'todo',  label: '◉ Todos' },
]

export function TasksPage() {
  const [tab, setTab]         = useState<TaskType | 'all'>('all')
  const [showModal, setShowModal] = useState(false)

  const { updateUser } = useAuthStore()
  const { add: addToast } = useToastStore()
  const qc = useQueryClient()

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ['tasks', tab],
    queryFn: () => tasksApi.list(tab === 'all' ? undefined : tab),
  })

  const completeMut = useMutation({
    mutationFn: ({ id, direction }: { id: string; direction?: 'positive' | 'negative' }) =>
      tasksApi.complete(id, direction),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
      qc.invalidateQueries({ queryKey: ['me'] })

      if (res.reward) {
        updateUser({
          ...useAuthStore.getState().user!,
          xp: res.reward.newXp,
          gold: res.reward.newGold,
          hp: res.reward.newHp,
          level: res.reward.newLevel,
        })
        if (res.reward.levelUp) {
          addToast('levelup', `▲ Level up! Now level ${res.reward.newLevel}!`)
        } else {
          addToast('xp', `+${res.reward.xpGained} XP`)
          addToast('gold', `+${res.reward.goldGained.toFixed(1)} gold`)
        }
      } else if (res.message.includes('HP')) {
        addToast('damage', res.message)
      }
    },
    onError: (err: any) => {
      addToast('error', err.response?.data?.message ?? 'Error')
    },
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })

  const visibleTasks = tasks.filter((t) => {
    if (tab === 'all') return true
    return t.type === tab
  })

  // Separate todos: incomplete first, then done
  const sortedTasks = tab === 'todo' || tab === 'all'
    ? [
        ...visibleTasks.filter((t) => t.type !== 'todo' || !t.completed),
        ...visibleTasks.filter((t) => t.type === 'todo' && t.completed),
      ]
    : visibleTasks

  return (
    <div className="tasks-page fade-up">
      <div className="page-header">
        <div>
          <h2 className="page-title">Quests</h2>
          <p className="page-sub">Complete tasks to gain XP and gold</p>
        </div>
        <button className="btn btn-gold" onClick={() => setShowModal(true)}>
          + New Quest
        </button>
      </div>

      {/* Tabs */}
      <div className="task-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`task-tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Task list */}
      {isLoading ? (
        <div className="tasks-loading">Loading quests...</div>
      ) : sortedTasks.length === 0 ? (
        <div className="tasks-empty">
          <span className="tasks-empty-icon">◎</span>
          <p>No quests yet. Create your first one!</p>
        </div>
      ) : (
        <div className="task-list">
          {sortedTasks.map((task, i) => (
            <div key={task.id} style={{ animationDelay: `${i * 40}ms` }} className="fade-up">
              <TaskCard
                task={task}
                onComplete={(direction) => completeMut.mutate({ id: task.id, direction })}
                onDelete={() => deleteMut.mutate(task.id)}
                isCompleting={completeMut.isPending}
              />
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <CreateTaskModal
          onClose={() => setShowModal(false)}
          onCreated={() => {
            setShowModal(false)
            qc.invalidateQueries({ queryKey: ['tasks'] })
          }}
        />
      )}
    </div>
  )
}
