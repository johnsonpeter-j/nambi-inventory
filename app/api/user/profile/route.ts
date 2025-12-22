import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { findUserByEmail, updateUser } from "@/lib/db";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";

// GET - Get current user profile
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userData = await findUserByEmail(user.email);
    if (!userData) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Return user data without password
    const { password: _, ...userWithoutPassword } = userData;

    return NextResponse.json(
      { data: userWithoutPassword },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const name = formData.get("name") as string | null;
    const profilePic = formData.get("profilePic") as File | null;
    const existingProfilePicUrl = formData.get("existingProfilePicUrl") as string | null;

    // Get current user data
    const currentUser = await findUserByEmail(user.email);
    if (!currentUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const updateData: { name?: string; profilePic?: string } = {};

    // Update name if provided
    if (name !== null && name.trim() !== "") {
      updateData.name = name.trim();
    }

    // Handle profile picture upload
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

        // Delete old profile picture from Cloudinary if it exists
        if (currentUser.profilePic && currentUser.profilePic.includes("cloudinary.com")) {
          try {
            await deleteFromCloudinary(currentUser.profilePic);
          } catch (error) {
            console.error("Error deleting old profile picture:", error);
            // Continue even if deletion fails
          }
        }

        // Convert File to Buffer
        const bytes = await profilePic.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate unique public ID for Cloudinary
        const timestamp = Date.now();
        const publicId = `image_${user.email.replace(/[^a-zA-Z0-9]/g, "_")}_${timestamp}`;

        // Upload to Cloudinary with custom path structure: yarncheck/profile/
        const profilePicUrl = await uploadToCloudinary(buffer, "yarncheck/profile", publicId);
        updateData.profilePic = profilePicUrl;
      } catch (error: any) {
        console.error("Error uploading profile picture to Cloudinary:", error);
        return NextResponse.json(
          { message: "Failed to upload profile picture" },
          { status: 500 }
        );
      }
    }

    // Update user
    const updatedUser = await updateUser(user.email, updateData);

    // Return updated user data without password
    const { password: _, ...userWithoutPassword } = updatedUser;

    return NextResponse.json(
      {
        data: userWithoutPassword,
        message: "Profile updated successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { message: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}

