import { Router } from 'express'
import { protect, authorize } from '../middleware/auth.js'
import { getAdminStats, listUsers } from '../controllers/adminController.js'

const router = Router()
router.use(protect, authorize('admin')) // pehle login, phir role check (asli security yahin hai)

router.get('/stats', getAdminStats)
router.get('/users', listUsers)

export default router