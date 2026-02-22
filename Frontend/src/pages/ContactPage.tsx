import React from 'react';

export default function ContactPage() {
    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <h1 style={{ marginBottom: '30px' }}>Contact Us</h1>

            <div style={{ padding: '30px', border: '1px solid #000', borderRadius: '4px', backgroundColor: '#fff' }}>
                <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ textTransform: 'uppercase', fontSize: '14px', marginBottom: '10px' }}>Our Location</h3>
                    <p style={{ fontSize: '18px' }}>📍 123 Fitness Street, Healthy City, 10110</p>
                </div>

                <div>
                    <h3 style={{ textTransform: 'uppercase', fontSize: '14px', marginBottom: '10px' }}>Email</h3>
                    <p style={{ fontSize: '18px' }}>📧 contact@fitness.com</p>
                </div>
            </div>
        </div>
    );
}
