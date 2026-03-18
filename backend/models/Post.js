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
  attachmentName: { type: String },
  
  targetClass: { type: String, default: 'All' },
  
  // Link to Teacher Model
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },

  // Auto delete after 40 days
  createdAt: { type: Date, default: Date.now} 
});

export default mongoose.model('Post', postSchema);