import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  getMe: () => api.get('/auth/me'),
};

export const usersAPI = {
  getProfile: (username) => api.get(`/users/${username}`),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  follow: (userId) => api.post(`/users/follow/${userId}`),
  unfollow: (userId) => api.delete(`/users/follow/${userId}`),
  search: (query) => api.get(`/users/search?q=${query}`),
};

export const projectsAPI = {
  getAll: (params) => api.get('/projects', { params }),
  getOne: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  uploadScreenshot: (id, file) => {
    const formData = new FormData();
    formData.append('screenshot', file);
    return api.post(`/projects/${id}/screenshots`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadFile: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/projects/${id}/file`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  addComment: (id, data) => api.post(`/projects/${id}/comments`, data),
  rate: (id, data) => api.post(`/projects/${id}/rate`, data),
  search: (params) => api.get('/projects/search', { params }),
  getByCategory: (category) => api.get(`/projects/category/${category}`),
};

export const chatAPI = {
  getMessages: (limit) => api.get(`/chat/messages?limit=${limit}`),
  sendMessage: (data) => api.post('/chat/messages', data),
  deleteMessage: (id) => api.delete(`/chat/messages/${id}`),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  banUser: (id) => api.post(`/admin/users/${id}/ban`),
  unbanUser: (id) => api.post(`/admin/users/${id}/unban`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  getAds: () => api.get('/admin/ads'),
  createAd: (data) => api.post('/admin/ads', data),
  updateAd: (id, data) => api.put(`/admin/ads/${id}`, data),
  deleteAd: (id) => api.delete(`/admin/ads/${id}`),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
  uploadLogo: (file) => {
    const formData = new FormData();
    formData.append('logo', file);
    return api.post('/admin/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getChatMessages: (params) => api.get('/admin/chat', { params }),
  deleteChatMessage: (id) => api.delete(`/admin/chat/${id}`),
  getReports: () => api.get('/admin/reports'),
};

export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

export default api;
