"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { useToast } from "@/hooks/useToast";
import AccessControl from "@/components/common/AccessControl";
import CustomSelect from "@/components/common/CustomSelect";
import CustomDatePicker from "@/components/common/CustomDatePicker";

interface YarnInEntry {
  id: string;
  entryDate: string;
  categoryId: string;
  categoryName: string;
  lotNo: string;
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

interface LotData {
  lotNo: string;
  totalWeight: number;
  availableWeight: number;
  inEntries: YarnInEntry[];
  exEntries: YarnExEntry[];
}

interface CategoryData {
  categoryId: string;
  categoryName: string;
  lots: Map<string, LotData>;
  totalWeight: number;
  availableWeight: number;
}

interface YarnCategory {
  id: string;
  name: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Map<string, CategoryData>>(
    new Map()
  );
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [yarnCategories, setYarnCategories] = useState<YarnCategory[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("today");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");

  // Fetch yarn categories
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

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, dateFilter, customStartDate, customEndDate]);

  // Calculate date range based on filter
  const getDateRange = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (dateFilter === "custom") {
      if (customStartDate && customEndDate) {
        return {
          startDate: new Date(customStartDate),
          endDate: new Date(customEndDate),
        };
      }
      // If custom is selected but dates not provided, default to today
      return {
        startDate: new Date(today),
        endDate: new Date(today),
      };
    }

    let startDate: Date;
    let endDate: Date = new Date(today);
    endDate.setHours(23, 59, 59, 999);

