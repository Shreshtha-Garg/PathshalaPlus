import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  // --- Login & Identity ---
  srNo: { type: String, required: true, unique: true }, 
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true }, 
  mobile: { type: String, required: true, unique: true },
  password: { type: String, default: "123456" },
  class: { type: String, required: true },
  profilePhoto: { type: String }, 

  // --- Family & Personal Details ---
  fatherName: { type: String, required: true },
  fatherAadharNo: { type: String }, // <--- ADDED
  motherName: { type: String, required: true },
  motherAadharNo: { type: String }, // <--- ADDED
  
  address: { type: String, required: true },
  dob: { type: String }, // Added Date of Birth as it's standard
  aadharNo: { type: String, required: true }, 
  
  category: { 
    type: String, 
    enum: ['Gen', 'SC', 'ST', 'OBC', 'EWS'],
    required: true 
  },
  
  rationCardType: { 
    type: String, 
    enum: ['APL', 'BPL', 'Antyodaya', 'Annapurna', 'Priority', 'None'], 
    required: true 
  },
  rationCardNo: { type: String }, 

  bankName: { type: String },
  bankIfsc: { type: String },
  bankAccountNo: { type: String },

}, { timestamps: true });

export default mongoose.model('Student', studentSchema);