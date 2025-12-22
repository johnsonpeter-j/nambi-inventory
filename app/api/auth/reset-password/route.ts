import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import {
  findUserByEmail,
  updateUser,
  isResetTokenUsed,
  markResetTokenAsUsed,
} from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { message: "Token and password are required" },
        { status: 400 }
      );
    }

    // Validate password
    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Validate token
    const decoded = verifyToken(token);
    if (!decoded || decoded.type !== "reset") {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 400 }
      );
    }

    const email = decoded.email;

    // Check if user exists
    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Check if this token has already been used
    const tokenUsed = await isResetTokenUsed(email, token);
    if (tokenUsed) {
      return NextResponse.json(
        { message: "This password reset link has already been used. Please request a new one." },
        { status: 400 }
      );
    }

    // Update password
    await updateUser(email, { password });

    // Mark token as used after successful password reset
    await markResetTokenAsUsed(email, token);

    return NextResponse.json(
      { message: "Password reset successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in reset-password API:", error);
    return NextResponse.json(
      { message: error.message || "Failed to reset password" },
      { status: 500 }
    );
  }
}

