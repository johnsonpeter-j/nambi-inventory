import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import YarnInEntry from "@/models/YarnInEntry";
import { getAuthenticatedUser } from "@/lib/api-auth";
import mongoose from "mongoose";

// GET - Get single yarn in entry by ID
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
    const entry = await YarnInEntry.findById(id)
      .populate("categoryId", "name")
      .populate("partyId", "name")
      .lean();

    if (!entry) {
      return NextResponse.json(
        { message: "Yarn in entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        data: {
          id: entry._id.toString(),
          entryDate: entry.entryDate,
          name: entry.name,
          categoryId: entry.categoryId._id.toString(),
          categoryName: (entry.categoryId as any).name,
          lotNo: entry.lotNo,
          purchaseDate: entry.purchaseDate,
          partyId: entry.partyId._id.toString(),
          partyName: (entry.partyId as any).name,
          noOfBoxes: entry.noOfBoxes,
          weightInKg: entry.weightInKg,
          createdBy: entry.createdBy,
          createdAt: entry.createdAt,
          updatedAt: entry.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching yarn in entry:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch yarn in entry" },
      { status: 500 }
    );
  }
}

// PUT - Update yarn in entry
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
    const {
      entryDate,
      categoryId,
      lotNo,
      purchaseDate,
      partyId,
      noOfBoxes,
      weightInKg,
    } = body;

    await connectDB();
    const entry = await YarnInEntry.findById(id);

    if (!entry) {
      return NextResponse.json(
        { message: "Yarn in entry not found" },
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
    if (purchaseDate !== undefined) {
      entry.purchaseDate = new Date(purchaseDate);
    }
    if (partyId !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(partyId)) {
        return NextResponse.json(
          { message: "Valid party ID is required" },
          { status: 400 }
        );
      }
      entry.partyId = new mongoose.Types.ObjectId(partyId);
    }
    if (noOfBoxes !== undefined) {
      if (noOfBoxes < 0) {
        return NextResponse.json(
          { message: "Number of boxes must be non-negative" },
          { status: 400 }
        );
      }
      entry.noOfBoxes = Number(noOfBoxes);
    }
    if (weightInKg !== undefined) {
      if (weightInKg < 0) {
        return NextResponse.json(
          { message: "Weight in kg must be non-negative" },
          { status: 400 }
        );
      }
      // Validate decimal places (max 3)
      const weightStr = weightInKg.toString();
      const decimalPart = weightStr.includes(".") ? weightStr.split(".")[1] : "";
      if (decimalPart.length > 3) {
        return NextResponse.json(
          { message: "Weight in kg must have at most 3 decimal places" },
          { status: 400 }
        );
      }
      entry.weightInKg = Number(weightInKg);
    }

    await entry.save();
    await entry.populate("categoryId", "name");
    await entry.populate("partyId", "name");

    return NextResponse.json(
      {
        data: {
          id: entry._id.toString(),
          entryDate: entry.entryDate,
          name: entry.name,
          categoryId: entry.categoryId._id.toString(),
          categoryName: (entry.categoryId as any).name,
          lotNo: entry.lotNo,
          purchaseDate: entry.purchaseDate,
          partyId: entry.partyId._id.toString(),
          partyName: (entry.partyId as any).name,
          noOfBoxes: entry.noOfBoxes,
          weightInKg: entry.weightInKg,
          createdBy: entry.createdBy,
          createdAt: entry.createdAt,
          updatedAt: entry.updatedAt,
        },
        message: "Yarn in entry updated successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating yarn in entry:", error);
    return NextResponse.json(
      { message: error.message || "Failed to update yarn in entry" },
      { status: 500 }
    );
  }
}

// DELETE - Delete yarn in entry
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
    const entry = await YarnInEntry.findByIdAndDelete(id);

    if (!entry) {
      return NextResponse.json(
        { message: "Yarn in entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Yarn in entry deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting yarn in entry:", error);
    return NextResponse.json(
      { message: error.message || "Failed to delete yarn in entry" },
      { status: 500 }
    );
  }
}


