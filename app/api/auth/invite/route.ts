import { NextRequest, NextResponse } from "next/server";
import { generateToken } from "@/lib/jwt";
import { sendRegistrationEmail } from "@/lib/email";
import { findUserByEmail } from "@/lib/db";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
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

    // Check if email already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser && existingUser.password) {
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
    await connectDB();
    if (existingUser) {
      // Update existing user (invited but not registered)
      await User.findByIdAndUpdate(existingUser.id, {
        role: roleId || null,
      });
    } else {
      // Create new user without password (will be set during registration)
      await User.create({
        email: email.toLowerCase(),
        role: roleId || null,
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

    // Send email
    const inviterName = process.env.INVITER_NAME || "Admin";
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

