import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'model'], required: true },
    content: { type: String, required: true, trim: true, maxlength: 10000 },
  },
  { _id: false }
)

const aiConversationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, trim: true, maxlength: 60, default: 'New doubt' },
    messages: { type: [messageSchema], default: [] },
  },
  { timestamps: true }
)

export default mongoose.model('AIConversation', aiConversationSchema)
