"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { AppShell } from "../../../components/AppShell";
import { useAuth } from "../../../context/AuthContext";
import { useTranslations } from "next-intl";
import {
  UploadSimple,
  LockKey,
  Buildings,
  Users,
  Plus,
  Trash,
  ToggleLeft,
  ToggleRight,
  CheckCircle,
  XCircle,
  UserGear,
  PencilSimple,
  MagnifyingGlass,
  ArrowsClockwise,
  ShieldWarning,
  CaretLeft,
  CaretRight,
  CaretUpDown,
  X,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import {
  UserService,
  UserItem,
  CreateUserInput,
  UpdateUserInput,
} from "../../../lib/userService";
import { handleApiError } from "../../../lib/axios";

export default function AccountSettingsPage() {
  const tProfile = useTranslations("profile");
  const { user: authUser } = useAuth();
  const roleLower = authUser?.role?.toLowerCase();
  const isAdmin = roleLower === "admin" || roleLower === "superadmin";
  const isSuperAdmin = roleLower === "superadmin";

  const [activeTab, setActiveTab] = useState<"account" | "users">("account");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ───────────────────────────────────────────────────────────────────────────
  //  State: Admin User Management
  // ───────────────────────────────────────────────────────────────────────────
  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Filters with Search Debouncing
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [blockedFilter, setBlockedFilter] = useState<string>("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Modals state
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Keyboard Escape listener to close open modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowAddUserModal(false);
        setShowEditUserModal(false);
        setShowDeleteModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Active user selections for Modals
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [togglingBlockId, setTogglingBlockId] = useState<number | null>(null);

  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newUserForm, setNewUserForm] = useState<CreateUserInput>({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const [editUserForm, setEditUserForm] = useState<UpdateUserInput>({
    name: "",
    email: "",
    role: "user",
  });

  // Photo Upload & Password Update State (User Account Tab)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  const [companyData, setCompanyData] = useState({
    legalAddress: "14 Dostyk Ave, Medeu District, Almaty 050010, Kazakhstan",
    officialEmail: "compliance@pharma.kz",
    additionalAddress: "28 Mangilik El Ave, Astana 010000, Kazakhstan",
    corporatePhone: "+7 (7172) 79-88-00",
  });

  // Current logged in user profile display data
  const currentUserData = useMemo(() => {
    if (authUser) {
      return {
        id: authUser.id,
        name: authUser.name || "User",
        email: authUser.email,
        role: authUser.role || "user",
      };
    }
    return {
      id: 0,
      name: "User",
      email: "user@example.com",
      role: "user",
    };
  }, [authUser]);

  // ───────────────────────────────────────────────────────────────────────────
  //  Fetch Users from Backend REST API
  // ───────────────────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    if (!authUser) return;
    setLoadingUsers(true);
    try {
      const isBlockedParam =
        blockedFilter === "blocked" ? true : blockedFilter === "active" ? false : undefined;

      const data = await UserService.listUsers({
        page,
        limit,
        search: debouncedSearch || undefined,
        role: (roleFilter as "user" | "admin" | "superadmin") || undefined,
        isBlocked: isBlockedParam,
      });

      setUsersList(data.users);
      setPagination(data.pagination);
    } catch (error) {
      handleApiError(error, "Failed to load user list");
    } finally {
      setLoadingUsers(false);
    }
  }, [authUser, page, limit, debouncedSearch, roleFilter, blockedFilter]);

  useEffect(() => {
    if (activeTab === "users" && authUser) {
      fetchUsers();
    }
  }, [fetchUsers, activeTab, authUser]);

  // ───────────────────────────────────────────────────────────────────────────
  //  Handlers: Admin User Actions
  // ───────────────────────────────────────────────────────────────────────────
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.email) {
      toast.error("Email address is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateUserInput = {
        name: newUserForm.name?.trim() || undefined,
        email: newUserForm.email.trim(),
        role: newUserForm.role,
        ...(newUserForm.password ? { password: newUserForm.password } : {}),
      };

      await UserService.createUser(payload);

      toast.success("User created successfully.");
      setShowAddUserModal(false);
      setNewUserForm({ name: "", email: "", password: "", role: "user" });
      fetchUsers();
    } catch (error) {
      handleApiError(error, "Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditModal = (user: UserItem) => {
    setSelectedUser(user);
    setEditUserForm({
      name: user.name || "",
      email: user.email,
      role: user.role,
    });
    setShowEditUserModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      await UserService.updateUser(selectedUser.id, {
        name: editUserForm.name?.trim() || undefined,
        email: editUserForm.email?.trim() || undefined,
        role: editUserForm.role,
      });

      toast.success(`User ${selectedUser.email} updated successfully.`);
      setShowEditUserModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      handleApiError(error, "Failed to update user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleBlockStatus = async (user: UserItem) => {
    if (authUser?.id === user.id) {
      toast.error("You cannot block your own account.");
      return;
    }

    if (togglingBlockId === user.id) return;

    const previousState = user.isBlocked;
    const nextState = !previousState;

    // 1. Optimistic Update: instantly update UI locally
    setUsersList((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, isBlocked: nextState } : u))
    );
    setTogglingBlockId(user.id);

    try {
      if (previousState) {
        await UserService.unblockUser(user.id);
        toast.success(`User ${user.email} has been unblocked.`);
      } else {
        await UserService.blockUser(user.id);
        toast.warning(`User ${user.email} blocked. Active sessions revoked.`);
      }
    } catch (error) {
      // 2. Revert back if API fails
      setUsersList((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isBlocked: previousState } : u))
      );
      handleApiError(error, "Failed to update user block status");
    } finally {
      setTogglingBlockId(null);
    }
  };

  const handleOpenDeleteModal = (user: UserItem) => {
    if (authUser?.id === user.id) {
      toast.error("You cannot delete your own account.");
      return;
    }
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      await UserService.deleteUser(selectedUser.id);
      toast.success(`User ${selectedUser.email} deleted permanently.`);
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      handleApiError(error, "Failed to delete user");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  //  Account Tab Local Handlers
  // ───────────────────────────────────────────────────────────────────────────
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 50 * 1024) {
        setAvatarError("Avatar image must be smaller than 50 KB.");
        toast.error("Avatar image must be smaller than 50 KB.");
        return;
      }
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        if (img.width > 130 || img.height > 130) {
          setAvatarError(`Image dimensions (${img.width}x${img.height}) exceed maximum 130x130 pixels.`);
          toast.error("Image dimensions exceed 130x130 pixels.");
        } else {
          setAvatarPreview(img.src);
          toast.success("Avatar updated.");
        }
      };
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.next.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }
    if (passwords.next !== passwords.confirm) {
      toast.error("New passwords do not match.");
      return;
    }
    toast.success("Password changed successfully.");
    setPasswords({ current: "", next: "", confirm: "" });
  };

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Company information saved.");
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header Row matching the 'Employees' clean model */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-3">
            <h1 className="font-lexend text-2xl font-bold text-primary tracking-tight">
              {tProfile("title")}
            </h1>

            {/* Continuous Segmented Pill Tabs */}
            <div className="inline-flex items-center p-1 bg-surface border border-border rounded-full shadow-xs">
              <button
                type="button"
                onClick={() => setActiveTab("account")}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "account"
                    ? "bg-accent text-white shadow-xs"
                    : "text-secondary hover:text-primary"
                }`}
              >
                <UserGear size={16} />
                <span>{tProfile("tabAccountSettings")}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("users")}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "users"
                    ? "bg-accent text-white shadow-xs"
                    : "text-secondary hover:text-primary"
                }`}
              >
                <Users size={16} />
                <span>User Management</span>
                <span
                  className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    activeTab === "users" ? "bg-white/20 text-white" : "bg-surface-raised text-muted"
                  }`}
                >
                  {pagination.total}
                </span>
              </button>
            </div>
          </div>

          {activeTab === "users" && isAdmin && (
            <button
              type="button"
              onClick={() => setShowAddUserModal(true)}
              className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white font-semibold text-xs rounded-full shadow-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer self-start sm:self-auto"
            >
              <Plus size={16} weight="bold" />
              <span>Add User</span>
            </button>
          )}
        </div>

        {/* ACCOUNT SETTINGS TAB */}
        {activeTab === "account" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Photo Avatar Card */}
            <div className="bg-surface border border-border rounded-3xl p-6 shadow-xs space-y-4 h-full">
              <div className="flex items-center gap-2.5 pb-4 border-b border-border/60">
                <UploadSimple size={20} className="text-accent" />
                <h2 className="font-lexend font-bold text-base text-primary">
                  {tProfile("avatarTitle")}
                </h2>
              </div>

              <div className="flex flex-col items-center gap-4 pt-2">
                <div className="w-20 h-20 rounded-full bg-bg border-2 border-accent/40 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-lexend font-bold text-2xl text-accent">
                      {(currentUserData.name[0] || "U").toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="space-y-2 flex flex-col items-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-full transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <UploadSimple size={16} />
                    <span>{tProfile("tabAvatar")}</span>
                  </button>
                  {avatarError && (
                    <p className="text-xs text-rose-400 font-medium text-center">{avatarError}</p>
                  )}
                </div>
              </div>

              <div className="bg-bg/70 p-4 rounded-2xl border border-border space-y-1.5 text-xs mt-auto">
                <span className="font-bold text-accent block uppercase tracking-wider text-[10px]">
                  Dimension Limits
                </span>
                <p className="text-secondary">• Max size: <strong className="text-primary">50 KB</strong></p>
                <p className="text-secondary">• Dimensions: <strong className="text-primary">130 x 130 px</strong></p>
              </div>
            </div>

            {/* Password Update Card */}
            <div className="bg-surface border border-border rounded-3xl p-6 shadow-xs space-y-4 h-full">
              <div className="flex items-center gap-2.5 pb-4 border-b border-border/60">
                <LockKey size={20} className="text-accent" />
                <h2 className="font-lexend font-bold text-base text-primary">
                  {tProfile("passwordTitle")}
                </h2>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-primary font-semibold mb-1.5">{tProfile("currentPassword")}</label>
                  <input
                    type="password"
                    required
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    className="w-full bg-bg border border-border rounded-xl p-2.5 text-primary outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-primary font-semibold mb-1.5">{tProfile("newPassword")}</label>
                  <input
                    type="password"
                    required
                    value={passwords.next}
                    onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
                    className="w-full bg-bg border border-border rounded-xl p-2.5 text-primary outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-primary font-semibold mb-1.5">{tProfile("confirmPassword")}</label>
                  <input
                    type="password"
                    required
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    className="w-full bg-bg border border-border rounded-xl p-2.5 text-primary outline-none focus:border-accent"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-accent hover:bg-accent-hover text-white font-semibold rounded-full transition-all shadow-xs cursor-pointer"
                  >
                    {tProfile("updatePasswordBtn")}
                  </button>
                </div>
              </form>
            </div>

            {/* Company Data Card */}
            <div className="bg-surface border border-border rounded-3xl p-6 shadow-xs space-y-4 h-full">
              <div className="flex items-center gap-2.5 pb-4 border-b border-border/60">
                <Buildings size={20} className="text-accent" />
                <h2 className="font-lexend font-bold text-base text-primary">
                  {tProfile("companyTitle")}
                </h2>
              </div>

              <form onSubmit={handleCompanySubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-primary font-semibold mb-1.5">{tProfile("officialEmail")}</label>
                  <input
                    type="email"
                    required
                    value={companyData.officialEmail}
                    onChange={(e) => setCompanyData({ ...companyData, officialEmail: e.target.value })}
                    className="w-full bg-bg border border-border rounded-xl p-2.5 text-primary outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-primary font-semibold mb-1.5">{tProfile("legalAddress")}</label>
                  <input
                    type="text"
                    required
                    value={companyData.legalAddress}
                    onChange={(e) => setCompanyData({ ...companyData, legalAddress: e.target.value })}
                    className="w-full bg-bg border border-border rounded-xl p-2.5 text-primary outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-primary font-semibold mb-1.5">{tProfile("corporatePhone")}</label>
                  <input
                    type="text"
                    required
                    value={companyData.corporatePhone}
                    onChange={(e) => setCompanyData({ ...companyData, corporatePhone: e.target.value })}
                    className="w-full bg-bg border border-border rounded-xl p-2.5 text-primary outline-none focus:border-accent font-mono"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-accent hover:bg-accent-hover text-white font-semibold rounded-full transition-all shadow-xs cursor-pointer"
                  >
                    {tProfile("saveCompanyBtn")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* USERS MANAGEMENT TAB (EXACT EMPLOYEES MODEL IMPLEMENTATION) */}
        {activeTab === "users" && (
          <div className="space-y-6">
            {/* Filter Bar Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Segmented Pill Tabs for Status */}
              <div className="inline-flex items-center p-1 bg-surface border border-border rounded-full shadow-xs self-start">
                <button
                  type="button"
                  onClick={() => {
                    setBlockedFilter("");
                    setPage(1);
                  }}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    blockedFilter === ""
                      ? "bg-accent text-white shadow-xs"
                      : "text-secondary hover:text-primary"
                  }`}
                >
                  <span>All Accounts</span>
                  <span
                    className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      blockedFilter === "" ? "bg-white/20 text-white" : "bg-surface-raised text-muted"
                    }`}
                  >
                    {pagination.total}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setBlockedFilter("active");
                    setPage(1);
                  }}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    blockedFilter === "active"
                      ? "bg-accent text-white shadow-xs"
                      : "text-secondary hover:text-primary"
                  }`}
                >
                  <span>Active</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setBlockedFilter("blocked");
                    setPage(1);
                  }}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    blockedFilter === "blocked"
                      ? "bg-accent text-white shadow-xs"
                      : "text-secondary hover:text-primary"
                  }`}
                >
                  <span>Blocked</span>
                </button>
              </div>

              {/* Search & Role Filter */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-2 bg-surface border border-border rounded-full px-4 py-2 text-xs text-muted w-full sm:w-64 shadow-xs focus-within:border-accent transition-colors">
                  <MagnifyingGlass size={15} className="text-muted shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search name or email..."
                    className="bg-transparent text-primary outline-none w-full text-xs placeholder:text-muted"
                  />
                </div>

                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setPage(1);
                  }}
                  className="bg-surface border border-border rounded-full px-4 py-2 text-xs text-primary outline-none focus:border-accent cursor-pointer shadow-xs"
                >
                  <option value="">All Roles</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Superadmin</option>
                </select>

                <button
                  onClick={fetchUsers}
                  disabled={loadingUsers}
                  className="w-8 h-8 rounded-full bg-surface hover:bg-surface-raised border border-border text-secondary hover:text-primary flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-xs"
                  title="Refresh"
                >
                  <ArrowsClockwise size={15} className={loadingUsers ? "animate-spin text-accent" : ""} />
                </button>
              </div>
            </div>

            {/* Clean Rounded Table Container */}
            <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border/60 text-secondary">
                      <th className="py-4.5 px-6 font-semibold">
                        <span className="inline-flex items-center gap-1.5">
                          Name
                          <CaretUpDown size={14} className="text-muted/70" />
                        </span>
                      </th>
                      <th className="py-4.5 px-6 font-semibold">
                        <span className="inline-flex items-center gap-1.5">
                          Email
                          <CaretUpDown size={14} className="text-muted/70" />
                        </span>
                      </th>
                      <th className="py-4.5 px-6 font-semibold">
                        <span className="inline-flex items-center gap-1.5">
                          Role
                          <CaretUpDown size={14} className="text-muted/70" />
                        </span>
                      </th>
                      <th className="py-4.5 px-6 font-semibold">
                        <span className="inline-flex items-center gap-1.5">
                          Status
                          <CaretUpDown size={14} className="text-muted/70" />
                        </span>
                      </th>
                      <th className="py-4.5 px-6 font-semibold">
                        <span className="inline-flex items-center gap-1.5">
                          Created Date
                          <CaretUpDown size={14} className="text-muted/70" />
                        </span>
                      </th>
                      {isAdmin && <th className="py-4.5 px-6 text-right font-semibold">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {loadingUsers ? (
                      <tr>
                        <td colSpan={isAdmin ? 6 : 5} className="py-12 text-center text-secondary">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <ArrowsClockwise size={24} className="animate-spin text-accent" />
                            <span>Loading users from database...</span>
                          </div>
                        </td>
                      </tr>
                    ) : usersList.length === 0 ? (
                      <tr>
                        <td colSpan={isAdmin ? 6 : 5} className="py-12 text-center text-muted">
                          No user accounts match the current query.
                        </td>
                      </tr>
                    ) : (
                      usersList.map((u) => {
                        const isSelf = authUser?.id === u.id;
                        return (
                          <tr key={u.id} className="hover:bg-surface-raised/40 transition-colors">
                            {/* 1. Name */}
                            <td className="py-4.5 px-6">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-primary text-sm">
                                  {u.name || "—"}
                                </span>
                                {isSelf && (
                                  <span className="text-[9px] bg-accent/20 text-accent font-bold px-2 py-0.5 rounded-full uppercase">
                                    You
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* 2. Email */}
                            <td className="py-4.5 px-6 font-mono text-secondary text-xs">{u.email}</td>

                            {/* 3. Role Badge (like 'Employees' reference) */}
                            <td className="py-4.5 px-6">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 ${
                                  u.role === "superadmin"
                                    ? "bg-purple-500/10 text-purple-400 border border-purple-500/25"
                                    : u.role === "admin"
                                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/25"
                                    : "bg-accent/10 text-accent border border-accent/25"
                                }`}
                              >
                                {u.role === "superadmin"
                                  ? "Super Admin"
                                  : u.role === "admin"
                                  ? "Admin"
                                  : "Standard"}
                              </span>
                            </td>

                            {/* 4. Status Toggle */}
                            <td className="py-4.5 px-6">
                              {isAdmin ? (
                                <button
                                  type="button"
                                  onClick={() => handleToggleBlockStatus(u)}
                                  disabled={isSelf || togglingBlockId === u.id}
                                  className={`flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-opacity ${
                                    isSelf
                                      ? "opacity-50 cursor-not-allowed"
                                      : togglingBlockId === u.id
                                      ? "opacity-70 cursor-wait"
                                      : ""
                                  }`}
                                  title={isSelf ? "Cannot block your own account" : "Click to toggle account status"}
                                >
                                  {u.isBlocked ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                      <XCircle size={14} weight="fill" />
                                      Blocked
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                      <CheckCircle size={14} weight="fill" />
                                      Active
                                    </span>
                                  )}
                                </button>
                              ) : (
                                <div className="flex items-center gap-1.5 text-xs font-semibold">
                                  {u.isBlocked ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                      <XCircle size={14} weight="fill" />
                                      Blocked
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                      <CheckCircle size={14} weight="fill" />
                                      Active
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>

                            {/* 5. Date */}
                            <td className="py-4.5 px-6 text-xs text-secondary font-mono">
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-GB") : "—"}
                            </td>

                            {/* 6. Action buttons (Edit pencil circle & Delete trash circle like reference image) */}
                            {isAdmin && (
                              <td className="py-4.5 px-6 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditModal(u)}
                                    className="w-8 h-8 rounded-full bg-surface-raised hover:bg-accent/15 text-secondary hover:text-accent border border-border/60 transition-all inline-flex items-center justify-center cursor-pointer shadow-xs"
                                    title="Edit User"
                                  >
                                    <PencilSimple size={15} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenDeleteModal(u)}
                                    disabled={isSelf}
                                    className={`w-8 h-8 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all inline-flex items-center justify-center cursor-pointer shadow-xs ${
                                      isSelf ? "opacity-30 cursor-not-allowed" : ""
                                    }`}
                                    title={isSelf ? "Cannot delete your own account" : "Delete User"}
                                  >
                                    <Trash size={15} />
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className="p-4 border-t border-border/60 flex items-center justify-between bg-bg/40">
                  <span className="text-xs text-secondary">
                    Page <strong className="text-primary">{pagination.page}</strong> of{" "}
                    <strong className="text-primary">{pagination.totalPages}</strong> ({pagination.total} total)
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      disabled={pagination.page <= 1}
                      className="w-8 h-8 rounded-full border border-border bg-surface text-secondary hover:text-primary disabled:opacity-40 flex items-center justify-center cursor-pointer shadow-xs"
                    >
                      <CaretLeft size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                      disabled={pagination.page >= pagination.totalPages}
                      className="w-8 h-8 rounded-full border border-border bg-surface text-secondary hover:text-primary disabled:opacity-40 flex items-center justify-center cursor-pointer shadow-xs"
                    >
                      <CaretRight size={15} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* MODAL 1: ADD NEW USER                                               */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {showAddUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-surface border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Plus size={18} className="text-accent" />
                  <h3 className="font-lexend font-bold text-base text-primary">Add New User</h3>
                </div>
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="text-xs text-secondary hover:text-primary cursor-pointer p-1"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
                <div>
                  <label className="block text-primary font-bold mb-1">Full Name</label>
                  <input
                    type="text"
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full bg-bg border border-border rounded-xl p-2.5 text-primary outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-primary font-bold mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    placeholder="john@company.com"
                    className="w-full bg-bg border border-border rounded-xl p-2.5 text-primary outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-primary font-bold mb-1">Role</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) =>
                      setNewUserForm({
                        ...newUserForm,
                        role: e.target.value as "user" | "admin" | "superadmin",
                      })
                    }
                    className="w-full bg-bg border border-border rounded-xl p-2.5 text-primary outline-none focus:border-accent"
                  >
                    <option value="user">User</option>
                    {isSuperAdmin && (
                      <>
                        <option value="admin">Admin</option>
                        <option value="superadmin">Superadmin</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                    className="px-4 py-2 bg-bg text-secondary hover:text-primary border border-border rounded-xl font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-accent hover:bg-accent-hover text-white rounded-xl font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting && <ArrowsClockwise size={14} className="animate-spin" />}
                    <span>Create User</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* MODAL 2: EDIT USER                                                  */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {showEditUserModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-surface border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <PencilSimple size={18} className="text-accent" />
                  <h3 className="font-lexend font-bold text-base text-primary">
                    Edit User #{selectedUser.id}
                  </h3>
                </div>
                <button
                  onClick={() => setShowEditUserModal(false)}
                  className="text-xs text-secondary hover:text-primary cursor-pointer p-1"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleUpdateUser} className="space-y-4 text-xs">
                <div>
                  <label className="block text-primary font-bold mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editUserForm.name}
                    onChange={(e) => setEditUserForm({ ...editUserForm, name: e.target.value })}
                    className="w-full bg-bg border border-border rounded-xl p-2.5 text-primary outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-primary font-bold mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editUserForm.email}
                    onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                    className="w-full bg-bg border border-border rounded-xl p-2.5 text-primary outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-primary font-bold mb-1">Role</label>
                  <select
                    value={editUserForm.role}
                    onChange={(e) =>
                      setEditUserForm({
                        ...editUserForm,
                        role: e.target.value as "user" | "admin" | "superadmin",
                      })
                    }
                    className="w-full bg-bg border border-border rounded-xl p-2.5 text-primary outline-none focus:border-accent"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    {isSuperAdmin && <option value="superadmin">Superadmin</option>}
                  </select>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowEditUserModal(false)}
                    className="px-4 py-2 bg-bg text-secondary hover:text-primary border border-border rounded-xl font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-accent hover:bg-accent-hover text-white rounded-xl font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting && <ArrowsClockwise size={14} className="animate-spin" />}
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* MODAL 3: DELETE CONFIRMATION                                        */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {showDeleteModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-surface border border-border rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-red-500">
                <ShieldWarning size={28} />
                <h3 className="font-lexend font-bold text-base text-primary">Delete User Account</h3>
              </div>

              <p className="text-xs text-secondary leading-relaxed">
                Are you sure you want to permanently delete user{" "}
                <strong className="text-primary font-mono">{selectedUser.email}</strong>? This action will cascade delete all active sessions and project memberships.
              </p>

              <div className="pt-3 flex justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-bg text-secondary hover:text-primary border border-border rounded-xl font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteUser}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting && <ArrowsClockwise size={14} className="animate-spin" />}
                  <span>Delete User</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
