const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: false },
  email: { type: String, required: false },
  phone: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Candidate', candidateSchema);
