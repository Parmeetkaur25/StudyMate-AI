import { useEffect, useState } from 'react'
import { Users, ListChecks, FileText, Timer, CalendarDays, GraduationCap, MessageCircle, Loader2, ShieldCheck } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import Card from '../components/ui/Card'
import StatCard from '../components/ui/StatCard'
import Badge from '../components/ui/Badge'
import api, { getErrorMessage } from '../services/api'
import { formatDay } from '../utils/dates'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.get('/admin/stats'), api.get('/admin/users')])
      .then(([s, u]) => { setStats(s.data.stats); setUsers(u.data.users) })
      .catch((e) => setError(getErrorMessage(e)))
  }, [])

  if (error) return <div className="rounded-xl border border-[#fca5a5] bg-[#fff1f2] px-4 py-3 text-sm text-[#b91c1c]">{error}</div>
  if (!stats) return (
    <div className="flex justify-center py-24">
      <Loader2 className="animate-spin text-[#2563eb]" size={28} />
    </div>
  )

  const chart = stats.signups.map((d) => ({
    day: formatDay(d.date, { day: 'numeric', month: 'short' }),
    signups: d.count,
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563eb] text-white shadow">
          <ShieldCheck size={19} />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#0f172a]">Admin Dashboard</h2>
          <p className="text-xs text-[#6b7280]">Platform-wide metrics and user management.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users}        label="Total users"      value={stats.users}         hint={`${stats.students} students · ${stats.admins} admins`} color="blue" />
        <StatCard icon={ListChecks}   label="Quiz attempts"    value={stats.attempts}      hint={`${stats.quizzes} quizzes generated`} color="indigo" />
        <StatCard icon={FileText}     label="Notes summarised" value={stats.notes}         color="green" />
        <StatCard icon={Timer}        label="Study sessions"   value={stats.sessions}      color="orange" />
        <StatCard icon={CalendarDays} label="Study plans"      value={stats.plans}         color="violet" />
        <StatCard icon={GraduationCap}label="Exam preps"       value={stats.exams}         color="amber" />
        <StatCard icon={MessageCircle}label="Doubt chats"      value={stats.conversations} color="blue" />
      </div>

      {/* Signups chart */}
      <Card className="p-6">
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-[#111827]">New signups</h3>
          <p className="mt-0.5 text-xs text-[#9ca3af]">Last 14 days</p>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} interval={1} tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.07)', fontSize: '13px' }}
                cursor={{ fill: '#eff6ff' }}
              />
              <Bar dataKey="signups" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Users table */}
      <Card className="overflow-hidden p-0">
        <div className="border-b border-[#f3f4f6] px-6 py-4">
          <h3 className="text-sm font-semibold text-[#111827]">Users</h3>
          <p className="mt-0.5 text-xs text-[#9ca3af]">Latest 100 registered users</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f9fafb]">
              <tr>
                {['Name', 'Email', 'Role', 'Level', 'Joined'].map((h) => (
                  <th key={h} className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f9fafb]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#fafafa] transition-colors">
                  <td className="px-5 py-3 font-medium text-[#111827]">{u.name}</td>
                  <td className="px-5 py-3 text-[#6b7280]">{u.email}</td>
                  <td className="px-5 py-3"><Badge variant={u.role === 'admin' ? 'blue' : 'slate'}>{u.role}</Badge></td>
                  <td className="px-5 py-3 capitalize text-[#6b7280]">{u.educationLevel}</td>
                  <td className="px-5 py-3 text-[#9ca3af]">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
