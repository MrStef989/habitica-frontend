import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../store/auth.store'
import { userApi } from '../lib/api'
import './Layout.css'

export function Layout() {
  const { user, updateUser, logout } = useAuthStore()
  const navigate = useNavigate()

  // Keep user stats fresh — refetch every 30s
  useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const u = await userApi.me()
      updateUser(u)
      return u
    },
    refetchInterval: 30_000,
  })

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const hpPct  = user ? (user.hp / user.maxHp) * 100 : 0
  const xpPct  = user ? (user.xp / user.xpToNextLevel) * 100 : 0

  return (
    <div className="layout">
      {/* ── Sidebar ─────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">⚔</span>
          <span className="brand-name">QuestLog</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/tasks"        className={navCls}>◈ Tasks</NavLink>
          <NavLink to="/shop"         className={navCls}>◉ Shop</NavLink>
          <NavLink to="/achievements" className={navCls}>★ Feats</NavLink>
          <NavLink to="/profile"      className={navCls}>◎ Profile</NavLink>
        </nav>

        <button className="sidebar-logout btn btn-ghost" onClick={handleLogout}>
          ← Logout
        </button>
      </aside>

      {/* ── Main area ───────────────────── */}
      <div className="main-wrap">
        {/* Header stats bar */}
        {user && (
          <header className="topbar">
            <div className="topbar-stat">
              <span className="topbar-label">HP</span>
              <div className="topbar-bar">
                <div className="bar-wrap">
                  <div className="bar-fill bar-hp" style={{ width: `${hpPct}%` }} />
                </div>
                <span className="topbar-val">{Math.ceil(user.hp)}/{user.maxHp}</span>
              </div>
            </div>

            <div className="topbar-stat">
              <span className="topbar-label">XP</span>
              <div className="topbar-bar">
                <div className="bar-wrap">
                  <div className="bar-fill bar-xp" style={{ width: `${xpPct}%` }} />
                </div>
                <span className="topbar-val">{Math.floor(user.xp)}/{user.xpToNextLevel}</span>
              </div>
            </div>

            <div className="topbar-pills">
              <span className="stat-pill">
                <span style={{ color: 'var(--gold)' }}>◈</span>
                {user.gold.toFixed(1)}
              </span>
              <span className="stat-pill">
                <span style={{ color: 'var(--xp)' }}>▲</span>
                Lv {user.level}
              </span>
              {user.streakDays > 0 && (
                <span className="stat-pill">
                  <span style={{ color: 'var(--hp)' }}>♦</span>
                  {user.streakDays}d
                </span>
              )}
              <span className="topbar-username">{user.username}</span>
            </div>
          </header>
        )}

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

const navCls = ({ isActive }: { isActive: boolean }) =>
  `nav-link ${isActive ? 'nav-link--active' : ''}`
