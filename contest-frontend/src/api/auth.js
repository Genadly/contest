import api from './client';

export const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  localStorage.setItem('token', data.token);
  return data.token;
};

export const register = async (email, password) => {
  const { data } = await api.post('/auth/register', { email, password });
  return data;
};

export const getProfile = async () => {
  const { data } = await api.get('/auth/profile');
  return data;
};

export const logout = () => {
  localStorage.removeItem('token');
};