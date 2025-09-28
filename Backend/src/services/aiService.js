const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini with your API key
const gemini = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Use the correct model name ("gemini-2.0-flash" or the exact model you want)
const model = gemini.getGenerativeModel({ model: "gemini-2.0-flash" });

const systemPrompt = `
You are an expert interviewer for an SDE Intern role. Keep questions relevant, concise and diverse in technical, problem-solving, and behavioral aspects.
`;

// Generate the next interview question based on session Q&A history
exports.generateNextQuestion = async (session) => {
  const conversationContext = session.questions
    .map((q, i) => `Q: ${q}\nA: ${session.responses[i] || 'No answer'}`)
    .join('\n');
  
  const prompt = `
${systemPrompt}

Given this conversation history:
${conversationContext}

Generate the next interview question that is relevant and covers technical, problem-solving, or behavioral aspects. Return only the question string.
  `;

  const response = await model.generateContent(prompt);
  const content = response?.response?.text();
  return content?.trim() || "Could not generate a question.";
};

// Evaluate candidate's response and generate scores/feedback
exports.evaluateResponse = async (question, answer) => {
  const evaluationPrompt = `
${systemPrompt}

Question: ${question}
Candidate's Answer: ${answer}

Score the answer from 1 to 10 (integer) on each:
1) Technical knowledge
2) Communication clarity
3) Problem-solving approach

Respond with a JSON object like:
{
  "technical": number,
  "communication": number,
  "problemSolving": number,
  "feedback": "brief feedback here"
}
`;

  const response = await model.generateContent(evaluationPrompt);
  const content = response?.response?.text();

  try {
    return JSON.parse(content);
  } catch (err) {
    console.error('Error parsing evaluation JSON:', err, '\nContent:', content);
    return { technical: 5, communication: 5, problemSolving: 5, feedback: 'Answer is unclear.' };
  }
};

// Generate performance summary for candidate after interview
exports.generateFinalSummary = async (session) => {
  const summaryPrompt = `
You are an expert recruiter that reviews interview data to produce a summary.

Candidate Info:
Name: ${session.candidate?.name || 'N/A'}
Email: ${session.candidate?.email || 'N/A'}

Interview Questions and Answers:
${session.questions.map((q, idx) => `Q${idx + 1}: ${q}\nA${idx + 1}: ${session.responses[idx] || 'No answer'}`).join('\n\n')}

Scores:
Technical: ${session.scores.technical}
Communication: ${session.scores.communication}
Problem-Solving: ${session.scores.problemSolving}

Please provide a concise performance summary and recommendation.
`;

  const response = await model.generateContent(summaryPrompt);
  return response?.response?.text();
};
