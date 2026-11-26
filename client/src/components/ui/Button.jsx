import { Link } from 'react-router-dom'

const variants = {
  primary:   'bg-[#2563eb] text-white hover:bg-[#1d4ed8] shadow-sm hover:shadow active:scale-[0.97]',
  secondary: 'bg-white text-[#374151] border border-[#e5e7eb] hover:bg-[#f9fafb] hover:border-[#d1d5db] shadow-sm',
  ghost:     'text-[#4b5563] hover:bg-[#f3f4f6] hover:text-[#111827]',
  danger:    'bg-[#ef4444] text-white hover:bg-[#dc2626] shadow-sm',
  outline:   'border border-[#2563eb]/30 text-[#2563eb] hover:bg-[#eff6ff]',
  dark:      'bg-[#111827] text-white hover:bg-[#1f2937] shadow-sm',
}

const sizes = {
  xs: 'px-2.5 py-1 text-xs gap-1',
  sm: 'px-3.5 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
}

export default function Button({ to, variant = 'primary', size = 'md', className = '', children, ...props }) {
  const cls = `inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 ${variants[variant]} ${sizes[size]} ${className}`
  if (to) return <Link to={to} className={cls} {...props}>{children}</Link>
  return <button className={cls} {...props}>{children}</button>
}
