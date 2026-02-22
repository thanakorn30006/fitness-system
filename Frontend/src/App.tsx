import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';

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
        <AuthProvider>
            <Router>
                <Toaster position="top-right" />
                <Layout>
                    <Routes>
                        {/* Public */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/classes" element={<ClassesPage />} />
                        <Route path="/packages" element={<PackagesPage />} />
                        <Route path="/payment/:packageId" element={<PaymentPage />} />
                        <Route path="/trainers" element={<TrainersPage />} />
                        <Route path="/contact" element={<ContactPage />} />

                        {/* Private */}
                        <Route path="/my-bookings" element={<MyBookingsPage />} />
                        <Route path="/profile" element={<ProfilePage />} />

                        {/* Admin */}
                        <Route path="/admin" element={<AdminPage />} />
                    </Routes>
                </Layout>
            </Router>
        </AuthProvider>
    );
}

export default App;
