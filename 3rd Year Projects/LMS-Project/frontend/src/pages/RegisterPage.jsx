import React from 'react';
import RegisterForm from '../components/auth/RegisterForm.jsx';

const RegisterPage = () => {
    return (
        <div className="container">
            <div className="form-container">
                <h2>Create a New Account</h2>
                <RegisterForm />
            </div>
        </div>
    );
};

export default RegisterPage;