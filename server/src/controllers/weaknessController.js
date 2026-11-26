import asyncHandler from '../utils/asyncHandler.js'
import { generateJSON } from '../services/aiServices.js'
import { adviceSystemPrompt, advicePrompt } from '../services/prompts.js'
import { computeWeakness, getWrongQuestions, topicKey } from '../utils/weaknessStats.js'

// GET /api/weakness: pure statistics, AI nahi
export const getWeakness = asyncHandler(async (req, res) => {
  const { stats } = await computeWeakness(req.user._id)
  res.json({ success: true, stats })
})

// POST /api/weakness/advice: AI sirf calculated data ko padhkar salaah deta hai
export const getAdvice = asyncHandler(async (req, res) => {
  const { stats, attempts } = await computeWeakness(req.user._id)
  if (!stats) {
    res.status(400)
    throw new Error('Take at least one quiz first. Advice is based on your real quiz history.')
  }

  const needWork = stats.topics.filter((t) => t.status !== 'strong')
  const wrongQuestions = await getWrongQuestions(attempts, new Set(needWork.map(topicKey)))

  const data = await generateJSON({
    systemInstruction: adviceSystemPrompt,
    prompt: advicePrompt({
      level: req.user.educationLevel,
      data: {
        overall: stats.overall,
        subjects: stats.subjects.map(({ subject, percentage, attempts }) => ({ subject, percentage, attempts })),
        topics: stats.topics.slice(0, 20).map(({ subject, topic, percentage, status, attempts }) => ({ subject, topic, percentage, status, attempts })),
        wrongQuestions,
      },
    }),
  })

  const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
  const summary = str(data?.summary, 600)
  const suggestions = (Array.isArray(data?.suggestions) ? data.suggestions : [])
    .map((s) => ({ topic: str(s?.topic, 120), advice: str(s?.advice, 400) }))
    .filter((s) => s.topic && s.advice).slice(0, 5)
  const nextQuizzes = (Array.isArray(data?.nextQuizzes) ? data.nextQuizzes : [])
    .map((q) => ({
      subject: str(q?.subject, 80),
      topic: str(q?.topic, 120),
      difficulty: ['easy', 'medium', 'hard'].includes(q?.difficulty) ? q.difficulty : 'medium',
    }))
    .filter((q) => q.subject && q.topic).slice(0, 3)

  if (!summary && suggestions.length === 0) {
    res.status(502)
    throw new Error('AI could not produce advice. Please try again.')
  }
  res.json({ success: true, advice: { summary, suggestions, nextQuizzes } })
})
