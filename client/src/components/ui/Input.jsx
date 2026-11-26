export const inputCls =
  'mt-1 w-full rounded-xl border border-[#e5e7eb] bg-white px-3.5 py-2.5 text-sm text-[#111827] placeholder:text-[#9ca3af] outline-none transition-all hover:border-[#d1d5db] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10'

export function Input({ className = '', ...props }) {
  return <input className={`${inputCls} ${className}`} {...props} />
}

export function Select({ className = '', children, ...props }) {
  return (
    <select className={`${inputCls} ${className}`} {...props}>
      {children}
    </select>
  )
}

export function Textarea({ className = '', ...props }) {
  return <textarea className={`${inputCls} ${className}`} {...props} />
}
