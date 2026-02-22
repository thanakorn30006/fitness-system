// ============================================================
// AuthContext.tsx — ระบบจัดการ Authentication ทั้งหมดของแอป
//
// วิธีใช้ใน Component อื่น:
//   const { user, login, logout, isAuthenticated } = useAuth();
//
// ห้ามแก้: โครงสร้าง token/user ใน localStorage
//   เพราะ api/client.tsx อ่าน token จาก localStorage โดยตรง
// ============================================================

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authAPI } from '../api/client';

// --- Types ---
// โครงสร้างข้อมูล user ที่เก็บใน context (ตรงกับ response จาก /api/auth/login)
interface User {
    id: number;
    name: string;
    email: string;
    role: string; // 'MEMBER' | 'ADMIN'
}

// สิ่งที่ components อื่นเรียกใช้ได้จาก useAuth()
interface AuthContextType {
    user: User | null;          // ข้อมูล user ปัจจุบัน (null = ยังไม่ล็อกอิน)
    loading: boolean;           // true ขณะกำลังเช็ค session ตอนเปิดแอป
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (name: string, lastName: string, phone: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    isAuthenticated: boolean;   // shorthand → !!user
}

// สร้าง Context (ห้ามแก้ค่า default เป็น null)
const AuthContext = createContext<AuthContextType | null>(null);

// ============================================================
// AuthProvider — ครอบแอปทั้งหมดใน App.tsx (ห้ามย้าย)
// ============================================================
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // เช็คว่ามี session ค้างอยู่ใน localStorage หรือเปล่า (ทำครั้งเดียวตอนเปิดแอป)
    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    // เรียก API login แล้วเก็บ token + user ลง localStorage
    const login = async (email: string, password: string) => {
        try {
            const response = await authAPI.login({ email, password });
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);

            return { success: true };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || 'Login failed'
            };
        }
    };

    // เรียก API register (ยังไม่ auto-login หลังสมัคร)
    const register = async (name: string, lastName: string, phone: string, email: string, password: string) => {
        try {
            await authAPI.register({ name, lastName, phone, email, password });
            return { success: true };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || 'Registration failed'
            };
        }
    };

    // ล้าง session ทั้งหมดออกจาก localStorage
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const value: AuthContextType = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ============================================================
// useAuth — hook สำหรับเรียกใช้ AuthContext ใน component ต่างๆ
// ต้องใช้ภายใน <AuthProvider> เท่านั้น
// ============================================================
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
