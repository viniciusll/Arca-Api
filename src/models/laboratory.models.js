const mongoose = require('../database/index');

const LaboratorySchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  status: {
    type: String,
    required: true
  },
  address: {
    city: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    },
    cep: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    street: {
      type: String,
      required: true
    },
    number: {
      type: Number,
      required: true
    },
    district: {
      type: String,
      required: true
    },
    complement: {
      type: String
    }
  }
});

const Laboratory = mongoose.model('Laboratory', LaboratorySchema);

module.exports = Laboratory;