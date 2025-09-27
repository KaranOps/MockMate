const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');

// Start a new interview session
router.post('/start', interviewController.startInterview);

// Get a question by index for a session
router.get('/:sessionId/question/:questionIndex', interviewController.getQuestion);

router.get('/:sessionId/next-question', interviewController.getNextQuestion);

// Submit an answer for a question
router.post('/:sessionId/answer', interviewController.submitAnswer);

// Get final summary after interview completion
router.get('/:sessionId/summary', interviewController.getSummary);

module.exports = router;
