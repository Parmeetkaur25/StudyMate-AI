import { Navigate, Link } from 'react-router-dom'
import {
  Brain, CalendarDays, MessageCircleQuestion, ListChecks, TrendingUp,
  ArrowRight, CheckCircle2, Zap, GraduationCap, FileText, Timer,
  BookOpen, Sparkles,
} from 'lucide-react'
import Logo from '../components/ui/Logo'
import Button from '../components/ui/Button'
import { useAuth } from '../context/useAuth'

const features = [
  { icon: Brain,              title: 'AI Doubt Solver',      desc: 'Instant, accurate answers to any academic question — available 24 / 7.',           gradient: 'from-[#2563eb] to-[#4f46e5]' },
  { icon: CalendarDays,       title: 'Smart Study Planner',  desc: 'Provide subjects and exam dates; AI builds a personalised day-by-day timetable.',  gradient: 'from-[#0ea5e9] to-[#2563eb]' },
  { icon: ListChecks,         title: 'Quiz Generator',       desc: 'Unlimited AI-generated MCQ quizzes on any topic to test exam readiness.',           gradient: 'from-[#7c3aed] to-[#4f46e5]' },
  { icon: TrendingUp,         title: 'Weakness Analyzer',    desc: 'Spot weak topics from quiz data and get targeted AI improvement suggestions.',       gradient: 'from-[#059669] to-[#0d9488]' },
  { icon: FileText,           title: 'Notes Summariser',     desc: 'Upload PDF or text files; get summaries, key points, and revision notes instantly.', gradient: 'from-[#d97706] to-[#ea580c]' },
  { icon: GraduationCap,      title: 'Exam Preparation',     desc: 'Countdown timers, syllabus checklists, and AI-generated revision schedules.',        gradient: 'from-[#db2777] to-[#e11d48]' },
]

const stats = [
  { value: '10 K+',  label: 'Students learning' },
  { value: '500 K+', label: 'Questions answered' },
  { value: '99 %',   label: 'Satisfaction rate' },
  { value: '24 / 7', label: 'AI availability' },
]

const highlights = [
  'Personalised AI study plans',
  'Instant doubt resolution',
  'Progress analytics',
  'Smart quiz generation',
]

export default function Landing() {
  const { user } = useAuth()
  if (user) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen bg-white text-[#111827]">

      {/* ── Topnav ───────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-[#f3f4f6] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Logo size="md" />
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-xl px-4 py-2 text-sm font-medium text-[#4b5563] transition hover:bg-[#f3f4f6] hover:text-[#111827]"
            >
              Sign in
            </Link>
            <Button to="/register" size="sm">
              Get started free <ArrowRight size={14} />
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#fafbff] pb-28 pt-24">
        {/* Blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-[#dbeafe]/50 blur-[90px]" />
          <div className="absolute -right-32 bottom-0 h-[400px] w-[400px] rounded-full bg-[#ede9fe]/50 blur-[80px]" />
        </div>

        <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#bfdbfe] bg-[#eff6ff] px-4 py-1.5 text-xs font-semibold text-[#2563eb]">
            <Zap size={12} />
            Powered by Google Gemini AI
          </div>

          {/* Heading */}
          <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight text-[#0f172a] sm:text-6xl lg:text-[70px]">
            Study smarter,{' '}
            <span className="relative inline-block">
              <span className="gradient-text">not harder</span>
              <svg className="absolute -bottom-1 left-0 w-full overflow-visible" viewBox="0 0 320 10" fill="none">
                <path d="M2 8 Q80 2 160 5 Q240 8 318 3" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.45" />
              </svg>
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#4b5563]">
            Your AI-powered study companion. Plan studies, resolve doubts, generate quizzes,
            and track progress — all in one place.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button to="/register" size="lg">
              Start learning for free <ArrowRight size={18} />
            </Button>
            <Button to="/login" variant="secondary" size="lg">
              Sign in to your account
            </Button>
          </div>

          {/* Trust chips */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {highlights.map((h) => (
              <span key={h} className="flex items-center gap-1.5 text-sm text-[#6b7280]">
                <CheckCircle2 size={13} className="text-[#16a34a]" />
                {h}
              </span>
            ))}
          </div>

          {/* App preview card */}
          <div className="mt-16 mx-auto max-w-3xl rounded-2xl border border-[#e5e7eb] bg-white p-1 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
            <div className="rounded-xl bg-[#f4f6f9] px-6 py-8">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {stats.map(({ value, label }) => (
                  <div key={label} className="rounded-xl bg-white p-4 text-center shadow-sm">
                    <div className="text-2xl font-extrabold text-[#2563eb]">{value}</div>
                    <div className="mt-1 text-xs font-medium text-[#6b7280]">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────── */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-14 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#e5e7eb] bg-white px-4 py-1.5 text-xs font-semibold text-[#4b5563] shadow-sm">
              <Sparkles size={12} className="text-[#2563eb]" />
              Everything you need
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight text-[#0f172a]">
              All your study tools in one place
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-[#6b7280]">
              Built on advanced AI to deliver a truly personalised learning experience.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, desc, gradient }) => (
              <div
                key={title}
                className="group rounded-2xl border border-[#e5e7eb] bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#bfdbfe] hover:shadow-lg"
              >
                <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow`}>
                  <Icon size={20} />
                </div>
                <h3 className="mb-1.5 text-sm font-semibold text-[#111827]">{title}</h3>
                <p className="text-sm leading-relaxed text-[#6b7280]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────── */}
      <section className="bg-[#fafbff] py-24">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-[#0f172a] px-10 py-16 text-center shadow-2xl">
            {/* Noise texture overlay */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }}
            />
            {/* Accent blobs */}
            <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#2563eb]/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[#7c3aed]/20 blur-3xl" />

            <div className="relative">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2563eb] shadow-lg">
                <BookOpen size={22} className="text-white" />
              </div>
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                Ready to ace your exams?
              </h2>
              <p className="mx-auto mt-3 max-w-md text-[#94a3b8]">
                Join thousands of students already using StudyMate AI to study smarter.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Button to="/register" variant="secondary" size="lg">
                  Create free account <ArrowRight size={18} />
                </Button>
                <Link to="/login" className="text-sm font-medium text-[#94a3b8] transition hover:text-white">
                  Already a member? Sign in →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────── */}
      <footer className="border-t border-[#f3f4f6] py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-5 sm:flex-row sm:justify-between sm:px-8">
          <Logo />
          <p className="text-xs text-[#9ca3af]">
            © {new Date().getFullYear()} StudyMate AI · Built to make learning better.
          </p>
        </div>
      </footer>
    </div>
  )
}
