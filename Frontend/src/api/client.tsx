import axios from 'axios';
import { User, FitnessClass, Booking, Package, UserPackage } from '../types';

const API_BASE_URL = 'http://localhost:5001/api';

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add JWT token to headers
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Unauthorized - clear token and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data: Partial<User> & { password?: string }) => apiClient.post('/auth/register', data),
    login: (data: { email: string; password?: string }) => apiClient.post('/auth/login', data),
    getSession: () => apiClient.get<User>('/auth/session'),
    getAllUsers: () => apiClient.get<User[]>('/auth/users'),
    updateProfile: (data: { name?: string; password?: string }) => apiClient.put<User>('/auth/profile', data),
};

// Bookings API
export const bookingsAPI = {
    getMyBookings: () => apiClient.get<Booking[]>('/bookings'),
    createBooking: (classId: number) => apiClient.post('/bookings', { classId }),
    cancelBooking: (id: number) => apiClient.delete(`/bookings/${id}`),
};

// Classes API
export const classesAPI = {
    getAll: () => apiClient.get<FitnessClass[]>('/classes'),
    create: (data: Partial<FitnessClass>) => apiClient.post<FitnessClass>('/classes', data),
    toggle: (id: number) => apiClient.put<FitnessClass>(`/classes/${id}/toggle`),
    delete: (id: number) => apiClient.delete(`/classes/${id}`),
};

// Packages API
export const packagesAPI = {
    getAll: () => apiClient.get<Package[]>('/packages'),
    getAllAdmin: () => apiClient.get<Package[]>('/packages/all'),
    getActive: () => apiClient.get<UserPackage>('/packages/my-active'),
    getHistory: () => apiClient.get<UserPackage[]>('/packages/history'),
    create: (data: Partial<Package>) => apiClient.post<Package>('/packages', data),
    subscribe: (packageId: number) => apiClient.post('/packages/subscribe', { packageId }),
    delete: (id: number) => apiClient.delete(`/packages/${id}`),
};

export default apiClient;
