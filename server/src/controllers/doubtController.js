import AIConversation from '../models/AIConversation.js'
import asyncHandler from '../utils/asyncHandler.js'
import { generateText } from '../services/aiServices.js'
import { doubtSystemPrompt } from '../services/prompts.js'

// GET /api/doubts  (sirf list, messages nahi)
export const listConversations = asyncHandler(async (req, res) => {
  const items = await AIConversation.find({ user: req.user.id })
    .select('title updatedAt')
    .sort({ updatedAt: -1 })
    .limit(50)
  res.json({ success: true, conversations: items })
})

// GET /api/doubts/:id
export const getConversation = asyncHandler(async (req, res) => {
  // user filter = data ownership: dusre ka chat ID jaanne par bhi nahi milega
  const convo = await AIConversation.findOne({ _id: req.params.id, user: req.user.id })
  if (!convo) {
    res.status(404)
    throw new Error('Conversation not found')
  }
  res.json({ success: true, conversation: convo })
})

// POST /api/doubts/ask   body: { message, conversationId? }
export const askDoubt = asyncHandler(async (req, res) => {
  const { message, conversationId } = req.body

  let convo = conversationId
    ? await AIConversation.findOne({ _id: conversationId, user: req.user.id })
    : null
  if (conversationId && !convo) {
    res.status(404)
    throw new Error('Conversation not found')
  }
  if (!convo) convo = new AIConversation({ user: req.user.id, title: message.slice(0, 60), messages: [] })

  // Pichhle 20 messages context ke liye (tokens bachane ke liye)
  const history = convo.messages.slice(-20).map((m) => ({ role: m.role, parts: [{ text: m.content }] }))
  const contents = [...history, { role: 'user', parts: [{ text: message }] }]

  // Pehle AI call; fail hua to DB mein adhura message save nahi hoga
  const answer = await generateText({ contents, systemInstruction: doubtSystemPrompt(req.user) })

  convo.messages.push({ role: 'user', content: message }, { role: 'model', content: answer })
  await convo.save()
  res.json({ success: true, conversationId: convo.id, answer })
})

// DELETE /api/doubts/:id
export const deleteConversation = asyncHandler(async (req, res) => {
  const done = await AIConversation.findOneAndDelete({ _id: req.params.id, user: req.user.id })
  if (!done) {
    res.status(404)
    throw new Error('Conversation not found')
  }
  res.json({ success: true })
})
