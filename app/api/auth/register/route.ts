import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { findUserByEmail, createUser, updateUser } from "@/lib/db";
import { generateToken } from "@/lib/jwt";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const token = formData.get("token") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;
    const profilePic = formData.get("profilePic") as File | null;

    if (!token) {
      return NextResponse.json(
        { message: "Token is required" },
        { status: 400 }
      );
    }

    // Validate token
    const decoded = verifyToken(token);
    if (!decoded || decoded.type !== "register") {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 400 }
      );
    }

    const email = decoded.email;

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser && existingUser.password) {
      return NextResponse.json(
        { message: "User already registered" },
        { status: 400 }
      );
    }

    // Handle profile picture upload
    let profilePicUrl: string | undefined;
    if (profilePic && profilePic instanceof File) {
      try {
        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), "public", "uploads");
        if (!existsSync(uploadsDir)) {
          await mkdir(uploadsDir, { recursive: true });
        }

        // Generate unique filename to avoid conflicts
        const timestamp = Date.now();
        const fileExtension = profilePic.name.split(".").pop();
        const uniqueFileName = `${email.replace(/[^a-zA-Z0-9]/g, "_")}_${timestamp}.${fileExtension}`;
        const filePath = join(uploadsDir, uniqueFileName);

        // Convert File to Buffer and save
        const bytes = await profilePic.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Store the URL path (relative to public folder)
        profilePicUrl = `/uploads/${uniqueFileName}`;
      } catch (error: any) {
        console.error("Error saving profile picture:", error);
        // Continue without profile picture if upload fails
        profilePicUrl = undefined;
      }
    }

    // Create or update user
    let user;
    if (existingUser) {
      // Update existing user (in case they were invited but didn't complete registration)
      user = await updateUser(email, {
        password,
        name,
        profilePic: profilePicUrl,
      });
    } else {
      // Create new user
      user = await createUser({
        email,
        password,
        name,
        profilePic: profilePicUrl,
      });
    }

    // Generate JWT token for login
    const authToken = generateToken(
      { email: user.email, type: "auth" },
      "30d"
    );

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        token: authToken,
        user: userWithoutPassword,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in register API:", error);
    return NextResponse.json(
      { message: error.message || "Registration failed" },
      { status: 500 }
    );
  }
}

