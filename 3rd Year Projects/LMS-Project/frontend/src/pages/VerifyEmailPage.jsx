// frontend/src/pages/VerifyEmailPage.jsx

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const VerifyEmailPage = () => {
    const { token } = useParams(); // URL se :token nikalega
    const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
    const [message, setMessage] = useState('Verifying your email, please wait...');

    useEffect(() => {
        if (token) {
            const verifyToken = async () => {
                try {
                    // Backend ke sahi URL par request bhejein
                    const API_URL = `${import.meta.env.VITE_API_URL}/api/auth/verify-email/${token}`;
                    const response = await axios.get(API_URL);

                    if (response.data.success) {
                        setStatus('success');
                        setMessage(response.data.message);
                    } else {
                        // Agar success: false aata hai
                        setStatus('error');
                        setMessage(response.data.message || 'Verification failed.');
                    }
                } catch (error) {
                    setStatus('error');
                    setMessage(error.response?.data?.message || 'Verification failed. The link might be invalid or expired.');
                }
            };
            verifyToken();
        } else {
            setStatus('error');
            setMessage('No verification token found.');
        }
    }, [token]);

    const styles = {
        container: {
            textAlign: 'center',
            padding: '50px 20px',
            fontFamily: 'Arial, sans-serif',
            maxWidth: '600px',
            margin: '50px auto',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            borderRadius: '8px'
        },
        message: {
            fontSize: '1.2em',
            color: status === 'success' ? 'green' : (status === 'error' ? 'red' : 'blue')
        },
        link: {
            display: 'inline-block',
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px'
        }
    };

    return (
        <div style={styles.container}>
            <h1>Email Verification</h1>
            <p style={styles.message}>{message}</p>
            {status !== 'verifying' && (
                <div>
                    <br />
                    <Link to="/login" style={styles.link}>Go to Login Page</Link>
                </div>
            )}
        </div>
    );
};

export default VerifyEmailPage;