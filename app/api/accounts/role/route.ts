import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Role from "@/models/Role";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { findUserByEmail } from "@/lib/db";

// GET - List all roles
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    // Build query filter
    const queryFilter: any = {};

    // Build search filter
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      queryFilter.name = searchRegex;
    }

    const roles = await Role.find(queryFilter)
      .sort({ createdAt: -1 })
      .lean();

    // Get unique creator emails
    const creatorEmails = [...new Set(roles.map((role) => role.createdBy))];
    
    // Fetch all users and create a map
    const userMap = new Map<string, string>();
    for (const email of creatorEmails) {
      const userData = await findUserByEmail(email);
      if (userData) {
        userMap.set(email, userData.name || email);
      } else {
        userMap.set(email, email); // Fallback to email if user not found
      }
    }

    return NextResponse.json(
      {
        data: roles.map((role) => ({
          id: role._id.toString(),
          name: role.name,
          permissions: role.permissions,
          createdBy: role.createdBy,
          createdByName: userMap.get(role.createdBy) || role.createdBy,
          createdAt: role.createdAt,
          updatedAt: role.updatedAt,
        })),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching roles:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch roles" },
      { status: 500 }
    );
  }
}

// POST - Create new role
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, permissions } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { message: "Name is required" },
        { status: 400 }
      );
    }

    if (!permissions || typeof permissions !== "object") {
      return NextResponse.json(
        { message: "Permissions are required" },
        { status: 400 }
      );
    }

    await connectDB();
    const role = new Role({
      name: name.trim(),
      permissions: permissions,
      createdBy: user.email,
    });

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
        message: "Role created successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating role:", error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "A role with this name already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: error.message || "Failed to create role" },
      { status: 500 }
    );
  }
}


