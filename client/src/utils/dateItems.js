// Planner dates "YYYY-MM-DD" strings hain (server UTC midnight rakhta hai), isliye timezone shift nahi hota
export const localToday = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const addDays = (key, n) => {
  const d = new Date(`${key}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

export const formatDay = (key, opts = { weekday: 'short', day: 'numeric', month: 'short' }) =>
  new Date(`${key}T00:00:00Z`).toLocaleDateString(undefined, { ...opts, timeZone: 'UTC' })

export const formatClock = (secs) => {
  const h = String(Math.floor(secs / 3600)).padStart(2, '0')
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0')
  const s = String(secs % 60).padStart(2, '0')
  return `${h}:${m}:${s}`
}

export const formatMinutes = (m) => (m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`)