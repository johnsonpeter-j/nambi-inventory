import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/db";
import { generateToken } from "@/lib/jwt";
import { sendRegistrationEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  try {
    const defaultUserEmail = process.env.DEFAULT_USER_EMAIL;

    if (!defaultUserEmail) {
      return NextResponse.json(
        { message: "DEFAULT_USER_EMAIL not configured" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await findUserByEmail(defaultUserEmail);
    const userExists = !!existingUser;

    if (userExists) {
      return NextResponse.json(
        {
          message: "Default user already exists",
          email: defaultUserEmail,
          exists: true,
        },
        { status: 200 }
      );
    }

    // User doesn't exist, send invitation
    try {
      // Generate JWT token with expiry from env
      const expiresIn = process.env.REGISTER_EXPIRE_IN || "7d";
      const token = generateToken(
        { email: defaultUserEmail, type: "register" },
        expiresIn
      );

      // Create registration link
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      const registrationLink = `${baseUrl}/register?token=${token}`;

      // Send email
      const inviterName = process.env.INVITER_NAME || "Admin";
      const companyName = process.env.COMPANY_NAME || "Inventory";
      
      await sendRegistrationEmail(
        defaultUserEmail,
        registrationLink,
        inviterName,
        companyName
      );

      return NextResponse.json(
        {
          message: "Default user invitation sent",
          email: defaultUserEmail,
          exists: false,
        },
        { status: 200 }
      );
    } catch (inviteError: any) {
      console.error("Error sending invitation:", inviteError);
      return NextResponse.json(
        {
          message: "Failed to invite default user",
          error: inviteError.message,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error in check-default-user API:", error);
    return NextResponse.json(
      { message: error.message || "Failed to check default user" },
      { status: 500 }
    );
  }
}

