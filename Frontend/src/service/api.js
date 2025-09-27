import axios from 'axios';

const API_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:5000/api/interview';

export const startInterview = (candidateData) => {
  return axios.post(`${API_URL}/start`, candidateData);
};

export const getNextQuestion = (sessionId) => {
  return axios.get(`${API_URL}/${sessionId}/next-question`);
};

export const submitAnswer = (sessionId, questionIndex, answer) => {
  return axios.post(`${API_URL}/${sessionId}/answer`, {
    questionIndex,
    answer,
  });
};

export const getSummary = (sessionId) => {
  return axios.get(`${API_URL}/${sessionId}/summary`);
};
