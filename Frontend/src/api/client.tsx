// ============================================================
// api/client.tsx — ศูนย์กลาง API calls ทุกอย่างในแอป
//
// โครงสร้าง:
//   apiClient      → axios instance ที่แนบ JWT token ทุก request อัตโนมัติ
//   authAPI        → login, register, session, users, profile
//   bookingsAPI    → จอง/ยกเลิก/ดูการจองของตัวเอง
//   classesAPI     → ดู/สร้าง/toggle/ลบ class
//   packagesAPI    → ดู/สมัคร/สร้าง/ลบ package
//   trainersAPI    → ดู/สร้าง/ลบ trainer
//
// ถ้าอยากเพิ่ม API endpoint ใหม่ → เพิ่มใน object ที่เกี่ยวข้องตามด้านล่าง
// ห้ามแก้: interceptors (ส่วนที่แนบ token อัตโนมัติ)
// ============================================================

import axios from 'axios';
import { User, FitnessClass, Booking, Package, UserPackage, Trainer } from '../types';

// URL หลักของ Backend — เปลี่ยนตรงนี้ถ้า deploy ไปที่อื่น
const API_BASE_URL = 'http://localhost:5001/api';

// สร้าง axios instance กลาง (ห้ามเรียก axios ตรงๆ ในหน้าอื่น ให้ใช้ apiClient)
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ======================== Interceptors ========================
// ห้ามแก้ส่วนนี้ — แนบ JWT token ให้ทุก request อัตโนมัติ
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

// ห้ามแก้ส่วนนี้ — ถ้า API ตอบ 401 → ล้าง token แล้วกลับไปหน้า login อัตโนมัติ
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// ======================== Auth API ========================
// Endpoint: /api/auth/*
export const authAPI = {
    register: (data: Partial<User> & { password?: string }) => apiClient.post('/auth/register', data),
    login: (data: { email: string; password?: string }) => apiClient.post('/auth/login', data),
    getSession: () => apiClient.get<User>('/auth/session'),
    getAllUsers: () => apiClient.get<User[]>('/auth/users'),          // Admin only
    updateProfile: (data: { name?: string; password?: string }) => apiClient.put<User>('/auth/profile', data),
};

// ======================== Bookings API ========================
// Endpoint: /api/bookings/*
export const bookingsAPI = {
    getMyBookings: () => apiClient.get<Booking[]>('/bookings'),
    createBooking: (classId: number) => apiClient.post('/bookings', { classId }),
    cancelBooking: (id: number) => apiClient.delete(`/bookings/${id}`),
};

// ======================== Classes API ========================
// Endpoint: /api/classes/*
export const classesAPI = {
    getAll: () => apiClient.get<FitnessClass[]>('/classes'),
    create: (data: Partial<FitnessClass>) => apiClient.post<FitnessClass>('/classes', data),      // Admin only
    toggle: (id: number) => apiClient.put<FitnessClass>(`/classes/${id}/toggle`),                 // Admin only
    delete: (id: number) => apiClient.delete(`/classes/${id}`),                                   // Admin only
};

// ======================== Packages API ========================
// Endpoint: /api/packages/*
export const packagesAPI = {
    getAll: () => apiClient.get<Package[]>('/packages'),                          // เฉพาะ active packages
    getAllAdmin: () => apiClient.get<Package[]>('/packages/all'),                  // Admin only (ทุก package)
    getActive: () => apiClient.get<UserPackage>('/packages/my-active'),           // package ที่ยังไม่หมดอายุของ user ปัจจุบัน
    getHistory: () => apiClient.get<UserPackage[]>('/packages/history'),           // ประวัติการซื้อ package ทั้งหมด
    create: (data: Partial<Package>) => apiClient.post<Package>('/packages', data), // Admin only
    subscribe: (packageId: number) => apiClient.post('/packages/subscribe', { packageId }),
    delete: (id: number) => apiClient.delete(`/packages/${id}`),                   // Admin only
};

// ======================== Trainers API ========================
// Endpoint: /api/trainers/*
export const trainersAPI = {
    getAll: () => apiClient.get<Trainer[]>('/trainers/all'),
    create: (data: Partial<Trainer>) => apiClient.post<Trainer>('/trainers/create', data), // Admin only
    delete: (id: number) => apiClient.delete(`/trainers/${id}`),                           // Admin only
};

export default apiClient;
