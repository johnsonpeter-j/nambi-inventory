import mongoose, { Schema, Document, Model } from "mongoose";

export interface IYarnExEntry extends Document {
  entryDate: Date;
  categoryId: mongoose.Types.ObjectId;
  lotNo: string;
  takingWeightInKg: number;
  createdBy: string; // User email or ID
  createdAt: Date;
  updatedAt: Date;
}

const YarnExEntrySchema: Schema = new Schema(
  {
    entryDate: {
      type: Date,
      required: true,
      index: true,
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
    takingWeightInKg: {
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
YarnExEntrySchema.index({ entryDate: 1 });
YarnExEntrySchema.index({ categoryId: 1 });
YarnExEntrySchema.index({ lotNo: 1 });
YarnExEntrySchema.index({ createdBy: 1 });
YarnExEntrySchema.index({ categoryId: 1, lotNo: 1 });

const YarnExEntry: Model<IYarnExEntry> =
  mongoose.models.YarnExEntry ||
  mongoose.model<IYarnExEntry>("YarnExEntry", YarnExEntrySchema);

export default YarnExEntry;

