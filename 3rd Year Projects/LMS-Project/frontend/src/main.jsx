// frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // Your main LMS App component
import './App.css'; // Or your main CSS file (e.g., App.css)
import { AuthProvider } from './contexts/AuthContext.jsx'; // If you're using this
import { BrowserRouter as Router } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Router>
            <AuthProvider> {/* Assuming you have an AuthProvider */}
                <App />
            </AuthProvider>
        </Router>
    </React.StrictMode>
);