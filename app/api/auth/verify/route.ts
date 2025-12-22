import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { findUserByEmail } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { valid: false, message: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { valid: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Only accept auth tokens for verification
    if (decoded.type !== "auth") {
      return NextResponse.json(
        { valid: false, message: "Invalid token type" },
        { status: 401 }
      );
    }

    // Check if user exists in database
    const user = await findUserByEmail(decoded.email);
    if (!user) {
      return NextResponse.json(
        { valid: false, message: "User not found" },
        { status: 401 }
      );
    }

    // Return user data
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        valid: true,
        user: userWithoutPassword,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in verify API:", error);
    return NextResponse.json(
      { valid: false, message: error.message || "Token verification failed" },
      { status: 500 }
    );
  }
}

