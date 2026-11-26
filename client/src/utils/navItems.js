import {
  LayoutDashboard, CalendarDays, MessageCircleQuestion, ListChecks,
  FileText, TrendingUp, Timer, GraduationCap, User, ShieldCheck,
} from 'lucide-react'


export const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/planner', label: 'Study Planner', icon: CalendarDays },
  { to: '/doubts', label: 'Doubt Solver', icon: MessageCircleQuestion },
  { to: '/quiz', label: 'Quiz Generator', icon: ListChecks },
  { to: '/notes', label: 'Notes Summarizer', icon: FileText },
  { to: '/weakness', label: 'Weakness Analyzer', icon: TrendingUp },
  { to: '/productivity', label: 'Productivity', icon: Timer },
  { to: '/exams', label: 'Exam Preparation', icon: GraduationCap },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/admin', label: 'Admin', icon: ShieldCheck },
]