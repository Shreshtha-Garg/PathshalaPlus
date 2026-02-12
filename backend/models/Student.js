import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  // --- Login & Identity ---
  srNo: { type: String, required: true, unique: true }, // Scholar Register No (Main ID)
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true }, // For Google Login
  mobile: { type: String, required: true, unique: true },
  password: { type: String, default: "123456" },
  class: { type: String, required: true },
  profilePhoto: { type: String }, 

  // --- Family & Personal Details ---
  fatherName: { type: String, required: true },
  motherName: { type: String, required: true },
  address: { type: String, required: true },
  aadharNo: { type: String, required: true }, 
  category: { 
    type: String, 
    enum: ['Gen', 'SC', 'ST', 'OBC', 'Other'],
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