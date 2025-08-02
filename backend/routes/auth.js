import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// List of authorized admin usernames who can modify data
const AUTHORIZED_ADMINS = [
  'sharathchandra', // Change these to match your new usernames
  'admin2', 
  'admin3',
  'admin4',
  'admin5',
  'admin6'
];

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is authorized to access the system
    const isAuthorized = AUTHORIZED_ADMINS.includes(username) || user.isAuthorized;
    if (!isAuthorized) {
      return res.status(403).json({ 
        error: 'Access denied. You are not authorized to access this system.' 
      });
    }

    // Determine access level
    let accessLevel = 'viewer';
    if (AUTHORIZED_ADMINS.includes(username)) {
      accessLevel = username === 'sharathchandra' ? 'super_admin' : 'admin';
    } else if (user.accessLevel) {
      accessLevel = user.accessLevel;
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        username: user.username, 
        role: user.role,
        accessLevel: accessLevel,
        isAuthorized: true
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        accessLevel: accessLevel,
        isAuthorized: true
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register route (for admin setup)
router.post('/register', async (req, res) => {
  try {
    const { username, password, fullName, email, role = 'admin' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Create new user
    const user = new User({
      username,
      password,
      fullName,
      email,
      role
    });

    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Middleware to verify JWT token
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

export default router;
