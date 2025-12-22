import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { updateUser } from "@/lib/db";
import User from "@/models/User";
import connectDB from "@/lib/mongodb";

// PUT - Change user password
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { newPassword, confirmPassword } = body;

    // Validation
    if (!newPassword || !confirmPassword) {
      return NextResponse.json(
        { message: "New password and confirm password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { message: "Passwords do not match" },
        { status: 400 }
      );
    }

    await connectDB();

    // Get current user
    const currentUser = await User.findOne({ email: user.email });
    if (!currentUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Update password using updateUser function
    // The User model's pre-save hook will automatically hash the password
    await updateUser(user.email, {
      password: newPassword,
    });

    return NextResponse.json(
      { message: "Password changed successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { message: error.message || "Failed to change password" },
      { status: 500 }
    );
  }
}

