import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';

const Navbar = () => {
    const { currentUser, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav>
            <Link to="/" className="logo">Aman's LMS</Link>
            <div className="nav-links">
                <Link to="/">Home</Link>
                <Link to="/branches">Branches</Link>
                <Link to="/courses">Courses</Link>
                {currentUser ? (
                    <>
                        {isAdmin ? (
                            <Link to="/admin/dashboard">Admin Dashboard</Link>
                        ) : (
                            <Link to="/student/dashboard">My Dashboard</Link>
                        )}
                        <Link to="/profile">Profile</Link>
                        {currentUser.user && <span className="user-info">Hi, {currentUser.user.firstName}</span>}
                        <button onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;