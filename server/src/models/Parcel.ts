import mongoose, { Document, Schema } from 'mongoose';

// Not için interface
interface INote {
  content: string;
  createdAt: Date;
  userId: mongoose.Types.ObjectId;
}

// Parsel için interface
export interface IParcel extends Document {
  userId: mongoose.Types.ObjectId;
  il: string;
  ilce: string;
  mahalle: string;
  ada: string;
  parsel: string;
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  notes: INote[];
  createdAt: Date;
  updatedAt: Date;
}

// Not şeması
const noteSchema = new Schema({
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

// Parsel şeması
const parcelSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    il: {
      type: String,
      required: true,
    },
    ilce: {
      type: String,
      required: true,
    },
    mahalle: {
      type: String,
      required: true,
    },
    ada: {
      type: String,
      required: true,
    },
    parsel: {
      type: String,
      required: true,
    },
    geometry: {
      type: {
        type: String,
        enum: ['Polygon'],
        required: true,
      },
      coordinates: {
        type: [[[Number]]],
        required: true,
      },
    },
    notes: [noteSchema],
  },
  {
    timestamps: true,
  }
);

// Geometri için spatial index oluştur
parcelSchema.index({ geometry: '2dsphere' });

// Parsel modelini oluştur ve export et
export default mongoose.model<IParcel>('Parcel', parcelSchema);
