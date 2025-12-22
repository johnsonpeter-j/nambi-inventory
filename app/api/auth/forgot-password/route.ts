import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/db";
import { generateToken } from "@/lib/jwt";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

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

    // Check if user exists
    const user = await findUserByEmail(email);
    if (!user) {
      // Don't reveal if email exists for security
      return NextResponse.json(
        {
          message: "If the email exists, a password reset link has been sent",
        },
        { status: 200 }
      );
    }

    // Generate reset token (expires in 1 hour)
    const expiresIn = process.env.RESET_EXPIRE_IN || "1h";
    const token = generateToken(
      { email, type: "reset" },
      expiresIn
    );

    // Create reset link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    // Send password reset email
    const companyName = process.env.COMPANY_NAME || "Inventory";
    
    await sendPasswordResetEmail(
      email,
      resetLink,
      companyName,
      expiresIn
    );
    return NextResponse.json(
      {
        message: "If the email exists, a password reset link has been sent",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in forgot-password API:", error);
    return NextResponse.json(
      { message: error.message || "Failed to process request" },
      { status: 500 }
    );
  }
}

