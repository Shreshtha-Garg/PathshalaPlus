import jwt from 'jsonwebtoken';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import connectToDatabase from '../db.js';

// --- TEACHER / ADMIN PROTECTION ---
export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      await connectToDatabase();
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Verify ID belongs to a Teacher
      req.user = await Teacher.findById(decoded.id).select('-password');
      if (!req.user) return res.status(401).json({ message: "Not authorized as Teacher" });
      
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Token failed" });
    }
  }
  if (!token) return res.status(401).json({ message: "No token" });
};

// --- STUDENT PROTECTION ---
export const protectStudent = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      await connectToDatabase();
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Verify ID belongs to a Student
      req.student = await Student.findById(decoded.id).select('-password');
      if (!req.student) return res.status(401).json({ message: "Not authorized as Student" });

      return next();
    } catch (error) {
      return res.status(401).json({ message: "Token failed" });
    }
  }
  if (!token) return res.status(401).json({ message: "No token" });
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(401).json({ message: "Admin access required" });
  }
};