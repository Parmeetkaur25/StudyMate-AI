import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import doubtRoutes from './routes/doubtRoutes.js'
import quizRoutes from './routes/quizRoutes.js'
import planRoutes from './routes/planRoutes.js'
import sessionRoutes from './routes/sessionRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import noteRoutes from './routes/noteRoutes.js'
import weaknessRoutes from './routes/weaknessRoutes.js'
import examRoutes from './routes/examRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import sanitize from './middleware/sanitize.js'
import { apiLimiter, authLimiter } from './middleware/rateLimiters.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

// Zaroori settings ke bina server start hi nahi hoga
for (const name of ['JWT_SECRET', 'MONGODB_URI']) {
  if (!process.env[name]) {
    console.error(`${name} missing in .env`)
    process.exit(1)
  }
}
if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET must be at least 32 characters in production')
  process.exit(1)
}

const app = express()

// Render jaise hosting proxy ke peeche asli user IP padhne ke liye (rate limit ko zaroorat hai)
app.set('trust proxy', 1)

app.use(helmet())

// CLIENT_URL mein comma se alag kai origins ho sakte hain (local + Vercel)
const allowedOrigins = (process.env.CLIENT_URL || '').split(',').map((s) => s.trim()).filter(Boolean)
app.use(
  cors({
    origin: (origin, cb) => {
      // origin undefined = Postman/curl (browser nahi), allow
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
      cb(new Error('Not allowed by CORS'))
    },
    credentials: true,
  })
)

app.use(express.json({ limit: '1mb' }))
app.use(sanitize)
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'StudyMate AI backend is running ✅' })
})

app.use('/api', apiLimiter)
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)

app.use('/api/auth', authRoutes)
app.use('/api/doubts', doubtRoutes)
app.use('/api/quizzes', quizRoutes)
app.use('/api/plans', planRoutes)
app.use('/api/sessions', sessionRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/notes', noteRoutes)
app.use('/api/weakness', weaknessRoutes)
app.use('/api/exams', examRoutes)
app.use('/api/admin', adminRoutes)

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
})