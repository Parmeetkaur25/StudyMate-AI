import { useCallback, useEffect, useState } from 'react'
import { Play, Pause, Square, Loader2, Flame, Target, Clock, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import Card from '../components/ui/Card'
import StatCard from '../components/ui/StatCard'
import EmptyState from '../components/ui/EmptyState'
import { inputCls } from '../components/ui/Input'
import api, { getErrorMessage } from '../services/api'
import { useAuth } from '../context/useAuth'
import { formatClock, formatMinutes, formatDay } from '../utils/dates'

export default function Productivity() {
  const { user, updateProfile } = useAuth()
  const [active, setActive]   = useState(null)
  const [stats, setStats]     = useState(null)
  const [history, setHistory] = useState([])
  const [subject, setSubject] = useState(user.subjects?.[0] || '')
  const [goal, setGoal]       = useState(user.dailyGoalMinutes)
  const [now, setNow]         = useState(() => Date.now())
  const [busy, setBusy]       = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [msg, setMsg]         = useState('')

  const loadStats = useCallback(async () => {
    const [s, h] = await Promise.all([api.get('/sessions/stats', { params: { tzOffset: new Date().getTimezoneOffset() } }), api.get('/sessions')])
    setStats(s.data.stats); setHistory(h.data.sessions)
  }, [])

  useEffect(() => {
    let mounted = true
    Promise.all([api.get('/sessions/active'), api.get('/sessions/stats', { params: { tzOffset: new Date().getTimezoneOffset() } }), api.get('/sessions')])
      .then(([a, s, h]) => {
        if (!mounted) return
        setActive(a.data.session ? { ...a.data.session, baseTs: Date.now() } : null)
        setStats(s.data.stats); setHistory(h.data.sessions)
      })
      .catch((e) => { if (mounted) setError(getErrorMessage(e)) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (active?.status !== 'running') return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [active?.status])

  const seconds = active
    ? active.elapsedSeconds + (active.status === 'running' ? Math.max(0, Math.floor((now - active.baseTs) / 1000)) : 0)
    : 0

  const act = async (fn) => { setBusy(true); setError(''); try { await fn() } catch (e) { setError(getErrorMessage(e)) } finally { setBusy(false) } }

  const start = (e) => { e.preventDefault(); return act(async () => { const r = await api.post('/sessions/start', { subject: subject.trim() }); setNow(Date.now()); setActive({ ...r.data.session, baseTs: Date.now() }) }) }
  const control = (action) => act(async () => { const r = await api.post(`/sessions/${active.id}/${action}`); setNow(Date.now()); if (action === 'stop') { setActive(null); await loadStats() } else { setActive({ ...r.data.session, baseTs: Date.now() }); await loadStats() } })
  const saveGoal = (e) => { e.preventDefault(); return act(async () => { await updateProfile({ dailyGoalMinutes: Number(goal) }); await loadStats(); setMsg('Saved!'); setTimeout(() => setMsg(''), 2000) }) }

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-[#2563eb]" size={28} /></div>

  const chart = stats.week.map((d) => ({ day: formatDay(d.date, { weekday: 'short' }), minutes: d.minutes }))
  const pct   = Math.min(100, Math.round((stats.todayMinutes / stats.goalMinutes) * 100))
  const isRunning = active?.status === 'running'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-[#0f172a]">Focus & Productivity</h2>
        <p className="mt-0.5 text-sm text-[#6b7280]">Your timer persists even after page refresh — sessions are saved server-side.</p>
      </div>

      {error && <div className="rounded-xl border border-[#fca5a5] bg-[#fff1f2] px-4 py-3 text-sm text-[#b91c1c]">{error}</div>}

      {/* Timer */}
      <Card className="p-8 text-center">
        {active ? (
          <>
            <div className="mb-3">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${isRunning ? 'bg-[#dbeafe] text-[#1d4ed8]' : 'bg-[#fef9c3] text-[#92400e]'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${isRunning ? 'bg-[#2563eb] animate-pulse' : 'bg-[#d97706]'}`} />
                {active.subject} · {isRunning ? 'Studying' : 'Paused'}
              </span>
            </div>
            <p className={`font-mono text-7xl font-extrabold tracking-tight ${isRunning ? 'text-[#2563eb]' : 'text-[#d97706]'}`}>
              {formatClock(seconds)}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              {isRunning ? (
                <button disabled={busy} onClick={() => control('pause')} className="flex items-center gap-2 rounded-xl bg-[#f59e0b] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#d97706] disabled:opacity-60">
                  <Pause size={15} /> Pause
                </button>
              ) : (
                <button disabled={busy} onClick={() => control('resume')} className="flex items-center gap-2 rounded-xl bg-[#2563eb] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1d4ed8] disabled:opacity-60">
                  <Play size={15} /> Resume
                </button>
              )}
              <button disabled={busy} onClick={() => control('stop')} className="flex items-center gap-2 rounded-xl bg-[#111827] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1f2937] disabled:opacity-60">
                <Square size={15} /> Stop & save
              </button>
            </div>
          </>
        ) : (
          <div className="py-2">
            <div className="mb-5 flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-[#dbeafe] text-[#2563eb]">
              <Clock size={26} />
            </div>
            <h3 className="text-base font-semibold text-[#111827]">Start a focus session</h3>
            <p className="mt-1 mb-6 text-sm text-[#9ca3af]">What are you going to study today?</p>
            <form onSubmit={start} className="mx-auto flex max-w-md flex-col gap-2.5 sm:flex-row">
              <input className={`${inputCls} mt-0 flex-1`} required minLength={2} maxLength={80} list="subj" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Enter subject or topic…" />
              <datalist id="subj">{(user.subjects || []).map((s) => <option key={s} value={s} />)}</datalist>
              <button disabled={busy} className="flex items-center justify-center gap-2 rounded-xl bg-[#2563eb] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1d4ed8] disabled:opacity-60">
                <Play size={15} /> Start session
              </button>
            </form>
          </div>
        )}
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Target}    label="Studied today"  value={formatMinutes(stats.todayMinutes)} hint={`Goal: ${formatMinutes(stats.goalMinutes)} (${pct}%)`} color="blue" />
        <StatCard icon={Flame}     label="Study streak"   value={`${stats.streak} day${stats.streak === 1 ? '' : 's'}`} hint="Consecutive days" color="orange" />
        <StatCard icon={TrendingUp}label="Last 7 days"    value={formatMinutes(stats.weekTotalMinutes)} hint="Total study time" color="green" />
      </div>

      {/* Chart + Goal */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-6">
          <h3 className="mb-4 text-sm font-semibold text-[#111827]">Daily study time (minutes)</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.07)', fontSize: '13px' }} cursor={{ fill: '#eff6ff' }} />
                <Bar dataKey="minutes" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="mb-3 text-sm font-semibold text-[#111827]">Daily goal</h3>
            <form onSubmit={saveGoal} className="flex gap-2">
              <input className={`${inputCls} mt-0 flex-1`} type="number" min="10" max="1440" value={goal} onChange={(e) => setGoal(e.target.value)} />
              <button disabled={busy} className="rounded-xl bg-[#2563eb] px-4 text-sm font-semibold text-white transition hover:bg-[#1d4ed8] disabled:opacity-60">Save</button>
            </form>
            <p className="mt-1 text-xs text-[#9ca3af]">minutes per day</p>
            {msg && <p className="mt-1.5 text-xs font-semibold text-[#16a34a]">✓ {msg}</p>}
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs text-[#9ca3af]">
                <span>{formatMinutes(stats.todayMinutes)}</span><span>{pct}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#f3f4f6]">
                <div className="h-full rounded-full bg-[#2563eb] transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="mb-3 text-sm font-semibold text-[#111827]">By subject (7 days)</h3>
            {stats.bySubject.length === 0 ? <p className="text-sm text-[#9ca3af]">No data yet.</p> : (
              <ul className="space-y-2.5">
                {stats.bySubject.map((s) => (
                  <li key={s.subject} className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate text-[#374151]">{s.subject}</span>
                    <span className="shrink-0 font-semibold text-[#111827]">{formatMinutes(s.minutes)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      {/* History */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-[#111827]">Session history</h3>
        {history.length === 0 ? (
          <EmptyState icon={Clock} title="No sessions yet" message="Start a timer, stop it, and your session will be saved here." />
        ) : (
          <Card className="divide-y divide-[#f9fafb] p-0 overflow-hidden">
            {history.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-[#fafafa] transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#111827] truncate">{s.subject}</p>
                  <p className="mt-0.5 text-xs text-[#9ca3af]">{new Date(s.startedAt).toLocaleString()}</p>
                </div>
                <span className="shrink-0 font-mono text-sm font-medium text-[#374151]">{formatClock(s.elapsedSeconds)}</span>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  )
}
