import mongoose from 'mongoose';

const dataSchema = new mongoose.Schema({}, { strict: false }); // Schema flexível
export const P37Model = mongoose.model('P37', dataSchema);