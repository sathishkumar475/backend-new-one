import mongoose from 'mongoose'

const userSchema = mongoose.Schema({
    username: String,
    email: String,
    password: String,
    bio: String,
    following: Array,
    followers:Array,
})


const User = mongoose.model('User', userSchema)

export default User