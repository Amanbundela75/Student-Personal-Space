import React, { useState, useEffect } from 'react';
import { fetchBranches, createBranch, updateBranch, deleteBranch } from '../../api/branches';
import { useAuth } from '../../contexts/AuthContext.jsx';

const BranchManagement = () => {
    const [branches, setBranches] = useState([]);
    const [newBranchName, setNewBranchName] = useState('');
    const [newBranchDesc, setNewBranchDesc] = useState('');
    const [editingBranch, setEditingBranch] = useState(null); // { _id, name, description }
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();

    const loadBranches = async () => {
        setLoading(true);
        try {
            const data = await fetchBranches();
            setBranches(data || []);
        } catch (err) { setError('Failed to load branches.'); }
        setLoading(false);
    };

    useEffect(() => { loadBranches(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newBranchName.trim()) {
            alert("Branch name cannot be empty.");
            return;
        }
        setError('');
        try {
            const response = await createBranch({ name: newBranchName, description: newBranchDesc }, token);
            if (response.success) {
                loadBranches();
                setNewBranchName('');
                setNewBranchDesc('');
                alert("Branch created!");
            } else {
                setError(response.message || "Failed to create branch.");
            }
        } catch (err) { setError(err.response?.data?.message || 'Error creating branch.'); }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!editingBranch || !editingBranch.name.trim()) {
            alert("Branch name cannot be empty for update.");
            return;
        }
        setError('');
        try {
            const response = await updateBranch(editingBranch._id, { name: editingBranch.name, description: editingBranch.description }, token);
            if (response.success) {
                loadBranches();
                setEditingBranch(null);
                alert("Branch updated!");
            } else {
                setError(response.message || "Failed to update branch.");
            }
        } catch (err) { setError(err.response?.data?.message || 'Error updating branch.'); }
    };

    const handleDelete = async (branchId, branchName) => {
        if (window.confirm(`Are you sure you want to delete branch "${branchName}"? Associated courses might prevent deletion.`)) {
            setError('');
            try {
                const response = await deleteBranch(branchId, token);
                if (response.success) {
                    loadBranches();
                    alert("Branch deleted!");
                } else {
                    setError(response.message || "Failed to delete branch.");
                }
            } catch (err) { setError(err.response?.data?.message || 'Error deleting branch.'); }
        }
    };


    if (loading) return <p>Loading branches...</p>;


    return (
        <div>
            <h2>Branch Management</h2>
            {error && <p className="error-message">{error}</p>}

            {/* Create Form */}
            {!editingBranch && (
                <form onSubmit={handleCreate}>
                    <h3>Create New Branch</h3>
                    <div>
                        <label>Name:</label>
                        <input type="text" value={newBranchName} onChange={(e) => setNewBranchName(e.target.value)} required />
                    </div>
                    <div>
                        <label>Description (Optional):</label>
                        <textarea value={newBranchDesc} onChange={(e) => setNewBranchDesc(e.target.value)} />
                    </div>
                    <button type="submit">Create Branch</button>
                </form>
            )}

            {/* Edit Form */}
            {editingBranch && (
                <form onSubmit={handleUpdate}>
                    <h3>Edit Branch: {editingBranch.initialName || editingBranch.name}</h3>
                    <div>
                        <label>Name:</label>
                        <input type="text" value={editingBranch.name} onChange={(e) => setEditingBranch({...editingBranch, name: e.target.value})} required />
                    </div>
                    <div>
                        <label>Description:</label>
                        <textarea value={editingBranch.description} onChange={(e) => setEditingBranch({...editingBranch, description: e.target.value})} />
                    </div>
                    <button type="submit">Save Changes</button>
                    <button type="button" onClick={() => setEditingBranch(null)} style={{backgroundColor: "grey", marginLeft: "10px"}}>Cancel</button>
                </form>
            )}


            <h3>Existing Branches</h3>
            {branches.length === 0 && !loading ? <p>No branches found.</p> : (
                <table>
                    <thead><tr><th>Name</th><th>Description</th><th>Actions</th></tr></thead>
                    <tbody>
                    {branches.map(b => (
                        <tr key={b._id}>
                            <td>{b.name}</td>
                            <td>{b.description || '-'}</td>
                            <td>
                                <button onClick={() => setEditingBranch({...b, initialName: b.name})} className="action-button edit-button">Edit</button>
                                <button onClick={() => handleDelete(b._id, b.name)} className="action-button delete-button">Delete</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default BranchManagement;