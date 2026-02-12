import express from 'express';
import jwt from 'jsonwebtoken';
import Student from '../models/Student.js'; 
import Post from '../models/Post.js'; 
import connectToDatabase from '../db.js'; 
import Teacher from '../models/Teacher.js'; 
import Submission from '../models/Submission.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// --- 1. TEACHER LOGIN ---
router.post('/login', async (req, res) => {
  try {
    await connectToDatabase();
    const { email, password } = req.body;
    const teacher = await Teacher.findOne({ email });
    console.log("Login attempt for email:", email);
    if (!teacher || teacher.password !== password) {
       return res.status(401).json({ message: "Invalid Admin Credentials" });
    }

    res.json({ 
      _id: teacher._id,
      name: teacher.name, 
      role: teacher.role,
      token: generateToken(teacher._id) 
    });

  } catch (error) {
    res.status(500).json({ message: "Login Error" });
  }
});

// --- 2. ADD STUDENT (Full Professional Profile) ---
router.post('/add-student', protect, async (req, res) => {
  try {
    await connectToDatabase(); 
    // Check for duplicate SrNo or Mobile
    const existingStudent = await Student.findOne({ 
      $or: [{ srNo: req.body.srNo }, { mobile: req.body.mobile }] 
    });
    
    if (existingStudent) {
      return res.status(400).json({ message: "Student with this SR No. or Mobile already exists." });
    }

    const newStudent = new Student(req.body);
    await newStudent.save();
    
    res.status(201).json({ message: "Student Added Successfully!" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding student", error: error.message });
  }
});

// --- 3. GET ALL STUDENTS (For Class List) --- 
// NEW ROUTE
router.get('/students', protect, async (req, res) => {
  try {
    await connectToDatabase();
    const { classFilter } = req.query; // Optional: ?classFilter=10th-A
    
    let query = {};
    if (classFilter) {
      query.class = classFilter;
    }

    const students = await Student.find(query).select('-password').sort({ class: 1, srNo: 1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Error fetching students" });
  }
});

// --- 4. POST NOTICE / HOMEWORK / MATERIAL ---
router.post('/post-notice', protect, async (req, res) => {
  try {
    await connectToDatabase();
    const { title, description, type, targetClass, attachmentUrl } = req.body;
    
    const newPost = new Post({
      title,
      description,
      type, // 'Notice', 'Homework', 'Material'
      targetClass,
      attachmentUrl
    });
    
    await newPost.save();
    res.status(201).json({ message: "Posted Successfully!" });

  } catch (error) {
    res.status(500).json({ message: "Error posting content" });
  }
});

// --- 5. GET TEACHER'S POSTS (For 'Check Homework' List) ---
// NEW ROUTE
router.get('/posts', protect, async (req, res) => {
  try {
    await connectToDatabase();
    // In a real app, you might filter by 'createdBy'. 
    // For now, we return all posts so the Admin can manage everything.
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts" });
  }
});

// --- 6. VIEW SUBMISSIONS FOR A SPECIFIC POST ---
router.get('/submissions/:postId', protect, async (req, res) => {
  try {
    await connectToDatabase();
    const submissions = await Submission.find({ postId: req.params.postId })
      .populate('studentId', 'name srNo class profilePhoto')
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching submissions" });
  }
});

// --- 7. FORGOT PASSWORD (Basic Implementation) ---
// NEW ROUTE
router.post('/forgot-password', async (req, res) => {
  try {
    await connectToDatabase();
    const { email } = req.body;
    const teacher = await Teacher.findOne({ email });

    if (!teacher) {
      return res.status(404).json({ message: "Email not found" });
    }

    // Since we don't have an SMTP server, we will return a mock success
    // In production, send an email here.
    res.json({ message: "Password reset link sent to email (Mock)" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;