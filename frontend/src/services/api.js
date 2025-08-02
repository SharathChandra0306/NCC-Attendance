import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Handle access denied - will be caught by the calling component
      const errorMessage = error.response?.data?.error || 'Access denied. You do not have permission to perform this action.';
      error.isAccessDenied = true;
      error.message = errorMessage;
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

// Students API
export const studentsAPI = {
  getAll: (params) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  create: (student) => api.post('/students', student),
  update: (id, student) => api.put(`/students/${id}`, student),
  delete: (id) => api.delete(`/students/${id}`),
  uploadExcel: (formData) => api.post('/students/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// Parades API
export const paradesAPI = {
  getAll: (params) => api.get('/parades', { params }),
  getById: (id) => api.get(`/parades/${id}`),
  create: (parade) => api.post('/parades', parade),
  update: (id, parade) => api.put(`/parades/${id}`, parade),
  delete: (id) => api.delete(`/parades/${id}`),
  updateStatus: (id, status) => api.patch(`/parades/${id}/status`, { status }),
};

// Attendance API
export const attendanceAPI = {
  getByParade: (paradeId) => api.get(`/attendance/parade/${paradeId}`),
  getByStudent: (studentId) => api.get(`/attendance/student/${studentId}`),
  mark: (data) => api.post('/attendance', data),
  markMultiple: (data) => api.post('/attendance/mark', data),
  update: (id, data) => api.put(`/attendance/${id}`, data),
  delete: (id) => api.delete(`/attendance/${id}`),
};

// Reports API
export const reportsAPI = {
  getDashboard: () => api.get('/reports/dashboard'),
  getAttendanceReport: (params) => api.get('/reports/attendance', { params }),
  getParadeStats: (params) => api.get('/reports/parade-stats', { params }),
  getStudentStats: (params) => api.get('/reports/student-stats', { params }),
  exportAttendance: (params) => {
    return api.get('/reports/export/attendance', { 
      params,
      responseType: 'blob'
    });
  },
};

export default api;
