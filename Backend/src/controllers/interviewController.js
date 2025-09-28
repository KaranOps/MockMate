const Candidate = require('../models/candidate');
const InterviewSession = require('../models/interviewSession');
const aiService = require('../services/aiService');

exports.startInterview = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    const candidate = new Candidate({ name, email, phone });
    await candidate.save();

    // Create interview session without any questions initially
    const session = new InterviewSession({
      candidate: candidate._id,
      questions: [],
      responses: [],
      scores: { technical: 0, communication: 0, problemSolving: 0 },
      status: 'started',
    });
    await session.save();

    res.status(201).json({
      sessionId: session._id,
      candidateId: candidate._id,
      questions: [], // No questions initially
      message: 'Interview started',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getQuestion = async (req, res) => {
  try {
    const { sessionId, questionIndex } = req.params;
    const session = await InterviewSession.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    // Return question by index
    const question = session.questions[questionIndex];
    if (!question) return res.status(404).json({ message: 'Question not found' });

    res.json({ question, questionIndex: Number(questionIndex) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getNextQuestion = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await InterviewSession.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    // Generate new question based on past Q&A in session
    const nextQuestion = await aiService.generateNextQuestion(session);

    // Add new question to session.questions
    session.questions.push(nextQuestion);
    await session.save();

    res.json({ question: nextQuestion, questionIndex: session.questions.length - 1 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.submitAnswer = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { questionIndex, answer } = req.body;

    // Validate input
    if (typeof questionIndex !== 'number' || questionIndex < 0) {
      return res.status(400).json({ message: 'Invalid question index' });
    }
    if (!answer || typeof answer !== 'string') {
      return res.status(400).json({ message: 'Answer must be a non-empty string' });
    }

    const session = await InterviewSession.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    if (questionIndex >= session.questions.length) {
      return res.status(400).json({ message: 'Question index out of bounds' });
    }

    // Save the candidate's response
    session.responses[questionIndex] = answer;

    // Evaluate answer using AI service
    const question = session.questions[questionIndex];
    const score = await aiService.evaluateResponse(question, answer);

    // Initialize per-question score tracking if missing
    if (!session.perQuestionScores) {
      session.perQuestionScores = [];
    }

    // Save/update score for this specific question
    session.perQuestionScores[questionIndex] = score;

    // Recalculate total scores as sum of per-question scores
    const totalScores = session.perQuestionScores.reduce(
      (acc, curr) => ({
        technical: acc.technical + (curr.technical || 0),
        communication: acc.communication + (curr.communication || 0),
        problemSolving: acc.problemSolving + (curr.problemSolving || 0),
      }),
      { technical: 0, communication: 0, problemSolving: 0 }
    );
    session.scores = totalScores;

    await session.save();

    res.json({
      message: 'Answer submitted and evaluated',
      currentScores: session.scores,
      feedback: score.feedback || '',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};


exports.getSummary = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await InterviewSession.findById(sessionId).populate('candidate');
    if (!session) return res.status(404).json({ message: 'Session not found' });

    // Generate summary from AI service
    const summary = await aiService.generateFinalSummary(session);

    // Update session status to completed
    session.status = 'completed';
    await session.save();

    res.json({ candidate: session.candidate, summary, scores: session.scores });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
