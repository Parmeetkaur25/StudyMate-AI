import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Plus, Trash2, Sparkles, Circle, CheckCircle2, ListChecks, GraduationCap, CalendarClock } from 'lucide-react'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import Badge from '../components/ui/Badge'
import { inputCls } from '../components/ui/Input'
import api, { getErrorMessage } from '../services/api'
import { localToday, formatDay } from '../utils/dates'

const emptySubject = () => ({ name: '', topics: '', priority: 'medium' })
const daysLeft     = (d) => Math.round((Date.parse(d.slice(0, 10)) - Date.parse(localToday())) / 86400000)
const prioVariant  = { high: 'red', medium: 'amber', low: 'slate' }

const ProgressBar = ({ label, done, total }) => {
  const pct = total ? Math.round((done / total) * 100) : 0
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-xs text-[#6b7280]">
        <span>{label}: {done}/{total}</span>
        <span className="font-bold text-[#2563eb]">{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#f3f4f6]">
        <div className="h-full rounded-full bg-[#2563eb] transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function ExamPrep() {
  const navigate = useNavigate()
  const [exams, setExams]       = useState([])
  const [activeId, setActiveId] = useState(null)
  const [mode, setMode]         = useState('view')
  const [showAll, setShowAll]   = useState(false)
  const [loading, setLoading]   = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError]       = useState('')
  const [form, setForm]         = useState({ title: '', examDate: '', availableHoursPerDay: 3 })
  const [subjects, setSubjects] = useState([emptySubject()])

  useEffect(() => {
    api.get('/exams')
      .then((r) => { setExams(r.data.exams); if (r.data.exams.length) setActiveId(r.data.exams[0]._id); else setMode('create') })
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [])

  const exam       = exams.find((e) => e._id === activeId)
  const replace    = (u) => setExams((xs) => xs.map((x) => (x._id === u._id ? u : x)))
  const setSubject = (i, f, v) => setSubjects(subjects.map((s, idx) => (idx === i ? { ...s, [f]: v } : s)))

  const create = async (e) => {
    e.preventDefault(); setError(''); setCreating(true)
    try {
      const res = await api.post('/exams', {
        ...form, startDate: localToday(),
        availableHoursPerDay: Number(form.availableHoursPerDay),
        subjects: subjects.map((s) => ({ ...s, topics: s.topics.split(',').map((t) => t.trim()).filter(Boolean) })),
      })
      setExams((xs) => [...xs, res.data.exam].sort((a, b) => a.examDate.localeCompare(b.examDate)))
      setActiveId(res.data.exam._id)
      setMode('view'); setForm({ title: '', examDate: '', availableHoursPerDay: 3 }); setSubjects([emptySubject()])
    } catch (err) { setError(getErrorMessage(err)) }
    finally { setCreating(false) }
  }

  const patch = async (url, completed) => {
    setError('')
    try { replace((await api.patch(url, { completed })).data.exam) }
    catch (err) { setError(getErrorMessage(err)) }
  }

  const remove = async () => {
    if (!window.confirm('Delete this exam and its schedule?')) return
    try {
      await api.delete(`/exams/${exam._id}`)
      const rest = exams.filter((x) => x._id !== exam._id)
      setExams(rest); setActiveId(rest[0]?._id ?? null)
      if (!rest.length) setMode('create')
    } catch (err) { setError(getErrorMessage(err)) }
  }

  const grouped = useMemo(() => {
    if (!exam) return []
    const today = localToday(); const g = {}
    exam.schedule.forEach((i) => {
      const k = i.date.slice(0, 10)
      if (showAll || k >= today) (g[k] ||= []).push(i)
    })
    return Object.entries(g).sort(([a], [b]) => a.localeCompare(b))
  }, [exam, showAll])

  if (loading) return (
    <div className="flex justify-center py-24">
      <Loader2 className="animate-spin text-[#2563eb]" size={28} />
    </div>
  )

  const left      = exam ? daysLeft(exam.examDate) : 0
  const allTopics = exam ? exam.subjects.flatMap((s) => s.topics) : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#0f172a]">Exam Preparation</h2>
          <p className="mt-0.5 text-sm text-[#6b7280]">Provide your syllabus and AI generates a full revision schedule.</p>
        </div>
        {exams.length > 0 && mode === 'view' && (
          <button onClick={() => setMode('create')} className="flex items-center gap-2 rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1d4ed8]">
            <Plus size={15} /> New exam
          </button>
        )}
      </div>

      {error && <div className="rounded-xl border border-[#fca5a5] bg-[#fff1f2] px-4 py-3 text-sm text-[#b91c1c]">{error}</div>}

      {/* ── Create form ───────────────────────────── */}
      {mode === 'create' && (
        <Card className="p-6">
          <div className="mb-5 flex items-center gap-2">
            <Sparkles size={15} className="text-[#2563eb]" />
            <h3 className="text-sm font-semibold text-[#111827]">New exam setup</h3>
          </div>
          <form onSubmit={create} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block text-xs font-semibold uppercase tracking-wide text-[#374151]">
                Exam name
                <input className={inputCls} required minLength={2} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Semester 3 finals" />
              </label>
              <label className="block text-xs font-semibold uppercase tracking-wide text-[#374151]">
                Exam date
                <input className={inputCls} type="date" required min={localToday()} value={form.examDate} onChange={(e) => setForm({ ...form, examDate: e.target.value })} />
              </label>
              <label className="block text-xs font-semibold uppercase tracking-wide text-[#374151]">
                Study hours / day
                <input className={inputCls} type="number" step="0.5" min="0.5" max="12" required value={form.availableHoursPerDay} onChange={(e) => setForm({ ...form, availableHoursPerDay: e.target.value })} />
              </label>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wide text-[#374151]">Subjects & syllabus</h4>
              {subjects.map((s, i) => (
                <div key={i} className="grid gap-3 rounded-xl border border-[#f3f4f6] bg-[#fafafa] p-4 sm:grid-cols-6">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-[#374151] sm:col-span-2">
                    Subject
                    <input className={inputCls} required value={s.name} onChange={(e) => setSubject(i, 'name', e.target.value)} placeholder="DBMS" />
                  </label>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-[#374151] sm:col-span-2">
                    Priority
                    <select className={inputCls} value={s.priority} onChange={(e) => setSubject(i, 'priority', e.target.value)}>
                      <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                    </select>
                  </label>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-[#374151] sm:col-span-6">
                    Syllabus topics <span className="font-normal normal-case text-[#9ca3af]">(comma separated)</span>
                    <input className={inputCls} required value={s.topics} onChange={(e) => setSubject(i, 'topics', e.target.value)} placeholder="ER model, Normalization, SQL joins, Transactions" />
                  </label>
                  {subjects.length > 1 && (
                    <button type="button" onClick={() => setSubjects(subjects.filter((_, x) => x !== i))} className="flex items-center gap-1 text-xs font-medium text-[#ef4444] hover:text-[#dc2626] sm:col-span-6">
                      <Trash2 size={12} /> Remove subject
                    </button>
                  )}
                </div>
              ))}
              {subjects.length < 8 && (
                <button type="button" onClick={() => setSubjects([...subjects, emptySubject()])} className="flex items-center gap-1.5 text-sm font-semibold text-[#2563eb] hover:text-[#1d4ed8] transition">
                  <Plus size={14} /> Add subject
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button disabled={creating} className="flex items-center gap-2 rounded-xl bg-[#2563eb] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1d4ed8] hover:shadow-md disabled:opacity-60">
                {creating ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                {creating ? 'Generating schedule…' : 'Create & generate schedule'}
              </button>
              {exams.length > 0 && (
                <button type="button" onClick={() => setMode('view')} className="rounded-xl border border-[#e5e7eb] px-5 py-2.5 text-sm font-semibold text-[#374151] hover:bg-[#f9fafb] transition">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </Card>
      )}

      {/* ── View exam ─────────────────────────────── */}
      {mode === 'view' && exam && (
        <>
          <Card className="p-5">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <select
                className="rounded-xl border border-[#e5e7eb] bg-white px-3 py-2 text-sm font-semibold outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10"
                value={activeId} onChange={(e) => setActiveId(e.target.value)}
              >
                {exams.map((x) => <option key={x._id} value={x._id}>{x.title}</option>)}
              </select>
              <button onClick={remove} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-[#ef4444] hover:bg-[#fff1f2] transition">
                <Trash2 size={13} /> Delete exam
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {/* Countdown */}
              <div className="flex flex-col items-center justify-center rounded-2xl bg-[#0f172a] p-5 text-center text-white shadow">
                <p className="text-5xl font-extrabold tabular-nums text-[#60a5fa]">
                  {left > 0 ? left : left === 0 ? '🎯' : '✓'}
                </p>
                <p className="mt-1 text-sm font-medium text-white/60">
                  {left > 0 ? `day${left === 1 ? '' : 's'} left` : left === 0 ? 'Exam is today!' : 'Exam completed'}
                </p>
                <p className="mt-2 text-xs text-white/35">
                  {formatDay(exam.examDate.slice(0, 10), { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>

              <div className="space-y-5 sm:col-span-2 self-center">
                <ProgressBar label="Topics covered"  done={allTopics.filter((t) => t.completed).length}       total={allTopics.length} />
                <ProgressBar label="Schedule done"   done={exam.schedule.filter((i) => i.completed).length}   total={exam.schedule.length} />
              </div>
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Syllabus */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <GraduationCap size={15} className="text-[#2563eb]" />
                <h3 className="text-sm font-semibold text-[#111827]">Syllabus</h3>
              </div>
              {exam.subjects.map((s) => (
                <Card key={s._id} className="p-5">
                  <p className="mb-3 text-sm font-semibold text-[#111827]">{s.name}</p>
                  <ul className="space-y-2.5">
                    {s.topics.map((t) => (
                      <li key={t._id} className="flex items-center gap-3 text-sm">
                        <button
                          onClick={() => patch(`/exams/${exam._id}/topics/${s._id}/${t._id}`, !t.completed)}
                          className={`shrink-0 transition ${t.completed ? 'text-[#16a34a]' : 'text-[#d1d5db] hover:text-[#2563eb]'}`}
                        >
                          {t.completed ? <CheckCircle2 size={19} /> : <Circle size={19} />}
                        </button>
                        <span className={`flex-1 leading-snug ${t.completed ? 'text-[#9ca3af] line-through' : 'text-[#374151]'}`}>
                          {t.name}
                        </span>
                        <Badge variant={prioVariant[t.priority]} className="hidden sm:inline-flex">{t.priority}</Badge>
                        <button
                          onClick={() => navigate('/quiz', { state: { subject: s.name, topic: t.name } })}
                          title="Mock quiz on this topic"
                          className="shrink-0 rounded-lg p-1.5 text-[#d1d5db] transition hover:bg-[#eff6ff] hover:text-[#2563eb]"
                        >
                          <ListChecks size={15} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>

            {/* Schedule */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarClock size={15} className="text-[#2563eb]" />
                  <h3 className="text-sm font-semibold text-[#111827]">Revision schedule</h3>
                </div>
                <button onClick={() => setShowAll(!showAll)} className="text-xs font-semibold text-[#2563eb] hover:text-[#1d4ed8] transition">
                  {showAll ? 'Show upcoming only' : 'Show all days'}
                </button>
              </div>

              {grouped.length === 0 ? (
                <EmptyState
                  icon={CalendarClock}
                  title="No upcoming revision"
                  message="All days have passed. Toggle 'Show all days' to view the full schedule."
                />
              ) : grouped.map(([day, items]) => (
                <div key={day}>
                  <div className="mb-2 flex items-center gap-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-[#6b7280]">{formatDay(day)}</p>
                    {day === localToday() && <Badge variant="blue">Today</Badge>}
                  </div>
                  <Card className="divide-y divide-[#f9fafb] p-0 overflow-hidden">
                    {items.map((i) => (
                      <div key={i._id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#fafafa] transition-colors">
                        <button
                          onClick={() => patch(`/exams/${exam._id}/schedule/${i._id}`, !i.completed)}
                          className={`shrink-0 transition ${i.completed ? 'text-[#16a34a]' : 'text-[#d1d5db] hover:text-[#2563eb]'}`}
                        >
                          {i.completed ? <CheckCircle2 size={19} /> : <Circle size={19} />}
                        </button>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-medium ${i.completed ? 'text-[#9ca3af] line-through' : 'text-[#111827]'}`}>
                            {i.subject}: {i.topic}
                          </p>
                          <p className="text-xs text-[#9ca3af]">{i.durationMinutes} min</p>
                        </div>
                      </div>
                    ))}
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
