const { GoogleGenerativeAI } = require('@google/generative-ai');

const gemini = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const systemPrompt = `
    You are an expert interviewer for an SDE Intern role. Keep questions relevant, 
    concise and diverse in technical, problem-solving, and behavioral aspects.
`;

exports.generateNextQuestion = async (session) => {
  // Build conversation context string from past Q&A
  const conversationContext = session.questions
    .map((q, i) => `Q: ${q}\nA: ${session.responses[i] || 'No answer'}`)
    .join('\n');

  const prompt = `
You are an AI interviewer for an SDE Intern role.
Given this conversation history:
${conversationContext}

Generate the next interview question that is relevant and covers technical, problem-solving, or behavioral aspects. Return only the question string.
`;

  const response = await gemini.chat.completions.create({
    model: 'gemini-2.0-flash',
    messages: [
      { role: 'system', content: 'You are an expert AI interviewer.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
  });

  return response.choices[0].message.content.trim();
};


// Evaluate candidate response with Gemini and score it
exports.evaluateResponse = async (question, answer) => {
  const evaluationPrompt = `
You are an interviewer evaluating a candidate for SDE Intern role.

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

  const response = await gemini.chat.completions.create({
    model: 'gemini-2.0-flash',
    messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: evaluationPrompt }],
    temperature: 0.5,
  });

  try {
    return JSON.parse(response.choices[0].message.content);
  } catch (err) {
    console.error('Error parsing evaluation JSON:', err);
    return { technical: 5, communication: 5, problemSolving: 5, feedback: 'Answer is unclear.' };
  }
};

// Generate final summary for the candidate after the interview ends
exports.generateFinalSummary = async (session) => {
  const summaryPrompt = `
You are an expert recruiter that reviews interview data to produce a summary.

Candidate Info:
Name: ${session.candidate.name || 'N/A'}
Email: ${session.candidate.email || 'N/A'}

Interview Questions and Answers:
${session.questions.map((q, idx) => `Q${idx + 1}: ${q}\nA${idx + 1}: ${session.responses[idx] || 'No answer'}`).join('\n\n')}

Scores:
Technical: ${session.scores.technical}
Communication: ${session.scores.communication}
Problem-Solving: ${session.scores.problemSolving}

Please provide a concise performance summary and recommendation.
`;

  const response = await gemini.chat.completions.create({
    model: 'gemini-2.0-flash',
    messages: [{ role: 'system', content: 'You are a helpful recruiter assistant.' }, { role: 'user', content: summaryPrompt }],
    temperature: 0.7,
  });

  return response.choices[0].message.content;
};
