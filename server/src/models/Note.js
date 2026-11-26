import mongoose from 'mongoose'

const noteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    originalFileName: { type: String },
    mimeType: { type: String },
    extractedChars: { type: Number, default: 0 },
    summary: { type: String, default: '' },
    keyPoints: { type: [String], default: [] },
    revisionNotes: { type: String, default: '' },
  },
  { timestamps: true }
)

export default mongoose.model('Note', noteSchema)