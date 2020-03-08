const mongoose = require('../database/index')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    validate: function (password) {
      return /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,}$/.test(password)
    }
  },
  funcoes: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
})

UserSchema.pre('save', async function (next) {
  const hash = await bcrypt.hash(this.password, 8)
  this.password = hash

  next()
})

const User = mongoose.model('User', UserSchema)

module.exports = User