const axios = require('axios');
const InterviewSession = require('../models/interviewSession');

const PROCTORING_SERVICE_URL = 'http://localhost:5001';

// Analyze frame endpoint
exports.analyzeFrame = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { frameData } = req.body;

    if (!frameData) {
      return res.status(400).json({ 
        success: false, 
        error: 'No frame data provided' 
      });
    }

    // Forward to Python proctoring service
    const response = await axios.post(`${PROCTORING_SERVICE_URL}/analyze-frame`, {
      frame: frameData,
      session_id: sessionId
    });

    if (!response.data.success) {
      return res.status(400).json(response.data);
    }

    const analysis = response.data.analysis;
    
    const logFile = path.join(__dirname, '..', 'activity.txt');
    fs.appendFile(logFile, JSON.stringify(analysis) + '\n', err => {
      if (err) console.error('Error appending to activity.txt:', err);
    });
    
    // Update session with proctoring data
    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: 'Session not found' 
      });
    }

    // Add activity to session
    session.proctoring_activities.push(analysis);
    session.proctoring_summary.total_frames_analyzed += 1;

    // Count violations
    if (analysis.suspicious_activity && analysis.suspicious_activity.length > 0) {
      session.total_violations += analysis.suspicious_activity.length;
      
      if (analysis.suspicious_activity.includes('face_anomaly')) {
        session.proctoring_summary.face_anomalies += 1;
      }
    }

    await session.save();

    res.json({
      success: true,
      analysis,
      session_stats: {
        total_violations: session.total_violations,
        frames_analyzed: session.proctoring_summary.total_frames_analyzed
      }
    });

  } catch (error) {
    console.error('Proctoring analysis error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Proctoring analysis failed',
      details: error.message 
    });
  }
};

// Get proctoring report
exports.getProctoringReport = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: 'Session not found' 
      });
    }

    // Also get detailed report from Python service
    try {
      const detailedReport = await axios.get(
        `${PROCTORING_SERVICE_URL}/session/${sessionId}/summary`
      );
      
      res.json({
        success: true,
        session_id: sessionId,
        mongo_summary: session.proctoring_summary,
        total_violations: session.total_violations,
        activities_count: session.proctoring_activities.length,
        python_service_summary: detailedReport.data.summary || null,
        recent_activities: session.proctoring_activities.slice(-10) // Last 10 activities
      });

    } catch (serviceError) {
      // If Python service is down, return MongoDB data only
      res.json({
        success: true,
        session_id: sessionId,
        mongo_summary: session.proctoring_summary,
        total_violations: session.total_violations,
        activities_count: session.proctoring_activities.length,
        python_service_summary: null,
        recent_activities: session.proctoring_activities.slice(-10)
      });
    }

  } catch (error) {
    console.error('Error generating proctoring report:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate report' 
    });
  }
};

// Enable/disable proctoring for session
exports.toggleProctoring = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { enabled } = req.body;

    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: 'Session not found' 
      });
    }

    session.proctoring_enabled = enabled;
    await session.save();

    res.json({
      success: true,
      message: `Proctoring ${enabled ? 'enabled' : 'disabled'} for session`,
      proctoring_enabled: session.proctoring_enabled
    });

  } catch (error) {
    console.error('Error toggling proctoring:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to toggle proctoring' 
    });
  }
};
