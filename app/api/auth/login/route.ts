import { NextRequest, NextResponse } from "next/server";
import { verifyUserPassword } from "@/lib/db";
import { generateToken } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Verify user credentials
    const user = await verifyUserPassword(email, password);

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken(
      { email: user.email, type: "auth" },
      "30d"
    );

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        token,
        user: userWithoutPassword,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in login API:", error);
    return NextResponse.json(
      { message: error.message || "Login failed" },
      { status: 500 }
    );
  }
}

