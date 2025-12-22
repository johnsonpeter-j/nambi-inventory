import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import YarnExEntry from "@/models/YarnExEntry";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { findUserByEmail } from "@/lib/db";
import mongoose from "mongoose";

// GET - List all yarn ex entries
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
    const entries = await YarnExEntry.find()
      .populate("categoryId", "name")
      .sort({ entryDate: -1, createdAt: -1 })
      .lean();

    // Get unique creator emails
    const creatorEmails = [...new Set(entries.map((entry) => entry.createdBy))];
    
    // Fetch all users and create a map
    const userMap = new Map<string, string>();
    for (const email of creatorEmails) {
      const userData = await findUserByEmail(email);
      if (userData) {
        userMap.set(email, userData.name || email);
      } else {
        userMap.set(email, email);
      }
    }

    return NextResponse.json(
      {
        data: entries.map((entry) => ({
          id: entry._id.toString(),
          entryDate: entry.entryDate,
          categoryId: entry.categoryId._id.toString(),
          categoryName: (entry.categoryId as any).name,
          lotNo: entry.lotNo,
          takingWeightInKg: entry.takingWeightInKg,
          createdBy: entry.createdBy,
          createdByName: userMap.get(entry.createdBy) || entry.createdBy,
          createdAt: entry.createdAt,
          updatedAt: entry.updatedAt,
        })),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching yarn ex entries:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch yarn ex entries" },
      { status: 500 }
    );
  }
}

// POST - Create new yarn ex entry
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
    const { entryDate, categoryId, lotNo, takingWeightInKg } = body;

    // Validation
    if (!entryDate) {
      return NextResponse.json(
        { message: "Entry date is required" },
        { status: 400 }
      );
    }

    if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
      return NextResponse.json(
        { message: "Valid category ID is required" },
        { status: 400 }
      );
    }

    if (!lotNo || !lotNo.trim()) {
      return NextResponse.json(
        { message: "Lot number is required" },
        { status: 400 }
      );
    }

    if (takingWeightInKg === undefined || takingWeightInKg === null || takingWeightInKg < 0) {
      return NextResponse.json(
        { message: "Taking weight in kg must be a non-negative number" },
        { status: 400 }
      );
    }

    // Validate takingWeightInKg decimal places (max 3)
    const weightStr = takingWeightInKg.toString();
    const decimalPart = weightStr.includes(".") ? weightStr.split(".")[1] : "";
    if (decimalPart.length > 3) {
      return NextResponse.json(
        { message: "Taking weight in kg must have at most 3 decimal places" },
        { status: 400 }
      );
    }

    await connectDB();
    const entry = new YarnExEntry({
      entryDate: new Date(entryDate),
      categoryId: new mongoose.Types.ObjectId(categoryId),
      lotNo: lotNo.trim(),
      takingWeightInKg: Number(takingWeightInKg),
      createdBy: user.email,
    });

    await entry.save();

    // Populate for response
    await entry.populate("categoryId", "name");

    return NextResponse.json(
      {
        data: {
          id: entry._id.toString(),
          entryDate: entry.entryDate,
          categoryId: entry.categoryId._id.toString(),
          categoryName: (entry.categoryId as any).name,
          lotNo: entry.lotNo,
          takingWeightInKg: entry.takingWeightInKg,
          createdBy: entry.createdBy,
          createdAt: entry.createdAt,
          updatedAt: entry.updatedAt,
        },
        message: "Yarn ex entry created successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating yarn ex entry:", error);
    return NextResponse.json(
      { message: error.message || "Failed to create yarn ex entry" },
      { status: 500 }
    );
  }
}

