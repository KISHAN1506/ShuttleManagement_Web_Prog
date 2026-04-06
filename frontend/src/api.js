import axios from 'axios';

const apiBaseURL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
    baseURL: apiBaseURL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = `${import.meta.env.BASE_URL}login`;
        }
        return Promise.reject(error);
    }
);

export default api;
