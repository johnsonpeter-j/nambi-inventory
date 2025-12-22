import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import YarnExEntry from "@/models/YarnExEntry";
import YarnCategory from "@/models/YarnCategory"; // Import for populate
import { getAuthenticatedUser } from "@/lib/api-auth";
import mongoose from "mongoose";

// GET - Get single yarn ex entry by ID
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
        { message: "Invalid entry ID" },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Ensure models are registered for populate (access to trigger registration)
    void YarnCategory;
    
    const entry = await YarnExEntry.findById(id)
      .populate("categoryId", "name")
      .lean();

    if (!entry) {
      return NextResponse.json(
        { message: "Yarn ex entry not found" },
        { status: 404 }
      );
    }

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
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching yarn ex entry:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch yarn ex entry" },
      { status: 500 }
    );
  }
}

// PUT - Update yarn ex entry
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
        { message: "Invalid entry ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { entryDate, categoryId, lotNo, takingWeightInKg } = body;

    await connectDB();
    
    // Ensure models are registered for populate (access to trigger registration)
    void YarnCategory;
    
    const entry = await YarnExEntry.findById(id);

    if (!entry) {
      return NextResponse.json(
        { message: "Yarn ex entry not found" },
        { status: 404 }
      );
    }

    // Update fields
    if (entryDate !== undefined) {
      entry.entryDate = new Date(entryDate);
    }
    if (categoryId !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return NextResponse.json(
          { message: "Valid category ID is required" },
          { status: 400 }
        );
      }
      entry.categoryId = new mongoose.Types.ObjectId(categoryId);
    }
    if (lotNo !== undefined) {
      if (!lotNo || !lotNo.trim()) {
        return NextResponse.json(
          { message: "Lot number is required" },
          { status: 400 }
        );
      }
      entry.lotNo = lotNo.trim();
    }
    if (takingWeightInKg !== undefined) {
      if (takingWeightInKg < 0) {
        return NextResponse.json(
          { message: "Taking weight in kg must be non-negative" },
          { status: 400 }
        );
      }
      // Validate decimal places (max 3)
      const weightStr = takingWeightInKg.toString();
      const decimalPart = weightStr.includes(".") ? weightStr.split(".")[1] : "";
      if (decimalPart.length > 3) {
        return NextResponse.json(
          { message: "Taking weight in kg must have at most 3 decimal places" },
          { status: 400 }
        );
      }
      entry.takingWeightInKg = Number(takingWeightInKg);
    }

    await entry.save();
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
        message: "Yarn ex entry updated successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating yarn ex entry:", error);
    return NextResponse.json(
      { message: error.message || "Failed to update yarn ex entry" },
      { status: 500 }
    );
  }
}

// DELETE - Delete yarn ex entry
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
        { message: "Invalid entry ID" },
        { status: 400 }
      );
    }

    await connectDB();
    const entry = await YarnExEntry.findByIdAndDelete(id);

    if (!entry) {
      return NextResponse.json(
        { message: "Yarn ex entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Yarn ex entry deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting yarn ex entry:", error);
    return NextResponse.json(
      { message: error.message || "Failed to delete yarn ex entry" },
      { status: 500 }
    );
  }
}

