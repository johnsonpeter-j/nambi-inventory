import { NextRequest, NextResponse } from "next/server";
import { generateToken } from "@/lib/jwt";
import { sendRegistrationEmail } from "@/lib/email";
import { findUserByEmail } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/api-auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const authenticatedUser = await getAuthenticatedUser(request);
    if (!authenticatedUser) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get inviter's details
    const inviter = await findUserByEmail(authenticatedUser.email);
    if (!inviter) {
      return NextResponse.json(
        { message: "Inviter not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { email, roleId } = body;

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if email already exists (including deleted users)
    await connectDB();
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser && existingUser.password && !existingUser.isDeleted) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 400 }
      );
    }

    // Validate roleId if provided
    if (roleId && !mongoose.Types.ObjectId.isValid(roleId)) {
      return NextResponse.json(
        { message: "Invalid role ID" },
        { status: 400 }
      );
    }

    // Create or update user with role
    if (existingUser) {
      // Update existing user (invited but not registered, or restore deleted user)
      const updateData: any = {
        isDeleted: false, // Restore if deleted
      };
      
      // Only update role if roleId is explicitly provided, otherwise preserve existing role
      if (roleId !== undefined) {
        updateData.role = roleId || null;
      }
      
      // Only set status to invited if user hasn't joined (doesn't have password)
      if (!existingUser.password) {
        updateData.status = "invited";
      }
      await User.findByIdAndUpdate(existingUser._id, updateData);
    } else {
      // Create new user without password (will be set during registration)
      await User.create({
        email: email.toLowerCase(),
        role: roleId || null,
        status: "invited",
        isDeleted: false,
      });
    }

    // Generate JWT token with expiry from env
    const expiresIn = process.env.REGISTER_EXPIRE_IN || "7d";
    const token = generateToken(
      { email, type: "register" },
      expiresIn
    );

    // Create registration link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const registrationLink = `${baseUrl}/register?token=${token}`;

    // Send email with actual inviter's name
    const inviterName = inviter.name || inviter.email || "Admin";
    const companyName = process.env.COMPANY_NAME || "Inventory";
    
    await sendRegistrationEmail(
      email,
      registrationLink,
      inviterName,
      companyName
    );

    return NextResponse.json(
      {
        message: "Registration invitation sent successfully",
        email,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in invite API:", error);
    return NextResponse.json(
      { message: error.message || "Failed to send invitation" },
      { status: 500 }
    );
  }
}

