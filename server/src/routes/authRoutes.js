import { Router } from 'express'
import { register, login, getMe, updateProfile } from '../controllers/authController.js'
import { protect } from '../middleware/auth.js'
import validate from '../middleware/validate.js'
import { registerRules, loginRules, profileRules } from '../validators/authValidators.js'

const router = Router()

router.post('/register', registerRules, validate, register)
router.post('/login', loginRules, validate, login)
router.get('/me', protect, getMe)
router.put('/profile', protect, profileRules, validate, updateProfile)

export default router