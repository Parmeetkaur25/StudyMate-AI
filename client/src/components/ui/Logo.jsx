import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'

export default function Logo({ to = '/', size = 'md', dark = false }) {
  const isLg = size === 'lg'
  return (
    <Link to={to} className="flex items-center gap-2.5 group select-none">
      <span
        className={`flex shrink-0 items-center justify-center rounded-xl bg-[#2563eb] text-white shadow transition-shadow group-hover:shadow-md ${
          isLg ? 'h-10 w-10' : 'h-8 w-8'
        }`}
      >
        <BookOpen size={isLg ? 20 : 16} strokeWidth={2.2} />
      </span>
      <span className={`font-bold tracking-tight ${dark ? 'text-white' : 'text-[#111827]'} ${isLg ? 'text-xl' : 'text-[15px]'}`}>
        StudyMate <span className="text-[#2563eb]">AI</span>
      </span>
    </Link>
  )
}
