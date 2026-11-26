import { Router } from 'express'
import { body } from 'express-validator'
import { protect } from '../middleware/auth.js'
import { aiLimiter } from '../middleware/rateLimiters.js'
import validate from '../middleware/validate.js'
import { listConversations, getConversation, askDoubt, deleteConversation } from '../controllers/doubtController.js'

const router = Router()
router.use(protect) // is file ke saare routes login maangte hain

router.get('/', listConversations)
router.post(
  '/ask',
  [
    body('message').trim().isLength({ min: 2, max: 2000 }).withMessage('Question must be 2-2000 characters'),
    body('conversationId').optional().isMongoId().withMessage('Invalid conversation id'),
  ],
  validate,
  aiLimiter,
  askDoubt
)
router.get('/:id', getConversation)
router.delete('/:id', deleteConversation)

export default router