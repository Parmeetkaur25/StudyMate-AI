import QuizAttempt from '../models/QuizAttempt.js'
import Quiz from '../models/Quiz.js'

// Ye saari NORMAL maths hai (AI nahi): average, percentage, classification
export const classify = (pct) => (pct < 50 ? 'weak' : pct >= 75 ? 'strong' : 'average')
const pctOf = (c, t) => (t ? Math.round((c / t) * 100) : 0)
const norm = (s) => (typeof s === 'string' ? s.trim().toLowerCase() : '')
export const topicKey = (x) => `${norm(x.subject)}|${norm(x.topic)}`

const groupBy = (attempts, keyOf, labelOf) => {
  const map = new Map()
  for (const a of attempts) {
    const key = keyOf(a)
    const g = map.get(key) || { ...labelOf(a), attempts: 0, correct: 0, total: 0, lastPercentage: 0 }
    g.attempts += 1
    g.correct += a.score
    g.total += a.total
    g.lastPercentage = a.percentage // attempts purane se naye order mein hain, isliye last wala latest hoga
    map.set(key, g)
  }
  return [...map.values()]
    .map((g) => {
      const percentage = pctOf(g.correct, g.total)
      return { ...g, percentage, status: classify(percentage) }
    })
    .sort((a, b) => a.percentage - b.percentage)
}

export const computeWeakness = async (userId) => {
  const latest = await QuizAttempt.find({ user: userId }).sort({ createdAt: -1 }).limit(500).lean()
  const attempts = latest.reverse() // oldest -> newest

  // Older attempts may not have subject stored. Recover it from the linked Quiz.
  const missingSubjectQuizIds = attempts
    .filter((a) => !norm(a.subject) && a.quiz)
    .map((a) => a.quiz)

  if (missingSubjectQuizIds.length) {
    const quizzes = await Quiz.find({ _id: { $in: missingSubjectQuizIds } })
      .select('_id subject')
      .lean()
    const subjectByQuiz = new Map(quizzes.map((q) => [String(q._id), q.subject]))
    for (const attempt of attempts) {
      if (!norm(attempt.subject)) {
        attempt.subject = subjectByQuiz.get(String(attempt.quiz)) || ''
      }
    }
  }

  if (!attempts.length) return { stats: null, attempts }

  const totalCorrect = attempts.reduce((s, a) => s + a.score, 0)
  const totalQs = attempts.reduce((s, a) => s + a.total, 0)

  // Improvement: purane half ka average vs naye half ka average (kam se kam 4 attempts chahiye)
  let improvement = null
  if (attempts.length >= 4) {
    const half = Math.floor(attempts.length / 2)
    const avg = (arr) => arr.reduce((s, a) => s + a.percentage, 0) / arr.length
    improvement = Math.round(avg(attempts.slice(half)) - avg(attempts.slice(0, half)))
  }

  const categorized = attempts.filter((a) => norm(a.subject) && norm(a.topic))

  return {
    attempts,
    stats: {
      overall: { attempts: attempts.length, percentage: pctOf(totalCorrect, totalQs), improvement },
      subjects: groupBy(categorized, (a) => norm(a.subject), (a) => ({ subject: a.subject })),
      topics: groupBy(categorized, topicKey, (a) => ({ subject: a.subject, topic: a.topic })),
      trend: categorized.slice(-20).map((a) => ({
        date: a.createdAt,
        label: `${a.subject}: ${a.topic}`,
        percentage: a.percentage,
      })),
    },
  }
}


export const getWrongQuestions = async (attempts, keys, max = 12) => {
  if (max <= 0) return []
  const recent = attempts.slice(-15).filter((a) => keys.has(topicKey(a))).reverse()
  const quizzes = await Quiz.find({ _id: { $in: recent.map((a) => a.quiz) } }).lean()
  const byId = new Map(quizzes.map((q) => [String(q._id), q]))
  const out = []
  for (const a of recent) {
    const quiz = byId.get(String(a.quiz))
    if (!quiz) continue
    for (const ans of a.answers) {
      if (ans.isCorrect) continue
      const q = quiz.questions[ans.questionIndex]
      if (!q) continue
      out.push({ subject: a.subject, topic: a.topic, question: q.question, correctAnswer: q.options[q.correctIndex] })
      if (out.length >= max) return out
    }
  }
  return out
}