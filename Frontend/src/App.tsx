// ============================================================
// App.tsx — จุดเริ่มต้นของ Frontend ทั้งหมด
// ไฟล์นี้กำหนด routing (URL → หน้า) ของแอปทั้งหมด
// ห้ามแก้: AuthProvider, Router, Layout ไม่ควรถูกเคลื่อนย้าย
// ============================================================

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';

// Pages — ถ้าเพิ่มหน้าใหม่ ให้ import มาที่นี่แล้วเพิ่ม <Route> ในส่วน Routes ข้างล่าง
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ClassesPage from './pages/ClassesPage';
import MyBookingsPage from './pages/MyBookingsPage';
import PackagesPage from './pages/PackagesPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import ContactPage from './pages/ContactPage';
import TrainersPage from './pages/TrainersPage';
import PaymentPage from './pages/PaymentPage';

function App() {
    return (
        // AuthProvider → ครอบทั้งแอปเพื่อให้ทุกหน้าเข้าถึงข้อมูล user ได้ (ห้ามย้าย)
        <AuthProvider>
            <Router>
                {/* Toaster → แสดง toast notification มุมบนขวา (ห้ามลบ) */}
                <Toaster position="top-right" />
                {/* Layout → ครอบ Navbar และ Content ทุกหน้า */}
                <Layout>
                    <Routes>
                        {/* ======= Public Routes ======= */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/classes" element={<ClassesPage />} />
                        <Route path="/packages" element={<PackagesPage />} />
                        <Route path="/payment/:packageId" element={<PaymentPage />} />
                        <Route path="/trainers" element={<TrainersPage />} />
                        <Route path="/contact" element={<ContactPage />} />

                        {/* ======= Protected Routes (ต้องล็อกอินก่อน) ======= */}
                        <Route path="/my-bookings" element={<MyBookingsPage />} />
                        <Route path="/profile" element={<ProfilePage />} />

                        {/* ======= Admin Route (เฉพาะ ADMIN เท่านั้น — redirect ถ้าไม่ใช่) ======= */}
                        <Route path="/admin" element={<AdminPage />} />

                        {/* ถ้าอยากเพิ่มหน้าใหม่ → เพิ่ม <Route path="/xxx" element={<XxxPage />} /> ที่นี่ */}
                    </Routes>
                </Layout>
            </Router>
        </AuthProvider>
    );
}

export default App;
