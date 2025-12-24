"use client";

import { useState, useEffect, useRef } from "react";
import axiosInstance from "@/lib/axios";
import { useToast } from "@/hooks/useToast";
import UserList from "@/components/user/UserList";
import InviteUserPopover from "@/components/user/InviteUserPopover";
import EditUserModal from "@/components/user/EditUserModal";
import DeleteConfirmModal from "@/components/yarn-category/DeleteConfirmModal";
import CustomSelect from "@/components/common/CustomSelect";

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
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const inviteButtonRef = useRef<HTMLButtonElement>(null);

  // Debounce search query - wait 3 seconds after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 3000);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch users
  const fetchUsers = async (status?: string, roleId?: string, search?: string) => {
    try {
      setLoading(true);
      const params: any = {};
      if (status && status !== "all") {
        params.status = status;
      }
      if (roleId && roleId !== "all") {
        params.roleId = roleId;
      }
      if (search && search.trim()) {
        params.search = search.trim();
      }
      const response = await axiosInstance.get("/accounts/user", { params });
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
    fetchRoles();
  }, []);

  // Fetch users when status filter, role filter, or debounced search query changes
  useEffect(() => {
    fetchUsers(statusFilter, roleFilter, debouncedSearchQuery);
  }, [statusFilter, roleFilter, debouncedSearchQuery]);

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

        {/* Filter Bar */}
        <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="w-full sm:w-auto sm:max-w-[180px]">
              <CustomSelect
                name="statusFilter"
                value={statusFilter}
                onChange={(e) => {
                  const { value } = e.target;
                  setStatusFilter(value);
                }}
                options={[
                  { value: "all", label: "All Users" },
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
                placeholder="Filter by status"
              />
            </div>
            <div className="w-full sm:w-auto sm:max-w-[180px]">
              <CustomSelect
                name="roleFilter"
                value={roleFilter}
                onChange={(e) => {
                  const { value } = e.target;
                  setRoleFilter(value);
                }}
                options={[
                  { value: "all", label: "All Roles" },
                  ...roles.map((role) => ({
                    value: role.id,
                    label: role.name,
                  })),
                ]}
                placeholder="Filter by role"
              />
            </div>
          </div>
          <div className="w-full sm:w-auto sm:max-w-lg">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or role..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-[#324d67] bg-slate-50 dark:bg-[#101922] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-slate-500 dark:placeholder:text-[#92adc9]"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-[#92adc9] pointer-events-none">
                <span className="material-symbols-outlined text-xl">search</span>
              </span>
            </div>
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

