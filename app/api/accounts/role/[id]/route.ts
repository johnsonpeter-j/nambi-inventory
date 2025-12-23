import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Role from "@/models/Role";
import User from "@/models/User";
import { getAuthenticatedUser } from "@/lib/api-auth";
import mongoose from "mongoose";

// GET - Get single role by ID
export async function GET(
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
        { message: "Invalid role ID" },
        { status: 400 }
      );
    }

    await connectDB();
    const role = await Role.findById(id).lean();

    if (!role) {
      return NextResponse.json(
        { message: "Role not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        data: {
          id: role._id.toString(),
          name: role.name,
          permissions: role.permissions,
          createdBy: role.createdBy,
          createdAt: role.createdAt,
          updatedAt: role.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching role:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch role" },
      { status: 500 }
    );
  }
}

// PUT - Update role
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

    if (!id) {
      return NextResponse.json(
        { message: "Role ID is required" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid role ID format" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, permissions } = body;

    await connectDB();
    const role = await Role.findById(id);

    if (!role) {
      return NextResponse.json(
        { message: "Role not found" },
        { status: 404 }
      );
    }

    // Prevent editing Admin role
    if (role.name === "Admin") {
      return NextResponse.json(
        { message: "Admin role cannot be edited" },
        { status: 403 }
      );
    }

    // Update fields
    if (name !== undefined) {
      if (!name || !name.trim()) {
        return NextResponse.json(
          { message: "Name is required" },
          { status: 400 }
        );
      }
      role.name = name.trim();
    }
    if (permissions !== undefined) {
      if (!permissions || typeof permissions !== "object") {
        return NextResponse.json(
          { message: "Permissions must be an object" },
          { status: 400 }
        );
      }
      role.permissions = permissions;
    }

    await role.save();

    return NextResponse.json(
      {
        data: {
          id: role._id.toString(),
          name: role.name,
          permissions: role.permissions,
          createdBy: role.createdBy,
          createdAt: role.createdAt,
          updatedAt: role.updatedAt,
        },
        message: "Role updated successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating role:", error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "A role with this name already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: error.message || "Failed to update role" },
      { status: 500 }
    );
  }
}

// DELETE - Delete role
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
        { message: "Invalid role ID" },
        { status: 400 }
      );
    }

    await connectDB();
    const role = await Role.findById(id);

    if (!role) {
      return NextResponse.json(
        { message: "Role not found" },
        { status: 404 }
      );
    }

    // Prevent deleting Admin role
    if (role.name === "Admin") {
      return NextResponse.json(
        { message: "Admin role cannot be deleted" },
        { status: 403 }
      );
    }

    // Check if any active users are using this role
    const usersWithRole = await User.find({
      role: id,
      isDeleted: { $ne: true },
    }).lean();

    if (usersWithRole.length > 0) {
      const userCount = usersWithRole.length;
      return NextResponse.json(
        {
          message: `Cannot delete role. This role is currently assigned to ${userCount} active user${userCount > 1 ? "s" : ""}. Please reassign or remove the role from users before deleting.`,
        },
        { status: 400 }
      );
    }

    await Role.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Role deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting role:", error);
    return NextResponse.json(
      { message: error.message || "Failed to delete role" },
      { status: 500 }
    );
  }
}

