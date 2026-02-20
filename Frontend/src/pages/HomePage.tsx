import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { packagesAPI } from '../api/client';

export default function HomePage() {
    const { user } = useAuth();

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '60vh'
        }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '10px' }}>ยินดีต้อนรับ</h1>
            {user ? (
                <h2 style={{ color: '#555' }}>คุณ {user.name}</h2>
            ) : (
                <p style={{ color: '#888' }}>กรุณา Login เพื่อเข้าใช้งานระบบจองคลาส</p>
            )}
            <p style={{ marginTop: '20px', color: '#777' }}>ขอให้มีความสุขกับการออกกำลังกายนะครับ!</p>
        </div>
    );
}

