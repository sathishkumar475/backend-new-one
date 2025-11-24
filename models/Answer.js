import mongoose from "mongoose";

const answerSchema = mongoose.Schema({
    username: String,
    userbio: String,
    actualanswer: String,
})

const Answer = mongoose.model('Answer', answerSchema)
export default Answer