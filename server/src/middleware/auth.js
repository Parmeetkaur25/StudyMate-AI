import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import asyncHandler from '../utils/asyncHandler.js'

// AUTHENTICATION: "tum kaun ho?" (token valid hai?)
export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401)
    throw new Error('Not authorized, token missing')
  }
  const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET)
  const user = await User.findById(decoded.id)
  if (!user) {
    res.status(401)
    throw new Error('User no longer exists')
  }
  req.user = user // aage ke controllers req.user.id se sirf apna data nikalenge
  next()
})

// AUTHORIZATION: "tumhe ye karne ki permission hai?" (role check)
export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    res.status(403)
    return next(new Error('You do not have permission to do this'))
  }
  next()
}