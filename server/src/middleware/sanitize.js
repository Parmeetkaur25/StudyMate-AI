// NoSQL injection guard: {"email": {"$gt": ""}} jaisi body Mongo query ko tod sakti hai.
// Kisi bhi key ka naam "$" se shuru ho ya "." rakhe to request reject.
const hasBadKey = (v) => {
  if (Array.isArray(v)) return v.some(hasBadKey)
  if (v && typeof v === 'object') {
    return Object.entries(v).some(([k, val]) => k.startsWith('$') || k.includes('.') || hasBadKey(val))
  }
  return false
}

export default (req, res, next) => {
  if (hasBadKey(req.body) || hasBadKey(req.query)) {
    res.status(400)
    return next(new Error('Invalid characters in request'))
  }
  next()
}