const mongoose = require('mongoose');

const ProctoringActivitySchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  face_status: { type: String, enum: ['normal', 'no_face', 'multiple_faces', 'error'] },
  faces_count: { type: Number, default: 0 },
  gaze_direction: { type: String, default: 'not_implemented_yet' },
  head_pose: { type: String, default: 'not_implemented_yet' },
  detected_objects: [String],
  blink_status: { type: String, default: 'not_implemented_yet' },
  blink_count: { type: Number, default: 0 },
  suspicious_activity: [String]
});

const interviewSessionSchema = new mongoose.Schema({
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  questions: [{ type: String }], // question IDs or texts
  responses: [{ type: String }], // Candidate answers
  scores: {
    technical: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    problemSolving: { type: Number, default: 0 },
  },

  // Proctoring data added below
  proctoring_enabled: { type: Boolean, default: false },
  proctoring_activities: [ProctoringActivitySchema],
  total_violations: { type: Number, default: 0 },
  proctoring_summary: {
    face_anomalies: { type: Number, default: 0 },
    total_frames_analyzed: { type: Number, default: 0 },
    session_duration: { type: Number, default: 0 }, // seconds
  }
});

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
