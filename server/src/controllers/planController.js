import StudyPlan from '../models/StudyPlan.js'
import asyncHandler from '../utils/asyncHandler.js'
import { generateJSON } from '../services/aiServices.js'
import { plannerPrompt, plannerSystemPrompt } from '../services/prompts.js'
import { isValidDateString } from '../utils/dateValidation.js'

const DAY = 86400000
const toDate = (s) => new Date(`${s}T00:00:00Z`) // sirf date, hamesha UTC midnight (timezone ka jhanjhat nahi)
const key = (d) => d.toISOString().slice(0, 10)
const TYPES = ['study', 'revision', 'practice']
const lengthText = { short: '25-30 minute sessions', medium: '45-60 minute sessions', long: '90 minute deep-work sessions' }

const findPlan = async (req, res) => {
  const plan = await StudyPlan.findOne({ _id: req.params.id, user: req.user.id })
  if (!plan) {
    res.status(404)
    throw new Error('Plan not found')
  }
  return plan
}

// POST /api/plans/generate
export const generatePlan = asyncHandler(async (req, res) => {
  const { title, subjects, availableHoursPerDay = 3, startDate, sessionLength = 'medium' } = req.body

  const start = toDate(startDate)
  const exams = subjects.map((s) => toDate(s.examDate))
  if (exams.some((e) => e < start)) {
    res.status(400)
    throw new Error('Exam dates must be on or after the start date')
  }
  const lastExam = new Date(Math.max(...exams))
  const horizonEnd = new Date(Math.min(lastExam.getTime(), start.getTime() + 29 * DAY)) // MVP: max 30 din ka plan

  const data = await generateJSON({
    systemInstruction: plannerSystemPrompt,
    prompt: plannerPrompt({
      today: startDate,
      horizonEnd: key(horizonEnd),
      subjects: subjects.map((s) => ({ name: s.name, topics: s.topics, examDate: s.examDate, priority: s.priority, level: s.level })),
      hoursPerDay: availableHoursPerDay,
      preferredTime: req.user.preferredStudyTime,
      sessionLength: lengthText[sessionLength],
    }),
  })

  // AI par bharosa nahi: dates, subjects, duration aur daily limit khud enforce karte hain
  const examBySubject = new Map(subjects.map((s) => [s.name.toLowerCase(), toDate(s.examDate)]))
  const maxPerDay = availableHoursPerDay * 60 * 1.1
  const used = {}
  const tasks = (Array.isArray(data?.tasks) ? data.tasks : [])
    .filter((t) => t && typeof t.title === 'string' && t.title.trim() && typeof t.subject === 'string' && isValidDateString(t.date))
    .map((t) => ({ ...t, d: toDate(t.date), exam: examBySubject.get(t.subject.trim().toLowerCase()) }))
    .filter((t) => !isNaN(t.d) && t.exam && t.d >= start && t.d <= horizonEnd && t.d <= t.exam)
    .sort((a, b) => a.d - b.d)
    .filter((t) => {
      const mins = Math.min(180, Math.max(15, Math.round(Number(t.durationMinutes) || 45)))
      t.mins = mins
      const k = key(t.d)
      if ((used[k] || 0) + mins > maxPerDay) return false
      used[k] = (used[k] || 0) + mins
      return true
    })
    .slice(0, 200)
    .map((t) => ({
      title: t.title.trim().slice(0, 150),
      subject: t.subject.trim(),
      topic: typeof t.topic === 'string' ? t.topic.trim().slice(0, 120) : '',
      date: t.d,
      durationMinutes: t.mins,
      type: TYPES.includes(t.type) ? t.type : 'study',
    }))

  if (tasks.length === 0) {
    res.status(502)
    throw new Error('AI could not produce a valid plan. Please try again.')
  }

  const plan = await StudyPlan.create({
    user: req.user.id,
    title: title?.trim() || (typeof data.title === 'string' && data.title.trim().slice(0, 120)) || 'My study plan',
    availableHoursPerDay,
    inputs: { subjects, startDate, sessionLength },
    tasks,
  })
  res.status(201).json({ success: true, plan })
})

// GET /api/plans
export const listPlans = asyncHandler(async (req, res) => {
  const plans = await StudyPlan.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(20)
  res.json({ success: true, plans })
})

// PATCH /api/plans/:id/tasks/:taskId   (complete/pending, edit)
export const updateTask = asyncHandler(async (req, res) => {
  const plan = await findPlan(req, res)
  const task = plan.tasks.id(req.params.taskId)
  if (!task) {
    res.status(404)
    throw new Error('Task not found')
  }
  const { completed, title, durationMinutes, date } = req.body
  if (completed !== undefined) task.completed = completed
  if (title !== undefined) task.title = title
  if (durationMinutes !== undefined) task.durationMinutes = durationMinutes
  if (date !== undefined) task.date = toDate(date)
  await plan.save()
  res.json({ success: true, plan })
})

// DELETE /api/plans/:id/tasks/:taskId
export const deleteTask = asyncHandler(async (req, res) => {
  const plan = await findPlan(req, res)
  if (!plan.tasks.id(req.params.taskId)) {
    res.status(404)
    throw new Error('Task not found')
  }
  plan.tasks.pull(req.params.taskId)
  await plan.save()
  res.json({ success: true, plan })
})

// DELETE /api/plans/:id
export const deletePlan = asyncHandler(async (req, res) => {
  const done = await StudyPlan.findOneAndDelete({ _id: req.params.id, user: req.user.id })
  if (!done) {
    res.status(404)
    throw new Error('Plan not found')
  }
  res.json({ success: true })
})
