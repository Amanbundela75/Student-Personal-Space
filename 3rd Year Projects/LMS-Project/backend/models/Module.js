import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Course',
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: false, // Isko optional rakhte hain
    },
    videoUrl: {
        type: String,
        required: false, // Video link optional hai
    },
    textContent: {
        type: String,
        required: false, // Likhit content bhi optional hai
    },
    // Aap future mein yahan aur cheezein jod sakte hain, jaise PDF file ka link, etc.
}, {
    timestamps: true,
});

const Module = mongoose.model('Module', moduleSchema);

export default Module;