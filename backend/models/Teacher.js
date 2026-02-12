import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobile: { type: String, required: true },
  
  // Just in case another teacher is added later
  role: { type: String, default: 'Admin' }, 
}, { timestamps: true });

export default mongoose.model('Teacher', teacherSchema);