import StudySession from '../models/StudySession.js'
import asyncHandler from '../utils/asyncHandler.js'
import { elapsedSeconds, computeStats, parseTz } from '../utils/sessionStats.js'

const publicSession = (s) => ({
  id: s.id,
  subject: s.subject,
  status: s.status,
  startedAt: s.startedAt,
  endedAt: s.endedAt,
  elapsedSeconds: elapsedSeconds(s),
})

const findOwn = async (req, res) => {
  const s = await StudySession.findOne({ _id: req.params.id, user: req.user.id })
  if (!s) {
    res.status(404)
    throw new Error('Session not found')
  }
  return s
}

// GET /api/sessions/active
export const getActive = asyncHandler(async (req, res) => {
  const s = await StudySession.findOne({ user: req.user.id, status: { $in: ['running', 'paused'] } })
  res.json({ success: true, session: s ? publicSession(s) : null })
})

// POST /api/sessions/start
export const startSession = asyncHandler(async (req, res) => {
  const existing = await StudySession.findOne({ user: req.user.id, status: { $in: ['running', 'paused'] } })
  if (existing) {
    res.status(409)
    throw new Error('You already have an active session. Stop it first.')
  }
  const s = await StudySession.create({ user: req.user.id, subject: req.body.subject })
  res.status(201).json({ success: true, session: publicSession(s) })
})

// POST /api/sessions/:id/pause
export const pauseSession = asyncHandler(async (req, res) => {
  const s = await findOwn(req, res)
  if (s.status !== 'running') {
    res.status(400)
    throw new Error('Session is not running')
  }
  s.accumulatedSeconds = elapsedSeconds(s)
  s.status = 'paused'
  await s.save()
  res.json({ success: true, session: publicSession(s) })
})

// POST /api/sessions/:id/resume
export const resumeSession = asyncHandler(async (req, res) => {
  const s = await findOwn(req, res)
  if (s.status !== 'paused') {
    res.status(400)
    throw new Error('Session is not paused')
  }
  s.lastResumedAt = new Date()
  s.status = 'running'
  await s.save()
  res.json({ success: true, session: publicSession(s) })
})

// POST /api/sessions/:id/stop
export const stopSession = asyncHandler(async (req, res) => {
  const s = await findOwn(req, res)
  if (s.status === 'completed') {
    res.status(400)
    throw new Error('Session already stopped')
  }
  s.accumulatedSeconds = elapsedSeconds(s)
  s.status = 'completed'
  s.endedAt = new Date()
  await s.save()
  res.json({ success: true, session: publicSession(s) })
})

// GET /api/sessions  (history)
export const listSessions = asyncHandler(async (req, res) => {
  const items = await StudySession.find({ user: req.user.id, status: 'completed' })
    .sort({ startedAt: -1 })
    .limit(30)
  res.json({ success: true, sessions: items.map(publicSession) })
})

// GET /api/sessions/stats?tzOffset=-330
export const getStats = asyncHandler(async (req, res) => {
  const stats = await computeStats(req.user._id, parseTz(req.query.tzOffset), req.user.dailyGoalMinutes)
  res.json({ success: true, stats })
})