import { GoogleGenAI } from '@google/genai'

let client
const getClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    const e = new Error('GEMINI_API_KEY is not configured on the server')
    e.statusCode = 500
    throw e
  }
  client ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  return client
}

const MODEL = () => process.env.GEMINI_MODEL || 'gemini-2.5-flash'

// Gemini ke errors ko student-friendly message + sahi status code mein badalta hai
const wrapError = (err) => {
  const code = err.status || err.code
  const e = new Error(
    code === 429
      ? 'AI is busy or the free quota is used up. Please try again in a minute.'
      : code === 503
        ? 'AI service is temporarily overloaded. Please try again shortly.'
        : code === 404
          ? 'AI model not found. Check GEMINI_MODEL in server/.env.'
          : 'AI request failed. Please try again.'
  )
  e.statusCode = code === 429 ? 429 : code === 503 ? 503 : 502
  console.error('Gemini error:', err.message)
  return e
}

// Normal text (doubt solver). contents = [{ role: 'user'|'model', parts: [{ text }] }]
export const generateText = async ({ contents, systemInstruction, temperature = 0.5 }) => {
  try {
    const res = await getClient().models.generateContent({
      model: MODEL(),
      contents,
      config: { systemInstruction, temperature },
    })
    if (!res.text) throw new Error('Empty AI response')
    return res.text
  } catch (err) {
    throw wrapError(err)
  }
}

// Structured JSON (quiz, planner, etc.)
export const generateJSON = async ({ prompt, systemInstruction, temperature = 0.4 }) => {
  let text
  try {
    const res = await getClient().models.generateContent({
      model: MODEL(),
      contents: prompt,
      config: { systemInstruction, temperature, responseMimeType: 'application/json' },
    })
    text = res.text
  } catch (err) {
    throw wrapError(err)
  }
  try {
    // Kabhi model ```json fences laga deta hai, unhe hata ke parse karte hain
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch {
    const e = new Error('AI returned an unreadable response. Please try again.')
    e.statusCode = 502
    throw e
  }
}