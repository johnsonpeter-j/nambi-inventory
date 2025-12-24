"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { useToast } from "@/hooks/useToast";
import CustomSelect from "@/components/common/CustomSelect";

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
  updatedAt: string;
}

interface YarnCategory {
  id: string;
  name: string;
}

export default function YarnInPage() {
  const router = useRouter();
  const toast = useToast();
  const [entries, setEntries] = useState<YarnInEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [yarnCategories, setYarnCategories] = useState<YarnCategory[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");

  // Debounce search query - wait 3 seconds after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 3000);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/yarn-category");
        setYarnCategories(response.data.data);
      } catch (error: any) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch entries
  const fetchEntries = async (categoryId?: string, search?: string) => {
    try {
      setLoading(true);
      const params: any = {};
      if (categoryId && categoryId !== "all") {
        params.categoryId = categoryId;
      }
      if (search && search.trim()) {
        params.search = search.trim();
      }
      const response = await axiosInstance.get("/yarn-in-entry", { params });
      setEntries(response.data.data);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to fetch yarn in entries"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries(categoryFilter, debouncedSearchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, debouncedSearchQuery]);


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
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Yarn In
            </h1>
            <p className="text-slate-500 dark:text-[#92adc9]">
              View and manage yarn in entries
            </p>
          </div>
          <button
            onClick={() => router.push("/yarn-in/add")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white font-medium transition-colors shadow-md shadow-primary/20"
          >
            <span className="material-symbols-outlined">add</span>
            <span>Add Entry</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="w-full sm:w-auto sm:max-w-[200px]">
              <CustomSelect
                name="categoryFilter"
                value={categoryFilter}
                onChange={(e) => {
                  const { value } = e.target;
                  setCategoryFilter(value);
                }}
                options={[
                  { value: "all", label: "All Categories" },
                  ...yarnCategories.map((cat) => ({
                    value: cat.id,
                    label: cat.name,
                  })),
                ]}
                placeholder="Filter by category"
              />
            </div>
          </div>
          <div className="w-full sm:w-auto sm:max-w-lg">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by lot no, category, or party..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-[#324d67] bg-slate-50 dark:bg-[#101922] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-slate-500 dark:placeholder:text-[#92adc9]"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-[#92adc9] pointer-events-none">
                <span className="material-symbols-outlined text-xl">search</span>
              </span>
            </div>
          </div>
        </div>

        {/* Entries List */}
        {entries.length === 0 ? (
          <div className="bg-white dark:bg-[#1a232e] rounded-xl shadow-lg dark:shadow-none border border-slate-200 dark:border-[#324d67] p-8 text-center">
            <span className="material-symbols-outlined text-6xl text-slate-400 dark:text-[#64748b] mb-4">
              inventory_2
            </span>
            <p className="text-slate-500 dark:text-[#92adc9] text-lg mb-2">
              No entries found
            </p>
            <p className="text-slate-400 dark:text-[#64748b] text-sm">
              Click "Add Entry" to create your first yarn in entry
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white dark:bg-[#1a232e] rounded-xl shadow-lg dark:shadow-none border border-slate-200 dark:border-[#324d67] p-6 hover:shadow-xl transition-shadow"
              >
                {/* Category */}
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400 dark:text-[#64748b] text-lg">
                      category
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 dark:text-[#92adc9]">
                        Category
                      </p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {entry.categoryName}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Lot No */}
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400 dark:text-[#64748b] text-lg">
                      tag
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 dark:text-[#92adc9]">
                        Lot No
                      </p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {entry.lotNo}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Party */}
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400 dark:text-[#64748b] text-lg">
                      groups
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 dark:text-[#92adc9]">
                        Party
                      </p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {entry.partyName}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Entry Date */}
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400 dark:text-[#64748b] text-lg">
                      event
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 dark:text-[#92adc9]">
                        Entry Date
                      </p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {new Date(entry.entryDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Purchase Date */}
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400 dark:text-[#64748b] text-lg">
                      shopping_cart
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 dark:text-[#92adc9]">
                        Purchase Date
                      </p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {new Date(entry.purchaseDate).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Boxes and Weight */}
                <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-slate-200 dark:border-[#324d67]">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-[#92adc9]">
                      Boxes
                    </p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {entry.noOfBoxes}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-[#92adc9]">
                      Weight (kg)
                    </p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {entry.weightInKg.toFixed(3)}
                    </p>
                  </div>
                </div>

                {/* Created By */}
                <div className="pt-4 border-t border-slate-200 dark:border-[#324d67]">
                  <p className="text-xs text-slate-500 dark:text-[#92adc9]">
                    Created by {entry.createdByName || entry.createdBy}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

