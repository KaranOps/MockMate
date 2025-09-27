import React, { useEffect } from 'react';
import { useInterview } from '../hooks/useInterview';

const InterviewChat = () => {
  const {
    questions,
    currentQuestionIndex,
    currentAnswer,
    setCurrentAnswer,
    loading,
    error,
    interviewCompleted,
    scores,
    summary,
    start,
    getNext,
    submit,
    fetchSummary,
  } = useInterview();

  // Start Interview
  useEffect(() => {
    start({ name: 'Karan', email: 'karanops.dev@gmail.com' });
  }, []);

  // Get first question after interview start
  useEffect(() => {
    if (currentQuestionIndex === -1) {
      getNext();
    }
  }, [currentQuestionIndex]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentAnswer.trim()) return;
    await submit(currentAnswer);
    if (currentQuestionIndex + 1 >= 7) {
      await fetchSummary();
    } else {
      await getNext();
    }
  };

  if (loading && questions.length === 0) return <p>Loading interview...</p>;

  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  if (interviewCompleted)
    return (
      <div>
        <h2>Interview Finished</h2>
        <p>{summary?.summary || 'Summary not available'}</p>
        <div>
          <p>Technical: {scores.technical}</p>
          <p>Communication: {scores.communication}</p>
          <p>Problem Solving: {scores.problemSolving}</p>
        </div>
      </div>
    );

  return (
    <div>
      <h2>Question {currentQuestionIndex + 1}</h2>
      <p>{questions[currentQuestionIndex]}</p>
      <form onSubmit={handleSubmit}>
        <textarea
          rows="4"
          value={currentAnswer}
          onChange={(e) => setCurrentAnswer(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Answer'}
        </button>
      </form>
    </div>
  );
};

export default InterviewChat;
