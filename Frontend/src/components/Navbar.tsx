import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Navbar() {
    const { user, logout } = useAuth();
    const role = user?.role;

    return (
        <nav
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '15px 30px',
                backgroundColor: '#f3f3f3',
                color: 'white',
            }}
        >
            {/* LEFT */}
            <div style={{ display: 'flex', gap: '20px' }}>
                <Link to="/">Home</Link>
                <Link to="/classes">Classes</Link>
                <Link to="/trainers">Trainers</Link>
                <Link to="/packages">Packages</Link>
                <Link to="/contact">Contact</Link>

                {role === 'MEMBER' && (
                    <>
                        <Link to="/my-bookings">My Bookings</Link>
                    </>
                )}

                {role === 'ADMIN' && (
                    <>
                        <Link to="/admin">Admin</Link>
                    </>
                )}
            </div>

            {/* RIGHT */}
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                {!user && (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}

                {user && (
                    <>
                        <Link to="/profile" style={{ color: 'blue' }}> {user.name}</Link>
                        <button
                            onClick={logout}
                            style={{
                                backgroundColor: 'red',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                cursor: 'pointer',
                            }}
                        >
                            Logout
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}
