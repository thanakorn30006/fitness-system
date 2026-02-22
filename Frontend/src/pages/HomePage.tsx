import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
    return (
        <div style={{ textAlign: 'center', padding: '50px 20px' }}>
            <h1>Fitness System</h1>
            <p>Welcome to our fitness class booking system.</p>

            <div style={{ marginTop: '30px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <Link
                    to="/classes"
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#0070f3',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '5px'
                    }}
                >
                    View Classes
                </Link>
                <Link
                    to="/packages"
                    style={{
                        padding: '10px 20px',
                        border: '1px solid #0070f3',
                        color: '#0070f3',
                        textDecoration: 'none',
                        borderRadius: '5px'
                    }}
                >
                    View Packages
                </Link>
            </div>
        </div>
    );
}
