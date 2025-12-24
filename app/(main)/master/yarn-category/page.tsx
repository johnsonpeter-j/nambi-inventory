"use client";

import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";
import { useToast } from "@/hooks/useToast";
import AccessControl from "@/components/common/AccessControl";
import YarnCategoryForm, {
  YarnCategory,
} from "@/components/yarn-category/YarnCategoryForm";
import YarnCategoryList from "@/components/yarn-category/YarnCategoryList";
import DeleteConfirmModal from "@/components/yarn-category/DeleteConfirmModal";

export default function YarnCategoryPage() {
  const toast = useToast();
  const [categories, setCategories] = useState<YarnCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<YarnCategory | null>(
    null
  );
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
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
  const fetchCategories = async (search?: string) => {
    try {
      setLoading(true);
      const params: any = {};
      if (search && search.trim()) {
        params.search = search.trim();
      }
      const response = await axiosInstance.get("/yarn-category", { params });
      setCategories(response.data.data);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to fetch yarn categories"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(debouncedSearchQuery);
  }, [debouncedSearchQuery]);

  // Handle form submit
  const handleSubmit = async (data: {
    name: string;
    description?: string;
    noOfCones: number;
    weightPerBox: number;
  }) => {
    try {
      setSubmitting(true);

      if (editingCategory) {
        // Update existing category
        await axiosInstance.put(`/yarn-category/${editingCategory.id}`, data);
        toast.success("Yarn category updated successfully");
      } else {
        // Create new category
        await axiosInstance.post("/yarn-category", data);
        toast.success("Yarn category created successfully");
      }

      // Reset and close
      setShowForm(false);
      setEditingCategory(null);
      fetchCategories(debouncedSearchQuery);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to save yarn category"
      );
      throw error; // Re-throw to let form handle it
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = (category: YarnCategory) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      await axiosInstance.delete(`/yarn-category/${id}`);
      toast.success("Yarn category deleted successfully");
      setDeleteConfirm(null);
      fetchCategories(debouncedSearchQuery);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to delete yarn category"
      );
    }
  };

  // Cancel form
  const handleCancel = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  // Open form for new category
  const handleAddNew = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  return (
    <AccessControl>
      <div className="min-h-screen bg-background-light dark:bg-background-dark p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Yarn Category
            </h1>
            <p className="text-slate-500 dark:text-[#92adc9]">
              Manage yarn categories and their cone counts
            </p>
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white font-medium transition-colors shadow-md shadow-primary/20"
          >
            <span className="material-symbols-outlined">add</span>
            <span>Add Category</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6 flex justify-end">
          <div className="w-full sm:w-auto sm:max-w-lg">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or description..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-[#324d67] bg-slate-50 dark:bg-[#101922] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-slate-500 dark:placeholder:text-[#92adc9]"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-[#92adc9] pointer-events-none">
                <span className="material-symbols-outlined text-xl">search</span>
              </span>
            </div>
          </div>
        </div>

        {/* Form Modal */}
        <YarnCategoryForm
          show={showForm}
          editingCategory={editingCategory}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitting={submitting}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          show={!!deleteConfirm}
          onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
          message="Are you sure you want to delete this yarn category? This action cannot be undone."
        />

        {/* Categories List */}
        <YarnCategoryList
          categories={categories}
          loading={loading}
          onEdit={handleEdit}
          onDelete={(id) => setDeleteConfirm(id)}
        />
        </div>
      </div>
    </AccessControl>
  );
}
