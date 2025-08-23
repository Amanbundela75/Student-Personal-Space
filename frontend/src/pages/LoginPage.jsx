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
        <div className="container">
            <div className="form-container">
                <h2>Login to Your Account</h2>

                {verificationMessage && (
                    <div className="alert alert-success">
                        {verificationMessage}
                    </div>
                )}

                <LoginForm />
            </div>
        </div>
    );
};

export default LoginPage;