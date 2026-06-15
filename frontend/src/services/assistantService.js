import API from './api';

export const extractText = (resourceId) => API.post(`/assistant/${resourceId}/extract-text`);
export const getSummary = (resourceId) => API.get(`/assistant/${resourceId}/summary`);
export const getTopics = (resourceId) => API.get(`/assistant/${resourceId}/topics`);
export const askQuestion = (resourceId, question) => API.post(`/assistant/${resourceId}/ask`, { question });
