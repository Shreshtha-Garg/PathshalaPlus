import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['Notice', 'Homework', 'Material'], 
    required: true 
  },
  
  title: { type: String, required: true },
  description: { type: String },
  
  attachmentUrl: { type: String }, 
  attachmentName: { type: String }, // NEW: Saves the original file name
  
  targetClass: { type: String, default: 'All' },
  
  // Link to Teacher Model
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },

  // Auto delete after 10 days
  createdAt: { type: Date, default: Date.now, expires: 864000 } 
});

export default mongoose.model('Post', postSchema);