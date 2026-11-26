export default function Card({ className = '', hover = false, children, ...props }) {
  return (
    <div
      className={`rounded-2xl border border-[#e5e7eb] bg-white shadow-sm ${
        hover ? 'cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-[#bfdbfe]' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
