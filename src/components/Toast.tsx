import { useToastStore } from '../store/toast.store'
import './Toast.css'

const icons: Record<string, string> = {
  xp: '✦',
  gold: '◈',
  levelup: '▲',
  damage: '♥',
  error: '✕',
  achievement: '★',
}

export function ToastContainer() {
  const { toasts, remove } = useToastStore()

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.kind}`} onClick={() => remove(t.id)}>
          <span className="toast-icon">{icons[t.kind]}</span>
          <span className="toast-msg">{t.message}</span>
        </div>
      ))}
    </div>
  )
}
