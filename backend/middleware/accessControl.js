import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// List of authorized admin usernames
const AUTHORIZED_ADMINS = [
  'admin1',
  'admin2', 
  'admin3',
  'admin4',
  'admin5',
  'admin6'
];

// Middleware to check if user is authorized to access the system
export const checkAuthorization = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'Invalid token.' });
    }

    // Check if user is in authorized list or has explicit authorization
    const isAuthorized = AUTHORIZED_ADMINS.includes(user.username) || user.isAuthorized;
    
    if (!isAuthorized) {
      return res.status(403).json({ 
        error: 'Access denied. You are not authorized to access this system.' 
      });
    }

    req.user = {
      ...decoded,
      accessLevel: AUTHORIZED_ADMINS.includes(user.username) 
        ? (user.username === 'admin1' ? 'super_admin' : 'admin')
        : user.accessLevel || 'viewer'
    };
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

// Middleware to check if user can modify data (admin or super_admin only)
export const checkModifyPermission = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const { accessLevel, username } = req.user;
  
  // Only authorized admins can modify data
  if (!AUTHORIZED_ADMINS.includes(username) && accessLevel !== 'admin' && accessLevel !== 'super_admin') {
    return res.status(403).json({ 
      error: 'Access denied. You do not have permission to modify data.' 
    });
  }

  next();
};

// Middleware to check if user is super admin (for critical operations)
export const checkSuperAdminPermission = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const { accessLevel, username } = req.user;
  
  // Only super admin (admin1) can perform critical operations
  if (username !== 'admin1' && accessLevel !== 'super_admin') {
    return res.status(403).json({ 
      error: 'Access denied. Super admin privileges required.' 
    });
  }

  next();
};

// Middleware for read-only access (all authorized users)
export const checkReadPermission = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  // All authorized users can read data
  next();
};
