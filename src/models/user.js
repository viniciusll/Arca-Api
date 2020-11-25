const mongoose = require('../database/index');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
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
  confirmed: {
    type: Boolean,
    required: true,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  profile: [{
    emailProfile: {
      type: String,
      unique: true
    },
    firstName: {
      type: String
    },
    lastName: {
      type: String
    },
    address: [{
      city: {
        type: String
      },
      country: {
        type: String
      },
      cep: {
        type: String
      },
      state: {
        type: String
      },
      street: {
        type: String
      },
      number: {
        type: Number
      },
      district: {
        type: String
      },
      complement: {
        type: String
      }
    }],
    imageProfileUrl: {
      type: String
    },
    description: {
      type: String
    }
  }]
});

const User = mongoose.model('User', UserSchema);

module.exports = User;