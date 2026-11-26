import mongoose from 'mongoose'

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: {
    type: [String],
    validate: [(v) => v.length === 4, 'Each question needs exactly 4 options'],
  },
  correctIndex: { type: Number, required: true, min: 0, max: 3 }, // API response mein submit se pehle HIDE hoga
  explanation: { type: String, default: '' },
})

const quizSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subject: { type: String, required: true, trim: true },
    topic: { type: String, required: true, trim: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    questions: { type: [questionSchema], validate: [(v) => v.length > 0, 'Quiz needs questions'] },
  },
  { timestamps: true }
)

export default mongoose.model('Quiz', quizSchema)