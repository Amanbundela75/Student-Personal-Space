import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosConfig';
import { useAuth } from '../contexts/AuthContext';
import '../Components/CreateTest.css'; // Aapki CSS file ko yahan import kiya gaya hai

const CreateTestPage = () => {
    // Auth context se token aur user info lein
    const { token } = useAuth();
    const navigate = useNavigate();

    // Test ki basic details ke liye state
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState(60); // Default duration

    // Dropdowns ke liye state
    const [courses, setCourses] = useState([]);
    const [branches, setBranches] = useState([]);
    const [courseId, setCourseId] = useState('');
    const [branchId, setBranchId] = useState('');

    // Questions ke liye state
    const [questions, setQuestions] = useState([
        { questionText: '', options: ['', '', '', ''], correctAnswer: '' }
    ]);

    // UI states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Component mount hone par courses aur branches fetch karein
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [coursesRes, branchesRes] = await Promise.all([
                    apiClient.get('/api/courses', { headers: { Authorization: `Bearer ${token}` } }),
                    apiClient.get('/api/branches', { headers: { Authorization: `Bearer ${token}` } })
                ]);
                setCourses(coursesRes.data.data || []);
                setBranches(branchesRes.data.data || []);
            } catch (err) {
                setError('Failed to load courses and branches. Please try again.');
                console.error(err);
            }
        };
        if (token) {
            fetchData();
        }
    }, [token]);

    // Form submit hone par yeh function chalega
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !courseId || !branchId || questions.some(q => !q.questionText || !q.correctAnswer)) {
            setError('Please fill all required fields, including all question and answer fields.');
            return;
        }
        setLoading(true);
        setError('');

        const testData = {
            title,
            duration,
            course: courseId,
            branch: branchId,
            questions
        };

        try {
            await apiClient.post('/api/tests', testData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate('/admin/tests'); // Success ke baad test list par redirect
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to create test.');
            console.error('Error creating test:', error);
        } finally {
            setLoading(false);
        }
    };

    // Question ke text, ya correct answer ko update karne ke liye
    const handleQuestionChange = (index, event) => {
        const newQuestions = [...questions];
        newQuestions[index][event.target.name] = event.target.value;
        setQuestions(newQuestions);
    };

    // Option ke text ko update karne ke liye
    const handleOptionChange = (qIndex, oIndex, event) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex] = event.target.value;
        setQuestions(newQuestions);
    };

    // Naya question add karne ke liye
    const addQuestion = () => {
        setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctAnswer: '' }]);
    };

    // Question ko remove karne ke liye
    const removeQuestion = (index) => {
        const newQuestions = questions.filter((_, qIndex) => qIndex !== index);
        setQuestions(newQuestions);
    };

    return (
        <div className="create-test-container">
            <h2>Create a New Test</h2>
            <form onSubmit={handleSubmit}>
                {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}

                <div className="form-group">
                    <label>Test Title</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>

                <div className="form-group">
                    <label>Branch</label>
                    <select value={branchId} onChange={(e) => setBranchId(e.target.value)} required>
                        <option value="">Select Branch</option>
                        {branches.map(branch => (
                            <option key={branch._id} value={branch._id}>{branch.name}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Course</label>
                    <select value={courseId} onChange={(e) => setCourseId(e.target.value)} required disabled={!branchId}>
                        <option value="">Select Course</option>
                        {/* --- FIX YAHAN HAI --- */}
                        {/* 'course.name' ko 'course.title' se badal diya gaya hai */}
                        {courses.filter(c => c.branch?._id === branchId).map(course => (
                            <option key={course._id} value={course._id}>{course.title}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Duration (in minutes)</label>
                    <input type="number" value={duration} onChange={(e) => setDuration(parseInt(e.target.value, 10))} required />
                </div>

                <hr />

                <h3>Questions</h3>
                {questions.map((q, qIndex) => (
                    <div key={qIndex} className="question-block">
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <h4>Question {qIndex + 1}</h4>
                            {questions.length > 1 &&
                                <button type="button" onClick={() => removeQuestion(qIndex)} className="btn-remove">Remove</button>
                            }
                        </div>
                        <div className="form-group">
                            <label>Question Text</label>
                            <input type="text" name="questionText" value={q.questionText} onChange={(e) => handleQuestionChange(qIndex, e)} required />
                        </div>
                        {q.options.map((opt, oIndex) => (
                            <div className="form-group" key={oIndex}>
                                <label>Option {oIndex + 1}</label>
                                <input type="text" value={opt} onChange={(e) => handleOptionChange(qIndex, oIndex, e)} required />
                            </div>
                        ))}
                        <div className="form-group">
                            <label>Correct Answer (Select the correct option)</label>
                            <select name="correctAnswer" value={q.correctAnswer} onChange={(e) => handleQuestionChange(qIndex, e)} required>
                                <option value="">Select Correct Answer</option>
                                {q.options.filter(opt => opt).map((opt, oIndex) => (
                                    <option key={oIndex} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                ))}

                <button type="button" onClick={addQuestion} className="btn-secondary">Add Another Question</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Test'}
                </button>
            </form>
        </div>
    );
};

export default CreateTestPage;