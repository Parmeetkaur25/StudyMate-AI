import path from 'path'
import { Router } from 'express'
import multer from 'multer'
import { param } from 'express-validator'
import { protect } from '../middleware/auth.js'
import { aiLimiter } from '../middleware/rateLimiters.js'
import validate from '../middleware/validate.js'
import { uploadNote, listNotes, getNote, deleteNote } from '../controllers/noteController.js'

const ALLOWED = ['.pdf', '.txt', '.md']

const upload = multer({
  storage: multer.memoryStorage(), // disk par nahi likhte: koi leftover file ya path-traversal risk nahi
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED.includes(path.extname(file.originalname).toLowerCase())) return cb(null, true)
    cb(new Error('Only PDF, TXT and MD files are allowed'))
  },
}).single('file')

// Multer ke errors ko 400 + readable message mein badalta hai
const handleUpload = (req, res, next) =>
  upload(req, res, (err) => {
    if (!err) return next()
    res.status(400)
    next(new Error(err.code === 'LIMIT_FILE_SIZE' ? 'File is too large (max 5 MB)' : err.message))
  })

const router = Router()
router.use(protect)

router.get('/', listNotes)
router.post('/upload', aiLimiter, handleUpload, uploadNote)
router.get('/:id', [param('id').isMongoId()], validate, getNote)
router.delete('/:id', [param('id').isMongoId()], validate, deleteNote)

export default router