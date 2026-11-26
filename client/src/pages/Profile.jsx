import { useState } from 'react'
import { Loader2, CheckCircle2, Mail, Shield, Pencil } from 'lucide-react'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { inputCls } from '../components/ui/Input'
import { useAuth } from '../context/useAuth'
import { getErrorMessage } from '../services/api'

const levelLabel = {
  school: 'School student', college: 'College student', university: 'University student',
  competitive: 'Competitive exam', 'self-learner': 'Independent learner',
}

export default function Profile() {
  const { user, updateProfile } = useAuth()
  const [form, setForm] = useState({
    name:                user.name,
    educationLevel:      user.educationLevel,
    course:              user.course || '',
    dailyGoalMinutes:    user.dailyGoalMinutes,
    preferredStudyTime:  user.preferredStudyTime,
    subjects:            (user.subjects || []).join(', '),
  })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]       = useState({ type: '', text: '' })
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setMsg({ type: '', text: '' })
    try {
      await updateProfile({
        ...form,
        dailyGoalMinutes: Number(form.dailyGoalMinutes),
        subjects: form.subjects.split(',').map((s) => s.trim()).filter(Boolean),
      })
      setMsg({ type: 'ok', text: 'Profile updated successfully!' })
    } catch (err) { setMsg({ type: 'err', text: getErrorMessage(err) }) }
    finally { setSaving(false) }
  }

  const initials = user?.name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-[#0f172a]">Profile Settings</h2>
        <p className="mt-0.5 text-sm text-[#6b7280]">Manage your account details and study preferences.</p>
      </div>

      {/* Identity */}
      <Card className="flex items-center gap-5 p-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#2563eb] text-xl font-extrabold text-white shadow">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-base font-semibold text-[#111827]">{user.name}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 text-xs text-[#6b7280]"><Mail size={11} /> {user.email}</span>
            <Badge variant={user.role === 'admin' ? 'blue' : 'slate'}>
              <Shield size={9} /> {user.role}
            </Badge>
            <Badge variant="indigo">{levelLabel[user.educationLevel] ?? user.educationLevel}</Badge>
          </div>
        </div>
      </Card>

      {/* Edit */}
      <Card className="p-6">
        <div className="mb-5 flex items-center gap-2">
          <Pencil size={14} className="text-[#2563eb]" />
          <h3 className="text-sm font-semibold text-[#111827]">Edit profile</h3>
        </div>

        {msg.text && (
          <div className={`mb-5 flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm ${
            msg.type === 'ok'
              ? 'border-[#86efac] bg-[#f0fdf4] text-[#15803d]'
              : 'border-[#fca5a5] bg-[#fff1f2] text-[#b91c1c]'
          }`}>
            {msg.type === 'ok' && <CheckCircle2 size={15} />} {msg.text}
          </div>
        )}

        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          {[
            { label: 'Full name',       name: 'name',  span: 2, placeholder: '' },
          ].map(({ label, name, span, placeholder }) => (
            <label key={name} className={`block text-xs font-semibold uppercase tracking-wide text-[#374151] ${span === 2 ? 'sm:col-span-2' : ''}`}>
              {label}
              <input className={inputCls} name={name} value={form[name]} onChange={onChange} required placeholder={placeholder} />
            </label>
          ))}

          <label className="block text-xs font-semibold uppercase tracking-wide text-[#374151]">
            Education level
            <select className={inputCls} name="educationLevel" value={form.educationLevel} onChange={onChange}>
              {Object.entries(levelLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>

          <label className="block text-xs font-semibold uppercase tracking-wide text-[#374151]">
            Course / Class
            <input className={inputCls} name="course" value={form.course} onChange={onChange} placeholder="e.g. BCA 2nd year" />
          </label>

          <label className="block text-xs font-semibold uppercase tracking-wide text-[#374151]">
            Daily goal
            <div className="relative">
              <input className={inputCls} type="number" min="10" max="1440" name="dailyGoalMinutes" value={form.dailyGoalMinutes} onChange={onChange} />
              <span className="pointer-events-none absolute right-3 top-1/2 mt-0.5 -translate-y-1/2 text-xs text-[#9ca3af]">min/day</span>
            </div>
          </label>

          <label className="block text-xs font-semibold uppercase tracking-wide text-[#374151]">
            Preferred study time
            <select className={inputCls} name="preferredStudyTime" value={form.preferredStudyTime} onChange={onChange}>
              {['morning', 'afternoon', 'evening', 'night', 'flexible'].map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </label>

          <label className="block text-xs font-semibold uppercase tracking-wide text-[#374151] sm:col-span-2">
            My subjects <span className="font-normal normal-case text-[#9ca3af]">(comma separated)</span>
            <input className={inputCls} name="subjects" value={form.subjects} onChange={onChange} placeholder="Maths, Physics, DBMS" />
          </label>

          <div className="sm:col-span-2">
            <button
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-[#2563eb] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1d4ed8] hover:shadow-md disabled:opacity-60"
            >
              {saving && <Loader2 size={15} className="animate-spin" />} Save changes
            </button>
          </div>
        </form>
      </Card>
    </div>
  )
}
