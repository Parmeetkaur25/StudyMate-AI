import { Router } from 'express'
import { protect } from '../middleware/auth.js'
import { aiLimiter } from '../middleware/rateLimiters.js'
import { getWeakness, getAdvice } from '../controllers/weaknessController.js'

const router = Router()
router.use(protect)
router.get('/', getWeakness)
router.post('/advice', aiLimiter, getAdvice)

export default router