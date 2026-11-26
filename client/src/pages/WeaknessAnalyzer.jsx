import { useEffect, useState } from 'react'
import { Loader2, Sparkles, TrendingUp, TrendingDown, Target, Brain } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import Card from '../components/ui/Card'
import StatCard from '../components/ui/StatCard'
import EmptyState from '../components/ui/EmptyState'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import api, { getErrorMessage } from '../services/api'

const statusVariant = { weak: 'red', average: 'amber', strong: 'green' }

const chartStyle = {
  contentStyle: {
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
    fontSize: '13px',
  },
  cursor: { fill: '#eff6ff' },
}

const TopicList = ({ title, items, empty, icon: Icon, iconBg, iconText }) => (
  <Card className="p-6">
    <div className="mb-4 flex items-center gap-2.5">
      <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${iconBg}`}>
        <Icon size={15} className={iconText} />
      </div>
      <h3 className="text-sm font-semibold text-[#111827]">{title}</h3>
    </div>
    {items.length === 0 ? (
      <p className="py-2 text-sm text-[#9ca3af]">{empty}</p>
    ) : (
      <ul className="space-y-2.5">
        {items.map((t) => (
          <li key={`${t.subject}-${t.topic}`} className="flex items-center justify-between gap-3 text-sm">
            <span className="min-w-0 truncate text-[#374151]">
              {t.subject}: <span className="font-semibold text-[#111827]">{t.topic}</span>
              {' '}<span className="text-xs text-[#9ca3af]">({t.attempts} attempt{t.attempts > 1 ? 's' : ''})</span>
            </span>
            <Badge variant={statusVariant[t.status]}>{t.percentage}%</Badge>
          </li>
        ))}
      </ul>
    )}
  </Card>
)

export default function WeaknessAnalyzer() {
  const [stats, setStats]           = useState(undefined)
  const [advice, setAdvice]         = useState(null)
  const [loadingAdvice, setLA]      = useState(false)
  const [error, setError]           = useState('')

  useEffect(() => {
    api.get('/weakness')
      .then((r) => setStats(r.data.stats))
      .catch((e) => { setError(getErrorMessage(e)); setStats(null) })
  }, [])

  const getAdvice = async () => {
    setError(''); setLA(true)
    try { setAdvice((await api.post('/weakness/advice')).data.advice) }
    catch (e) { setError(getErrorMessage(e)) }
    finally { setLA(false) }
  }

  if (stats === undefined) return (
    <div className="flex justify-center py-24">
      <Loader2 className="animate-spin text-[#2563eb]" size={28} />
    </div>
  )

  if (stats === null) {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#0f172a]">Weakness Analyzer</h2>
          <p className="mt-0.5 text-sm text-[#6b7280]">AI analysis based on your quiz results.</p>
        </div>
        {error && <div className="rounded-xl border border-[#fca5a5] bg-[#fff1f2] px-4 py-3 text-sm text-[#b91c1c]">{error}</div>}
        <EmptyState
          icon={Target}
          title="Need quiz data to analyze"
          message="Take a few quizzes first. Analysis is based solely on your real quiz results."
          action={<Button to="/quiz">Take a quiz</Button>}
        />
      </div>
    )
  }

  const { overall, subjects, topics, trend } = stats
  const weak      = topics.filter((t) => t.status === 'weak')
  const strong    = topics.filter((t) => t.status === 'strong').reverse()
  const trendData = trend.map((t, i) => ({ n: i + 1, percentage: t.percentage, label: t.label }))
  const improvOk  = overall.improvement !== null && overall.improvement >= 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-[#0f172a]">Weakness Analyzer</h2>
        <p className="mt-0.5 text-sm text-[#6b7280]">Numbers calculated from your quiz history. AI gives suggestions based on them.</p>
      </div>

      {error && <div className="rounded-xl border border-[#fca5a5] bg-[#fff1f2] px-4 py-3 text-sm text-[#b91c1c]">{error}</div>}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Target}     label="Quizzes attempted" value={overall.attempts} color="blue" />
        <StatCard icon={TrendingUp} label="Overall accuracy"  value={`${overall.percentage}%`} hint="Correct / total questions" color="indigo" />
        <StatCard
          icon={overall.improvement !== null && overall.improvement < 0 ? TrendingDown : TrendingUp}
          label="Improvement"
          value={overall.improvement === null ? 'N/A' : `${overall.improvement > 0 ? '+' : ''}${overall.improvement}%`}
          hint={overall.improvement === null ? 'Need at least 4 quizzes' : 'Recent vs earlier attempts'}
          color={improvOk ? 'green' : 'red'}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="mb-4 text-sm font-semibold text-[#111827]">Subject-wise accuracy (%)</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjects} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="subject" tickLine={false} axisLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip {...chartStyle} />
                <Bar dataKey="percentage" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 text-sm font-semibold text-[#111827]">Score trend (last {trendData.length} quizzes)</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="n" tickLine={false} axisLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip
                  {...chartStyle}
                  formatter={(v) => `${v}%`}
                  labelFormatter={(_, p) => p?.[0]?.payload?.label || ''}
                />
                <Line type="monotone" dataKey="percentage" stroke="#2563eb" strokeWidth={2.5} dot={{ fill: '#2563eb', strokeWidth: 0, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Topic lists */}
      <div className="grid gap-5 lg:grid-cols-2">
        <TopicList
          title="Weak topics (below 50%)"
          items={weak}
          empty="No weak topics — great job!"
          icon={TrendingDown}
          iconBg="bg-[#fee2e2]"
          iconText="text-[#dc2626]"
        />
        <TopicList
          title="Strong topics (75% or more)"
          items={strong}
          empty="No strong topics yet — keep practicing."
          icon={TrendingUp}
          iconBg="bg-[#dcfce7]"
          iconText="text-[#16a34a]"
        />
      </div>

      {/* AI advice */}
      <Card className="p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Brain size={15} className="text-[#2563eb]" />
              <h3 className="text-sm font-semibold text-[#111827]">AI improvement suggestions</h3>
            </div>
            <p className="mt-0.5 text-xs text-[#9ca3af]">Based on your actual quiz data and wrong answers</p>
          </div>
          <button
            onClick={getAdvice}
            disabled={loadingAdvice}
            className="flex items-center gap-2 rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1d4ed8] hover:shadow-md disabled:opacity-60"
          >
            {loadingAdvice ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
            {advice ? 'Refresh advice' : 'Get AI advice'}
          </button>
        </div>

        {advice && (
          <div className="space-y-5">
            {advice.summary && (
              <div className="rounded-xl border border-[#bfdbfe] bg-[#eff6ff] p-4 text-sm leading-relaxed text-[#1d4ed8]">
                {advice.summary}
              </div>
            )}

            <div className="space-y-3">
              {advice.suggestions.map((s, i) => (
                <div key={i} className="rounded-xl border border-[#f3f4f6] bg-[#fafafa] p-4 text-sm">
                  <p className="font-semibold text-[#111827]">{s.topic}</p>
                  <p className="mt-1 leading-relaxed text-[#6b7280]">{s.advice}</p>
                </div>
              ))}
            </div>

            {advice.nextQuizzes.length > 0 && (
              <div className="rounded-xl border border-[#e0e7ff] bg-[#eef2ff] p-4">
                <p className="mb-2.5 text-sm font-semibold text-[#111827]">📚 Recommended next quizzes</p>
                <ul className="space-y-1.5">
                  {advice.nextQuizzes.map((q, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-[#374151]">
                      <span className="text-[#9ca3af]">·</span>
                      {q.subject}: {q.topic}
                      <Badge variant="indigo">{q.difficulty}</Badge>
                    </li>
                  ))}
                </ul>
                <Button to="/quiz" className="mt-4" size="sm">Go to Quiz Generator</Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
