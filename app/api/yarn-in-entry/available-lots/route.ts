import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import YarnInEntry from "@/models/YarnInEntry";
import YarnExEntry from "@/models/YarnExEntry";
import { getAuthenticatedUser } from "@/lib/api-auth";
import mongoose from "mongoose";

// GET - Get available lots for a category with available quantities
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
      return NextResponse.json(
        { message: "Valid category ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Get all in-entries for this category
    const inEntries = await YarnInEntry.find({
      categoryId: new mongoose.Types.ObjectId(categoryId),
    }).lean();

    // Get all ex-entries for this category to calculate remaining quantities
    const exEntries = await YarnExEntry.find({
      categoryId: new mongoose.Types.ObjectId(categoryId),
    }).lean();

    // Calculate available quantities for each lot
    const lotMap = new Map<
      string,
      {
        lotNo: string;
        totalBoxes: number;
        totalWeight: number;
        usedWeight: number;
      }
    >();

    // Sum up in-entries (total stock)
    inEntries.forEach((entry) => {
      const key = entry.lotNo;
      if (!lotMap.has(key)) {
        lotMap.set(key, {
          lotNo: key,
          totalBoxes: 0,
          totalWeight: 0,
          usedWeight: 0,
        });
      }
      const lot = lotMap.get(key)!;
      lot.totalBoxes += entry.noOfBoxes;
      lot.totalWeight += entry.weightInKg;
    });

    // Sum up ex-entries (what's been taken out)
    exEntries.forEach((entry) => {
      const key = entry.lotNo;
      if (lotMap.has(key)) {
        const lot = lotMap.get(key)!;
        lot.usedWeight += entry.takingWeightInKg;
      }
    });

    // Format response with available quantities
    const availableLots = Array.from(lotMap.values())
      .map((lot) => {
        const availableWeight = Math.max(0, lot.totalWeight - lot.usedWeight);
        
        // Calculate available boxes based on weight ratio
        let availableBoxes = 0;
        if (lot.totalWeight > 0 && lot.totalBoxes > 0) {
          const avgWeightPerBox = lot.totalWeight / lot.totalBoxes;
          availableBoxes = Math.floor(availableWeight / avgWeightPerBox);
        }

        return {
          lotNo: lot.lotNo,
          availableBoxes: Math.max(0, availableBoxes),
          availableWeightInKg: parseFloat(availableWeight.toFixed(3)),
        };
      })
      .filter((lot) => lot.availableBoxes > 0 || lot.availableWeightInKg > 0)
      .sort((a, b) => a.lotNo.localeCompare(b.lotNo));

    return NextResponse.json(
      {
        data: availableLots,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching available lots:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch available lots" },
      { status: 500 }
    );
  }
}

