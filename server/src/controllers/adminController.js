import User from '../models/User.js'
import Quiz from '../models/Quiz.js'
import QuizAttempt from '../models/QuizAttempt.js'
import Note from '../models/Note.js'
import StudySession from '../models/StudySession.js'
import StudyPlan from '../models/StudyPlan.js'
import ExamPreparation from '../models/ExamPreparation.js'
import AIConversation from '../models/AIConversation.js'
import asyncHandler from '../utils/asyncHandler.js'

// GET /api/admin/stats: sirf counts, kisi student ka personal content nahi
export const getAdminStats = asyncHandler(async (req, res) => {
  const since = new Date(Date.now() - 13 * 86400000)
  since.setUTCHours(0, 0, 0, 0)

  const [users, admins, quizzes, attempts, notes, sessions, plans, exams, conversations, signupRows] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'admin' }),
    Quiz.countDocuments(),
    QuizAttempt.countDocuments(),
    Note.countDocuments(),
    StudySession.countDocuments(),
    StudyPlan.countDocuments(),
    ExamPreparation.countDocuments(),
    AIConversation.countDocuments(),
    User.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
    ]),
  ])

  const byDay = new Map(signupRows.map((r) => [r._id, r.count]))
  const signups = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(since.getTime() + i * 86400000).toISOString().slice(0, 10)
    return { date: d, count: byDay.get(d) || 0 }
  })

  res.json({
    success: true,
    stats: { users, students: users - admins, admins, quizzes, attempts, notes, sessions, plans, exams, conversations, signups },
  })
})

// GET /api/admin/users
export const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('name email role educationLevel createdAt').sort({ createdAt: -1 }).limit(100)
  res.json({ success: true, users })
})