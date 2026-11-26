import { useLocation, useNavigate } from 'react-router-dom'
import { Menu, LogOut, Bell, ChevronDown, Settings } from 'lucide-react'
import { navItems } from '../utils/navItems'
import { useAuth } from '../context/useAuth'
import Logo from './ui/Logo'
import { useState } from 'react'

export default function Navbar({ onMenuClick }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const current = navItems.find((i) => i.to === pathname)
  const [dropOpen, setDropOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#e5e7eb] bg-white px-4 sm:px-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">

      {/* ── Left ──────────────────────────────────── */}
      <div className="flex items-center gap-3">
        {/* Hamburger (mobile) */}
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-[#6b7280] transition hover:bg-[#f3f4f6] hover:text-[#111827] lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={19} />
        </button>

        {/* Mobile logo */}
        <div className="lg:hidden">
          <Logo />
        </div>

        {/* Page title — desktop */}
        {current && (
          <div className="hidden items-center gap-2 lg:flex">
            <span className="text-[13px] text-[#9ca3af]">StudyMate AI</span>
            <span className="text-[#d1d5db]">/</span>
            <span className="text-[13px] font-semibold text-[#111827]">{current.label}</span>
          </div>
        )}
      </div>

      {/* ── Right ─────────────────────────────────── */}
      <div className="flex items-center gap-1.5">

        {/* Notification bell */}
        <button className="relative rounded-lg p-2 text-[#6b7280] transition hover:bg-[#f3f4f6] hover:text-[#111827]" aria-label="Notifications">
          <Bell size={17} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#2563eb]" />
        </button>

        {/* Divider */}
        <div className="mx-1 h-5 w-px bg-[#e5e7eb]" />

        {/* Avatar + dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropOpen((v) => !v)}
            className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-[#f3f4f6]"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2563eb] text-[11px] font-bold text-white shadow-sm">
              {initials}
            </div>
            <span className="hidden max-w-[110px] truncate text-[13px] font-medium text-[#374151] sm:block">
              {user?.name}
            </span>
            <ChevronDown
              size={13}
              className={`hidden text-[#9ca3af] transition-transform duration-200 sm:block ${dropOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {dropOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropOpen(false)} />
              <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-xl">
                {/* Identity */}
                <div className="border-b border-[#f3f4f6] px-4 py-3">
                  <p className="text-[13px] font-semibold text-[#111827]">{user?.name}</p>
                  <p className="mt-0.5 truncate text-[11px] text-[#9ca3af]">{user?.email}</p>
                </div>
                {/* Actions */}
                <div className="p-1.5">
                  <button
                    onClick={() => { setDropOpen(false); navigate('/profile') }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium text-[#374151] transition hover:bg-[#f3f4f6]"
                  >
                    <Settings size={14} className="text-[#9ca3af]" />
                    Profile settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium text-[#ef4444] transition hover:bg-[#fef2f2]"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
