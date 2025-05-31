import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';

const PrivateRoute = ({ roles }) => {
    const { isAuthenticated, currentUser } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // If roles are specified, check if the user has one of the required roles
    if (roles && roles.length > 0) {
        const userRole = currentUser?.user?.role;
        if (!userRole || !roles.includes(userRole)) {
            // Redirect to a general dashboard or home if role doesn't match
            // Or to an "Unauthorized" page
            return <Navigate to="/" replace />;
        }
    }

    return <Outlet />; // Render the child route component
};

export default PrivateRoute;