import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  email: string;
  name?: string;
  password?: string;
  profilePic?: string;
  role?: mongoose.Types.ObjectId | string; // Reference to Role
  usedResetTokens?: string[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword?(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      select: false, // Don't include password in queries by default
    },
    profilePic: {
      type: String,
    },
    usedResetTokens: {
      type: [String],
      default: [],
      select: false, // Don't include in queries by default
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) {
    return;
  }

  try {
    const password = this.password as string;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(password, salt);
  } catch (error: any) {
    throw error;
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

// Note: email field has unique: true which automatically creates an index
// No need to explicitly create an index for email

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;

