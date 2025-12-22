"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { useToast } from "@/hooks/useToast";

interface YarnInEntry {
  id: string;
  entryDate: string;
  categoryId: string;
  categoryName: string;
  lotNo: string;
  purchaseDate: string;
  partyId: string;
  partyName: string;
  noOfBoxes: number;
  weightInKg: number;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
}

interface YarnExEntry {
  id: string;
  entryDate: string;
  categoryId: string;
  categoryName: string;
  lotNo: string;
  takingWeightInKg: number;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
}

export default function LotDetailPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [lotNumber, setLotNumber] = useState<string>("");
  const [inEntries, setInEntries] = useState<YarnInEntry[]>([]);
  const [exEntries, setExEntries] = useState<YarnExEntry[]>([]);
  const [categoryName, setCategoryName] = useState<string>("");
  const [totalWeight, setTotalWeight] = useState<number>(0);
  const [availableWeight, setAvailableWeight] = useState<number>(0);

  useEffect(() => {
    if (params.lotNumber) {
      const decodedLotNo = decodeURIComponent(
        params.lotNumber as string
      );
      setLotNumber(decodedLotNo);
      fetchLotData(decodedLotNo);
    }
  }, [params]);

  const fetchLotData = async (lotNo: string) => {
    try {
      setLoading(true);
      const [inEntriesRes, exEntriesRes] = await Promise.all([
        axiosInstance.get("/yarn-in-entry"),
        axiosInstance.get("/yarn-ex-entry"),
      ]);

      const allInEntries: YarnInEntry[] = inEntriesRes.data.data;
      const allExEntries: YarnExEntry[] = exEntriesRes.data.data;

      // Filter entries for this lot number
      const lotInEntries = allInEntries.filter(
        (entry) => entry.lotNo === lotNo
      );
      const lotExEntries = allExEntries.filter(
        (entry) => entry.lotNo === lotNo
      );

      setInEntries(lotInEntries);
      setExEntries(lotExEntries);

      if (lotInEntries.length > 0) {
        setCategoryName(lotInEntries[0].categoryName);
      }

      // Calculate totals
      const total = lotInEntries.reduce(
        (sum, entry) => sum + entry.weightInKg,
        0
      );
      const totalOut = lotExEntries.reduce(
        (sum, entry) => sum + entry.takingWeightInKg,
        0
      );

      setTotalWeight(total);
      setAvailableWeight(Math.max(0, total - totalOut));
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to fetch lot data"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-[#1a232e] rounded-xl shadow-lg dark:shadow-none border border-slate-200 dark:border-[#324d67] p-8 text-center">
            <p className="text-slate-500 dark:text-[#92adc9]">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Lot Number: {lotNumber}
              </h1>
              {categoryName && (
                <p className="text-slate-500 dark:text-[#92adc9]">
                  Category: {categoryName}
                </p>
              )}
            </div>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-[#324d67] bg-white dark:bg-[#1a232e] text-slate-700 dark:text-[#92adc9] hover:bg-slate-50 dark:hover:bg-[#101922] hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              <span>Back</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-[#1a232e] rounded-xl shadow-lg dark:shadow-none border border-slate-200 dark:border-[#324d67] p-6">
            <div className="text-sm text-slate-600 dark:text-[#92adc9] mb-1">
              Total Weight
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {totalWeight.toFixed(2)} kg
            </div>
          </div>
          <div className="bg-white dark:bg-[#1a232e] rounded-xl shadow-lg dark:shadow-none border border-slate-200 dark:border-[#324d67] p-6">
            <div className="text-sm text-slate-600 dark:text-[#92adc9] mb-1">
              Available Weight
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {availableWeight.toFixed(2)} kg
            </div>
          </div>
          <div className="bg-white dark:bg-[#1a232e] rounded-xl shadow-lg dark:shadow-none border border-slate-200 dark:border-[#324d67] p-6">
            <div className="text-sm text-slate-600 dark:text-[#92adc9] mb-1">
              Total Transactions
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {inEntries.length + exEntries.length}
            </div>
          </div>
        </div>

        {/* In Entries Section */}
        <div className="bg-white dark:bg-[#1a232e] rounded-xl shadow-lg dark:shadow-none border border-slate-200 dark:border-[#324d67] p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            In Entries ({inEntries.length})
          </h2>
          {inEntries.length === 0 ? (
            <p className="text-slate-500 dark:text-[#92adc9] text-center py-8">
              No in entries found
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 rounded-lg border border-slate-200 dark:border-[#324d67] bg-slate-50 dark:bg-[#101922] hover:bg-slate-100 dark:hover:bg-[#0f172a] transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-lg">
                          input
                        </span>
                        <span className="text-sm font-medium text-slate-600 dark:text-[#92adc9]">
                          Entry Date
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {formatDate(entry.entryDate)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-lg">
                          shopping_cart
                        </span>
                        <span className="text-sm font-medium text-slate-600 dark:text-[#92adc9]">
                          Purchase Date
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {formatDate(entry.purchaseDate)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-lg">
                          groups
                        </span>
                        <span className="text-sm font-medium text-slate-600 dark:text-[#92adc9]">
                          Party
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white text-right">
                        {entry.partyName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-lg">
                          inventory_2
                        </span>
                        <span className="text-sm font-medium text-slate-600 dark:text-[#92adc9]">
                          Boxes
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {entry.noOfBoxes}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-lg">
                          scale
                        </span>
                        <span className="text-sm font-medium text-slate-600 dark:text-[#92adc9]">
                          Weight
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {entry.weightInKg.toFixed(3)} kg
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 dark:border-[#324d67]">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 dark:text-[#64748b]">
                          Created By
                        </span>
                        <span className="text-xs text-slate-600 dark:text-[#92adc9]">
                          {entry.createdByName || entry.createdBy}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Out Entries Section */}
        <div className="bg-white dark:bg-[#1a232e] rounded-xl shadow-lg dark:shadow-none border border-slate-200 dark:border-[#324d67] p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Out Entries ({exEntries.length})
          </h2>
          {exEntries.length === 0 ? (
            <p className="text-slate-500 dark:text-[#92adc9] text-center py-8">
              No out entries found
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 rounded-lg border border-slate-200 dark:border-[#324d67] bg-slate-50 dark:bg-[#101922] hover:bg-slate-100 dark:hover:bg-[#0f172a] transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-lg">
                          output
                        </span>
                        <span className="text-sm font-medium text-slate-600 dark:text-[#92adc9]">
                          Entry Date
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {formatDate(entry.entryDate)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-lg">
                          scale
                        </span>
                        <span className="text-sm font-medium text-slate-600 dark:text-[#92adc9]">
                          Taking Weight
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {entry.takingWeightInKg.toFixed(3)} kg
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 dark:border-[#324d67]">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 dark:text-[#64748b]">
                          Created By
                        </span>
                        <span className="text-xs text-slate-600 dark:text-[#92adc9]">
                          {entry.createdByName || entry.createdBy}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

