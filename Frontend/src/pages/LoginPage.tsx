// ============================================================
// LoginPage.tsx — หน้า Login
//
// flow: กรอก email + password → เรียก login() จาก AuthContext
//       → ถ้าสำเร็จ redirect ไปหน้า /
// ถ้าอยากเพิ่ม Remember Me หรือ Social Login → เพิ่มได้ที่นี่
// ============================================================

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    // State สำหรับ form inputs
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // เรียก login จาก AuthContext แล้วรอผลลัพธ์
    const handleLogin = async () => {
        const result = await login(email, password);

        if (result.success) {
            toast.success('Login successful');
            navigate('/'); // redirect ไปหน้า home
        } else {
            toast.error(result.error || 'Login failed');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '40px auto', textAlign: 'center' }}>
            <h1>Login</h1>

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <br />
            <br />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <br />
            <br />

            <button onClick={handleLogin}>Login</button>

            <br />
            <br />

            <Link to="/register">Don't have an account? Register here</Link>
        </div>
    );
}
