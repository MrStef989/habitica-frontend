import { useQuery } from '@tanstack/react-query'
import { achievementsApi } from '../lib/api'
import { ACHIEVEMENT_DEFINITIONS } from '../lib/achievements'
import type { Achievement } from '../types'
import './AchievementsPage.css'

export function AchievementsPage() {
  const { data: unlocked = [] } = useQuery<Achievement[]>({
    queryKey: ['achievements'],
    queryFn: achievementsApi.list,
  })

  const unlockedKeys = new Set(unlocked.map((a) => a.key))

  return (
    <div className="achievements-page fade-up">
      <div className="page-header">
        <div>
          <h2 className="page-title">Feats</h2>
          <p className="page-sub">{unlocked.length} / {ACHIEVEMENT_DEFINITIONS.length} unlocked</p>
        </div>
      </div>

      {/* Progress bar across all achievements */}
      <div className="feats-progress">
        <div className="bar-wrap" style={{ height: '10px' }}>
          <div
            className="bar-fill"
            style={{
              width: `${(unlocked.length / ACHIEVEMENT_DEFINITIONS.length) * 100}%`,
              background: 'var(--gold)',
            }}
          />
        </div>
      </div>

      <div className="feats-grid">
        {ACHIEVEMENT_DEFINITIONS.map((def) => {
          const isUnlocked = unlockedKeys.has(def.key)
          const data = unlocked.find((a) => a.key === def.key)
          return (
            <div key={def.key} className={`feat-card card ${isUnlocked ? 'feat-card--unlocked' : 'feat-card--locked'}`}>
              <div className="feat-icon">{isUnlocked ? '★' : '☆'}</div>
              <div className="feat-body">
                <h4 className="feat-title">{def.title}</h4>
                <p className="feat-desc">{def.description}</p>
                {isUnlocked && data && (
                  <p className="feat-date">
                    Unlocked {new Date(data.unlockedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
