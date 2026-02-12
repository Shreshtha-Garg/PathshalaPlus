import express from 'express';
import jwt from 'jsonwebtoken';
import Student from '../models/Student.js';
import Post from '../models/Post.js';
import Submission from '../models/Submission.js';
import connectToDatabase from '../db.js';
import { protectStudent } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
}; 

// --- 1. STUDENT LOGIN ---
router.post('/login', async (req, res) => {
  try {
    await connectToDatabase();
    const { mobile, password } = req.body;

    const student = await Student.findOne({ mobile });
    
    if (!student || student.password !== password) {
      return res.status(401).json({ message: "Invalid Mobile or Password" });
    }

    res.json({
      _id: student._id,
      name: student.name,
      class: student.class,
      srNo: student.srNo,
      profilePhoto: student.profilePhoto,
      token: generateToken(student._id) // Token for mobile session
    });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// --- 2. GET MY FEED (Secured) ---
router.get('/feed/:studentClass', protectStudent, async (req, res) => {
  try {
    await connectToDatabase();
    const studentClass = req.params.studentClass;

    const posts = await Post.find({
      targetClass: { $in: ['All', studentClass] }
    }).sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching feed" });
  }
});

// --- 3. SUBMIT HOMEWORK (Secured) ---
router.post('/submit', protectStudent, async (req, res) => {
  try {
    await connectToDatabase();
    const { postId, fileUrl, remarks } = req.body;

    // Use studentId from the verified token for security
    const studentId = req.student._id;

    const existing = await Submission.findOne({ studentId, postId });
    if (existing) {
      return res.status(400).json({ message: "You have already submitted this assignment." });
    }

    const newSubmission = new Submission({
      studentId,
      postId,
      fileUrl,
      remarks
    });

    await newSubmission.save();
    res.status(201).json({ message: "Homework Submitted Successfully!" });

  } catch (error) {
    res.status(500).json({ message: "Error submitting homework" });
  }
});

export default router;