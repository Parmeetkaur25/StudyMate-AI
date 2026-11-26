import mongoose from 'mongoose'

const topicSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  completed: { type: Boolean, default: false },
})

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  topics: [topicSchema],
})

const scheduleItemSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  subject: String,
  topic: String,
  durationMinutes: { type: Number, default: 45 },
  completed: { type: Boolean, default: false },
})

const examPreparationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    examDate: { type: Date, required: true },
    availableHoursPerDay: { type: Number, min: 0.5, max: 16, default: 3 },
    subjects: [subjectSchema],
    schedule: [scheduleItemSchema],
  },
  { timestamps: true }
)

export default mongoose.model('ExamPreparation', examPreparationSchema)