import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import 'dotenv/config';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected Successfully'))
    .catch(err => console.log('Database connection error:', err));

// Define User Schema & Model
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// Hardcoded Owner Credentials
const OWNER_EMAIL = "Hasanrasheed66778@gmail.com";
const OWNER_PASS = "Hassan2272";

// 1. SIGNUP ROUTE (Customers Only)
app.post('/api/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (email === OWNER_EMAIL) {
            return res.status(400).json({ success: false, message: 'This email is reserved.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already exists.' });
        }

        const newUser = new User({ email, password });
        await newUser.save();
        res.json({ success: true, message: 'Account created successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error during signup.' });
    }
});

// 2. LOGIN ROUTE (Handles Owner & Customers)
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if Owner is logging in
        if (email === OWNER_EMAIL && password === OWNER_PASS) {
            return res.json({ success: true, role: 'owner', email: OWNER_EMAIL });
        }

        // Check regular users in MongoDB
        const user = await User.findOne({ email, password });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        res.json({ success: true, role: 'customer', email: user.email });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error during login.' });
    }
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});