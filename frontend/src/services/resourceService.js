import API from './api';

export const getResources = (params) => API.get('/resources', { params });
export const getResourceById = (id) => API.get(`/resources/${id}`);
export const createResource = (data) => API.post('/resources', data);
export const viewResource = (id) => API.put(`/resources/${id}/view`);
export const downloadResource = (id) => API.put(`/resources/${id}/download`);
export const likeResource = (id) => API.put(`/resources/${id}/like`);
export const commentOnResource = (id, comment) => API.post(`/resources/${id}/comment`, { comment });
export const deleteResource = (id) => API.delete(`/resources/${id}`);
export const saveResource = (id) => API.put(`/resources/${id}/save`);
export const uploadFile = (formData) => API.post('/upload', formData);
