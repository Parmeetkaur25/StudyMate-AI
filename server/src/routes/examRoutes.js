import { Router } from 'express'
import { body, param } from 'express-validator'
import { protect } from '../middleware/auth.js'
import validate from '../middleware/validate.js'
import { aiLimiter } from '../middleware/rateLimiters.js'
import { isValidDateString } from '../utils/dateValidation.js'
import { createExam, listExams, toggleTopic, toggleScheduleItem, deleteExam } from '../controllers/examController.js'

const router = Router()
router.use(protect)

const date = (f) => body(f).custom(isValidDateString).withMessage(`${f} must be a valid YYYY-MM-DD date`)
const completed = body('completed').isBoolean().withMessage('completed must be true/false').toBoolean()

router.get('/', listExams)
router.post(
  '/',
  [
    body('title').trim().isLength({ min: 2, max: 120 }).withMessage('Title must be 2-120 characters'),
    date('examDate'),
    date('startDate'),
    body('availableHoursPerDay').optional().isFloat({ min: 0.5, max: 12 }).toFloat().withMessage('Study hours must be 0.5-12'),
    body('subjects').isArray({ min: 1, max: 8 }).withMessage('Add 1-8 subjects'),
    body('subjects.*.name').trim().isLength({ min: 2, max: 80 }).withMessage('Subject name must be 2-80 characters'),
    body('subjects.*.priority').isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
    body('subjects.*.topics').isArray({ min: 1, max: 40 }).withMessage('Each subject needs 1-40 topics'),
    body('subjects.*.topics.*').trim().isLength({ min: 1, max: 100 }).withMessage('Topic must be 1-100 characters'),
  ],
  validate,
  aiLimiter,
  createExam
)
router.patch('/:id/topics/:subjectId/:topicId', [param('id').isMongoId(), param('subjectId').isMongoId(), param('topicId').isMongoId(), completed], validate, toggleTopic)
router.patch('/:id/schedule/:itemId', [param('id').isMongoId(), param('itemId').isMongoId(), completed], validate, toggleScheduleItem)
router.delete('/:id', [param('id').isMongoId()], validate, deleteExam)

export default router