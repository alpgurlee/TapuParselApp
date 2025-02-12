import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  position: {
    lat: Number,
    lng: Number
  },
  locationInfo: {
    il: String,
    ilce: String,
    mahalle: String,
    ada: String,
    parsel: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Note', NoteSchema);
