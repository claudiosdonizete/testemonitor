import mongoose from 'mongoose';

const P37DetailSchema = new mongoose.Schema({
    idcontabil: { type: String, required: true },
    status: { type: String, required: true },
    legenda: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  });
  
  export const P37DetailModel = mongoose.model('P37Detail', P37DetailSchema);