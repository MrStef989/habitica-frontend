import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../store/auth.store'
import { shopApi } from '../lib/api'
import type { InventoryItem } from '../types'
import './ProfilePage.css'

// XP formula mirror from backend
function xpRequired(level: number) {
  return Math.round(150 * Math.pow(level, 1.4))
}

export function ProfilePage() {
  const { user } = useAuthStore()

  const { data: inventory = [] } = useQuery<InventoryItem[]>({
    queryKey: ['inventory'],
    queryFn: shopApi.inventory,
  })

  if (!user) return null

  const equipped = inventory.filter((i) => i.equipped)
  const totalStr = equipped.reduce((s, i) => s + (i.item.strBonus ?? 0), 0)
  const totalCon = equipped.reduce((s, i) => s + (i.item.conBonus ?? 0), 0)

  const hpPct = (user.hp / user.maxHp) * 100
  const xpPct = (user.xp / user.xpToNextLevel) * 100

  return (
    <div className="profile-page fade-up">
      <div className="page-header">
        <div>
          <h2 className="page-title">Hero Profile</h2>
          <p className="page-sub">Your adventure so far</p>
        </div>
      </div>

      <div className="profile-grid">
        {/* Character card */}
        <div className="card profile-char-card">
          <div className="char-avatar">
            <span className="char-avatar-icon">⚔</span>
            <div className="char-level-badge">Lv {user.level}</div>
          </div>

          <h3 className="char-name">{user.username}</h3>

          {user.streakDays > 0 && (
            <div className="char-streak">
              <span style={{ color: 'var(--gold)' }}>♦</span>
              {user.streakDays}-day streak
            </div>
          )}

          <div className="char-stats">
            {/* HP */}
            <div className="char-stat">
              <div className="char-stat-label">
                <span style={{ color: 'var(--hp)' }}>♥</span> HP
                <span className="char-stat-val">{Math.ceil(user.hp)} / {user.maxHp}</span>
              </div>
              <div className="bar-wrap">
                <div className="bar-fill bar-hp" style={{ width: `${hpPct}%` }} />
              </div>
            </div>

            {/* XP */}
            <div className="char-stat">
              <div className="char-stat-label">
                <span style={{ color: 'var(--xp)' }}>✦</span> XP
                <span className="char-stat-val">{Math.floor(user.xp)} / {user.xpToNextLevel}</span>
              </div>
              <div className="bar-wrap">
                <div className="bar-fill bar-xp" style={{ width: `${xpPct}%` }} />
              </div>
            </div>

            {/* Gold */}
            <div className="char-stat-row">
              <span className="char-stat-label"><span style={{ color: 'var(--gold)' }}>◈</span> Gold</span>
              <span className="char-stat-num" style={{ color: 'var(--gold)' }}>{user.gold.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Combat stats */}
        <div className="card profile-combat-card">
          <h4 className="card-section-title">Combat Stats</h4>

          <div className="combat-stats">
            <div className="combat-stat">
              <span className="combat-stat-name">Strength</span>
              <div className="combat-stat-bar-wrap">
                <div className="combat-stat-bar" style={{ width: `${Math.min(totalStr, 100)}%`, background: 'var(--gold)' }} />
              </div>
              <span className="combat-stat-val" style={{ color: 'var(--gold)' }}>+{totalStr}</span>
            </div>
            <div className="combat-stat">
              <span className="combat-stat-name">Constitution</span>
              <div className="combat-stat-bar-wrap">
                <div className="combat-stat-bar" style={{ width: `${Math.min(totalCon, 100)}%`, background: 'var(--xp)' }} />
              </div>
              <span className="combat-stat-val" style={{ color: 'var(--xp)' }}>+{totalCon}</span>
            </div>
          </div>

          <p className="combat-hint">
            STR increases XP earned. CON reduces damage from missed dailies (max 30%).
          </p>

          {/* Equipped gear */}
          <h4 className="card-section-title" style={{ marginTop: '1.25rem' }}>Equipped Gear</h4>
          {equipped.length === 0 ? (
            <p className="profile-empty">No gear equipped. Visit the Armory!</p>
          ) : (
            <div className="equipped-list">
              {equipped.map((inv) => (
                <div key={inv.id} className="equipped-row">
                  <span className="equipped-name">{inv.item.name}</span>
                  <div className="equipped-bonuses">
                    {inv.item.strBonus > 0 && <span className="shop-stat shop-stat--str">STR +{inv.item.strBonus}</span>}
                    {inv.item.conBonus > 0 && <span className="shop-stat shop-stat--con">CON +{inv.item.conBonus}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Level roadmap */}
        <div className="card profile-levels-card">
          <h4 className="card-section-title">Level Roadmap</h4>
          <div className="level-list">
            {[1,2,3,5,10,15,20].map((lvl) => {
              const isReached = user.level >= lvl
              const isCurrent = user.level === lvl
              return (
                <div key={lvl} className={`level-row ${isReached ? 'level-row--done' : ''} ${isCurrent ? 'level-row--current' : ''}`}>
                  <span className="level-num">Lv {lvl}</span>
                  <div className="level-bar-wrap">
                    <div className="level-bar-fill" style={{ width: isReached ? '100%' : '0%' }} />
                  </div>
                  <span className="level-xp">{xpRequired(lvl).toLocaleString()} XP</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
