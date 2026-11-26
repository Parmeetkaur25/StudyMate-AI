import { useEffect, useMemo, useState } from 'react'
import { Loader2, Plus, Trash2, Pencil, Check, X, Sparkles, Circle, CheckCircle2, CalendarDays } from 'lucide-react'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import Badge from '../components/ui/Badge'
import { inputCls } from '../components/ui/Input'
import api, { getErrorMessage } from '../services/api'
import { localToday, addDays, formatDay } from '../utils/dates'

const emptySubject = () => ({ name: '', topics: '', examDate: '', priority: 'medium', level: 'beginner' })
const typeVariant  = { study: 'indigo', revision: 'amber', practice: 'green' }

export default function StudyPlanner() {
  const [plans, setPlans]           = useState([])
  const [activeId, setActiveId]     = useState(null)
  const [mode, setMode]             = useState('view')
  const [filter, setFilter]         = useState('today')
  const [loading, setLoading]       = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError]           = useState('')
  const [editing, setEditing]       = useState(null)
  const [form, setForm]             = useState({ title: '', startDate: localToday(), availableHoursPerDay: 3, sessionLength: 'medium' })
  const [subjects, setSubjects]     = useState([emptySubject()])

  useEffect(() => {
    api.get('/plans')
      .then((r) => {
        setPlans(r.data.plans)
        if (r.data.plans.length) setActiveId(r.data.plans[0]._id)
        else setMode('create')
      })
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [])

  const plan       = plans.find((p) => p._id === activeId)
  const replacePlan = (u) => setPlans((ps) => ps.map((p) => (p._id === u._id ? u : p)))
  const setSubject  = (i, f, v) => setSubjects(subjects.map((s, idx) => idx === i ? { ...s, [f]: v } : s))

  const generate = async (e) => {
    e.preventDefault(); setError(''); setGenerating(true)
    try {
      const res = await api.post('/plans/generate', {
        ...form,
        availableHoursPerDay: Number(form.availableHoursPerDay),
        subjects: subjects.map((s) => ({ ...s, topics: s.topics.split(',').map((t) => t.trim()).filter(Boolean) })),
      })
      setPlans((ps) => [res.data.plan, ...ps])
      setActiveId(res.data.plan._id)
      setMode('view'); setFilter('all')
    } catch (err) { setError(getErrorMessage(err)) }
    finally { setGenerating(false) }
  }

  const patchTask = async (taskId, body) => {
    setError('')
    try { const r = await api.patch(`/plans/${plan._id}/tasks/${taskId}`, body); replacePlan(r.data.plan); return true }
    catch (err) { setError(getErrorMessage(err)); return false }
  }

  const removeTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return
    try { replacePlan((await api.delete(`/plans/${plan._id}/tasks/${taskId}`)).data.plan) }
    catch (err) { setError(getErrorMessage(err)) }
  }

  const removePlan = async () => {
    if (!window.confirm('Delete the whole plan?')) return
    try {
      await api.delete(`/plans/${plan._id}`)
      const rest = plans.filter((p) => p._id !== plan._id)
      setPlans(rest); setActiveId(rest[0]?._id ?? null)
      if (!rest.length) setMode('create')
    } catch (err) { setError(getErrorMessage(err)) }
  }

  const saveEdit = async () => {
    const ok = await patchTask(editing.id, { title: editing.title, durationMinutes: Number(editing.durationMinutes) })
    if (ok) setEditing(null)
  }

  const visible = useMemo(() => {
    if (!plan) return []
    const today = localToday(); const weekEnd = addDays(today, 6)
    return plan.tasks.filter((t) => {
      const k = t.date.slice(0, 10)
      if (filter === 'today') return k === today
      if (filter === 'week')  return k >= today && k <= weekEnd
      return true
    })
  }, [plan, filter])

  const grouped = useMemo(() => {
    const g = {}
    visible.forEach((t) => { (g[t.date.slice(0, 10)] ||= []).push(t) })
    return Object.entries(g).sort(([a], [b]) => a.localeCompare(b))
  }, [visible])

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-[#2563eb]" size={28} /></div>

  const done = plan ? plan.tasks.filter((t) => t.completed).length : 0
  const pct  = plan && plan.tasks.length ? Math.round((done / plan.tasks.length) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#0f172a]">AI Study Planner</h2>
          <p className="mt-0.5 text-sm text-[#6b7280]">Provide subjects and exam dates — AI builds a personalised day-by-day timetable.</p>
        </div>
        {plans.length > 0 && mode === 'view' && (
          <button onClick={() => setMode('create')} className="flex items-center gap-2 rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1d4ed8]">
            <Plus size={15} /> New plan
          </button>
        )}
      </div>

      {error && <div className="rounded-xl border border-[#fca5a5] bg-[#fff1f2] px-4 py-3 text-sm text-[#b91c1c]">{error}</div>}

      {/* Create form */}
      {mode === 'create' && (
        <Card className="p-6">
          <div className="mb-5 flex items-center gap-2">
            <Sparkles size={15} className="text-[#2563eb]" />
            <h3 className="text-sm font-semibold text-[#111827]">Create new study plan</h3>
          </div>
          <form onSubmit={generate} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-4">
              <label className="block text-xs font-semibold uppercase tracking-wide text-[#374151] sm:col-span-2">
                Plan title <span className="font-normal normal-case text-[#9ca3af]">(optional)</span>
                <input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Semester exams" />
              </label>
              <label className="block text-xs font-semibold uppercase tracking-wide text-[#374151]">
                Start date
                <input className={inputCls} type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </label>
              <label className="block text-xs font-semibold uppercase tracking-wide text-[#374151]">
                Hours / day
                <input className={inputCls} type="number" step="0.5" min="0.5" max="12" required value={form.availableHoursPerDay} onChange={(e) => setForm({ ...form, availableHoursPerDay: e.target.value })} />
              </label>
              <label className="block text-xs font-semibold uppercase tracking-wide text-[#374151] sm:col-span-2">
                Session length
                <select className={inputCls} value={form.sessionLength} onChange={(e) => setForm({ ...form, sessionLength: e.target.value })}>
                  <option value="short">Short (25–30 min)</option>
                  <option value="medium">Medium (45–60 min)</option>
                  <option value="long">Long (90 min)</option>
                </select>
              </label>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wide text-[#374151]">Subjects</h4>
              {subjects.map((s, i) => (
                <div key={i} className="grid gap-3 rounded-xl border border-[#f3f4f6] bg-[#fafafa] p-4 sm:grid-cols-6">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-[#374151] sm:col-span-2">
                    Subject name
                    <input className={inputCls} required value={s.name} onChange={(e) => setSubject(i, 'name', e.target.value)} placeholder="DBMS" />
                  </label>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-[#374151] sm:col-span-4">
                    Topics <span className="font-normal normal-case text-[#9ca3af]">(comma separated)</span>
                    <input className={inputCls} required value={s.topics} onChange={(e) => setSubject(i, 'topics', e.target.value)} placeholder="ER model, Normalization, SQL joins" />
                  </label>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-[#374151] sm:col-span-2">
                    Exam date
                    <input className={inputCls} type="date" required min={form.startDate} value={s.examDate} onChange={(e) => setSubject(i, 'examDate', e.target.value)} />
                  </label>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-[#374151] sm:col-span-2">
                    Priority
                    <select className={inputCls} value={s.priority} onChange={(e) => setSubject(i, 'priority', e.target.value)}>
                      <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                    </select>
                  </label>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-[#374151] sm:col-span-2">
                    Current level
                    <select className={inputCls} value={s.level} onChange={(e) => setSubject(i, 'level', e.target.value)}>
                      <option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option>
                    </select>
                  </label>
                  {subjects.length > 1 && (
                    <button type="button" onClick={() => setSubjects(subjects.filter((_, idx) => idx !== i))} className="flex items-center gap-1 text-xs font-medium text-[#ef4444] hover:text-[#dc2626] sm:col-span-6">
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
              <button disabled={generating} className="flex items-center gap-2 rounded-xl bg-[#2563eb] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1d4ed8] hover:shadow-md disabled:opacity-60">
                {generating ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                {generating ? 'AI is building your plan…' : 'Generate plan'}
              </button>
              {plans.length > 0 && (
                <button type="button" onClick={() => setMode('view')} className="rounded-xl border border-[#e5e7eb] px-5 py-2.5 text-sm font-semibold text-[#374151] hover:bg-[#f9fafb] transition">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </Card>
      )}

      {/* View plan */}
      {mode === 'view' && plan && (
        <>
          <Card className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <select className="rounded-xl border border-[#e5e7eb] bg-white px-3 py-2 text-sm font-semibold outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10" value={activeId} onChange={(e) => setActiveId(e.target.value)}>
                  {plans.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
                </select>
                <button onClick={removePlan} className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-[#ef4444] hover:bg-[#fff1f2] transition">
                  <Trash2 size={13} /> Delete
                </button>
              </div>
              <div className="flex rounded-xl border border-[#e5e7eb] bg-[#f9fafb] p-1">
                {[['today', 'Today'], ['week', 'This week'], ['all', 'Full plan']].map(([v, l]) => (
                  <button key={v} onClick={() => setFilter(v)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${filter === v ? 'bg-white text-[#2563eb] shadow-sm' : 'text-[#6b7280] hover:text-[#111827]'}`}>{l}</button>
                ))}
              </div>
            </div>
            <div className="mt-5">
              <div className="mb-1.5 flex justify-between text-xs text-[#6b7280]">
                <span>{done} of {plan.tasks.length} tasks completed</span>
                <span className="font-bold text-[#2563eb]">{pct}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#f3f4f6]">
                <div className="h-full rounded-full bg-[#2563eb] transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
            </div>
          </Card>

          {grouped.length === 0 ? (
            <EmptyState icon={CalendarDays} title="No tasks in this range" message="Try 'This week' or 'Full plan' filter, or create a new plan." />
          ) : (
            grouped.map(([day, tasks]) => (
              <div key={day}>
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-[#6b7280]">{formatDay(day)}</h3>
                  {day === localToday() && <Badge variant="blue">Today</Badge>}
                </div>
                <Card className="divide-y divide-[#f9fafb] p-0 overflow-hidden">
                  {tasks.map((t) => (
                    <div key={t._id} className={`flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[#fafafa] ${t.completed ? 'bg-[#fafafa]' : ''}`}>
                      <button onClick={() => patchTask(t._id, { completed: !t.completed })} className={`shrink-0 transition ${t.completed ? 'text-[#16a34a]' : 'text-[#d1d5db] hover:text-[#2563eb]'}`}>
                        {t.completed ? <CheckCircle2 size={21} /> : <Circle size={21} />}
                      </button>
                      {editing?.id === t._id ? (
                        <div className="flex flex-1 flex-wrap items-center gap-2">
                          <input className="min-w-[160px] flex-1 rounded-lg border border-[#e5e7eb] px-2.5 py-1.5 text-sm outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/20" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
                          <input className="w-20 rounded-lg border border-[#e5e7eb] px-2.5 py-1.5 text-sm outline-none focus:border-[#2563eb]" type="number" min="5" max="600" value={editing.durationMinutes} onChange={(e) => setEditing({ ...editing, durationMinutes: e.target.value })} />
                          <span className="text-xs text-[#9ca3af]">min</span>
                          <button onClick={saveEdit} className="text-[#16a34a] hover:text-[#15803d]"><Check size={17} /></button>
                          <button onClick={() => setEditing(null)} className="text-[#9ca3af] hover:text-[#374151]"><X size={17} /></button>
                        </div>
                      ) : (
                        <>
                          <div className="min-w-0 flex-1">
                            <p className={`text-sm font-medium ${t.completed ? 'text-[#9ca3af] line-through' : 'text-[#111827]'}`}>{t.title}</p>
                            <p className="mt-0.5 text-xs text-[#9ca3af]">{t.subject}{t.topic && ` · ${t.topic}`} · {t.durationMinutes} min</p>
                          </div>
                          <Badge variant={typeVariant[t.type] ?? 'slate'} className="hidden sm:inline-flex">{t.type}</Badge>
                          <button onClick={() => setEditing({ id: t._id, title: t.title, durationMinutes: t.durationMinutes })} className="shrink-0 rounded-lg p-1.5 text-[#d1d5db] hover:bg-[#f3f4f6] hover:text-[#2563eb] transition"><Pencil size={14} /></button>
                          <button onClick={() => removeTask(t._id)} className="shrink-0 rounded-lg p-1.5 text-[#d1d5db] hover:bg-[#fff1f2] hover:text-[#ef4444] transition"><Trash2 size={14} /></button>
                        </>
                      )}
                    </div>
                  ))}
                </Card>
              </div>
            ))
          )}
        </>
      )}
    </div>
  )
}
