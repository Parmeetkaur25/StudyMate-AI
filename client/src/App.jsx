import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'
import { Loader2 } from 'lucide-react'

const Landing = lazy(() => import('./pages/Landing'))
const AuthPage = lazy(() => import('./pages/AuthPage'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Profile = lazy(() => import('./pages/Profile'))
const DoubtSolver = lazy(() => import('./pages/DoubtSolver'))
const QuizGenerator = lazy(() => import('./pages/QuizGenerator'))
const StudyPlanner = lazy(() => import('./pages/StudyPlanner'))
const Productivity = lazy(() => import('./pages/Productivity'))
const NotesSummarizer = lazy(() => import('./pages/NotesSummarizer'))
const WeaknessAnalyzer = lazy(() => import('./pages/WeaknessAnalyzer'))
const ExamPrep = lazy(() => import('./pages/ExamPrep'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))

function PageLoader() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#f4f6f9]">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2563eb] text-white shadow-md">
        <Loader2 size={20} className="animate-spin" />
      </div>
      <p className="text-sm font-medium text-[#9ca3af]">Loading…</p>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/planner" element={<StudyPlanner />} />
            <Route path="/doubts" element={<DoubtSolver />} />
            <Route path="/quiz" element={<QuizGenerator />} />
            <Route path="/productivity" element={<Productivity />} />
            <Route path="/exams" element={<ExamPrep />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notes" element={<NotesSummarizer />} />
            <Route path="/weakness" element={<WeaknessAnalyzer />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route element={<AppLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
