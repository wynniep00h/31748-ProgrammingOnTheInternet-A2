import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Activity from '../models/Activity.js';

const router = express.Router();

//helper function to generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            username: user.username,
            role: user.role, //testing between admin and user role
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// helper for log activity
const logActivity = async (userID, username, action, details = '', ipAddress = '') => {
    try {
        await Activity.create({ user: userID, username, action, details, ipAddress });
    } catch {
    }
};

// REGISTER NEW USER

router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        //check if user already exists
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Please provide username, email and password' });
        }

        const existing = await User.findOne({ 
            $or: [{ email }, { username }]
        });

        if (existing) {
            const field = existing.email === email ? 'Email' : 'Username';
            return res.status(400).json({ message: `${field} already exists, please choose another` });
        }

        //create new user
        const user = await User.create({ username, email, password });

        //log registration activity
        await logActivity(
            user._id, 
            user.username, 
            'register', 
            `User registered with email: ${username}`, 
            req.ip
        );

        //generate token
        const token = generateToken(user);

        res.status(201).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });

    } catch (error) {
        if (err.username === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: 'Server error, please try again later' });
    }
});

//USER LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        //find user by username
        const user = await User.findOne({username});

        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        //check and compare password
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        // log login activity
        await logActivity(
            user._id,
            user.username,
            'login',
            `User logged in with email`,
            req.ip
        );

        //create and send token
        const token = generateToken(user);

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });

    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

//LOGOUT
router.post('/logout', async (req, res) => {
    try {
        const {userId, username } = req.body;

        if (!userId || !username) {
            await logActivity(
                userId,
                username,
                'logout',
                `User logged out`,
                req.ip
            );
        }

        res.json({ message: 'Logged out successfully' });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//GET CURRENT USER INFO
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided, please login' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ message: 'User not found, invalid token' });
        }
        res.json({
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
        });

    } catch (err) {
        res.status(401).json({ message: 'Invalid or expired token, please login again' });
    }
});

export default router;

