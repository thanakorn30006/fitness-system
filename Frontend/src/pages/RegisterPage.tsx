import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [name, setName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = async () => {
        const result = await register(name, lastName, phone, email, password);

        if (result.success) {
            toast.success('Registration successful! Please login.');
            navigate('/login');
        } else {
            toast.error(result.error || 'Registration failed');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '40px auto', textAlign: 'center' }}>
            <h1>Register</h1>

            <input
                type="text"
                placeholder="ชื่อ (First Name) *"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <br />
            <br />

            <input
                type="text"
                placeholder="นามสกุล (Last Name)"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
            />

            <br />
            <br />

            <input
                type="tel"
                placeholder="เบอร์โทร (Phone)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
            />

            <br />
            <br />

            <input
                type="email"
                placeholder="Email *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <br />
            <br />

            <input
                type="password"
                placeholder="Password *"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <br />
            <br />

            <button onClick={handleRegister}>Register</button>

            <br />
            <br />

            <Link to="/login">Already have an account? Login here</Link>
        </div>
    );
}
