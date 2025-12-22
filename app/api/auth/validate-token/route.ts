import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { isResetTokenUsed, findUserByEmail } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { valid: false, message: "Token is required" },
        { status: 400 }
      );
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { valid: false, message: "Invalid or expired token" },
        { status: 200 }
      );
    }

    // For reset tokens, check if they've already been used
    if (decoded.type === "reset") {
      const tokenUsed = await isResetTokenUsed(decoded.email, token);
      if (tokenUsed) {
        return NextResponse.json(
          {
            valid: false,
            message: "This password reset link has already been used",
          },
          { status: 200 }
        );
      }
    }

    // For register tokens, check if user is already registered
    if (decoded.type === "register") {
      const existingUser = await findUserByEmail(decoded.email);
      if (existingUser && existingUser.status === "joined") {
        return NextResponse.json(
          {
            valid: false,
            message: "User is already registered. Please sign in instead.",
          },
          { status: 200 }
        );
      }
    }

    return NextResponse.json(
      {
        valid: true,
        email: decoded.email,
        type: decoded.type,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in validate-token API:", error);
    return NextResponse.json(
      { valid: false, message: error.message || "Token validation failed" },
      { status: 500 }
    );
  }
}

