import StudySession from '../models/StudySession.js'

// Elapsed time hamesha DB ke timestamps se nikalta hai, isliye page refresh par timer galat nahi hota
export const elapsedSeconds = (s, now = Date.now()) =>
  s.accumulatedSeconds +
  (s.status === 'running' ? Math.max(0, Math.floor((now - s.lastResumedAt.getTime()) / 1000)) : 0)

// Browser ka timezone offset (minutes) leke "local din" ki key (YYYY-MM-DD) banata hai
export const parseTz = (v) => Math.max(-840, Math.min(840, parseInt(v, 10) || 0))
const dayKey = (date, offsetMin) => new Date(date.getTime() - offsetMin * 60000).toISOString().slice(0, 10)

export const computeStats = async (userId, tzOffset = 0, goalMinutes = 120) => {
  const now = Date.now()
  const sessions = await StudySession.find({
    user: userId,
    startedAt: { $gte: new Date(now - 60 * 86400000) },
  })

  const perDay = {}
  sessions.forEach((s) => {
    const k = dayKey(s.startedAt, tzOffset) // session us din ka maana jata hai jis din start hua
    perDay[k] = (perDay[k] || 0) + elapsedSeconds(s, now)
  })

  const week = []
  for (let i = 6; i >= 0; i--) {
    const key = dayKey(new Date(now - i * 86400000), tzOffset)
    week.push({ date: key, minutes: Math.round((perDay[key] || 0) / 60) })
  }
  const weekKeys = new Set(week.map((d) => d.date))

  const subjectSecs = {}
  sessions.forEach((s) => {
    if (weekKeys.has(dayKey(s.startedAt, tzOffset))) {
      subjectSecs[s.subject] = (subjectSecs[s.subject] || 0) + elapsedSeconds(s, now)
    }
  })
  const bySubject = Object.entries(subjectSecs)
    .map(([subject, secs]) => ({ subject, minutes: Math.round(secs / 60) }))
    .sort((a, b) => b.minutes - a.minutes)

  // Streak: lagatar kitne din (kam se kam 1 minute) padhai hui. Aaj abhi nahi hui to kal se ginte hain
  const todayKey = dayKey(new Date(now), tzOffset)
  let i = (perDay[todayKey] || 0) >= 60 ? 0 : 1
  let streak = 0
  while ((perDay[dayKey(new Date(now - i * 86400000), tzOffset)] || 0) >= 60) {
    streak++
    i++
  }

  return {
    todayMinutes: Math.round((perDay[todayKey] || 0) / 60),
    goalMinutes,
    week,
    weekTotalMinutes: week.reduce((a, d) => a + d.minutes, 0),
    bySubject,
    streak,
  }
}