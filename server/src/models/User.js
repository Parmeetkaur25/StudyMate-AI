import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false }, // select:false = query mein by default nahi aata
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    educationLevel: {
      type: String,
      enum: ['school', 'college', 'university', 'competitive', 'self-learner'],
      default: 'college',
    },
    course: { type: String, trim: true, maxlength: 80, default: '' }, // e.g. "BCA 2nd year" ya "Class 10"
    dailyGoalMinutes: { type: Number, min: 10, max: 1440, default: 120 },
    preferredStudyTime: { type: String, enum: ['morning', 'afternoon', 'evening', 'night', 'flexible'], default: 'flexible' },
    subjects: { type: [String], default: [] },
  },
  { timestamps: true }
)


userSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 12)
})

userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password)
}


userSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
    delete ret.password
    return ret
  },
})

export default mongoose.model('User', userSchema)