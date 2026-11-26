import QuizAttempt from '../models/QuizAttempt.js'
import StudyPlan from '../models/StudyPlan.js'
import asyncHandler from '../utils/asyncHandler.js'
import { computeStats, parseTz } from '../utils/sessionStats.js'

// GET /api/dashboard: sab numbers real database se
export const getDashboard = asyncHandler(async (req, res) => {
  const uid = req.user._id // aggregate mein ObjectId chahiye, string nahi
  const [stats, quizzesTaken, done, recentAttempts] = await Promise.all([
    computeStats(uid, parseTz(req.query.tzOffset), req.user.dailyGoalMinutes),
    QuizAttempt.countDocuments({ user: uid }),
    StudyPlan.aggregate([
      { $match: { user: uid } },
      { $unwind: '$tasks' },
      { $match: { 'tasks.completed': true } },
      { $count: 'n' },
    ]),
    QuizAttempt.find({ user: uid }).select('subject topic score total percentage createdAt').sort({ createdAt: -1 }).limit(5),
  ])
  res.json({ success: true, stats, quizzesTaken, tasksCompleted: done[0]?.n || 0, recentAttempts })
})