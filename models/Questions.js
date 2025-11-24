import mongoose from "mongoose";

const questionShema = mongoose.Schema({
    userId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    question: String,
    answers: Array,
    likes: Array,
}, {
    timestamps: true
})

const Question = mongoose.model('Question', questionShema)
export default Question 
