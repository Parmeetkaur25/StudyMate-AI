import { useState } from 'react'
import { Outlet, useLocation, NavLink } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { navItems } from '../utils/navItems'
import Logo from '../components/ui/Logo'
import { useAuth } from '../context/useAuth'

const groups = [
  { label: 'Overview',  items: ['/dashboard'] },
  { label: 'AI Tools',  items: ['/doubts', '/quiz', '/notes', '/weakness', '/exams'] },
  { label: 'Planning',  items: ['/planner', '/productivity'] },
  { label: 'Account',   items: ['/profile', '/admin'] },
]

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user } = useAuth()
  const { pathname } = useLocation()
  const isAdmin = user?.role === 'admin'
  const getItem = (to) => navItems.find((n) => n.to === to)

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <Navbar onMenuClick={() => setMenuOpen((v) => !v)} />

      {/* Mobile overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* ── Sidebar ──────────────────────────────── */}
      <aside
        className={`fixed left-0 top-0 z-30 flex h-full w-[220px] flex-col bg-[#0f172a] transition-transform duration-300 lg:translate-x-0 lg:pt-16 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile logo strip */}
        <div className="flex h-16 items-center px-5 lg:hidden border-b border-white/[0.07]">
          <Logo dark />
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
          {groups.map((group) => {
            const items = group.items
              .map(getItem)
              .filter(Boolean)
              .filter((i) => i.to !== '/admin' || isAdmin)
            if (!items.length) return null

            return (
              <div key={group.label}>
                <p className="mb-1 px-3 text-[9px] font-bold uppercase tracking-[0.12em] text-white/30">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {items.map(({ to, label, icon: Icon }) => {
                    const active = pathname === to
                    return (
                      <NavLink
                        key={to}
                        to={to}
                        onClick={() => setMenuOpen(false)}
                        className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-150 ${
                          active
                            ? 'bg-[#2563eb] text-white shadow-sm'
                            : 'text-white/55 hover:bg-white/[0.07] hover:text-white'
                        }`}
                      >
                        <Icon
                          size={16}
                          strokeWidth={active ? 2.2 : 1.8}
                          className={active ? 'text-white' : 'text-white/40 group-hover:text-white/70'}
                        />
                        {label}
                      </NavLink>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/[0.07] p-3">
          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/[0.06] transition-colors cursor-default">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#2563eb] text-[11px] font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-white/80">{user?.name}</p>
              <p className="truncate text-[11px] text-white/35 capitalize">{user?.educationLevel}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────── */}
      <main className="lg:ml-[220px]">
        <div className="page-enter mx-auto max-w-[1280px] p-5 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
