import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const HomePage = () => {
    const { currentUser, isAdmin } = useAuth();

    return (
        <div className="container text-center">
            <h1>Welcome to the Learning Management System</h1>
            <p>Your one-stop platform for online education.</p>
            <div style={{ marginTop: '30px' }}>
                <Link to="/courses" className="button button-primary" style={{ marginRight: '10px' }}>Browse Courses</Link>
                <Link to="/branches" className="button button-primary">Explore Branches</Link>
            </div>

            {currentUser && (
                <div style={{ marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                    <h2>Quick Links</h2>
                    {isAdmin ? (
                        <Link to="/admin/dashboard" className="button">Admin Dashboard</Link>
                    ) : (
                        <Link to="/student/dashboard" className="button">My Dashboard</Link>
                    )}
                    <Link to="/profile" className="button" style={{marginLeft: '10px'}}>My Profile</Link>
                </div>
            )}
        </div>
    );
};

export default HomePage;