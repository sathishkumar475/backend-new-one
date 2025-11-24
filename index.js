import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Question from './models/Questions.js';

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection (replace with your MongoDB connection string)
const CONNECTION_URL = 'mongodb://localhost:27017/qna' || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/qna';

mongoose.connect(CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('MongoDB connected successfully');
    })
    .catch((error) => {
        console.log('MongoDB connection error:', error.message);
    });

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// User Signup Route
app.post('/user/signup', async (req, res) => {
    try {
        const { email, password, confirmPassword, firstName, lastName } = req.body;

        // Validation
        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create username from first and last name
        const username = `${firstName} ${lastName}`;

        // Create user
        const user = await User.create({
            email,
            password: hashedPassword,
            username: username,
            bio: '',
            following: [],
            followers: [],
        });

        // Generate token
        const token = jwt.sign({ email: user.email, id: user._id }, JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({
            result: {
                _id: user._id,
                email: user.email,
                username: user.username,
            },
            token,
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Something went wrong during signup' });
    }
});

// User Signin Route
app.post('/user/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User doesn't exist" });
        }

        // Check password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign({ email: user.email, id: user._id }, JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({
            result: {
                _id: user._id,
                email: user.email,
                username: user.username,
            },
            token,
        });
    } catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({ message: 'Something went wrong during signin' });
    }
});

// Get All Questions Route
app.get('/getquestions', async (req, res) => {
    try {
        const questions = await Question.find()
            .populate('userId', 'username email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            data: questions,
            message: 'Questions fetched successfully',
        });
    } catch (error) {
        console.error('Get questions error:', error);
        res.status(500).json({ message: 'Failed to fetch questions' });
    }
});

// Create Question Route
app.post('/Createquestion/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { questionstring, username } = req.body;

        // Validation
        if (!questionstring) {
            return res.status(400).json({ message: 'Question is required' });
        }

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        // Verify user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create question
        const question = await Question.create({
            userId: [userId],
            question: questionstring,
            answers: [],
            likes: [],
        });

        res.status(201).json({
            data: question,
            message: 'Question created successfully',
        });
    } catch (error) {
        console.error('Create question error:', error);
        res.status(500).json({ message: 'Failed to create question' });
    }
});

// Health check route
app.get('/', (req, res) => {
    res.json({ message: 'QnA API is running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

