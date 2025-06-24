const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
    questionText: {
        type: String,
        required: [true, 'Question text is required.'],
        trim: true
    },
    options: [{
        type: String,
        required: true
    }],
    correctOption: {
        type: Number,
        required: [true, 'Please provide the index of the correct option.']
    }
});

const TestSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title for the test.'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: [true, 'A test must be associated with a course.']
    },
    branch: {
        type: Schema.Types.ObjectId,
        ref: 'Branch',
        required: [true, 'A test must be associated with a branch.']
    },
    duration: {
        type: Number,
        required: [true, 'Please set a duration for the test.']
    },
    questions: [QuestionSchema],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true }); // timestamps: true bilkul sahi hai, isko rehne dein.


// --- Humne yahan se .pre('find') wala hissa hata diya hai ---
// Isse server crash hona band ho jaayega.
// -----------------------------------------------------------


const Test = mongoose.model('Test', TestSchema);

module.exports = Test;