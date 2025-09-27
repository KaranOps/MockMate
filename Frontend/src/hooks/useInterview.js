import { useState } from 'react';
import * as api from '../service/api';

export const useInterview = () => {
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [scores, setScores] = useState({ technical: 0, communication: 0, problemSolving: 0 });
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [error, setError] = useState(null);

  const start = async (candidateData) => {
    setLoading(true);
    try {
      const { data } = await api.startInterview(candidateData);
      setSessionId(data.sessionId);
      setQuestions([]);
      setCurrentQuestionIndex(-1);
      setSummary(null);
      setInterviewCompleted(false);
      setScores({ technical: 0, communication: 0, problemSolving: 0 });
      setError(null);
    } catch (err) {
      setError('Failed to start interview');
    }
    setLoading(false);
  };

  const getNext = async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const { data } = await api.getNextQuestion(sessionId);
      setQuestions((prev) => [...prev, data.question]);
      setCurrentQuestionIndex(data.questionIndex);
      setCurrentAnswer('');
      setError(null);
    } catch (err) {
      setError('Failed to get next question');
    }
    setLoading(false);
  };

  const submit = async (answer) => {
    if (!sessionId || currentQuestionIndex < 0) return;
    setLoading(true);
    try {
      const { data } = await api.submitAnswer(sessionId, currentQuestionIndex, answer);
      setScores(data.currentScores);
      setError(null);
    } catch (err) {
      setError('Failed to submit answer');
    }
    setLoading(false);
  };

  const fetchSummary = async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const { data } = await api.getSummary(sessionId);
      setSummary(data);
      setInterviewCompleted(true);
      setError(null);
    } catch (err) {
      setError('Failed to fetch summary');
    }
    setLoading(false);
  };

  return {
    sessionId,
    questions,
    currentQuestionIndex,
    currentAnswer,
    setCurrentAnswer,
    scores,
    summary,
    loading,
    error,
    interviewCompleted,
    start,
    getNext,
    submit,
    fetchSummary,
  };
};
