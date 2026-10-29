import api from './client';

export const fetchContests = (params = {}) =>
  api.get('/contests', { params });

export const fetchContestById = (id) =>
  api.get(`/contests/${id}`);

export const createContest = (data) =>
  api.post('/contests', data);

export const updateContest = (id, data) =>
  api.put(`/contests/${id}`, data);

export const deleteContest = (id) =>
  api.delete(`/contests/${id}`);