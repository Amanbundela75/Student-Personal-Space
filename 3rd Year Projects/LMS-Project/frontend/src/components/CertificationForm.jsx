import React, { useState, useEffect } from 'react';

const CertificationForm = ({ initialData, onSave, onCancel, isSubmitting }) => {
    // State for text inputs
    const [formData, setFormData] = useState({
        title: '',
        issuer: ''
    });
    // State for the selected file
    const [file, setFile] = useState(null);
    // State for validation errors
    const [error, setError] = useState('');

    // Jab component load ho aur initialData (editing ke liye) ho, to form ko populate karein
    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                issuer: initialData.issuer || ''
            });
            // Editing ke time file ko required nahi rakhte
        }
    }, [initialData]);

    // Text input change ko handle karein
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // File input change ko handle karein
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    // Form submit ko handle karein
    const handleSubmit = (e) => {
        e.preventDefault();
        setError(''); // Purane error ko clear karein

        // Validation
        if (!formData.title || !formData.issuer) {
            setError('Title and Issuer fields are required.');
            return;
        }
        // Naya certificate add karte time file zaroori hai
        if (!initialData && !file) {
            setError('A certificate file (PDF or Image) is required.');
            return;
        }

        // Parent component ko bhejne ke liye FormData object banayein
        const submissionData = new FormData();
        submissionData.append('title', formData.title);
        submissionData.append('issuer', formData.issuer);
        if (file) {
            submissionData.append('certificateFile', file);
        }

        // onSave function ko call karein (jo StudentDashboardPage mein hai)
        onSave(submissionData, initialData?._id);
    };

    return (
        <div className="form-wrapper">
            <form onSubmit={handleSubmit} className="edit-form">
                <h2>{initialData ? 'Edit Certification' : 'Add New Certification'}</h2>

                {/* --- Form Fields --- */}
                <div className="form-group">
                    <label htmlFor="title">Certificate Title</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="issuer">Issued By (e.g., Coursera, Udemy)</label>
                    <input
                        type="text"
                        id="issuer"
                        name="issuer"
                        value={formData.issuer}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="certificateFile">Certificate File (PDF, JPG, PNG)</label>
                    <input
                        type="file"
                        id="certificateFile"
                        name="certificateFile"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png"
                        // Naya add karte time file required hai
                        required={!initialData}
                    />
                    {initialData && <small>Leave blank to keep the existing file.</small>}
                </div>

                {/* --- Error Message --- */}
                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

                {/* --- Form Actions --- */}
                <div className="form-actions" style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="button-primary" disabled={isSubmitting} style={{ flex: 1 }}>
                        {isSubmitting ? 'Saving...' : 'Save Certificate'}
                    </button>
                    <button type="button" className="button-secondary" onClick={onCancel} disabled={isSubmitting} style={{ flex: 1 }}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CertificationForm;