    switch (dateFilter) {
      case "today":
        startDate = new Date(today);
        break;
      case "currentWeek":
        const dayOfWeek = now.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Monday is start of week
        startDate = new Date(today);
        startDate.setDate(today.getDate() + mondayOffset);
        break;
      case "currentFortnight":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 14);
        break;
      case "currentMonth":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "currentQuarter":
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case "currentHalfYear":
        const half = Math.floor(now.getMonth() / 6);
        startDate = new Date(now.getFullYear(), half * 6, 1);
        break;
      case "currentYear":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        // Default to today if unknown filter
        startDate = new Date(today);
        break;
    }
    startDate.setHours(0, 0, 0, 0);
    return { startDate, endDate };
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params: any = {};
      if (categoryFilter && categoryFilter !== "all") {
        params.categoryId = categoryFilter;
      }
      
      const dateRange = getDateRange();
      if (dateRange) {
        params.startDate = dateRange.startDate.toISOString();
        params.endDate = dateRange.endDate.toISOString();
      }

      const [inEntriesRes, exEntriesRes] = await Promise.all([
        axiosInstance.get("/yarn-in-entry", { params }),
        axiosInstance.get("/yarn-ex-entry", { params }),
      ]);

      const inEntries: YarnInEntry[] = inEntriesRes.data.data;
      const exEntries: YarnExEntry[] = exEntriesRes.data.data;

      // Group by category, then by lot number
      const categoryMap = new Map<string, CategoryData>();

      // Process in-entries
      inEntries.forEach((entry) => {
        if (!categoryMap.has(entry.categoryId)) {
          categoryMap.set(entry.categoryId, {
            categoryId: entry.categoryId,
            categoryName: entry.categoryName,
            lots: new Map(),
            totalWeight: 0,
            availableWeight: 0,
          });
        }

        const category = categoryMap.get(entry.categoryId)!;

        if (!category.lots.has(entry.lotNo)) {
          category.lots.set(entry.lotNo, {
            lotNo: entry.lotNo,
            totalWeight: 0,
            availableWeight: 0,
            inEntries: [],
            exEntries: [],
          });
        }

        const lot = category.lots.get(entry.lotNo)!;
        lot.inEntries.push(entry);
        lot.totalWeight += entry.weightInKg;
        category.totalWeight += entry.weightInKg;
      });

      // Process ex-entries
      exEntries.forEach((entry) => {
        const category = categoryMap.get(entry.categoryId);
        if (category) {
          if (!category.lots.has(entry.lotNo)) {
            category.lots.set(entry.lotNo, {
              lotNo: entry.lotNo,
              totalWeight: 0,
              availableWeight: 0,
              inEntries: [],
              exEntries: [],
            });
          }

          const lot = category.lots.get(entry.lotNo)!;
          lot.exEntries.push(entry);
        }
      });

      // Calculate available weights
      categoryMap.forEach((category) => {
        category.lots.forEach((lot) => {
          const totalOutWeight = lot.exEntries.reduce(
            (sum, entry) => sum + entry.takingWeightInKg,
            0
          );
          lot.availableWeight = Math.max(0, lot.totalWeight - totalOutWeight);
          category.availableWeight += lot.availableWeight;
        });
      });

      setCategories(categoryMap);
      
      // Expand all categories by default
      const allCategoryIds = Array.from(categoryMap.keys());
      setExpandedCategories(new Set(allCategoryIds));
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to fetch dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleLotClick = (lotNo: string) => {
    router.push(`/dashboard/${encodeURIComponent(lotNo)}`);
  };

  if (loading) {
    return (
      <AccessControl>
        <div className="min-h-screen bg-background-light dark:bg-background-dark p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white dark:bg-[#1a232e] rounded-xl shadow-lg dark:shadow-none border border-slate-200 dark:border-[#324d67] p-8 text-center">
              <p className="text-slate-500 dark:text-[#92adc9]">Loading...</p>
            </div>
          </div>
        </div>
      </AccessControl>
    );
  }

  const categoryArray = Array.from(categories.values());

  if (categoryArray.length === 0) {
    return (
      <AccessControl>
        <div className="min-h-screen bg-background-light dark:bg-background-dark p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Dashboard
              </h1>
              <p className="text-slate-500 dark:text-[#92adc9]">
                View inventory by category and lot number
              </p>
            </div>
            <div className="bg-white dark:bg-[#1a232e] rounded-xl shadow-lg dark:shadow-none border border-slate-200 dark:border-[#324d67] p-8 text-center">
              <p className="text-slate-500 dark:text-[#92adc9]">
                No data available
              </p>
            </div>
          </div>
        </div>
      </AccessControl>
    );
  }

  return (
    <AccessControl>
      <div className="min-h-screen bg-background-light dark:bg-background-dark p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Dashboard
            </h1>
            <p className="text-slate-500 dark:text-[#92adc9]">
              View inventory by category and lot number
            </p>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
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
            <div className="w-full sm:w-auto sm:max-w-[200px]">
              <CustomSelect
                name="dateFilter"
                value={dateFilter}
                onChange={(e) => {
                  const { value } = e.target;
                  setDateFilter(value);
                  if (value !== "custom") {
                    setCustomStartDate("");
                    setCustomEndDate("");
                  }
                }}
                options={[
                  { value: "today", label: "Today" },
                  { value: "currentWeek", label: "Current Week" },
                  { value: "currentFortnight", label: "Current Fortnight" },
                  { value: "currentMonth", label: "Current Month" },
                  { value: "currentQuarter", label: "Current Quarter" },
                  { value: "currentHalfYear", label: "Current Half Year" },
                  { value: "currentYear", label: "Current Year" },
                  { value: "custom", label: "Custom Range" },
                ]}
                placeholder="Filter by date"
              />
            </div>
            {dateFilter === "custom" && (
              <>
                <div className="w-full sm:w-auto sm:max-w-[180px]">
                  <label className="block text-sm font-medium text-slate-700 dark:text-white mb-2">
                    Start Date
                  </label>
                  <CustomDatePicker
                    name="customStartDate"
                    value={customStartDate}
                    onChange={(e) => {
                      const { value } = e.target;
                      setCustomStartDate(value);
                    }}
                    max={customEndDate || undefined}
                  />
                </div>
                <div className="w-full sm:w-auto sm:max-w-[180px]">
                  <label className="block text-sm font-medium text-slate-700 dark:text-white mb-2">
                    End Date
                  </label>
                  <CustomDatePicker
                    name="customEndDate"
                    value={customEndDate}
                    onChange={(e) => {
                      const { value } = e.target;
                      setCustomEndDate(value);
                    }}
                    min={customStartDate || undefined}
                  />
                </div>
              </>
            )}
          </div>

          {/* Category Accordions */}
          <div className="space-y-4">
            {categoryArray.map((category) => {
            const isExpanded = expandedCategories.has(category.categoryId);
            const lotsArray = Array.from(category.lots.values()).sort((a, b) =>
              a.lotNo.localeCompare(b.lotNo)
            );

            return (
              <div
                key={category.categoryId}
                className="bg-white dark:bg-[#1a232e] rounded-xl shadow-lg dark:shadow-none border border-slate-200 dark:border-[#324d67] overflow-hidden"
              >
                {/* Accordion Header */}
                <button
                  onClick={() => toggleCategory(category.categoryId)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#101922] transition-colors"
                >
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {category.categoryName}
                  </h2>
                  <span className="material-symbols-outlined text-slate-500 dark:text-[#92adc9] transition-transform">
                    {isExpanded ? "expand_less" : "expand_more"}
                  </span>
                </button>

                {/* Accordion Content */}
                {isExpanded && (
                  <div className="border-t border-slate-200 dark:border-[#324d67]">
                    {/* Summary Row */}
                    <div className="px-6 py-4 flex items-center justify-between bg-slate-50 dark:bg-[#101922]">
                      <div className="text-sm font-medium text-slate-700 dark:text-[#92adc9]">
                        Available Weight in Kgs:{" "}
                        <span className="text-slate-900 dark:text-white font-semibold">
                          {category.availableWeight.toFixed(2)} kg
                        </span>
                      </div>
                      <div className="text-sm font-medium text-slate-700 dark:text-[#92adc9]">
                        Total Weight in Kgs:{" "}
                        <span className="text-slate-900 dark:text-white font-semibold">
                          {category.totalWeight.toFixed(2)} kg
                        </span>
                      </div>
                    </div>

                    {/* Lot Numbers List */}
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {lotsArray.map((lot) => (
                          <div
                            key={lot.lotNo}
                            onClick={() => handleLotClick(lot.lotNo)}
                            className="p-4 rounded-lg border border-slate-200 dark:border-[#324d67] bg-slate-50 dark:bg-[#101922] hover:bg-slate-100 dark:hover:bg-[#0f172a] cursor-pointer transition-colors"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                {lot.lotNo}
                              </h3>
                              <span className="material-symbols-outlined text-slate-500 dark:text-[#92adc9]">
                                chevron_right
                              </span>
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-[#92adc9]">
                                  Available:
                                </span>
                                <span className="text-slate-900 dark:text-white font-medium">
                                  {lot.availableWeight.toFixed(2)} kg
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-[#92adc9]">
                                  Total:
                                </span>
                                <span className="text-slate-900 dark:text-white font-medium">
                                  {lot.totalWeight.toFixed(2)} kg
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
            })}
          </div>
        </div>
      </div>
    </AccessControl>
  );
}
