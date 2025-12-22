import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { findUserByEmail, createUser, updateUser } from "@/lib/db";
import { generateToken } from "@/lib/jwt";
import { uploadToCloudinary } from "@/lib/cloudinary";

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

    // Handle profile picture upload to Cloudinary
    let profilePicUrl: string | undefined;
    if (profilePic && profilePic instanceof File) {
      try {
        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (profilePic.size > maxSize) {
          return NextResponse.json(
            { message: "Profile picture must be less than 5MB" },
            { status: 400 }
          );
        }

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (!allowedTypes.includes(profilePic.type)) {
          return NextResponse.json(
            { message: "Profile picture must be a JPEG, PNG, or WebP image" },
            { status: 400 }
          );
        }

        // Convert File to Buffer
        const bytes = await profilePic.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate unique public ID for Cloudinary (will be stored as yarncheck/profile/image.png)
        const timestamp = Date.now();
        const publicId = `image_${email.replace(/[^a-zA-Z0-9]/g, "_")}_${timestamp}`;

        // Upload to Cloudinary with custom path structure: yarncheck/profile/
        profilePicUrl = await uploadToCloudinary(buffer, "yarncheck/profile", publicId);
      } catch (error: any) {
        console.error("Error uploading profile picture to Cloudinary:", error);
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

