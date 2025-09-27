const mongoose = require('mongoose');

const interviewSessionSchema = new mongoose.Schema({
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  questions: [{ type: String }], // question IDs or question texts
  responses: [{ type: String }], // Candidate answers
  scores: {
    technical: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    problemSolving: { type: Number, default: 0 },
  },
  status: { type: String, enum: ['started', 'completed'], default: 'started' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
