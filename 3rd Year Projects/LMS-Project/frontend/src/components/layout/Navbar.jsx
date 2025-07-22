import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import './Navbar.css';

const Navbar = () => {
    const { currentUser, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="app-navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    Aman's LMS
                </Link>
                <div className="nav-menu">
                    <Link to="/" className="nav-item">Home</Link>
                    <Link to="/branches" className="nav-item">Branches</Link>
                    <Link to="/courses" className="nav-item">Courses</Link>
                    {currentUser ? (
                        <>
                            {isAdmin ? (
                                <Link to="/admin/dashboard" className="nav-item">Admin Dashboard</Link>
                            ) : (
                                <>
                                    {/* Student ke liye links */}
                                    <Link to="/student/dashboard" className="nav-item">My Dashboard</Link>
                                    <Link to="/portfolio" className="nav-item">My Portfolio</Link> {/* <-- YEH NAYI LINE ADD KI GAYI HAI */}
                                    <Link to="/my-results" className="nav-item">My Results</Link>
                                </>
                            )}
                            <Link to="/profile" className="nav-item">Profile</Link>
                            <span className="nav-user-greeting">Hi, {currentUser.user.firstName}</span>
                            <button onClick={handleLogout} className="nav-button nav-button-logout">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-item nav-item-auth">Login</Link>
                            <Link to="/register" className="nav-item nav-item-auth nav-button-register">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;