import mongoose, { Schema, Document, Model } from "mongoose";

export interface IYarnInEntry extends Document {
  entryDate: Date;
  name?: string;
  categoryId: mongoose.Types.ObjectId;
  lotNo: string;
  purchaseDate: Date;
  partyId: mongoose.Types.ObjectId;
  noOfBoxes: number;
  weightInKg: number;
  createdBy: string; // User email or ID
  createdAt: Date;
  updatedAt: Date;
}

const YarnInEntrySchema: Schema = new Schema(
  {
    entryDate: {
      type: Date,
      required: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "YarnCategory",
      required: true,
      index: true,
    },
    lotNo: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    purchaseDate: {
      type: Date,
      required: true,
    },
    partyId: {
      type: Schema.Types.ObjectId,
      ref: "Party",
      required: true,
      index: true,
    },
    noOfBoxes: {
      type: Number,
      required: true,
      min: 0,
    },
    weightInKg: {
      type: Number,
      required: true,
      min: 0,
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
YarnInEntrySchema.index({ entryDate: 1 });
YarnInEntrySchema.index({ categoryId: 1 });
YarnInEntrySchema.index({ partyId: 1 });
YarnInEntrySchema.index({ lotNo: 1 });
YarnInEntrySchema.index({ createdBy: 1 });

const YarnInEntry: Model<IYarnInEntry> =
  mongoose.models.YarnInEntry ||
  mongoose.model<IYarnInEntry>("YarnInEntry", YarnInEntrySchema);

export default YarnInEntry;


