import mongoose, { Document, Schema } from 'mongoose';

// Not için interface
interface INote {
  content: string;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
}

// Koordinat interface'leri
interface IPoint {
  type: 'Point';
  coordinates: [number, number];
}

interface IPolygon {
  type: 'Polygon';
  coordinates: number[][][];
}

// Parsel için interface
export interface IParcel extends Document {
  il: string;
  ilce: string;
  mahalle: string;
  ada: string;
  coordinates: IPolygon;
  center: IPoint;
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
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Parsel şeması
const parcelSchema = new Schema(
  {
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
    coordinates: {
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
    center: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    notes: [noteSchema],
  },
  {
    timestamps: true,
  }
);

// Geospatial indexler
parcelSchema.index({ coordinates: '2dsphere' });
parcelSchema.index({ center: '2dsphere' });

const Parcel = mongoose.model<IParcel>('Parcel', parcelSchema);

export default Parcel;
