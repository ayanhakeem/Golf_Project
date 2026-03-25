import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: auto-refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token using the httpOnly cookie
        const res = await axios.post('/api/auth/refresh-token', {}, { withCredentials: true });
        if (res.data.success) {
          localStorage.setItem('accessToken', res.data.accessToken);
          // Retry origin request
          originalRequest.headers['Authorization'] = `Bearer ${res.data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        // Refresh token failed -> Force logout
        localStorage.removeItem('accessToken');
        window.dispatchEvent(new Event('auth-expired'));
      }
    }

    return Promise.reject(error);
  }
);

export default api;
