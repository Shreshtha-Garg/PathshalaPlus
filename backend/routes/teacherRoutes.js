  import express from 'express';
  import jwt from 'jsonwebtoken';
  import Student from '../models/Student.js'; 
  import Post from '../models/Post.js'; 
  import connectToDatabase from '../db.js'; 
  import Teacher from '../models/Teacher.js'; 
  import Submission from '../models/Submission.js';
  import { protect, admin } from '../middleware/authMiddleware.js';
  import { v2 as cloudinary } from "cloudinary";
  import dotenv from 'dotenv';
  dotenv.config(); 

  const router = express.Router();

  const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  };

  const cloudinaryUrl = process.env.CLOUDINARY_URL;

if (!cloudinaryUrl) {
  console.error("CLOUDINARY_URL is not defined in .env file!");
  // Fallback: use individual env variables or throw error
} else {
  const regex = /cloudinary:\/\/(\d+):([^@]+)@([^?]+)/;
  const match = cloudinaryUrl.match(regex);

  if (match) {
    cloudinary.config({
      cloud_name: match[3],
      api_key: match[1],
      api_secret: match[2],
      secure: true
    });
    console.log("Cloudinary configured successfully");
  } else {
    console.error("Invalid CLOUDINARY_URL format");
  }
}
  // --- 1. AUTHENTICATION ---
  router.post('/login', async (req, res) => {
    try {
      await connectToDatabase();
      const { email, password } = req.body;
      const teacher = await Teacher.findOne({ email });

      if (!teacher || teacher.password !== password) {
        return res.status(401).json({ message: "Invalid Credentials" });
      }

      res.json({ 
        _id: teacher._id,
        name: teacher.name, 
        email: teacher.email,
        role: teacher.role,
        profilePhoto: teacher.profilePhoto,
        token: generateToken(teacher._id) 
      });

    } catch (error) {
      res.status(500).json({ message: "Login Error" });
    }
  });

  // --- 2. PROFILE MANAGEMENT ---

  // GET Current Teacher Profile
  router.get('/me', protect, async (req, res) => {
    try {
      const teacher = await Teacher.findById(req.user._id).select('-password');
      res.json(teacher);
    } catch (error) {
      res.status(500).json({ message: "Error fetching profile" });
    }
  });

  // UPDATE Profile (Mobile, Photo, Password only)
  router.put('/update-profile', protect, async (req, res) => {
    try {
      const teacher = await Teacher.findById(req.user._id);
      if (!teacher) return res.status(404).json({ message: "Teacher not found" });

      // 1. CLOUDINARY CLEANUP (Before updating database)
      const newPhoto = req.body.profilePhoto;
      const oldPhoto = req.body.oldProfilePhoto;
      if (newPhoto && oldPhoto && newPhoto !== oldPhoto) {
        if (oldPhoto.includes('cloudinary.com')) {
          // Extract public_id: handles the pathshala_plus/profiles/teachers/filename structure
          const publicId = oldPhoto.split('/').slice(-4).join('/').split('.')[0];
          
          cloudinary.uploader.destroy(publicId)
            .then(result => console.log("Cloudinary Delete Result:", result))
            .catch(err => console.log("Cloudinary Delete Error:", err));
        }
      }

      // 2. UPDATE DATABASE FIELDS
      // 2.1 PASSWORD VERIFICATION LOGIC
      if (req.body.newPassword) {
        // Check if they provided the old password
        if (!req.body.oldPassword) {
          return res.status(400).json({ message: "You must enter your current password to set a new one." });
        }
        
        // Verify the old password matches what is in the database
        if (teacher.password !== req.body.oldPassword) {
          return res.status(400).json({ message: "Incorrect current password. Password not updated." });
        }

        // If it matches, update to the new password
        teacher.password = req.body.newPassword;
      }
      // 2.2 OTHER FIELDS
      if (req.body.mobile) teacher.mobile = req.body.mobile;
      if (newPhoto) teacher.profilePhoto = newPhoto;

      await teacher.save();
      
      res.json({ 
        message: "Profile Updated Successfully",
        teacher: {
          _id: teacher._id,
          name: teacher.name,
          email: teacher.email,
          mobile: teacher.mobile,
          profilePhoto: teacher.profilePhoto
        }
      });

    } catch (error) {
      console.error("Update error:", error);
      res.status(500).json({ message: "Update failed" });
    }
  });

  // --- 3. STUDENT MANAGEMENT ---
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
      res.status(500).json({ message: "Error adding student" });
    }
  });

  router.get('/students', protect, async (req, res) => {
    try {
      await connectToDatabase();
      const { classFilter } = req.query; 
      let query = {};
      if (classFilter) query.class = classFilter;
      const students = await Student.find(query).select('-password').sort({ class: 1, srNo: 1 });
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Error fetching students" });
    }
  });

  // --- 4. POSTS & HOMEWORK ---
  router.post('/post-notice', protect, async (req, res) => {
    try {
      await connectToDatabase();
      const { title, description, type, targetClass, attachmentUrl } = req.body;
      const newPost = new Post({
        title, description, type, targetClass, attachmentUrl,
        createdBy: req.user._id
      });
      await newPost.save();
      res.status(201).json({ message: "Posted Successfully!" });
    } catch (error) {
      res.status(500).json({ message: "Error posting content" });
    }
  });

  router.get('/posts', protect, async (req, res) => {
    try {
      await connectToDatabase();
      let posts;
      if (req.user.role === 'Admin') {
        posts = await Post.find().populate('createdBy', 'name').sort({ createdAt: -1 });
      } else {
        posts = await Post.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
      }
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching posts" });
    }
  });

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

  // --- 5. ADMIN ONLY: MANAGE TEACHERS ---

  // Get All Teachers (for Remove List)
  router.get('/all-teachers', protect, admin, async (req, res) => {
    try {
      await connectToDatabase();
      // Fetch all teachers, sorted by name, excluding passwords
      const teachers = await Teacher.find({}).select('-password').sort({ name: 1 });
      res.json(teachers);
    } catch (error) {
      res.status(500).json({ message: "Error fetching teachers" });
    }
  });

  // Create New Teacher
  router.post('/create-teacher', protect, admin, async (req, res) => {
    try {
      await connectToDatabase();
      const { name, email, password, mobile, role } = req.body;
      
      const exists = await Teacher.findOne({ email });
      if (exists) return res.status(400).json({ message: "Teacher already exists" });

      const teacher = new Teacher({ name, email, password, mobile, role: role || 'Teacher' });
      await teacher.save();
      
      res.status(201).json({ message: "New Teacher Account Created" });
    } catch (error) {
      res.status(500).json({ message: "Error creating teacher" });
    }
  });

  // Delete Teacher
  router.delete('/delete-teacher/:id', protect, admin, async (req, res) => {
    try {
      await connectToDatabase();
      await Teacher.findByIdAndDelete(req.params.id);
      res.json({ message: "Teacher removed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting teacher" });
    }
  });

  // Forgot Password (Mock)
  router.post('/forgot-password', async (req, res) => {
    try {
      await connectToDatabase();
      const { email } = req.body;
      const teacher = await Teacher.findOne({ email });
      if (!teacher) return res.status(404).json({ message: "Email not found" });
      res.json({ message: "Password reset link sent to email (Mock)" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  export default router;