import React from 'react';

const Footer = () => {
    return (
        <footer style={{ textAlign: 'center', padding: '20px', marginTop: '30px', backgroundColor: '#ecf0f1' }}>
            <p>&copy; {new Date().getFullYear()} Aman's Platform. All rights reserved.</p>
        </footer>
    );
};

export default Footer;