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

// --- 2. ADD A NEW STUDENT (Secured) ---
router.post('/add-student', protect, async (req, res) => {
  try {
    await connectToDatabase(); 
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
    res.status(500).json({ message: "Error adding student", error: error.message });
  }
});

// --- 3. POST A NOTICE / HOMEWORK (Secured) ---
router.post('/post-notice', protect, async (req, res) => {
  try {
    await connectToDatabase();
    const { title, description, type, targetClass, attachmentUrl } = req.body;
    
    const newPost = new Post({
      title,
      description,
      type,
      targetClass,
      attachmentUrl
    });
    
    await newPost.save();
    res.status(201).json({ message: "Notice Posted Successfully!" });

  } catch (error) {
    res.status(500).json({ message: "Error posting notice", error: error.message });
  }
});

// --- 4. VIEW SUBMISSIONS (Secured) ---
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

// --- 5. CREATE NEW TEACHER (Admin Only) ---
router.post('/create-teacher', protect, admin, async (req, res) => {
  try {
    const { name, email, password, mobile, role } = req.body;
    const teacherExists = await Teacher.findOne({ email });
    if (teacherExists) return res.status(400).json({ message: "Teacher already exists" });

    const teacher = await Teacher.create({ name, email, password, mobile, role: role || 'Teacher' });
    res.status(201).json({ message: "Teacher created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating teacher" });
  }
});

// --- 6. DELETE TEACHER (Admin Only) ---
router.delete('/delete-teacher/:id', protect, admin, async (req, res) => {
  try {
    await Teacher.findByIdAndDelete(req.params.id);
    res.json({ message: "Teacher removed" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting teacher" });
  }
});

// --- 7. CREATE INITIAL ADMIN (One-time setup) ---
// router.post('/create-admin', async (req, res) => {
//   try {
//     await connectToDatabase();
//     const newTeacher = new Teacher({
//       name: "Prashant Chaturvedi",
//       email: "pathshalaplus.app@gmail.com", 
//       password: "Pathshala+pass", 
//       mobile: "9876543210",
//       role: "Admin"
//     });
//     await newTeacher.save();
//     res.json({ message: "Admin Account Created!" });
//   } catch (error) {
//     res.json({ error: error.message });
//   }
// });

export default router;