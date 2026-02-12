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
  targetClass: { type: String, default: 'All' },
  // auto delete after 10 days (864000 seconds) - can be adjusted as needed
  createdAt: { type: Date, default: Date.now, expires: 864000 } 
});

export default mongoose.model('Post', postSchema);