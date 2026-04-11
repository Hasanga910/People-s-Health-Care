import mongoose from 'mongoose';

const holidaySchema = new mongoose.Schema({

  date:     { type: String, required: true, unique: true },
 reason:   { type: String, default: '' },
  

  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  

}, { timestamps: true });




export default mongoose.model('Holiday', holidaySchema);