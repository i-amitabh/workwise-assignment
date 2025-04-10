import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import pool from "../config/db.js";
dotenv.config();

const authMiddleware = async (req, res, next) => {
    // Get token from cookies
    const token = req.cookies.token;
  
    // Check if token exists
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
  
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      // Verify user exists in database
      const response = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
      
      if(response.rows.length > 0) {
          // Attach user data to request object
          req.user = {
              id: decoded.userId,
              // Add other relevant user data if needed
              // email: decoded.email,
              // role: decoded.role
          };
          next();
      } else {
          // Clear invalid token cookie
          res.clearCookie('token');
          return res.status(401).json({ message: 'User no longer exists' });
      }
      
    } catch (error) {
      // Clear invalid token cookie on error
      res.clearCookie('token');
  
      // Handle specific errors
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Session expired' });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid session' });
      }
      res.status(500).json({ message: 'Server error' });
    }
  };

export default authMiddleware;