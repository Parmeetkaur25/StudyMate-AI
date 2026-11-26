import Quiz from '../models/Quiz.js'
import QuizAttempt from '../models/QuizAttempt.js'
import asyncHandler from '../utils/asyncHandler.js'
import { generateJSON } from '../services/aiServices.js'
import { quizPrompt, quizSystemPrompt } from '../services/prompts.js'

// AI par bharosa nahi: har question ko khud validate karte hain
const isValidQuestion = (q) =>
  q &&
  typeof q.question === 'string' && q.question.trim().length > 3 &&
  Array.isArray(q.options) && q.options.length === 4 &&
  q.options.every((o) => typeof o === 'string' && o.trim()) &&
  new Set(q.options.map((o) => o.trim().toLowerCase())).size === 4 && // duplicate options nahi
  Number.isInteger(q.correctIndex) && q.correctIndex >= 0 && q.correctIndex <= 3

// Student ko bhejne wala version: correctIndex aur explanation hata ke
const toPublicQuiz = (quiz) => ({
  id: quiz.id,
  subject: quiz.subject,
  topic: quiz.topic,
  difficulty: quiz.difficulty,
  questions: quiz.questions.map((q) => ({ question: q.question, options: q.options })),
})

// POST /api/quizzes/generate
export const generateQuiz = asyncHandler(async (req, res) => {
  const { subject, topic, difficulty = 'medium', count = 5 } = req.body

  const data = await generateJSON({
    systemInstruction: quizSystemPrompt,
    prompt: quizPrompt({ subject, topic, difficulty, count, level: req.user.educationLevel }),
  })

  const questions = (Array.isArray(data?.questions) ? data.questions : [])
    .filter(isValidQuestion)
    .slice(0, count)
    .map((q) => ({
      question: q.question.trim(),
      options: q.options.map((o) => o.trim()),
      correctIndex: q.correctIndex,
      explanation: typeof q.explanation === 'string' ? q.explanation.trim() : '',
    }))

  if (questions.length === 0) {
    res.status(502)
    throw new Error('AI could not produce valid questions. Please try again.')
  }

  const quiz = await Quiz.create({ user: req.user.id, subject, topic, difficulty, questions })
  res.status(201).json({ success: true, quiz: toPublicQuiz(quiz) })
})

// GET /api/quizzes/:id  (answers hidden)
export const getQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({ _id: req.params.id, user: req.user.id })
  if (!quiz) {
    res.status(404)
    throw new Error('Quiz not found')
  }
  res.json({ success: true, quiz: toPublicQuiz(quiz) })
})

// POST /api/quizzes/:id/submit   body: { answers: [0..3 | null, ...] }
export const submitQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({ _id: req.params.id, user: req.user.id })
  if (!quiz) {
    res.status(404)
    throw new Error('Quiz not found')
  }
  const { answers } = req.body
  if (!Array.isArray(answers) || answers.length !== quiz.questions.length) {
    res.status(400)
    throw new Error('Answers must match the number of questions')
  }
  if (!answers.every((a) => a === null || (Number.isInteger(a) && a >= 0 && a <= 3))) {
    res.status(400)
    throw new Error('Invalid answer value')
  }

  // Score SERVER par nikalta hai, frontend ka bheja score kabhi trust nahi karte
  const graded = quiz.questions.map((q, i) => ({
    questionIndex: i,
    selectedIndex: answers[i],
    isCorrect: answers[i] === q.correctIndex,
  }))
  const score = graded.filter((a) => a.isCorrect).length
  const total = quiz.questions.length

  const attempt = await QuizAttempt.create({
    user: req.user.id,
    quiz: quiz.id,
    subject: quiz.subject,
    topic: quiz.topic,
    answers: graded,
    score,
    total,
    percentage: Math.round((score / total) * 100),
  })

  // Ab submit ho chuka hai, isliye answers reveal kar sakte hain
  const review = quiz.questions.map((q, i) => ({
    question: q.question,
    options: q.options,
    selectedIndex: answers[i],
    correctIndex: q.correctIndex,
    explanation: q.explanation,
    isCorrect: graded[i].isCorrect,
  }))

  res.json({
    success: true,
    result: { attemptId: attempt.id, score, total, percentage: attempt.percentage, review },
  })
})

// GET /api/quizzes/attempts  (history)
export const listAttempts = asyncHandler(async (req, res) => {
  const attempts = await QuizAttempt.find({ user: req.user.id })
    .select('subject topic score total percentage createdAt')
    .sort({ createdAt: -1 })
    .limit(50)
  res.json({ success: true, attempts })
})
