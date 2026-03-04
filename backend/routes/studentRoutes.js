import express from 'express';
import jwt from 'jsonwebtoken';
import Student from '../models/Student.js';
import Post from '../models/Post.js';
import Submission from '../models/Submission.js';
import connectToDatabase from '../db.js';
import { protectStudent } from '../middleware/authMiddleware.js';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ==========================================
// 1. STUDENT AUTHENTICATION
// ==========================================
router.post('/login', async (req, res) => {
  try {
    await connectToDatabase();
    const { mobile, password } = req.body;
    
    const student = await Student.findOne({ mobile });

    if (!student || student.password !== password) {
      return res.status(401).json({ message: "Invalid mobile number or password" });
    }

    res.json({ 
      _id: student._id,
      name: student.name, 
      mobile: student.mobile,
      studentClass: student.class,
      profilePhoto: student.profilePhoto,
      token: generateToken(student._id) 
    });

  } catch (error) {
    console.error("Student Login Error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

// ==========================================
// 2. STUDENT PROFILE
// ==========================================
router.get('/me', protectStudent, async (req, res) => {
  try {
    await connectToDatabase();
    const student = await Student.findById(req.student._id).select('-password');
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: "Error fetching student profile" });
  }
});

// ==========================================
// 3. STUDENT FEED (NOTICES, MATERIALS, SYLLABUS)
// ==========================================
router.get('/posts', protectStudent, async (req, res) => {
  try {
    await connectToDatabase();
    // 🔥 FIX: Now fetches posts for this specific class OR 'All'
    const posts = await Post.find({ 
      targetClass: { $in: [req.student.class, 'All'] },
      type: { $ne: 'Homework' } 
    })
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts feed" });
  }
});

// ==========================================
// 4. STUDENT HOMEWORK (PENDING VS SUBMITTED)
// ==========================================
router.get('/homework', protectStudent, async (req, res) => {
  try {
    await connectToDatabase();
    
    // 🔥 FIX: Now fetches homework for this specific class OR 'All'
    const allHomework = await Post.find({ 
      targetClass: { $in: [req.student.class, 'All'] }, 
      type: 'Homework' 
    })
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 });

    const studentSubmissions = await Submission.find({ 
      studentId: req.student._id 
    });

    const submittedPostIds = studentSubmissions.map(sub => sub.postId.toString());

    const pending = [];
    const submitted = [];

    allHomework.forEach(hw => {
      if (submittedPostIds.includes(hw._id.toString())) {
        const submissionRecord = studentSubmissions.find(sub => sub.postId.toString() === hw._id.toString());
        
        submitted.push({
          ...hw.toObject(),
          isSubmitted: true,
          submissionUrl: submissionRecord.attachmentUrl,
          submittedAt: submissionRecord.submittedAt
        });
      } else {
        pending.push({
          ...hw.toObject(),
          isSubmitted: false
        });
      }
    });

    res.json({ pending, submitted });

  } catch (error) {
    console.error("Error fetching homework data:", error);
    res.status(500).json({ message: "Error fetching homework data" });
  }
});

// ==========================================
// 5. SUBMIT HOMEWORK
// ==========================================
router.post('/submit-homework', protectStudent, async (req, res) => {
  try {
    await connectToDatabase();
    const { postId, attachmentUrl, fileName } = req.body;

    if (!postId || !attachmentUrl) {
      return res.status(400).json({ message: "Post ID and Attachment URL are required" });
    }

    const homeworkPost = await Post.findById(postId);
    if (!homeworkPost) {
      return res.status(404).json({ message: "Homework assignment not found" });
    }

    const existingSubmission = await Submission.findOne({ 
      postId: postId, 
      studentId: req.student._id 
    });

    if (existingSubmission) {
      return res.status(400).json({ message: "You have already submitted this assignment" });
    }

    const newSubmission = new Submission({
      postId,
      studentId: req.student._id,
      fileUrl: attachmentUrl,
      fileName: fileName || 'Submitted Homework',
      submittedAt: new Date()
    });

    await newSubmission.save();

    res.status(201).json({ message: "Homework submitted successfully!", submission: newSubmission });

  } catch (error) {
    console.error("Error submitting homework:", error);
    res.status(500).json({ message: "Error submitting homework" });
  }
});

// ==========================================
// 6. STUDENT DASHBOARD STATS
// ==========================================
router.get('/dashboard', protectStudent, async (req, res) => {
  try {
    await connectToDatabase();
    const studentClass = req.student.class;

    const rawRecentPosts = await Post.find({ 
        targetClass: { $in: [studentClass, 'All'] } 
      })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get student's submissions to check against recent posts
    const studentSubmissions = await Submission.find({ studentId: req.student._id });
    const submittedPostIds = studentSubmissions.map(sub => sub.postId.toString());

    // Attach isSubmitted status to the posts
    const recentPosts = rawRecentPosts.map(post => ({
      ...post.toObject(),
      isSubmitted: post.type === 'Homework' ? submittedPostIds.includes(post._id.toString()) : false
    }));

    const totalHomework = await Post.countDocuments({ 
      targetClass: { $in: [studentClass, 'All'] }, 
      type: 'Homework' 
    });

    const submittedHomeworkCount = submittedPostIds.length;
    const pendingHomework = Math.max(0, totalHomework - submittedHomeworkCount);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const newNotices = await Post.countDocuments({
      targetClass: { $in: [studentClass, 'All'] },
      type: 'Notice',
      createdAt: { $gte: sevenDaysAgo }
    });

    res.json({
      stats: { pendingHomework, newNotices },
      recentPosts
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: "Error fetching dashboard data" });
  }
});

export default router;