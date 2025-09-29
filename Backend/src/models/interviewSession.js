const mongoose = require('mongoose');

const ProctoringActivitySchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  face_status: String,
  gaze_direction: String,
  head_pose: String,
  detected_objects: [String],
  suspicious_activity: [String],
  frame_data: String // Base64 encoded frame (optional)
});

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
  proctoring_enabled: { type: Boolean, default: false },
  proctoring_activities: [ProctoringActivitySchema],
  suspicious_count: { type: Number, default: 0 },
  proctoring_violations: [{
    type: String,
    timestamp: Date,
    description: String
  }]
});

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
