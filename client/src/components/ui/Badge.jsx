const variants = {
  blue:   'bg-[#dbeafe] text-[#1d4ed8]',
  indigo: 'bg-[#e0e7ff] text-[#4338ca]',
  violet: 'bg-[#ede9fe] text-[#6d28d9]',
  green:  'bg-[#dcfce7] text-[#15803d]',
  amber:  'bg-[#fef9c3] text-[#92400e]',
  red:    'bg-[#fee2e2] text-[#b91c1c]',
  slate:  'bg-[#f1f5f9] text-[#475569]',
  dark:   'bg-[#111827] text-white',
}

export default function Badge({ children, variant = 'blue', className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-tight ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
