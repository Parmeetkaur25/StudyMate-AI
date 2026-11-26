import { body } from 'express-validator'

const levels = ['school', 'college', 'university', 'competitive', 'self-learner']

export const registerRules = [
  body('name').trim().isLength({ min: 2, max: 60 }).withMessage('Name must be 2-60 characters'),
  body('email').trim().toLowerCase().isEmail().withMessage('Enter a valid email'),
  body('password')
  .isString().withMessage('Password must be text')
  .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  .matches(/[A-Za-z]/).withMessage('Password needs a letter')
  .matches(/\d/).withMessage('Password needs a number'),
  body('educationLevel').optional().isIn(levels).withMessage('Invalid education level'),
]

export const loginRules = [
  body('email').trim().toLowerCase().isEmail().withMessage('Enter a valid email'),
  body('password').isString().notEmpty().withMessage('Password is required'),
]

export const profileRules = [
  body('name').optional().trim().isLength({ min: 2, max: 60 }).withMessage('Name must be 2-60 characters'),
  body('educationLevel').optional().isIn(levels).withMessage('Invalid education level'),
  body('course').optional().trim().isLength({ max: 80 }).withMessage('Course too long'),
  body('dailyGoalMinutes').optional().isInt({ min: 10, max: 1440 }).withMessage('Daily goal must be 10-1440 minutes'),
  body('preferredStudyTime').optional().isIn(['morning', 'afternoon', 'evening', 'night', 'flexible']).withMessage('Invalid study time'),
  body('subjects.*').optional().isString().trim().isLength({ min: 1, max: 80 }).withMessage('Each subject must be 1-80 characters'),
]