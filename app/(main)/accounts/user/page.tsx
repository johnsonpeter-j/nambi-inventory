"use client";

import { useState, useEffect, useRef } from "react";
import axiosInstance from "@/lib/axios";
import { useToast } from "@/hooks/useToast";
import UserList from "@/components/user/UserList";
import InviteUserPopover from "@/components/user/InviteUserPopover";
import EditUserModal from "@/components/user/EditUserModal";
import DeleteConfirmModal from "@/components/yarn-category/DeleteConfirmModal";

export interface User {
  id: string;
  email: string;
  name?: string;
  profilePic?: string;
  status?: "invited" | "joined";
  role?: {
    id: string;
    name: string;
  } | null;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function UserPage() {
  const toast = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvitePopover, setShowInvitePopover] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inviteButtonRef = useRef<HTMLButtonElement>(null);

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/accounts/user");
      setUsers(response.data.data);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to fetch users"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch roles
  const fetchRoles = async () => {
    try {
      const response = await axiosInstance.get("/accounts/role");
      setRoles(response.data.data.map((role: any) => ({
        id: role.id,
        name: role.name,
      })));
    } catch (error: any) {
      console.error("Failed to fetch roles:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  // Handle invite user
  const handleInvite = async (data: { email: string; roleId: string }) => {
    try {
      setSubmitting(true);
      await axiosInstance.post("/auth/invite", {
        email: data.email,
        roleId: data.roleId || undefined,
      });
      toast.success("Invitation sent successfully");
      setShowInvitePopover(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to send invitation"
      );
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  // Handle invite again
  const handleInviteAgain = async (email: string) => {
    try {
      setSubmitting(true);
      await axiosInstance.post("/auth/invite", { email });
      toast.success("Invitation sent successfully");
      fetchUsers();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to send invitation"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit user role
  const handleEdit = (user: User) => {
    setEditingUser(user);
  };

  // Handle update user role
  const handleUpdateRole = async (userId: string, roleId: string) => {
    try {
      setSubmitting(true);
      await axiosInstance.put(`/accounts/user/${userId}`, {
        roleId: roleId || null,
      });
      toast.success("User role updated successfully");
      setEditingUser(null);
      fetchUsers();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to update user role"
      );
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      await axiosInstance.delete(`/accounts/user/${id}`);
      toast.success("User deleted successfully");
      setDeleteConfirm(null);
      fetchUsers();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to delete user"
      );
    }
  };

  // Handle recover user
  const handleRecover = async (id: string) => {
    try {
      setSubmitting(true);
      await axiosInstance.patch(`/accounts/user/${id}`);
      toast.success("User recovered successfully");
      fetchUsers();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to recover user"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inviteButtonRef.current &&
        !inviteButtonRef.current.contains(event.target as Node) &&
        showInvitePopover &&
        !(event.target as Element).closest('[data-invite-popover]')
      ) {
        setShowInvitePopover(false);
      }
    };

    if (showInvitePopover) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showInvitePopover]);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              User
            </h1>
            <p className="text-slate-500 dark:text-[#92adc9]">
              Manage users and their access
            </p>
          </div>
          <div className="relative">
            <button
              ref={inviteButtonRef}
              onClick={() => setShowInvitePopover(!showInvitePopover)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white font-medium transition-colors shadow-md shadow-primary/20"
            >
              <span className="material-symbols-outlined">person_add</span>
              <span>Invite User</span>
            </button>

            {/* Invite User Popover */}
            {showInvitePopover && (
              <InviteUserPopover
                roles={roles}
                onSubmit={handleInvite}
                onCancel={() => setShowInvitePopover(false)}
                submitting={submitting}
              />
            )}
          </div>
        </div>

        {/* Edit User Modal */}
        <EditUserModal
          show={!!editingUser}
          user={editingUser}
          roles={roles}
          onSubmit={handleUpdateRole}
          onCancel={() => setEditingUser(null)}
          submitting={submitting}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          show={!!deleteConfirm}
          onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
          message="Are you sure you want to delete this user? This action cannot be undone."
        />

        {/* Users List */}
        <UserList
          users={users}
          loading={loading}
          onInviteAgain={handleInviteAgain}
          onEdit={handleEdit}
          onDelete={(id) => setDeleteConfirm(id)}
          onRecover={handleRecover}
        />
      </div>
    </div>
  );
}

