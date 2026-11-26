import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  subject: { type: String, trim: true },
  topic: { type: String, trim: true },
  date: { type: Date, required: true },
  durationMinutes: { type: Number, min: 5, max: 600, default: 45 },
  type: { type: String, enum: ['study', 'revision', 'practice'], default: 'study' },
  completed: { type: Boolean, default: false },
})

const studyPlanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    availableHoursPerDay: { type: Number, min: 0.5, max: 16, default: 3 },
    inputs: { type: mongoose.Schema.Types.Mixed }, // student ne form mein jo diya, uska copy
    tasks: [taskSchema],
  },
  { timestamps: true }
)

export default mongoose.model('StudyPlan', studyPlanSchema)