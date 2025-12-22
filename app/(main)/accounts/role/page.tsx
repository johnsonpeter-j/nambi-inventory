"use client";

import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";
import { useToast } from "@/hooks/useToast";
import RoleForm, { Role } from "@/components/role/RoleForm";
import RoleList from "@/components/role/RoleList";
import RoleViewModal from "@/components/role/RoleViewModal";
import DeleteConfirmModal from "@/components/yarn-category/DeleteConfirmModal";

export default function RolePage() {
  const toast = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingRole, setViewingRole] = useState<Role | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch roles
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/accounts/role");
      setRoles(response.data.data);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to fetch roles"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Handle form submit
  const handleSubmit = async (data: {
    name: string;
    permissions: any;
  }) => {
    try {
      setSubmitting(true);

      if (editingRole) {
        // Update existing role
        await axiosInstance.put(`/accounts/role/${editingRole.id}`, data);
        toast.success("Role updated successfully");
      } else {
        // Create new role
        await axiosInstance.post("/accounts/role", data);
        toast.success("Role created successfully");
      }

      // Reset and close
      setShowForm(false);
      setEditingRole(null);
      fetchRoles();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to save role"
      );
      throw error; // Re-throw to let form handle it
    } finally {
      setSubmitting(false);
    }
  };

  // Handle view
  const handleView = (role: Role) => {
    setViewingRole(role);
    setShowViewModal(true);
  };

  // Handle edit
  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      await axiosInstance.delete(`/accounts/role/${id}`);
      toast.success("Role deleted successfully");
      setDeleteConfirm(null);
      fetchRoles();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to delete role"
      );
    }
  };

  // Cancel form
  const handleCancel = () => {
    setShowForm(false);
    setEditingRole(null);
  };

  // Open form for new role
  const handleAddNew = () => {
    setEditingRole(null);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Role
            </h1>
            <p className="text-slate-500 dark:text-[#92adc9]">
              Manage roles and their permissions
            </p>
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white font-medium transition-colors shadow-md shadow-primary/20"
          >
            <span className="material-symbols-outlined">add</span>
            <span>Add Role</span>
          </button>
        </div>

        {/* Form Modal */}
        <RoleForm
          show={showForm}
          editingRole={editingRole}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitting={submitting}
        />

        {/* View Modal */}
        <RoleViewModal
          show={showViewModal}
          role={viewingRole}
          onClose={() => {
            setShowViewModal(false);
            setViewingRole(null);
          }}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          show={!!deleteConfirm}
          onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
          message="Are you sure you want to delete this role? This action cannot be undone."
        />

        {/* Roles List */}
        <RoleList
          roles={roles}
          loading={loading}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={(id) => setDeleteConfirm(id)}
        />
      </div>
    </div>
  );
}

