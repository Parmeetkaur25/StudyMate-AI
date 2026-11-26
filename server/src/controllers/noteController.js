import path from 'path'
import { PDFParse } from 'pdf-parse'
import Note from '../models/Note.js'
import asyncHandler from '../utils/asyncHandler.js'
import { generateJSON } from '../services/aiServices.js'
import { notesPrompt, notesSystemPrompt } from '../services/prompts.js'

const MAX_CHARS = 60000 // Gemini ko itna hi bhejte hain (cost aur limit control)
const MIN_CHARS = 200
const fail = (res, code, msg) => {
  res.status(code)
  throw new Error(msg)
}

const extractText = async (file, res) => {
  const ext = path.extname(file.originalname).toLowerCase()
  if (ext === '.pdf') {
    // Sirf extension par bharosa nahi: asli PDF "%PDF" se shuru hoti hai
    if (file.buffer.subarray(0, 4).toString() !== '%PDF') fail(res, 400, 'This file is not a valid PDF')
    try {
      const parser = new PDFParse({ data: file.buffer })
      try {
        const result = await parser.getText()
        return result.text || ''
      } finally {
        await parser.destroy()
      }
    } catch {
      return fail(res, 422, 'Could not read this PDF. It may be corrupted or password-protected.')
    }
  }
  return file.buffer.toString('utf8')
}

// POST /api/notes/upload   (multipart: file + optional title)
export const uploadNote = asyncHandler(async (req, res) => {
  if (!req.file) fail(res, 400, 'Please choose a file to upload')

  const raw = (await extractText(req.file, res)).replace(/\s+/g, ' ').trim()
  if (raw.length < MIN_CHARS) {
    fail(res, 422, 'No readable text found. This looks like a scanned/image-based PDF. OCR is not supported yet. Please upload a text-based PDF or a .txt file.')
  }
  const truncated = raw.length > MAX_CHARS
  const text = truncated ? raw.slice(0, MAX_CHARS) : raw

  const data = await generateJSON({
    systemInstruction: notesSystemPrompt,
    prompt: notesPrompt({ text, level: req.user.educationLevel }),
  })

  // AI output validate
  const summary = typeof data?.summary === 'string' ? data.summary.trim() : ''
  const keyPoints = (Array.isArray(data?.keyPoints) ? data.keyPoints : [])
    .filter((p) => typeof p === 'string' && p.trim()).map((p) => p.trim()).slice(0, 15)
  const revisionNotes = typeof data?.revisionNotes === 'string' ? data.revisionNotes.trim() : ''
  if (!summary) fail(res, 502, 'AI could not summarize this document. Please try again.')

  const defaultTitle = path.basename(req.file.originalname, path.extname(req.file.originalname))
  // Sirf summary save hoti hai, original file server par store nahi hoti (memory mein hi rehti hai)
  const note = await Note.create({
    user: req.user.id,
    title: (req.body.title?.trim() || defaultTitle).slice(0, 120),
    originalFileName: req.file.originalname.slice(0, 200),
    mimeType: req.file.mimetype,
    extractedChars: raw.length,
    summary,
    keyPoints,
    revisionNotes,
  })
  res.status(201).json({ success: true, note, truncated })
})

// GET /api/notes
export const listNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find({ user: req.user.id })
    .select('title originalFileName extractedChars createdAt')
    .sort({ createdAt: -1 })
    .limit(50)
  res.json({ success: true, notes })
})

// GET /api/notes/:id
export const getNote = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.user.id })
  if (!note) fail(res, 404, 'Note not found')
  res.json({ success: true, note })
})

// DELETE /api/notes/:id
export const deleteNote = asyncHandler(async (req, res) => {
  const done = await Note.findOneAndDelete({ _id: req.params.id, user: req.user.id })
  if (!done) fail(res, 404, 'Note not found')
  res.json({ success: true })
})
