import mongoose from 'mongoose';

const configSchema = new mongoose.Schema({

  morningSessionStart: { type: String, default: '07:00' },
  eveningSessionStart: { type: String, default: '17:00' },
  minutesPerPatient:   { type: Number, default: 3 },

}, { timestamps: true });

export default mongoose.model('Config', configSchema);