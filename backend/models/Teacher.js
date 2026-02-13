import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobile: { type: String, required: true },
  profilePhoto: { 
    type: String, 
    default: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" // Default Avatar
  },
  // Just in case another teacher is added later
  role: { type: String, default: 'Teacher' }, 
}, { timestamps: true });

export default mongoose.model('Teacher', teacherSchema);