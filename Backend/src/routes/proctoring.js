const express = require('express');
const router = express.Router();
const proctoringController = require('../controllers/proctoringController');

// Analyze frame endpoint
router.post('/session/:sessionId/analyze-frame', proctoringController.analyzeFrame);

// Get proctoring report endpoint
router.get('/session/:sessionId/report', proctoringController.getProctoringReport);

// Enable/disable proctoring endpoint
router.put('/session/:sessionId/toggle', proctoringController.toggleProctoring);

module.exports = router;
