import { useEffect, useState } from 'react'
import { Loader2, CheckCircle2, XCircle, RotateCcw, Trophy, Target } from 'lucide-react'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import Badge from '../components/ui/Badge'
import { inputCls } from '../components/ui/Input'
import api, { getErrorMessage } from '../services/api'
import { useLocation } from 'react-router-dom'

export default function QuizGenerator() {
  const location = useLocation()
  const [view, setView]       = useState('setup')
  const [form, setForm]       = useState({
    subject: location.state?.subject || '',
    topic:   location.state?.topic   || '',
    difficulty: 'medium',
    count: 5,
  })
  const [quiz, setQuiz]       = useState(null)
  const [answers, setAnswers] = useState([])
  const [result, setResult]   = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const loadHistory = () =>
    api.get('/quizzes/attempts').then((r) => setHistory(r.data.attempts)).catch(() => {})

  useEffect(() => { loadHistory() }, [])

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const generate = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const r = await api.post('/quizzes/generate', { ...form, count: Number(form.count) })
      setQuiz(r.data.quiz)
      setAnswers(new Array(r.data.quiz.questions.length).fill(null))
      setView('take')
    } catch (err) { setError(getErrorMessage(err)) }
    finally { setLoading(false) }
  }

  const submit = async () => {
    const unanswered = answers.filter((a) => a === null).length
    if (unanswered && !window.confirm(`${unanswered} question(s) unanswered. Submit anyway?`)) return
    setError(''); setLoading(true)
    try {
      const r = await api.post(`/quizzes/${quiz.id}/submit`, { answers })
      setResult(r.data.result); setView('result'); loadHistory()
    } catch (err) { setError(getErrorMessage(err)) }
    finally { setLoading(false) }
  }

  const reset = () => { setView('setup'); setQuiz(null); setResult(null); setError('') }

  /* ── TAKE ─────────────────────────────────────── */
  if (view === 'take') {
    const answered = answers.filter((a) => a !== null).length
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-[#0f172a]">{quiz.subject}: {quiz.topic}</h2>
            <p className="mt-0.5 text-sm capitalize text-[#6b7280]">{quiz.difficulty} · {quiz.questions.length} questions</p>
          </div>
          <span className="shrink-0 rounded-xl border border-[#e5e7eb] bg-white px-3 py-1.5 text-sm shadow-sm">
            <span className="font-semibold text-[#2563eb]">{answered}</span>
            <span className="text-[#9ca3af]">/{quiz.questions.length} answered</span>
          </span>
        </div>

        {/* Progress */}
        <div className="h-1.5 overflow-hidden rounded-full bg-[#f3f4f6]">
          <div
            className="h-full rounded-full bg-[#2563eb] transition-all duration-500"
            style={{ width: `${(answered / quiz.questions.length) * 100}%` }}
          />
        </div>

        {quiz.questions.map((q, qi) => (
          <Card key={qi} className="p-5">
            <div className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#eff6ff] text-[10px] font-bold text-[#2563eb]">{qi + 1}</span>
              <p className="font-medium text-[#111827] leading-snug">{q.question}</p>
            </div>
            <div className="mt-4 space-y-2 pl-9">
              {q.options.map((opt, oi) => (
                <button
                  key={oi}
                  onClick={() => setAnswers(answers.map((a, i) => i === qi ? oi : a))}
                  className={`w-full rounded-xl border px-4 py-2.5 text-left text-sm transition-all ${
                    answers[qi] === oi
                      ? 'border-[#2563eb] bg-[#eff6ff] text-[#1d4ed8] shadow-sm'
                      : 'border-[#e5e7eb] hover:border-[#bfdbfe] hover:bg-[#f9fafb]'
                  }`}
                >
                  <span className={`mr-2.5 font-bold ${answers[qi] === oi ? 'text-[#2563eb]' : 'text-[#9ca3af]'}`}>{'ABCD'[oi]}.</span>
                  {opt}
                </button>
              ))}
            </div>
          </Card>
        ))}

        {error && <div className="rounded-xl border border-[#fca5a5] bg-[#fff1f2] px-4 py-3 text-sm text-[#b91c1c]">{error}</div>}
        <button
          onClick={submit}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-[#2563eb] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1d4ed8] hover:shadow-md disabled:opacity-60"
        >
          {loading && <Loader2 size={15} className="animate-spin" />} Submit quiz
        </button>
      </div>
    )
  }

  /* ── RESULT ───────────────────────────────────── */
  if (view === 'result') {
    const grade = result.percentage >= 80 ? '🏆' : result.percentage >= 60 ? '👏' : result.percentage >= 40 ? '📚' : '💪'
    const scoreVariant = result.percentage >= 70 ? 'green' : result.percentage >= 40 ? 'amber' : 'red'

    return (
      <div className="mx-auto max-w-3xl space-y-5">
        <Card className="p-8 text-center bg-gradient-to-br from-[#f0f7ff] to-[#f5f3ff] border-[#dbeafe]">
          <div className="mb-2 text-5xl">{grade}</div>
          <p className="text-sm font-medium text-[#6b7280]">Your score</p>
          <p className="mt-1 text-5xl font-extrabold tracking-tight text-[#0f172a]">{result.score}/{result.total}</p>
          <div className="mt-2"><Badge variant={scoreVariant} className="text-xs px-3 py-1">{result.percentage}%</Badge></div>
          <button
            onClick={reset}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1d4ed8]"
          >
            <RotateCcw size={14} /> Take another quiz
          </button>
        </Card>

        <h3 className="text-sm font-semibold text-[#111827]">Question review</h3>
        {result.review.map((r, i) => (
          <Card key={i} className={`p-5 ${r.isCorrect ? 'border-[#bbf7d0]' : 'border-[#fecaca]'}`}>
            <div className="flex items-start gap-2.5">
              {r.isCorrect
                ? <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-[#16a34a]" />
                : <XCircle     size={17} className="mt-0.5 shrink-0 text-[#dc2626]" />
              }
              <p className="font-medium text-[#111827] leading-snug">{i + 1}. {r.question}</p>
            </div>
            <div className="mt-3 space-y-1.5 pl-7">
              {r.options.map((opt, oi) => {
                const correct   = oi === r.correctIndex
                const wrongPick = oi === r.selectedIndex && !correct
                return (
                  <div
                    key={oi}
                    className={`rounded-xl border px-3.5 py-2.5 text-sm ${
                      correct   ? 'border-[#86efac] bg-[#f0fdf4] text-[#166534]'
                    : wrongPick ? 'border-[#fca5a5] bg-[#fff1f2] text-[#991b1b]'
                    :             'border-[#f3f4f6] text-[#6b7280]'
                    }`}
                  >
                    <span className="mr-2 font-bold">{'ABCD'[oi]}.</span>{opt}
                    {correct   && <span className="ml-2 rounded-full bg-[#dcfce7] px-2 py-0.5 text-[10px] font-semibold text-[#15803d]">✓ correct</span>}
                    {wrongPick && <span className="ml-2 rounded-full bg-[#fee2e2] px-2 py-0.5 text-[10px] font-semibold text-[#b91c1c]">your answer</span>}
                  </div>
                )
              })}
              {r.selectedIndex === null && <p className="text-xs italic text-[#9ca3af]">Skipped</p>}
            </div>
            {r.explanation && (
              <div className="mt-3 pl-7 flex gap-2 rounded-xl bg-[#eff6ff] border border-[#bfdbfe] p-3 text-sm text-[#1d4ed8]">
                <span className="font-semibold">💡</span>{r.explanation}
              </div>
            )}
          </Card>
        ))}
      </div>
    )
  }

  /* ── SETUP ────────────────────────────────────── */
  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-[#0f172a]">AI Quiz Generator</h2>
        <p className="mt-0.5 text-sm text-[#6b7280]">Choose a topic; AI generates an MCQ quiz. Answers shown only after submission.</p>
      </div>

      <Card className="max-w-2xl p-6">
        <h3 className="mb-4 text-sm font-semibold text-[#111827]">Configure your quiz</h3>
        {error && <div className="mb-4 rounded-xl border border-[#fca5a5] bg-[#fff1f2] px-4 py-3 text-sm text-[#b91c1c]">{error}</div>}
        <form onSubmit={generate} className="grid gap-4 sm:grid-cols-2">
          <label className="block text-xs font-semibold uppercase tracking-wide text-[#374151]">
            Subject
            <input className={inputCls} name="subject" value={form.subject} onChange={onChange} required minLength={2} placeholder="e.g. DBMS" />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-wide text-[#374151]">
            Topic
            <input className={inputCls} name="topic" value={form.topic} onChange={onChange} required minLength={2} placeholder="e.g. Normalization" />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-wide text-[#374151]">
            Difficulty
            <select className={inputCls} name="difficulty" value={form.difficulty} onChange={onChange}>
              <option value="easy">🟢 Easy</option>
              <option value="medium">🟡 Medium</option>
              <option value="hard">🔴 Hard</option>
            </select>
          </label>
          <label className="block text-xs font-semibold uppercase tracking-wide text-[#374151]">
            Questions (3–15)
            <input className={inputCls} type="number" min="3" max="15" name="count" value={form.count} onChange={onChange} />
          </label>
          <div className="sm:col-span-2">
            <button
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-[#2563eb] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1d4ed8] hover:shadow-md disabled:opacity-60"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Target size={15} />}
              {loading ? 'Generating quiz…' : 'Generate quiz'}
            </button>
          </div>
        </form>
      </Card>

      {/* History */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Trophy size={15} className="text-[#d97706]" />
          <h3 className="text-sm font-semibold text-[#111827]">Quiz history</h3>
        </div>
        {history.length === 0 ? (
          <EmptyState icon={Target} title="No quiz attempts yet" message="Take your first quiz — scores are saved here." />
        ) : (
          <Card className="divide-y divide-[#f9fafb] p-0 overflow-hidden">
            {history.map((a) => (
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
