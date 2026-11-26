import mongoose from 'mongoose'

const answerSchema = new mongoose.Schema({
  questionIndex: { type: Number, required: true },
  selectedIndex: { type: Number, default: null }, // null = skip kiya
  isCorrect: { type: Boolean, required: true },
})

const quizAttemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    
    subject: { type: String, required: true, trim: true },
    topic: { type: String, required: true, trim: true },
    answers: [answerSchema],
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    percentage: { type: Number, required: true },
  },
  { timestamps: true }
)

quizAttemptSchema.index({ user: 1, createdAt: -1 })

export default mongoose.model('QuizAttempt', quizAttemptSchema)