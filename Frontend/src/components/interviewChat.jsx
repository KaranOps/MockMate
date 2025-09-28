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

  if (loading && questions.length === 0)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading interview...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-4">
          <div className="flex items-center">
            <div className="bg-red-100 rounded-full p-2 mr-3">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        </div>
      </div>
    );

  if (interviewCompleted)
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Interview Completed!</h2>
              <p className="text-gray-600">Great job! Here are your results.</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Summary</h3>
              <p className="text-gray-700 leading-relaxed">{summary?.summary || 'Summary not available'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Technical</h4>
                <p className="text-2xl font-bold text-blue-600">{scores.technical}/10</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <h4 className="text-sm font-medium text-green-800 mb-1">Communication</h4>
                <p className="text-2xl font-bold text-green-600">{scores.communication}/10</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <h4 className="text-sm font-medium text-purple-800 mb-1">Problem Solving</h4>
                <p className="text-2xl font-bold text-purple-600">{scores.problemSolving}/10</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-bold text-white">
                Question {currentQuestionIndex + 1} of 7
              </h2>
              <div className="bg-blue-500 rounded-full px-3 py-1">
                <span className="text-sm font-medium text-white">
                  {Math.round(((currentQuestionIndex + 1) / 7) * 100)}%
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3">
              <div className="bg-blue-500 rounded-full h-2">
                <div
                  className="bg-white rounded-full h-2 transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / 7) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Question */}
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Question:</h3>
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                <p className="text-gray-800 leading-relaxed">{questions[currentQuestionIndex]}</p>
              </div>
            </div>

            {/* Answer Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Answer:
                </label>
                <textarea
                  rows="6"
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  disabled={loading}
                  placeholder="Type your answer here..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none transition-colors"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
                <p className="text-sm text-gray-500">
                  Take your time to provide a detailed response
                </p>
                <button
                  type="submit"
                  disabled={loading || !currentAnswer.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center min-w-fit"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    'Submit Answer'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewChat;