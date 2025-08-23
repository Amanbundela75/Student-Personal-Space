import React, { useState, useEffect } from 'react';

// --- API Configuration ---
// Isse humein media preview ke liye poora URL banane mein madad milegi.
const API_URL = 'http://localhost:5001';

const AchievementForm = ({ initialData, onSave, onCancel, isSubmitting }) => {
    // Form ka data state mein rakhein.
    const [description, setDescription] = useState('');
    // Chuni gayi file ko state mein rakhein.
    const [mediaFile, setMediaFile] = useState(null);
    // Chuni gayi file ka preview URL state mein rakhein.
    const [mediaPreview, setMediaPreview] = useState('');

    // Jab component load ho, to initialData (agar hai) se form ko bharein.
    useEffect(() => {
        if (initialData) {
            setDescription(initialData.description || '');
            // Agar pehle se media hai, to uska poora URL banakar preview set karein.
            if (initialData.mediaUrl) {
                setMediaPreview(`${API_URL}${initialData.mediaUrl}`);
            }
        }
    }, [initialData]);

    // Jab user file chunta hai to yeh function chalta hai.
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMediaFile(file);
            // File ka temporary URL banakar preview dikhayein.
            setMediaPreview(URL.createObjectURL(file));
        }
    };

    // Form submit hone par yeh function chalta hai.
    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation: Naya post add karte samay description aur media file zaroori hai.
        if (!initialData && (!description || !mediaFile)) {
            alert('Please provide a description and a media file.');
            return;
        }

        // FormData object banayein, kyonki file upload ke liye yeh zaroori hai.
        const formData = new FormData();
        formData.append('description', description);
        if (mediaFile) {
            formData.append('media', mediaFile);
        }

        // onSave function ko call karein aur data bhejein.
        onSave(formData, initialData?._id);
    };

    return (
        <div className="form-wrapper">
            <form onSubmit={handleSubmit} className="edit-form">
                <h2>{initialData ? 'Edit Achievement' : 'Add New Achievement'}</h2>

                {/* Description Textarea */}
                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What did you achieve?"
                        required
                    />
                </div>

                {/* Media File Input */}
                <div className="form-group">
                    <label htmlFor="media">{initialData ? 'Change Media (Optional)' : 'Upload Image or Video'}</label>
                    <input
                        type="file"
                        id="media"
                        onChange={handleFileChange}
                        accept="image/*,video/*" // Sirf image aur video files accept karein.
                    />
                </div>

                {/* Media Preview */}
                {mediaPreview && (
                    <div className="form-group media-preview">
                        <p>Preview:</p>
                        {/* Check karein ki media type video hai ya image */}
                        {(mediaFile?.type.startsWith('video') || mediaPreview.includes('.mp4')) ? (
                            <video src={mediaPreview} controls style={{ maxWidth: '100%', maxHeight: '200px' }} />
                        ) : (
                            <img src={mediaPreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px' }} />
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="form-actions" style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="button-primary" disabled={isSubmitting} style={{ flex: 1 }}>
                        {isSubmitting ? 'Saving...' : 'Save Achievement'}
                    </button>
                    <button type="button" className="button-secondary" onClick={onCancel} disabled={isSubmitting} style={{ flex: 1 }}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AchievementForm;