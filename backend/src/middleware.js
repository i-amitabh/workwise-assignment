import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import pool from "./db.js";
dotenv.config();

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if header exists and is in correct format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication invalid' });
  }

  // Extract token
  const token = authHeader.split(' ')[1];

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const response = await pool.query('SELECT * FROM users WHERE name = $1', [decoded.name]);
    console.log(response.rows[0]);
    
    // Attach user data to request object
    req.user = {
      name: decoded.name
    };
    
    next();
  } catch (error) {
    // Handle specific errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export default authMiddleware;