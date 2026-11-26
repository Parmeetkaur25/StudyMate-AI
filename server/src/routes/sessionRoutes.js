import { Router } from 'express'
import { body, param } from 'express-validator'
import { protect } from '../middleware/auth.js'
import validate from '../middleware/validate.js'
import {
  getActive, startSession, pauseSession, resumeSession, stopSession, listSessions, getStats,
} from '../controllers/sessionControllers.js'

const router = Router()
router.use(protect)

const idRule = [param('id').isMongoId().withMessage('Invalid session id'), validate]

router.get('/', listSessions)
router.get('/active', getActive)
router.get('/stats', getStats)
router.post('/start', [body('subject').trim().isLength({ min: 2, max: 80 }).withMessage('Subject must be 2-80 characters')], validate, startSession)
router.post('/:id/pause', idRule, pauseSession)
router.post('/:id/resume', idRule, resumeSession)
router.post('/:id/stop', idRule, stopSession)

export default router
