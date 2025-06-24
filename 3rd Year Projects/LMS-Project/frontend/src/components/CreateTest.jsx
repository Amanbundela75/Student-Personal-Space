import React, { useState } from 'react';
import testService from '../services/TestServices';
import './CreateTest.css'; // Hum styling ke liye ek alag CSS file banayenge

const CreateTest = () => {
    // Test ki basic details ke liye state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [duration, setDuration] = useState(60); // Default duration 60 minutes

    // Yahan hum course ID ko hardcode kar rahe hain.
    // Asli application mein yeh dropdown se select hoga.
    const [courseId, setCourseId] = useState('60d5f2f5e7b3c2a4e8f3b8c6'); // EXAMPLE ID

    // Questions ke liye state. Yeh ek array hoga.
    const [questions, setQuestions] = useState([
        { questionText: '', options: ['', ''], correctAnswer: '' }
    ]);

    // Form submit hone par yeh function chalega
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Yahan hum user token lenge. Abhi ke liye hardcode kar rahe hain.
        const token = 'YOUR_ADMIN_AUTH_TOKEN'; // Aapko isse login system se lena hoga

        const testData = {
            title,
            description,
            duration,
            course: courseId,
            questions
        };

        try {
            await testService.createTest(testData, token);
            alert('Test Successfully Created!');
            // Form ko reset kar sakte hain
            setTitle('');
            setDescription('');
            setQuestions([{ questionText: '', options: ['', ''], correctAnswer: '' }]);
        } catch (error) {
            console.error('Error creating test:', error);
            alert('Failed to create test. Check console for error.');
        }
    };

    // Question ke text ko update karne ke liye
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
        setQuestions([...questions, { questionText: '', options: ['', ''], correctAnswer: '' }]);
    };

    return (
        <div className="create-test-container">
            <h2>Create a New Test</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Test Title</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                </div>
                <div className="form-group">
                    <label>Duration (in minutes)</label>
                    <input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                        required
                    />
                </div>

                <hr />

                <h3>Questions</h3>
                {questions.map((q, qIndex) => (
                    <div key={qIndex} className="question-block">
                        <h4>Question {qIndex + 1}</h4>
                        <div className="form-group">
                            <label>Question Text</label>
                            <input
                                type="text"
                                name="questionText"
                                value={q.questionText}
                                onChange={(e) => handleQuestionChange(qIndex, e)}
                                required
                            />
                        </div>
                        {q.options.map((opt, oIndex) => (
                            <div className="form-group" key={oIndex}>
                                <label>Option {oIndex + 1}</label>
                                <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) => handleOptionChange(qIndex, oIndex, e)}
                                    required
                                />
                            </div>
                        ))}
                        <div className="form-group">
                            <label>Correct Answer (enter the exact option text)</label>
                            <input
                                type="text"
                                name="correctAnswer"
                                value={q.correctAnswer}
                                onChange={(e) => handleQuestionChange(qIndex, e)}
                                required
                            />
                        </div>
                    </div>
                ))}

                <button type="button" onClick={addQuestion} className="btn-secondary">Add Another Question</button>
                <button type="submit" className="btn-primary">Create Test</button>
            </form>
        </div>
    );
};

export default CreateTest;