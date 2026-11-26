import ExamPreparation from '../models/ExamPreparation.js'
import asyncHandler from '../utils/asyncHandler.js'
import { generateJSON } from '../services/aiServices.js'
import { examPrompt, examSystemPrompt } from '../services/prompts.js'
import { computeWeakness } from '../utils/weaknessStats.js'
import { isValidDateString } from '../utils/dateValidation.js'

const DAY = 86400000
const toDate = (s) => new Date(`${s}T00:00:00Z`)
const key = (d) => d.toISOString().slice(0, 10)

const findOwn = async (req, res) => {
  const exam = await ExamPreparation.findOne({ _id: req.params.id, user: req.user.id })
  if (!exam) {
    res.status(404)
    throw new Error('Exam not found')
  }
  return exam
}

// POST /api/exams
export const createExam = asyncHandler(async (req, res) => {
  const { title, examDate, startDate, availableHoursPerDay = 3, subjects } = req.body
  const start = toDate(startDate)
  const exam = toDate(examDate)
  if (exam < start) {
    res.status(400)
    throw new Error('Exam date must be on or after today')
  }
  const horizonEnd = new Date(Math.min(exam.getTime(), start.getTime() + 59 * DAY)) // MVP: max 60 din

  // Student ka ASLI quiz performance (sirf in subjects ka) AI ko diya jata hai
  const { stats } = await computeWeakness(req.user._id)
  const names = new Set(subjects.map((s) => s.name.trim().toLowerCase()))
  const performance = stats
    ? stats.topics
        .filter((t) => names.has(t.subject.trim().toLowerCase()))
        .slice(0, 30)
        .map(({ subject, topic, percentage, attempts }) => ({ subject, topic, percentage, attempts }))
    : []

  const data = await generateJSON({
    systemInstruction: examSystemPrompt,
    prompt: examPrompt({
      today: startDate,
      horizonEnd: key(horizonEnd),
      examDate,
      hoursPerDay: availableHoursPerDay,
      subjects: subjects.map((s) => ({ name: s.name, priority: s.priority, topics: s.topics })),
      performance,
    }),
  })

  // AI output validate: subject match, date range, daily limit
  const canonical = new Map(subjects.map((s) => [s.name.trim().toLowerCase(), s.name.trim()]))
  const maxPerDay = availableHoursPerDay * 60 * 1.1
  const used = {}
  const schedule = (Array.isArray(data?.schedule) ? data.schedule : [])
    .filter((i) => i && typeof i.subject === 'string' && typeof i.topic === 'string' && i.topic.trim() && isValidDateString(i.date))
    .map((i) => ({ ...i, d: toDate(i.date), subj: canonical.get(i.subject.trim().toLowerCase()) }))
    .filter((i) => i.subj && !isNaN(i.d) && i.d >= start && i.d <= horizonEnd)
    .sort((a, b) => a.d - b.d)
    .filter((i) => {
      i.mins = Math.min(120, Math.max(15, Math.round(Number(i.durationMinutes) || 45)))
      const k = key(i.d)
      if ((used[k] || 0) + i.mins > maxPerDay) return false
      used[k] = (used[k] || 0) + i.mins
      return true
    })
    .slice(0, 300)
    .map((i) => ({ date: i.d, subject: i.subj, topic: i.topic.trim().slice(0, 120), durationMinutes: i.mins }))

  if (schedule.length === 0) {
    res.status(502)
    throw new Error('AI could not produce a valid revision schedule. Please try again.')
  }

  const doc = await ExamPreparation.create({
    user: req.user.id,
    title,
    examDate: exam,
    availableHoursPerDay,
    subjects: subjects.map((s) => ({
      name: s.name.trim(),
      topics: s.topics.map((t) => ({ name: t, priority: s.priority })),
    })),
    schedule,
  })
  res.status(201).json({ success: true, exam: doc })
})

// GET /api/exams
export const listExams = asyncHandler(async (req, res) => {
  const exams = await ExamPreparation.find({ user: req.user.id }).sort({ examDate: 1 }).limit(20)
  res.json({ success: true, exams })
})

// PATCH /api/exams/:id/topics/:subjectId/:topicId   body: { completed }
export const toggleTopic = asyncHandler(async (req, res) => {
  const exam = await findOwn(req, res)
  const topic = exam.subjects.id(req.params.subjectId)?.topics.id(req.params.topicId)
  if (!topic) {
    res.status(404)
    throw new Error('Topic not found')
  }
  topic.completed = req.body.completed
  await exam.save()
  res.json({ success: true, exam })
})

// PATCH /api/exams/:id/schedule/:itemId   body: { completed }
export const toggleScheduleItem = asyncHandler(async (req, res) => {
  const exam = await findOwn(req, res)
  const item = exam.schedule.id(req.params.itemId)
  if (!item) {
    res.status(404)
    throw new Error('Schedule item not found')
  }
  item.completed = req.body.completed
  await exam.save()
  res.json({ success: true, exam })
})

// DELETE /api/exams/:id
export const deleteExam = asyncHandler(async (req, res) => {
  const done = await ExamPreparation.findOneAndDelete({ _id: req.params.id, user: req.user.id })
  if (!done) {
    res.status(404)
    throw new Error('Exam not found')
  }
  res.json({ success: true })
})
