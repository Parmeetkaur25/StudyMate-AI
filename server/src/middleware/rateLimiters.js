import rateLimit from 'express-rate-limit'

const handler = (message) => (req, res) => res.status(429).json({ success: false, message })

// Poore API par: 15 minute mein 300 requests per IP
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: handler('Too many requests. Please slow down and try again shortly.'),
})

// Login/Register par: brute-force password guessing rokne ke liye
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: handler('Too many login attempts. Please try again in 15 minutes.'),
})

// AI endpoints par: Gemini ka free quota aur paisa bachane ke liye, per USER (IP nahi)
// Ye `protect` ke BAAD lagta hai, isliye req.user maujood hota hai
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 40,
  keyGenerator: (req) => req.user?.id || 'anonymous',
  standardHeaders: true,
  legacyHeaders: false,
  handler: handler('You have reached the hourly AI limit (40 requests). Please try again later.'),
})