import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarCheck, ListChecks, Timer, Flame, Loader2, ArrowUpRight, Sparkles } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import Card from '../components/ui/Card'
import StatCard from '../components/ui/StatCard'
import EmptyState from '../components/ui/EmptyState'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { navItems } from '../utils/navItems'
import { useAuth } from '../context/useAuth'
import api, { getErrorMessage } from '../services/api'
import { formatDay, formatMinutes } from '../utils/dates'

const quickLinks = navItems.filter((i) =>
  ['/planner', '/doubts', '/quiz', '/productivity'].includes(i.to)
)

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-white px-3.5 py-2.5 shadow-lg text-sm">
      <p className="font-semibold text-[#111827]">{label}</p>
      <p className="mt-0.5 text-[#2563eb]">{payload[0].value} hrs</p>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/dashboard', { params: { tzOffset: new Date().getTimezoneOffset() } })
      .then((r) => setData(r.data))
      .catch((e) => setError(getErrorMessage(e)))
  }, [])

  if (error) return (
    <div className="rounded-xl border border-[#fca5a5] bg-[#fff1f2] px-4 py-3 text-sm text-[#b91c1c]">{error}</div>
  )
  if (!data) return (
    <div className="flex justify-center py-24">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-[#2563eb]" size={28} />
        <p className="text-sm text-[#6b7280]">Loading your dashboard…</p>
      </div>
    </div>
  )

  const { stats, quizzesTaken, tasksCompleted, recentAttempts } = data
  const chart = stats.week.map((d) => ({
    day: formatDay(d.date, { weekday: 'short' }),
    hours: +(d.minutes / 60).toFixed(1),
  }))
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-7">
      {/* ── Header ───────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-[#2563eb]">
            <Sparkles size={12} />
            {greeting}
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#0f172a]">{user.name} 👋</h2>
          <p className="mt-0.5 text-sm text-[#6b7280]">Here's what's happening with your studies today.</p>
        </div>
        <Button to="/planner" size="sm" variant="outline">
          Study plan <ArrowUpRight size={13} />
        </Button>
      </div>

      {/* ── Stats ────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Timer}        label="Study time today"  value={formatMinutes(stats.todayMinutes)} hint={`Goal: ${formatMinutes(stats.goalMinutes)}`} color="blue" />
        <StatCard icon={CalendarCheck} label="Tasks completed"  value={tasksCompleted}  hint="From study planner"  color="indigo" />
        <StatCard icon={ListChecks}   label="Quizzes taken"     value={quizzesTaken}    hint="Total attempts"      color="violet" />
        <StatCard icon={Flame}        label="Study streak"      value={`${stats.streak} days`} hint="Keep it up!" color="orange" />
      </div>

      {/* ── Chart + Quick links ───────────────────── */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-6">
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-[#111827]">Weekly study hours</h3>
            <p className="mt-0.5 text-xs text-[#9ca3af]">Sessions recorded this week</p>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis allowDecimals tickLine={false} axisLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip content={<ChartTip />} cursor={{ fill: '#eff6ff' }} />
                <Bar dataKey="hours" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-0.5 text-sm font-semibold text-[#111827]">Quick access</h3>
          <p className="mb-4 text-xs text-[#9ca3af]">Jump to your tools</p>
          <div className="space-y-2">
            {quickLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="group flex items-center gap-3 rounded-xl border border-[#f3f4f6] bg-[#fafafa] px-3.5 py-2.5 text-sm font-medium text-[#374151] transition-all hover:border-[#bfdbfe] hover:bg-[#eff6ff] hover:text-[#2563eb]"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm transition-colors group-hover:bg-[#dbeafe]">
                  <Icon size={14} className="text-[#6b7280] group-hover:text-[#2563eb]" />
                </span>
                {label}
                <ArrowUpRight size={12} className="ml-auto text-[#d1d5db] group-hover:text-[#2563eb]" />
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Recent quizzes ────────────────────────── */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#111827]">Recent quiz activity</h3>
          <Button to="/quiz" variant="ghost" size="sm">
            View all <ArrowUpRight size={12} />
          </Button>
        </div>

        {recentAttempts.length === 0 ? (
          <EmptyState
            icon={ListChecks}
            title="No quiz activity yet"
            message="Take your first quiz and your scores will appear here."
            action={<Button to="/quiz">Generate a quiz</Button>}
          />
        ) : (
          <Card className="divide-y divide-[#f9fafb] p-0 overflow-hidden">
            {recentAttempts.map((a) => (
              <div key={a._id} className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-[#fafafa] transition-colors">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#111827]">{a.subject}: {a.topic}</p>
                  <p className="mt-0.5 text-xs text-[#9ca3af]">{new Date(a.createdAt).toLocaleString()}</p>
                </div>
                <Badge variant={a.percentage >= 70 ? 'green' : a.percentage >= 40 ? 'amber' : 'red'}>
                  {a.score}/{a.total} · {a.percentage}%
                </Badge>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  )
}
