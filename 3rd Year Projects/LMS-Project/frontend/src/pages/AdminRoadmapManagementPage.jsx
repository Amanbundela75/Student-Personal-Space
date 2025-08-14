// src/pages/AdminRoadmapManagementPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { FaPlus } from 'react-icons/fa';
import RoadmapForm from '../components/admin/RoadmapForm';
import Modal from '../components/layout/Modal';
import './AdminRoadmapManagementPage.css';

const API_URL = 'http://localhost:5001'; // Backend URL

const AdminRoadmapManagementPage = () => {
    const [roadmaps, setRoadmaps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { token } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRoadmap, setCurrentRoadmap] = useState(null);

    const fetchRoadmaps = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/api/roadmaps`);
            setRoadmaps(response.data);
        } catch (err) {
            setError('Failed to fetch roadmaps. Please try again later.');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchRoadmaps();
    }, []);

    const handleAddNew = () => {
        setCurrentRoadmap(null);
        setIsModalOpen(true);
    };

    const handleEdit = (roadmap) => {
        setCurrentRoadmap(roadmap);
        setIsModalOpen(true);
    };

    const handleSave = async (formData, roadmapId) => {
        setIsSubmitting(true);
        setError('');
        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } };
            if (roadmapId) {
                await axios.put(`${API_URL}/api/roadmaps/${roadmapId}`, formData, config);
            } else {
                await axios.post(`${API_URL}/api/roadmaps`, formData, config);
            }
            setIsModalOpen(false);
            fetchRoadmaps();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save roadmap.');
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this roadmap?')) {
            try {
                await axios.delete(`${API_URL}/api/roadmaps/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchRoadmaps();
            } catch (err) {
                setError('Failed to delete the roadmap.');
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
                {roadmaps.map(roadmap => (
                    <div key={roadmap._id} className="roadmap-item">
                        <div className="roadmap-info">
                            {/* === IMAGE PATH CORRECTED HERE === */}
                            <img
                                src={`${API_URL}${roadmap.profileImage}`}
                                alt={roadmap.seniorName}
                                className="roadmap-item-img"
                            />
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
                ))}
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