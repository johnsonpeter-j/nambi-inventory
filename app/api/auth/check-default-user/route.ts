import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/db";
import { generateToken } from "@/lib/jwt";
import { sendRegistrationEmail } from "@/lib/email";
import connectDB from "@/lib/mongodb";
import Role from "@/models/Role";
import User from "@/models/User";
import { IRolePermissions } from "@/models/Role";

// Helper function to get or create admin role with all permissions
async function getOrCreateAdminRole(): Promise<string> {
  await connectDB();
  
  // Check if admin role exists
  let adminRole = await Role.findOne({ name: "Admin" });
  
  if (!adminRole) {
    // Create admin role with all permissions
    const allPermissions: IRolePermissions = {
      dashboard: {
        view: true,
      },
      inEntry: {
        create: true,
      },
      outEntry: {
        create: true,
      },
      master: {
        category: {
          view: true,
          create: true,
          edit: true,
          delete: true,
        },
        party: {
          view: true,
          create: true,
          edit: true,
          delete: true,
        },
      },
      accounts: {
        user: {
          view: true,
          create: true,
          edit: true,
          delete: true,
        },
        role: {
          view: true,
          create: true,
          edit: true,
          delete: true,
        },
      },
    };

    adminRole = await Role.create({
      name: "Admin",
      permissions: allPermissions,
      createdBy: "system", // System-created role
    });
    
    console.log("Admin role created with all permissions");
  }
  
  return adminRole._id.toString();
}

export async function GET(request: NextRequest) {
  try {
    const defaultUserEmail = process.env.DEFAULT_USER_EMAIL;

    if (!defaultUserEmail) {
      return NextResponse.json(
        { message: "DEFAULT_USER_EMAIL not configured" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user exists
    const existingUser = await findUserByEmail(defaultUserEmail);
    const userExists = !!existingUser;

    // Get or create admin role
    const adminRoleId = await getOrCreateAdminRole();

    if (userExists) {
      // If user exists but doesn't have admin role, assign it
      if (existingUser) {
        await User.findByIdAndUpdate(existingUser.id, {
          role: adminRoleId,
        });
      }
      
      return NextResponse.json(
        {
          message: "Default user already exists",
          email: defaultUserEmail,
          exists: true,
        },
        { status: 200 }
      );
    }

    // User doesn't exist, create user with admin role and send invitation
    try {
      // Create user with admin role
      await User.create({
        email: defaultUserEmail.toLowerCase(),
        role: adminRoleId,
        status: "invited",
      });

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

