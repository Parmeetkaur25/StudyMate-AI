export default function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-[#e5e7eb] bg-[#fafafa] px-6 py-14 text-center">
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eff6ff] text-[#2563eb] shadow-sm">
          <Icon size={26} />
        </div>
      )}
      <h3 className="text-sm font-semibold text-[#111827]">{title}</h3>
      {message && <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-[#6b7280]">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
