import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Loader2, Eye, EyeOff, ArrowRight, CheckCircle2, BookOpen, Brain, ListChecks } from 'lucide-react'
import Logo from '../components/ui/Logo'
import { useAuth } from '../context/useAuth'
import { getErrorMessage } from '../services/api'
import { inputCls } from '../components/ui/Input'

const levels = [
  ['school',       'School student'],
  ['college',      'College student'],
  ['university',   'University student'],
  ['competitive',  'Competitive exam aspirant'],
  ['self-learner', 'Independent learner'],
]

const perks = [
  { icon: Brain,       text: 'AI-powered doubt solver' },
  { icon: BookOpen,    text: 'Smart study planner' },
  { icon: ListChecks,  text: 'Quiz generator & tracker' },
]

export default function AuthPage({ mode }) {
  const isRegister = mode === 'register'
  const { user, login, register } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [form, setForm]       = useState({ name: '', email: '', password: '', educationLevel: 'college' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isRegister) await register(form)
      else await login(form.email, form.password)
      navigate(location.state?.from || '/dashboard', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">

      {/* ── Left brand panel ─────────────────────── */}
      <div className="relative hidden lg:flex lg:w-5/12 flex-col justify-between overflow-hidden bg-[#0f172a] p-10">
        {/* Blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-[#2563eb]/15 blur-3xl" />
          <div className="absolute -bottom-20 right-0 h-80 w-80 rounded-full bg-[#7c3aed]/15 blur-3xl" />
        </div>

        <div className="relative">
          <Logo dark size="md" />
        </div>

        <div className="relative">
          <h2 className="text-3xl font-bold leading-snug text-white">
            {isRegister ? 'Start your learning\njourney today' : 'Welcome back to\nyour study hub'}
          </h2>
          <p className="mt-3 text-[#94a3b8]">
            {isRegister
              ? 'Join thousands of students already studying smarter with AI.'
              : 'Pick up right where you left off.'}
          </p>
          <ul className="mt-8 space-y-4">
            {perks.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#2563eb]/20 text-[#60a5fa]">
                  <Icon size={17} />
                </span>
                <span className="text-sm font-medium text-white/80">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-[#475569]">© {new Date().getFullYear()} StudyMate AI</p>
      </div>

      {/* ── Right form panel ─────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-[#f4f6f9] px-5 py-12 sm:px-10">

        {/* Mobile logo */}
        <div className="mb-8 lg:hidden">
          <Logo size="lg" />
        </div>

        <div className="w-full max-w-md">
          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-[26px] font-extrabold tracking-tight text-[#0f172a]">
              {isRegister ? 'Create your account' : 'Sign in to your account'}
            </h1>
            <p className="mt-1.5 text-sm text-[#6b7280]">
              {isRegister ? (
                <>Free forever — no credit card required.</>
              ) : (
                <>
                  Don't have an account?{' '}
                  <Link to="/register" className="font-semibold text-[#2563eb] hover:underline">
                    Sign up free →
                  </Link>
                </>
              )}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex gap-2.5 rounded-xl border border-[#fca5a5] bg-[#fff1f2] px-4 py-3 text-sm text-[#b91c1c]">
              <span className="mt-0.5 shrink-0">⚠</span>
              {error}
            </div>
          )}

          {/* Form card */}
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-7 shadow-sm">
            <form className="space-y-4" onSubmit={onSubmit}>
              {isRegister && (
                <>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-[#374151]">Full name</label>
                    <input className={inputCls} name="name" value={form.name} onChange={onChange} required placeholder="Your full name" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-[#374151]">I am a</label>
                    <select className={inputCls} name="educationLevel" value={form.educationLevel} onChange={onChange}>
                      {levels.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-[#374151]">Email address</label>
                <input className={inputCls} type="email" name="email" value={form.email} onChange={onChange} required placeholder="you@example.com" />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-[#374151]">Password</label>
                <div className="relative">
                  <input
                    className={`${inputCls} pr-10`}
                    type={showPass ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={onChange}
                    required
                    placeholder={isRegister ? 'Min 8 characters' : '••••••••'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 top-1/2 mt-0.5 -translate-y-1/2 text-[#9ca3af] hover:text-[#4b5563] transition"
                    tabIndex={-1}
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                disabled={loading}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2563eb] py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1d4ed8] hover:shadow active:scale-[0.98] disabled:opacity-55"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                {isRegister ? 'Create account' : 'Sign in'}
              </button>
            </form>
          </div>

          <p className="mt-5 text-center text-sm text-[#6b7280]">
            {isRegister ? 'Already have an account?' : 'New to StudyMate AI?'}{' '}
            <Link
              to={isRegister ? '/login' : '/register'}
              className="font-semibold text-[#2563eb] hover:underline"
            >
              {isRegister ? 'Sign in' : 'Create account'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
