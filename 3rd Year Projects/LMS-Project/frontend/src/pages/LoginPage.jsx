// frontend/src/pages/LoginPage.jsx

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';

const LoginPage = () => {
    const [verificationMessage, setVerificationMessage] = useState('');
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('verified') === 'true') {
            setVerificationMessage('Your email has been verified successfully! You can now log in.');
        }
    }, [location]);

    return (
        <div>
            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <h2>Login</h2>
                        {verificationMessage && (
                            <div className="alert alert-success" role="alert">
                                {verificationMessage}
                            </div>
                        )}
                        <LoginForm />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;