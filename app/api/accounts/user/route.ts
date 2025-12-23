import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Role from "@/models/Role";
import { getAuthenticatedUser } from "@/lib/api-auth";
import mongoose from "mongoose";

// GET - List all users
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
    
    // Ensure Role model is loaded
    if (!mongoose.models.Role) {
      await import("@/models/Role");
    }
    
    let users;
    try {
      // Fetch all users including deleted ones
      users = await User.find()
        .populate({
          path: "role",
          select: "name",
          model: "Role",
        })
        .sort({ createdAt: -1 })
        .lean();
    } catch (populateError: any) {
      // Fallback: fetch users without populate and manually fetch roles
      console.warn("Populate failed, using fallback:", populateError.message);
      users = await User.find().sort({ createdAt: -1 }).lean();
      
      // Manually fetch roles for users that have role IDs
      const roleIds = users
        .map((u: any) => u.role)
        .filter((id: any) => id && mongoose.Types.ObjectId.isValid(id));
      
      if (roleIds.length > 0) {
        const roles = await Role.find({ _id: { $in: roleIds } }).lean();
        const roleMap = new Map(roles.map((r: any) => [r._id.toString(), r]));
        
        users = users.map((u: any) => {
          if (u.role && roleMap.has(u.role.toString())) {
            u.role = roleMap.get(u.role.toString());
          }
          return u;
        });
      }
    }

    return NextResponse.json(
      {
        data: users.map((user) => ({
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          profilePic: user.profilePic,
          status: user.status || "invited", // Default to "invited" for backward compatibility
          role: user.role
            ? {
                id: typeof user.role === "object" ? user.role._id.toString() : user.role,
                name: typeof user.role === "object" ? user.role.name : null,
              }
            : null,
          isDeleted: user.isDeleted || false,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}

