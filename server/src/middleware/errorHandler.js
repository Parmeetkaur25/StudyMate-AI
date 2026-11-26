export const notFound = (req, res, next) => {
  res.status(404)
  next(new Error(`Route not found: ${req.originalUrl}`))
}

export const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500)
  let message = err.message || 'Server error'

  if (err.name === 'ValidationError') {
    status = 400
    message = Object.values(err.errors).map((e) => e.message).join(', ')
  } else if (err.name === 'CastError') {
    status = 400
    message = 'Invalid ID format'
  } else if (err.code === 11000) {
    status = 409
    message = 'That value already exists (duplicate)'
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    status = 401
    message = 'Session invalid or expired. Please login again.'
  }

  res.status(status).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  })
}
