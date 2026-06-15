import API from './api';

export const getQuestions = (params) => API.get('/quizzes/questions', { params });
export const getQuestionsForQuiz = (params) => API.get('/quizzes/questions/quiz', { params });
export const generateQuestions = (data) => API.post('/quizzes/generate', data);
export const generateSubjectQuiz = (data) => API.post('/quizzes/generate-subject', data);
export const submitQuiz = (data) => API.post('/quizzes/submit', data);
export const getAttempts = () => API.get('/quizzes/attempts');
export const getAttemptById = (id) => API.get(`/quizzes/attempts/${id}`);
export const getLeaderboard = () => API.get('/quizzes/leaderboard');
