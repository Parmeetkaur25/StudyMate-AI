import { Router } from 'express'
import { body } from 'express-validator'
import { protect } from '../middleware/auth.js'
import { aiLimiter } from '../middleware/rateLimiters.js'
import validate from '../middleware/validate.js'
import { generateQuiz, getQuiz, submitQuiz, listAttempts } from '../controllers/quizControllers.js'

const router = Router()
router.use(protect)

router.post(
  '/generate',
  [
    body('subject').trim().isLength({ min: 2, max: 80 }).withMessage('Subject must be 2-80 characters'),
    body('topic').trim().isLength({ min: 2, max: 120 }).withMessage('Topic must be 2-120 characters'),
    body('difficulty').optional().isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty'),
    body('count').optional().isInt({ min: 3, max: 15 }).toInt().withMessage('Questions must be 3-15'),
  ],
  validate,
  aiLimiter,
  generateQuiz
)
router.get('/attempts', listAttempts) // /:id se PEHLE rakhna zaroori hai, warna "attempts" ko id samajh liya jayega
router.get('/:id', getQuiz)
router.post('/:id/submit', submitQuiz)

export default router
