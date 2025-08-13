import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { FaPlus } from 'react-icons/fa';
import RoadmapForm from '../components/admin/RoadmapForm';
import Modal from '../components/layout/Modal'; // <-- PATH CORRECTED HERE
import './AdminRoadmapManagementPage.css';

const API_URL = 'http://localhost:5001/api';

const AdminRoadmapManagementPage = () => {
    const [roadmaps, setRoadmaps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { token } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRoadmap, setCurrentRoadmap] = useState(null); // For editing

    const fetchRoadmaps = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/roadmaps`);
            setRoadmaps(response.data);
        } catch (err) {
            setError('Failed to fetch roadmaps. Please try again later.');
            console.error('Fetch Roadmaps Error:', err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchRoadmaps();
    }, []);

    const handleAddNew = () => {
        setCurrentRoadmap(null); // Clear any editing data
        setIsModalOpen(true);
    };

    const handleEdit = (roadmap) => {
        setCurrentRoadmap(roadmap);
        setIsModalOpen(true);
    };

    const handleSave = async (formData) => {
        setIsSubmitting(true);
        setError('');
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            if (currentRoadmap) {
                // Update existing roadmap
                await axios.put(`${API_URL}/roadmaps/${currentRoadmap._id}`, formData, config);
            } else {
                // Create new roadmap
                await axios.post(`${API_URL}/roadmaps`, formData, config);
            }
            setIsModalOpen(false);
            fetchRoadmaps(); // Refresh list
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save roadmap.');
            console.error('Save Roadmap Error:', err);
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this roadmap?')) {
            try {
                await axios.delete(`${API_URL}/roadmaps/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchRoadmaps();
            } catch (err) {
                setError('Failed to delete the roadmap.');
                console.error('Delete Roadmap Error:', err);
            }
        }
    };

    if (loading) return <div className="admin-roadmap-container"><p>Loading roadmaps...</p></div>;

    return (
        <div className="admin-roadmap-container">
            <header className="roadmap-header">
                <h1>Manage Senior Roadmaps</h1>
                <button className="btn-add-new" onClick={handleAddNew}>
                    <FaPlus /> Add New Roadmap
                </button>
            </header>

            {error && <p className="error-message" style={{color: 'red', textAlign: 'center'}}>{error}</p>}

            <div className="roadmap-list">
                {roadmaps.length === 0 ? (
                    <p>No roadmaps found. Click "Add New Roadmap" to create one.</p>
                ) : (
                    roadmaps.map(roadmap => (
                        <div key={roadmap._id} className="roadmap-item">
                            <div className="roadmap-info">
                                <img src={roadmap.profileImage} alt={roadmap.seniorName} className="roadmap-item-img" />
                                <div className="roadmap-item-details">
                                    <h3>{roadmap.seniorName}</h3>
                                    <p>{roadmap.seniorRole}</p>
                                </div>
                            </div>
                            <div className="roadmap-actions">
                                <button className="btn-edit" onClick={() => handleEdit(roadmap)}>Edit</button>
                                <button className="btn-delete" onClick={() => handleDelete(roadmap._id)}>Delete</button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {isModalOpen && (
                <Modal onClose={() => setIsModalOpen(false)}>
                    <RoadmapForm
                        initialData={currentRoadmap}
                        onSave={handleSave}
                        onCancel={() => setIsModalOpen(false)}
                        isSubmitting={isSubmitting}
                    />
                </Modal>
            )}
        </div>
    );
};

export default AdminRoadmapManagementPage;