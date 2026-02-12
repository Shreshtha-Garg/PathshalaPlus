import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student', 
    required: true 
  },
  
  // Which homework is this for?
  postId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Post', 
    required: true 
  },
  
  // The photo/PDF the student uploaded
  fileUrl: { type: String, required: true },
  
  // Optional: Teacher's remarks (Good, Redo, etc.)
  remarks: { type: String },
  
  submittedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Submission', submissionSchema);