import User from '../models/User.js'
import asyncHandler from '../utils/asyncHandler.js'
import generateToken from '../utils/generateToken.js'

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, educationLevel } = req.body // role jaan-bujhkar nahi liya: koi khud ko admin nahi bana sakta

  if (await User.findOne({ email })) {
    res.status(409)
    throw new Error('An account with this email already exists')
  }

  const user = await User.create({ name, email, password, educationLevel })
  res.status(201).json({ success: true, token: generateToken(user._id), user })
})

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email }).select('+password')

  // Same message dono cases mein, taaki attacker ko pata na chale email exist karta hai ya nahi
  if (!user || !(await user.matchPassword(password))) {
    res.status(401)
    throw new Error('Invalid email or password')
  }
  res.json({ success: true, token: generateToken(user._id), user })
})

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user })
})

// PUT /api/auth/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ['name', 'educationLevel', 'course', 'dailyGoalMinutes', 'preferredStudyTime', 'subjects']
  const user = req.user
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) user[field] = req.body[field]
  })
  await user.save()
  res.json({ success: true, user })
})