import API from './api';

export const login = (data) => API.post('/users/login', data);
export const register = (data) => API.post('/users/register', data);
export const logout = () => API.post('/users/logout');
export const getMe = () => API.get('/users/me');
export const updateProfile = (data) => API.put('/users/profile', data);
export const googleAuth = (credential) => API.post('/users/google', { credential });
export const uploadAvatar = (file) => {
  const fd = new FormData();
  fd.append('avatar', file);
  return API.post('/upload/avatar', fd);
};
