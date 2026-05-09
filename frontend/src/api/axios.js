<<<<<<< HEAD
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // 🔥 auto redirect
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
=======
import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: { 'Content-Type': 'application/json' }
})

// Attach JWT to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

// Auto-logout on expired/invalid token
api.interceptors.response.use(
    (res) => res,
    (err) => {
        const status = err.response?.status
        const url    = err.config?.url || ''

        // Don't redirect on the login/forgot/reset endpoints themselves —
        // those 401s are expected (wrong credentials, bad token, etc).
        const isAuthEndpoint =
            url.includes('/auth/login') ||
            url.includes('/auth/forgot-password') ||
            url.includes('/auth/reset-password')

        if (status === 401 && !isAuthEndpoint) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            localStorage.removeItem('must_change_password')
            // Avoid infinite loop if already on /login
            if (!window.location.pathname.startsWith('/login')) {
                window.location.href = '/login?expired=1'
            }
        }
        return Promise.reject(err)
    }
)

export default api
>>>>>>> origin/malak
