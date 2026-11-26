import { Router } from 'express'
import { body, param } from 'express-validator'
import { protect } from '../middleware/auth.js'
import validate from '../middleware/validate.js'
import { aiLimiter } from '../middleware/rateLimiters.js'
import { isValidDateString } from '../utils/dateValidation.js'
import { generatePlan, listPlans, updateTask, deleteTask, deletePlan } from '../controllers/planController.js'

const router = Router()
router.use(protect)

const dateRule = (field) => body(field).custom(isValidDateString).withMessage(`${field} must be a valid YYYY-MM-DD date`)

router.get('/', listPlans)
router.post(
  '/generate',
  [
    body('title').optional().trim().isLength({ max: 120 }),
    dateRule('startDate'),
    body('availableHoursPerDay').optional().isFloat({ min: 0.5, max: 12 }).toFloat().withMessage('Study hours must be 0.5-12'),
    body('sessionLength').optional().isIn(['short', 'medium', 'long']),
    body('subjects').isArray({ min: 1, max: 8 }).withMessage('Add 1-8 subjects'),
    body('subjects.*.name').trim().isLength({ min: 2, max: 80 }).withMessage('Subject name must be 2-80 characters'),
    body('subjects.*.topics').isArray({ min: 1, max: 30 }).withMessage('Each subject needs 1-30 topics'),
    body('subjects.*.topics.*').trim().isLength({ min: 1, max: 100 }).withMessage('Topic must be 1-100 characters'),
    body('subjects.*.examDate').custom(isValidDateString).withMessage('Each subject needs a valid exam date'),
    body('subjects.*.priority').isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
    body('subjects.*.level').isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid preparation level'),
  ],
  validate,
  aiLimiter,
  generatePlan
)
router.patch(
  '/:id/tasks/:taskId',
  [
    param('id').isMongoId(),
    param('taskId').isMongoId(),
    body('completed').optional().isBoolean().toBoolean(),
    body('title').optional().trim().isLength({ min: 1, max: 150 }).withMessage('Title must be 1-150 characters'),
    body('durationMinutes').optional().isInt({ min: 5, max: 600 }).toInt().withMessage('Duration must be 5-600 minutes'),
    body('date').optional().custom(isValidDateString).withMessage('date must be a valid YYYY-MM-DD date'),
  ],
  validate,
  updateTask
)
router.delete('/:id/tasks/:taskId', [param('id').isMongoId(), param('taskId').isMongoId()], validate, deleteTask)
router.delete('/:id', [param('id').isMongoId()], validate, deletePlan)

export default router