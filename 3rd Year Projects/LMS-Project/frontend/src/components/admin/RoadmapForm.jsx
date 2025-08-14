import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';

const RoadmapForm = ({ initialData, onSave, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState({
        seniorName: '',
        seniorRole: '',
        introduction: '',
        keyAdvice: '',
        timeline: [{ year: 'First Year', title: '', description: '', skills: '' }]
    });
    // State to hold the selected image file
    const [profileImageFile, setProfileImageFile] = useState(null);

    useEffect(() => {
        if (initialData) {
            // If editing, convert skills array back to comma-separated string for the input
            const editableData = {
                ...initialData,
                timeline: initialData.timeline.map(step => ({
                    ...step,
                    skills: step.skills.join(', ')
                }))
            };
            setFormData(editableData);
        }
    }, [initialData]);

    const handleFileChange = (e) => {
        setProfileImageFile(e.target.files[0]);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTimelineChange = (index, e) => {
        const { name, value } = e.target;
        const newTimeline = [...formData.timeline];
        newTimeline[index][name] = value;
        setFormData(prev => ({ ...prev, timeline: newTimeline }));
    };

    const addTimelineStep = () => {
        setFormData(prev => ({
            ...prev,
            timeline: [...prev.timeline, { year: '', title: '', description: '', skills: '' }]
        }));
    };

    const removeTimelineStep = (index) => {
        const newTimeline = formData.timeline.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, timeline: newTimeline }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Use FormData to send both text and file data
        const submissionData = new FormData();
        submissionData.append('seniorName', formData.seniorName);
        submissionData.append('seniorRole', formData.seniorRole);
        submissionData.append('introduction', formData.introduction);
        submissionData.append('keyAdvice', formData.keyAdvice);

        if (profileImageFile) {
            submissionData.append('profileImage', profileImageFile);
        }

        // Convert timeline skills back to array and stringify the whole timeline
        const timelineWithSkillsArray = formData.timeline.map(step => ({
            ...step,
            skills: step.skills.split(',').map(s => s.trim()).filter(Boolean)
        }));
        submissionData.append('timeline', JSON.stringify(timelineWithSkillsArray));

        // Pass the FormData object to the parent component's onSave function
        onSave(submissionData, initialData?._id);
    };

    return (
        <form onSubmit={handleSubmit} className="roadmap-form" encType="multipart/form-data">
            <h2>{initialData ? 'Edit Roadmap' : 'Add New Roadmap'}</h2>

            <div className="form-group">
                <label>Senior Name</label>
                <input name="seniorName" value={formData.seniorName} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label>Senior Role (e.g., Software Engineer @ Google)</label>
                <input name="seniorRole" value={formData.seniorRole} onChange={handleChange} required />
            </div>
            {/* === IMAGE PATH AND SLUG REMOVED, FILE UPLOAD ADDED === */}
            <div className="form-group">
                <label>Profile Photo</label>
                <input type="file" name="profileImage" onChange={handleFileChange} accept="image/*" />
                {initialData && !profileImageFile && (
                    <p style={{fontSize: '0.8rem', marginTop: '5px', color: '#555'}}>
                        Current image will be kept if you don't upload a new one.
                    </p>
                )}
            </div>
            <div className="form-group">
                <label>Introduction</label>
                <textarea name="introduction" value={formData.introduction} onChange={handleChange} required rows="3" />
            </div>

            <h3 className="timeline-heading">Career Timeline</h3>
            {formData.timeline.map((step, index) => (
                <div key={index} className="timeline-step">
                    <h4>Step {index + 1}</h4>
                    <button type="button" className="btn-remove-step" onClick={() => removeTimelineStep(index)}>
                        <FaTrash />
                    </button>
                    <div className="form-group">
                        <label>Year / Stage</label>
                        <input name="year" value={step.year} onChange={(e) => handleTimelineChange(index, e)} />
                    </div>
                    <div className="form-group">
                        <label>Title</label>
                        <input name="title" value={step.title} onChange={(e) => handleTimelineChange(index, e)} />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea name="description" value={step.description} onChange={(e) => handleTimelineChange(index, e)} rows="2" />
                    </div>
                    <div className="form-group">
                        <label>Skills (comma-separated, e.g., React, Node.js, Git)</label>
                        <input name="skills" value={step.skills} onChange={(e) => handleTimelineChange(index, e)} />
                    </div>
                </div>
            ))}
            <button type="button" className="btn-add-step" onClick={addTimelineStep}>
                <FaPlus /> Add Timeline Step
            </button>

            <div className="form-group">
                <label>Final Words of Advice</label>
                <textarea name="keyAdvice" value={formData.keyAdvice} onChange={handleChange} rows="3" />
            </div>

            <div className="form-actions">
                <button type="button" className="button-secondary" onClick={onCancel} disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="button-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Roadmap'}
                </button>
            </div>
        </form>
    );
};

export default RoadmapForm;