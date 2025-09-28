import React, { useEffect, useRef } from 'react';
import { useInterview } from '../hooks/useInterview';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

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

  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  const { speak, stop, isSpeaking } = useTextToSpeech();
  const lastSpokenQuestionRef = useRef(null);

  // Update answer with speech transcript
  useEffect(() => {
    if (transcript) {
      setCurrentAnswer(transcript);
    }
  }, [transcript, setCurrentAnswer]);

  // Auto-speak questions when they arrive
  useEffect(() => {
    if (!questions[currentQuestionIndex]) return;

    // Only speak if question changed and not currently speaking
    if (
      lastSpokenQuestionRef.current !== questions[currentQuestionIndex] &&
      !isSpeaking
    ) {
      speak(questions[currentQuestionIndex]);
      lastSpokenQuestionRef.current = questions[currentQuestionIndex];
    }
  }, [currentQuestionIndex, questions, isSpeaking, speak]);

  // Start Interview once component mounts
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
    
    stopListening();
    resetTranscript();
    
    await submit(currentAnswer);
    if (currentQuestionIndex + 1 >= 7) {
      await fetchSummary();
    } else {
      await getNext();
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

  if (loading && questions.length === 0) 
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading interview...</p>
        </div>
      </div>
    );

  if (error) 
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
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
              <p className="text-gray-600">Excellent work! Here are your results.</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Summary</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {summary?.summary || 'Summary not available'}
              </p>
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
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">AI Voice Interview</h1>
                <p className="text-blue-100">Question {currentQuestionIndex + 1} of 7</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-blue-500 rounded-full px-3 py-1">
                  <span className="text-sm font-medium text-white">
                    {Math.round(((currentQuestionIndex + 1) / 7) * 100)}%
                  </span>
                </div>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-4">
              <div className="bg-blue-500 rounded-full h-2">
                <div 
                  className="bg-white rounded-full h-2 transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / 7) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Question Section */}
          <div className="p-6">
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Current Question</h2>
                <button
                  onClick={() => speak(questions[currentQuestionIndex])}
                  disabled={isSpeaking}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 w-fit"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M9 9h4l-4-4v4zm0 0v6l4-4H9z"></path>
                  </svg>
                  {isSpeaking ? 'Speaking...' : 'Repeat Question'}
                </button>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                <p className="text-gray-800 leading-relaxed">{questions[currentQuestionIndex]}</p>
              </div>
            </div>

            {/* Answer Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Answer:
                </label>
                <textarea
                  rows="6"
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  disabled={loading}
                  placeholder="Type your answer here or use voice input..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none transition-colors"
                />
              </div>

              {/* Voice Status */}
              {isListening && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <p className="text-green-700 font-medium">Listening... Speak your answer now</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    isListening 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                  </svg>
                  {isListening ? 'Stop Recording' : 'Start Voice Input'}
                </button>

                <button
                  type="submit"
                  disabled={loading || !currentAnswer.trim()}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex-1 sm:flex-initial"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                      </svg>
                      Submit Answer
                    </>
                  )}
                </button>
              </div>

              {/* Help Text */}
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  You can type your answer or use voice input for a more natural interview experience
                </p>
              </div>
            </form> 
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewChat;