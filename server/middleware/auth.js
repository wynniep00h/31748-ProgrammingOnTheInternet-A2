import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const authMiddleware = async (req, res, next) => {
    try {
        //get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided, please login' });
        }

        //extract token part after 'Bearer '
        const token = authHeader.split(' ')[1];

        //verify token using secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //find user by token id in the database
        const user = await User.findById(decoded.id).select('-password'); //exclude password

        if (!user) {
            return res.status(401).json({ message: 'User not found, invalid token' });
        }

        //attach user to request so it can be accessed in next middleware or route handler
        req.user = user;
        
        //pass control to next function
        next();

    } catch (error) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired, please login again' });
        }
        return res.status(401).json({ message: 'Invalid token, please login again' });
    }
};

//middleware to check if user is admin
export const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};

export default authMiddleware;