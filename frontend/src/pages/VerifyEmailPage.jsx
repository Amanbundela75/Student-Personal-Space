import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { verifyEmail } from '../api/auth'; // API function ka istemal

const VerifyEmailPage = () => {
    const { token } = useParams();
    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('Verifying your email, please wait...');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Verification link is invalid. No token found.');
            return;
        }

        const verifyToken = async () => {
            try {
                // API call
                const data = await verifyEmail(token);

                if (data.success) {
                    setStatus('success');
                    setMessage(data.message);
                }
            } catch (error) {
                setStatus('error');
                const errorMessage = error.message || 'Verification failed. The link might be invalid or expired.';
                setMessage(errorMessage);
            }
        };

        verifyToken();
    }, [token]);

    const getStatusColor = () => {
        if (status === 'success') return 'green';
        if (status === 'error') return 'red';
        return '#333';
    };

    return (
        <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Arial, sans-serif'
        }}>
            <div style={{
                textAlign: 'center', padding: '40px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: '8px', maxWidth: '500px', width: '90%'
            }}>
                <h1>Email Verification</h1>
                <p style={{ fontSize: '1.2em', color: getStatusColor(), minHeight: '50px' }}>
                    {message}
                </p>
                {status !== 'verifying' && (
                    <Link to="/login" style={{
                        display: 'inline-block', marginTop: '20px', padding: '12px 24px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '5px', fontSize: '1em'
                    }}>
                        Go to Login Page
                    </Link>
                )}
            </div>
        </div>
    );
};

export default VerifyEmailPage;