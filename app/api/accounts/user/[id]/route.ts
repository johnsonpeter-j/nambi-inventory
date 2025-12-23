import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { getAuthenticatedUser } from "@/lib/api-auth";
import mongoose from "mongoose";

// PUT - Update user role
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid user ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { roleId } = body;

    // Validate roleId if provided
    if (roleId && !mongoose.Types.ObjectId.isValid(roleId)) {
      return NextResponse.json(
        { message: "Invalid role ID" },
        { status: 400 }
      );
    }

    await connectDB();
    const updatedUser = await User.findOneAndUpdate(
      { _id: id, isDeleted: { $ne: true } },
      { role: roleId || null },
      { new: true }
    )
      .populate({
        path: "role",
        select: "name",
        model: "Role",
      })
      .lean();

    if (!updatedUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Handle role data with proper type checking
    let roleData = null;
    if (updatedUser.role) {
      if (typeof updatedUser.role === "object" && updatedUser.role !== null && "_id" in updatedUser.role) {
        roleData = {
          id: (updatedUser.role as any)._id.toString(),
          name: (updatedUser.role as any).name || null,
        };
      } else if (typeof updatedUser.role === "string") {
        roleData = {
          id: updatedUser.role,
          name: null,
        };
      }
    }

    return NextResponse.json(
      {
        message: "User updated successfully",
        data: {
          id: updatedUser._id.toString(),
          email: updatedUser.email,
          name: updatedUser.name,
          profilePic: updatedUser.profilePic,
          status: updatedUser.status || "invited",
          role: roleData,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: error.message || "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid user ID" },
        { status: 400 }
      );
    }

    await connectDB();
    const userToDelete = await User.findById(id);

    if (!userToDelete) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // If user hasn't joined yet (status is "invited"), hard delete from database
    // If user has joined (status is "joined"), soft delete (set isDeleted flag)
    if (userToDelete.status === "invited" || !userToDelete.status) {
      // Hard delete: remove from database
      await User.findByIdAndDelete(id);
    } else {
      // Soft delete: set isDeleted flag to preserve data integrity
      // (joined users may have created entries in dashboard)
      userToDelete.isDeleted = true;
      await userToDelete.save();
    }

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { message: error.message || "Failed to delete user" },
      { status: 500 }
    );
  }
}

// PATCH - Recover deleted user
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid user ID" },
        { status: 400 }
      );
    }

    await connectDB();
    const userToRecover = await User.findById(id);

    if (!userToRecover) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    if (!userToRecover.isDeleted) {
      return NextResponse.json(
        { message: "User is not deleted" },
        { status: 400 }
      );
    }

    // Recover user: set isDeleted to false
    userToRecover.isDeleted = false;
    await userToRecover.save();

    return NextResponse.json(
      { message: "User recovered successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error recovering user:", error);
    return NextResponse.json(
      { message: error.message || "Failed to recover user" },
      { status: 500 }
    );
  }
}

