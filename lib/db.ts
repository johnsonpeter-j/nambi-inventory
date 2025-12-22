// Database utility file using MongoDB with Mongoose
import connectDB from "./mongodb";
import User, { IUser } from "@/models/User";
import crypto from "crypto";

export interface UserData {
  id: string;
  email: string;
  name?: string;
  password?: string;
  profilePic?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Convert IUser to UserData
function convertUser(user: IUser | null): UserData | null {
  if (!user) return null;
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    password: user.password,
    profilePic: user.profilePic,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function findUserByEmail(email: string): Promise<UserData | null> {
  try {
    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase() });
    return convertUser(user);
  } catch (error) {
    console.error("Error finding user by email:", error);
    throw error;
  }
}

export async function createUser(data: {
  email: string;
  name?: string;
  password?: string;
  profilePic?: string;
}): Promise<UserData> {
  try {
    await connectDB();
    const user = await User.create({
      email: data.email.toLowerCase(),
      name: data.name,
      password: data.password,
      profilePic: data.profilePic,
    });
    return convertUser(user)!;
  } catch (error: any) {
    console.error("Error creating user:", error);
    if (error.code === 11000) {
      throw new Error("Email already exists");
    }
    throw error;
  }
}

export async function updateUser(
  email: string,
  data: Partial<UserData>
): Promise<UserData> {
  try {
    await connectDB();
    
    // Find the user first
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      throw new Error("User not found");
    }

    // Update fields (excluding id and email)
    if (data.name !== undefined) {
      user.name = data.name;
    }
    if (data.password !== undefined) {
      // Setting password will trigger the pre-save hook to hash it
      user.password = data.password;
    }
    if (data.profilePic !== undefined) {
      user.profilePic = data.profilePic;
    }

    // Save the user (this will trigger the pre-save hook for password hashing)
    await user.save();

    return convertUser(user)!;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

// Hash token for storage
function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// Check if reset token has been used
export async function isResetTokenUsed(
  email: string,
  token: string
): Promise<boolean> {
  try {
    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+usedResetTokens"
    ) as IUser | null;

    if (!user || !user.usedResetTokens) {
      return false;
    }

    const tokenHash = hashToken(token);
    return user.usedResetTokens.includes(tokenHash);
  } catch (error) {
    console.error("Error checking reset token:", error);
    return true; // If error, assume token is used for security
  }
}

// Mark reset token as used
export async function markResetTokenAsUsed(
  email: string,
  token: string
): Promise<void> {
  try {
    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+usedResetTokens"
    ) as IUser | null;

    if (!user) {
      throw new Error("User not found");
    }

    const tokenHash = hashToken(token);
    
    // Add token hash to used tokens array
    if (!user.usedResetTokens) {
      user.usedResetTokens = [];
    }
    
    if (!user.usedResetTokens.includes(tokenHash)) {
      user.usedResetTokens.push(tokenHash);
      
      // Keep only last 10 used tokens to prevent array from growing too large
      if (user.usedResetTokens.length > 10) {
        user.usedResetTokens = user.usedResetTokens.slice(-10);
      }
      
      await user.save();
    }
  } catch (error) {
    console.error("Error marking reset token as used:", error);
    throw error;
  }
}

export async function findUserById(id: string): Promise<UserData | null> {
  try {
    await connectDB();
    const user = await User.findById(id);
    return convertUser(user);
  } catch (error) {
    console.error("Error finding user by id:", error);
    throw error;
  }
}

export async function verifyUserPassword(
  email: string,
  password: string
): Promise<UserData | null> {
  try {
    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user || !user.password) {
      return null;
    }

    if (!user.comparePassword) {
      return null;
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return null;
    }

    // Remove password from response
    user.password = undefined;
    return convertUser(user);
  } catch (error) {
    console.error("Error verifying user password:", error);
    throw error;
  }
}

