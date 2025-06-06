import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx'; // .jsx extension
import { fetchBranches } from '../../api/branches'; // .jsx extension अगर इसमें JSX है, वरना .js
import FaceCaptureComponent from '../auth/FaceCaptureComponent.jsx'; // <<< (1) पाथ सही करें (यह एक उदाहरण है)

const RegisterForm = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        branchId: '',
    });
    const [branches, setBranches] = useState([]);
    const [idCardImage, setIdCardImage] = useState(null); // यह फ़ाइल ऑब्जेक्ट होगा
    const [faceImage, setFaceImage] = useState(null); // यह base64 स्ट्रिंग या Blob हो सकता है

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const loadBranches = async () => {
            try {
                const fetchedBranches = await fetchBranches();
                setBranches(fetchedBranches || []);
                if (fetchedBranches && fetchedBranches.length > 0) {
                    setFormData(prev => ({ ...prev, branchId: fetchedBranches[0]._id }));
                }
            } catch (err) {
                setError('Failed to load branches. Please try again later.');
                console.error("Error loading branches:", err);
            }
        };
        loadBranches();
    }, []);

    const { firstName, lastName, email, password, confirmPassword, branchId } = formData;

    const onChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleIdCardChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setIdCardImage(e.target.files[0]);
        }
    };

    const handleFaceCaptured = (imageDataUrl) => { // imageDataUrl एक base64 स्ट्रिंग है
        setFaceImage(imageDataUrl);
        console.log("Face image captured and set in RegisterForm state!");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        // (वैकल्पिक) ID कार्ड और फेस इमेज के लिए भी वैलिडेशन जोड़ सकते हैं कि वे कैप्चर हुए हैं या नहीं
        if (!idCardImage) {
            setError('Please upload your ID card.');
            return;
        }
        if (!faceImage) {
            setError('Please capture your face image.');
            return;
        }

        setLoading(true);

        // (2) FormData का इस्तेमाल करें
        const registrationData = new FormData();
        registrationData.append('firstName', firstName);
        registrationData.append('lastName', lastName);
        registrationData.append('email', email);
        registrationData.append('password', password);
        registrationData.append('branchId', branchId);
        if (idCardImage) {
            registrationData.append('idCardImage', idCardImage); // फ़ाइल ऑब्जेक्ट
        }
        if (faceImage) {
            // Base64 इमेज को Blob में कन्वर्ट करके भेजना बेहतर हो सकता है,
            // या बैकएंड पर base64 को हैंडल करें। अभी के लिए इसे स्ट्रिंग के तौर पर भेजते हैं।
            // अगर बैकएंड base64 को सीधे फ़ाइल की तरह नहीं पढ़ सकता, तो इसे JSON डेटा के साथ अलग से भेजें
            // या इसे Blob में बदलें।
            // Example: Convert base64 to Blob (अगर ज़रूरत हो)
            // const fetchRes = await fetch(faceImage);
            // const blob = await fetchRes.blob();
            // registrationData.append('faceImage', blob, 'face_image.jpg');

            // For now, let's assume your backend 'register' function can handle
            // other fields in FormData if 'faceImage' is a base64 string.
            // Or, your 'register' function in AuthContext needs to handle this intelligently.
            // A common practice is to send files via FormData and other data as well,
            // or send JSON for text fields and separate requests for files.
            // Given we're using FormData for idCardImage, let's try adding faceImage string.
            // The backend (multer) might ignore non-file fields if not configured for them.
            // It's often easier if the 'register' function in AuthContext prepares this.
            registrationData.append('faceImageBase64', faceImage); // एक अलग नाम से भेजें
        }


        try {
            // अब 'register' फ़ंक्शन को FormData ऑब्जेक्ट लेना चाहिए
            const response = await register(registrationData);
            if (response.success) {
                setSuccess('Registration successful! Please login.');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError(response.message || 'Registration failed. Please try again.');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'An unexpected error occurred.');
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} encType="multipart/form-data"> {/* (2a) encType जोड़ें */}
            <h2>Register</h2>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            <div>
                <label htmlFor="firstName">First Name:</label>
                <input type="text" id="firstName" name="firstName" value={firstName} onChange={onChange} required />
            </div>
            <div>
                <label htmlFor="lastName">Last Name:</label>
                <input type="text" id="lastName" name="lastName" value={lastName} onChange={onChange} required />
            </div>
            <div>
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" name="email" value={email} onChange={onChange} required />
            </div>
            <div>
                <label htmlFor="password">Password:</label>
                <input type="password" id="password" name="password" value={password} onChange={onChange} required />
            </div>
            <div>
                <label htmlFor="confirmPassword">Confirm Password:</label>
                <input type="password" id="confirmPassword" name="confirmPassword" value={confirmPassword} onChange={onChange} required />
            </div>
            <div>
                <label htmlFor="branchId">Select Branch/Stream:</label>
                <select id="branchId" name="branchId" value={branchId} onChange={onChange} required>
                    <option value="" disabled>-- Select Branch --</option>
                    {branches.map(branch => (
                        <option key={branch._id} value={branch._id}>{branch.name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="idCard">Upload ID Card (e.g., Aadhar, Voter ID):</label>
                <input
                    type="file"
                    id="idCard"
                    name="idCard"
                    onChange={handleIdCardChange}
                    accept="image/png, image/jpeg, image/jpg"
                    required // ID कार्ड को ज़रूरी बना सकते हैं
                />
            </div>

            <FaceCaptureComponent onCapture={handleFaceCaptured} />
            {faceImage && <p style={{color: 'green', textAlign: 'center'}}>Face image captured and ready!</p>}

            <button type="submit" disabled={loading} style={{ marginTop: '20px' }}> {/* थोड़ा मार्जिन */}
                {loading ? 'Registering...' : 'Register'}
            </button>
            <p className="form-link-text"> {/* क्लास जोड़ा बेहतर स्टाइलिंग के लिए */}
                Already have an account? <Link to="/login">Login here</Link>
            </p>
        </form>
    );
};

export default RegisterForm;