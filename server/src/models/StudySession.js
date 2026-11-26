import mongoose from 'mongoose'

const studySessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true, trim: true },
    status: { type: String, enum: ['running', 'paused', 'completed'], default: 'running' },
    startedAt: { type: Date, default: Date.now },
    lastResumedAt: { type: Date, default: Date.now },
    accumulatedSeconds: { type: Number, default: 0 },
    endedAt: { type: Date },
  },
  { timestamps: true }
)

studySessionSchema.index({ user: 1, status: 1 })
studySessionSchema.index({ user: 1, startedAt: -1 })

export default mongoose.model('StudySession', studySessionSchema)