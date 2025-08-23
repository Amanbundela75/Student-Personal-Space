// frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // Your main LMS App component

// Dono CSS files ko import kiya jaa raha hai
import './App.css';      // Yeh aapki purani styles ke liye hai
import './index.css';    // Yeh naye sticky footer fix ke liye hai

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