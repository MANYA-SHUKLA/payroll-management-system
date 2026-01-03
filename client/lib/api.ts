import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Log API URL in development to help with debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('API URL:', API_URL);
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 errors - redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    // Log network errors for debugging
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.error('API connection failed. Check NEXT_PUBLIC_API_URL:', API_URL);
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (data: { name: string; email: string; password: string; role?: string }) =>
    api.post('/auth/signup', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Salary Slip API
export const salarySlipAPI = {
  getAll: () => api.get('/salary-slip'),
  getById: (id: string) => api.get(`/salary-slip/${id}`),
  create: (data: any) => api.post('/salary-slip', data),
  update: (id: string, data: any) => api.put(`/salary-slip/${id}`, data),
  exportPDF: (id: string) => api.get(`/salary-slip/${id}/pdf`, { responseType: 'blob' }),
};

// Expense API
export const expenseAPI = {
  getAll: () => api.get('/expense'),
  create: (data: any) => api.post('/expense', data),
  approve: (id: string) => api.put(`/expense/${id}/approve`),
  reject: (id: string, reason?: string) => api.put(`/expense/${id}/reject`, { rejectionReason: reason }),
};

// Notification API
export const notificationAPI = {
  getAll: () => api.get('/notification'),
  markAsRead: (id: string) => api.put(`/notification/${id}/read`),
  markAllAsRead: () => api.put('/notification/read-all'),
  getUnreadCount: () => api.get('/notification/unread-count'),
};

export default api;

