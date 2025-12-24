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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const roleId = searchParams.get("roleId");
    const search = searchParams.get("search");

    // Build query filter
    const queryFilter: any = {};

    // Filter by status (active/inactive based on isDeleted)
    if (status === "active") {
      queryFilter.isDeleted = false;
    } else if (status === "inactive") {
      queryFilter.isDeleted = true;
    }
    // If status is "all" or not provided, don't filter by isDeleted

    // Filter by role
    if (roleId && roleId !== "all") {
      queryFilter.role = roleId;
    }

    // Build search filter
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      const searchConditions: any[] = [
        { name: searchRegex },
        { email: searchRegex },
      ];

      // Also search by role name - find matching roles first
      const matchingRoles = await Role.find({
        name: searchRegex,
      }).select("_id").lean();

      if (matchingRoles.length > 0) {
        const roleIds = matchingRoles.map((r: any) => r._id);
        searchConditions.push({ role: { $in: roleIds } });
      }

      queryFilter.$or = searchConditions;
    }
    
    let users;
    try {
      // Fetch users with filters
      users = await User.find(queryFilter)
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
      users = await User.find(queryFilter).sort({ createdAt: -1 }).lean();
      
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

        // If search is provided, also filter by role name in memory
        if (search && search.trim()) {
          const searchLower = search.trim().toLowerCase();
          users = users.filter((u: any) => {
            const name = (u.name || "").toLowerCase();
            const email = (u.email || "").toLowerCase();
            const roleName = (u.role?.name || "").toLowerCase();
            return (
              name.includes(searchLower) ||
              email.includes(searchLower) ||
              roleName.includes(searchLower)
            );
          });
        }
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

