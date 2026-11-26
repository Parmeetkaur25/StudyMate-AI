import Card from './Card'

const colorMap = {
  blue:   { ring: 'bg-[#dbeafe]', icon: 'text-[#2563eb]', val: 'text-[#111827]' },
  indigo: { ring: 'bg-[#e0e7ff]', icon: 'text-[#4338ca]', val: 'text-[#111827]' },
  violet: { ring: 'bg-[#ede9fe]', icon: 'text-[#7c3aed]', val: 'text-[#111827]' },
  green:  { ring: 'bg-[#dcfce7]', icon: 'text-[#16a34a]', val: 'text-[#111827]' },
  amber:  { ring: 'bg-[#fef9c3]', icon: 'text-[#d97706]', val: 'text-[#111827]' },
  red:    { ring: 'bg-[#fee2e2]', icon: 'text-[#dc2626]', val: 'text-[#111827]' },
  orange: { ring: 'bg-[#ffedd5]', icon: 'text-[#ea580c]', val: 'text-[#111827]' },
  slate:  { ring: 'bg-[#f1f5f9]', icon: 'text-[#64748b]', val: 'text-[#111827]' },
}

export default function StatCard({ icon: Icon, label, value, hint, color = 'blue', className = '' }) {
  const c = colorMap[color] ?? colorMap.blue
  return (
    <Card className={`group p-5 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#6b7280]">{label}</p>
          <p className={`mt-2 text-2xl font-bold leading-none ${c.val}`}>{value}</p>
          {hint && <p className="mt-1.5 text-xs text-[#9ca3af]">{hint}</p>}
        </div>
        {Icon && (
          <div className={`shrink-0 rounded-xl ${c.ring} p-2.5 transition-transform duration-200 group-hover:scale-110`}>
            <Icon size={20} className={c.icon} />
          </div>
        )}
      </div>
    </Card>
  )
}
