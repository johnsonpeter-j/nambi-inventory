"use client";

import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";
import { useToast } from "@/hooks/useToast";
import PartyForm, { Party } from "@/components/party/PartyForm";
import PartyList from "@/components/party/PartyList";
import DeleteConfirmModal from "@/components/yarn-category/DeleteConfirmModal";

export default function PartyPage() {
  const toast = useToast();
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingParty, setEditingParty] = useState<Party | null>(null);
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

  // Fetch parties
  const fetchParties = async (search?: string) => {
    try {
      setLoading(true);
      const params: any = {};
      if (search && search.trim()) {
        params.search = search.trim();
      }
      const response = await axiosInstance.get("/party", { params });
      setParties(response.data.data);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to fetch parties"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParties(debouncedSearchQuery);
  }, [debouncedSearchQuery]);

  // Handle form submit
  const handleSubmit = async (data: {
    name: string;
    mobileNo: string;
    emailId: string;
  }) => {
    try {
      setSubmitting(true);

      if (editingParty) {
        // Update existing party
        await axiosInstance.put(`/party/${editingParty.id}`, data);
        toast.success("Party updated successfully");
      } else {
        // Create new party
        await axiosInstance.post("/party", data);
        toast.success("Party created successfully");
      }

      // Reset and close
      setShowForm(false);
      setEditingParty(null);
      fetchParties(debouncedSearchQuery);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to save party"
      );
      throw error; // Re-throw to let form handle it
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = (party: Party) => {
    setEditingParty(party);
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      await axiosInstance.delete(`/party/${id}`);
      toast.success("Party deleted successfully");
      setDeleteConfirm(null);
      fetchParties(debouncedSearchQuery);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to delete party"
      );
    }
  };

  // Cancel form
  const handleCancel = () => {
    setShowForm(false);
    setEditingParty(null);
  };

  // Open form for new party
  const handleAddNew = () => {
    setEditingParty(null);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Party
            </h1>
            <p className="text-slate-500 dark:text-[#92adc9]">
              Manage parties and their contact information
            </p>
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white font-medium transition-colors shadow-md shadow-primary/20"
          >
            <span className="material-symbols-outlined">add</span>
            <span>Add Party</span>
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
                placeholder="Search by name, email, or mobile..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-[#324d67] bg-slate-50 dark:bg-[#101922] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-slate-500 dark:placeholder:text-[#92adc9]"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-[#92adc9] pointer-events-none">
                <span className="material-symbols-outlined text-xl">search</span>
              </span>
            </div>
          </div>
        </div>

        {/* Form Modal */}
        <PartyForm
          show={showForm}
          editingParty={editingParty}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitting={submitting}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          show={!!deleteConfirm}
          onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
          message="Are you sure you want to delete this party? This action cannot be undone."
        />

        {/* Parties List */}
        <PartyList
          parties={parties}
          loading={loading}
          onEdit={handleEdit}
          onDelete={(id) => setDeleteConfirm(id)}
        />
      </div>
    </div>
  );
}

