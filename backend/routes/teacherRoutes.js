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
// Edit Student
  router.put('/edit-student/:id', protect, async (req, res) => {
    try {
      await connectToDatabase();
      
      // Check if updating to an existing srNo or mobile (excluding this specific student)
      const { srNo, mobile } = req.body;
      const existingStudent = await Student.findOne({
        $or: [{ srNo }, { mobile }],
        _id: { $ne: req.params.id } 
      });

      if (existingStudent) {
        return res.status(400).json({ message: "Another student with this SR No. or Mobile already exists." });
      }

      const updatedStudent = await Student.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!updatedStudent) {
        return res.status(404).json({ message: "Student not found" });
      }

      res.json({ message: "Student Updated Successfully!", student: updatedStudent });
    } catch (error) {
      console.error("Error editing student:", error);
      res.status(500).json({ message: "Error editing student" });
    }
  });

  // Delete Student
  router.delete('/delete-student/:id', protect, async (req, res) => {
    try {
      await connectToDatabase();
      const deletedStudent = await Student.findByIdAndDelete(req.params.id);
      
      if (!deletedStudent) {
        return res.status(404).json({ message: "Student not found" });
      }

      res.json({ message: "Student deleted successfully" });
    } catch (error) {
      console.error("Error deleting student:", error);
      res.status(500).json({ message: "Error deleting student" });
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
      // NEW: Extracted attachmentName from req.body
      const { title, description, type, targetClass, attachmentUrl, attachmentName } = req.body;
      
      const newPost = new Post({
        title, 
        description, 
        type, 
        targetClass, 
        attachmentUrl,
        attachmentName, // NEW: Saved to the database document
        createdBy: req.user._id
      });
      
      await newPost.save();
      res.status(201).json({ message: "Posted Successfully!" });
    } catch (error) {
      console.error("Error posting content:", error);
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
  // --- DELETE POST ---
  router.delete('/delete-post/:id', protect, async (req, res) => {
    try {
      await connectToDatabase();
      
      // 1. Find the post
      const post = await Post.findById(req.params.id);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      // 2. Authorization Check: Must be Admin OR the Teacher who created the post
      if (req.user.role !== 'Admin' && post.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized. You can only delete your own posts." });
      }

      // 3. Cloudinary Cleanup (Safely delete the attachment if it exists)
      if (post.attachmentUrl && post.attachmentUrl.includes('cloudinary.com')) {
        try {
          const urlParts = post.attachmentUrl.split('/');
          const uploadIndex = urlParts.findIndex(part => part === 'upload');
          
          if (uploadIndex !== -1) {
            // 1. Get the path after the version number
            const publicIdWithExt = urlParts.slice(uploadIndex + 2).join('/'); 
            
            // 2. FORCE strip the extension (.pdf, .jpg, etc.) to match the exact Public ID
            const lastDotIndex = publicIdWithExt.lastIndexOf('.');
            const publicId = lastDotIndex !== -1 ? publicIdWithExt.substring(0, lastDotIndex) : publicIdWithExt;

            console.log(`Attempting to delete Cloudinary file: ${publicId}`);

            // 3. Double-Tap Delete: Try 'raw' first (new posts)
            let cloudResult = await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
            
            // 4. If not found, it might be an older post uploaded as an 'image'
            if (cloudResult.result === 'not found') {
              console.log("Not found as raw, trying as image...");
              cloudResult = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
            }

            console.log("Final Cloudinary deletion result:", cloudResult);
          }
        } catch (cloudErr) {
          console.error("Cloudinary cleanup error:", cloudErr);
        }
      }

      // 4. Delete the post from the database
      await Post.findByIdAndDelete(req.params.id);
      
      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ message: "Error deleting post" });
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