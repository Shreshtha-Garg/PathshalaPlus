import express from 'express';
import { v2 as cloudinary } from "cloudinary";
import Post from '../models/Post.js';
import Submission from '../models/Submission.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// 1. Cloudinary Configuration
const cloudinaryUrl = process.env.CLOUDINARY_URL;
if (cloudinaryUrl) {
  const regex = /cloudinary:\/\/(\d+):([^@]+)@([^?]+)/;
  const match = cloudinaryUrl.match(regex);
  if (match) {
    cloudinary.config({
      cloud_name: match[3],
      api_key: match[1],
      api_secret: match[2],
      secure: true
    });
  }
}

// Helper function to delete from Cloudinary
const deleteFromCloudinary = async (fileUrl) => {
  if (!fileUrl || !fileUrl.includes('cloudinary.com')) return;
  try {
    const urlParts = fileUrl.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    if (uploadIndex !== -1) {
      const publicIdWithExt = urlParts.slice(uploadIndex + 2).join('/'); 
      const lastDotIndex = publicIdWithExt.lastIndexOf('.');
      const publicId = lastDotIndex !== -1 ? publicIdWithExt.substring(0, lastDotIndex) : publicIdWithExt;

      // Try deleting as raw (PDFs/Docs) and image (JPGs/PNGs)
      let res = await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
      if (res.result === 'not found') {
        await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
      }
    }
  } catch (err) {
    console.error("Cloudinary cron delete error:", err);
  }
};

// 2. The Cron Job Endpoint
router.get('/cleanup', async (req, res) => {
  // SECURITY CHECK: Ensure this request actually came from Vercel
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // 1. Set your generic timeframe here
    const EXPIRATION_DAYS = 7; 
    
    // Calculate the generic cutoff date
    const cutoffDate = new Date(Date.now() - EXPIRATION_DAYS * 24 * 60 * 60 * 1000);

    // Find posts older than the cutoff date
    const oldPosts = await Post.find({ createdAt: { $lt: cutoffDate } });

    for (const post of oldPosts) {
      // A. Delete Post Attachment from Cloudinary
      if (post.attachmentUrl) await deleteFromCloudinary(post.attachmentUrl);

      // B. Find & Delete all Student Submissions for this post
      const submissions = await Submission.find({ postId: post._id });
      for (const sub of submissions) {
        if (sub.fileUrl) await deleteFromCloudinary(sub.fileUrl);
        await Submission.findByIdAndDelete(sub._id);
      }

      // C. Finally, delete the Post from MongoDB
      await Post.findByIdAndDelete(post._id);
    }

    res.status(200).json({ message: `Cleanup success! Deleted ${oldPosts.length} posts.` });
  } catch (error) {
    console.error("Cron Error:", error);
    res.status(500).json({ message: "Cron job failed" });
  }
});

export default router;