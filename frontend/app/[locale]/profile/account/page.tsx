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
  const isAdmin = authUser?.role === "admin" || authUser?.role === "superadmin";
  const isSuperAdmin = authUser?.role === "superadmin";

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
    tinBin: "990240001892",
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
    if (!isAdmin) return;
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
  }, [isAdmin, page, limit, debouncedSearch, roleFilter, blockedFilter]);

  useEffect(() => {
    if (activeTab === "users" && isAdmin) {
      fetchUsers();
    }
  }, [fetchUsers, activeTab, isAdmin]);

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
        {/* Header Banner */}
        <div className="bg-surface border border-border p-5 rounded-2xl shadow-xs">
          <span className="text-[10px] uppercase tracking-wider font-bold text-accent px-2 py-0.5 rounded bg-accent/10 border border-accent/20">
            {tProfile("badgeLabel")}
          </span>
          <h1 className="font-lexend text-2xl font-bold text-primary mt-1">
            {tProfile("title")}
          </h1>
          <p className="text-xs text-secondary">
            {tProfile("sub")}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 bg-surface border border-border p-1.5 rounded-2xl overflow-x-auto shadow-xs">
          <button
            onClick={() => setActiveTab("account")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === "account" ? "bg-accent text-white" : "text-secondary hover:text-primary"
            }`}
          >
            <UserGear size={16} />
            <span>{tProfile("tabAccountSettings")}</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === "users" ? "bg-accent text-white" : "text-secondary hover:text-primary"
              }`}
            >
              <Users size={16} />
              <span>User Management (Admin)</span>
            </button>
          )}
        </div>

        {/* ACCOUNT SETTINGS TAB */}
        {activeTab === "account" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Photo Avatar Card */}
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-4 h-full">
              <div className="flex items-center gap-2 pb-3 border-b border-border">
                <UploadSimple size={20} className="text-accent" />
                <h2 className="font-lexend font-bold text-base text-primary">
                  {tProfile("avatarTitle")}
                </h2>
              </div>

              <div className="flex flex-col items-center gap-3 pt-1">
                <div className="w-20 h-20 rounded-full bg-bg border-2 border-accent/40 overflow-hidden flex items-center justify-center shrink-0">
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
                    className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <UploadSimple size={16} />
                    <span>{tProfile("tabAvatar")}</span>
                  </button>
                  {avatarError && (
                    <p className="text-xs text-red-500 font-medium text-center">{avatarError}</p>
                  )}
                </div>
              </div>

              <div className="bg-bg p-4 rounded-xl border border-border space-y-2 text-xs mt-auto">
                <span className="font-bold text-accent block uppercase tracking-wider">
                  Dimension Limits
                </span>
                <p className="text-secondary">• Max size: <strong className="text-primary">50 KB</strong></p>
                <p className="text-secondary">• Dimensions: <strong className="text-primary">130 x 130 px</strong></p>
              </div>
            </div>

            {/* Password Update Card */}
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-4 h-full">
              <div className="flex items-center gap-2 pb-3 border-b border-border">
                <LockKey size={20} className="text-accent" />
                <h2 className="font-lexend font-bold text-base text-primary">
                  {tProfile("passwordTitle")}
                </h2>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-primary font-bold mb-1">{tProfile("currentPassword")}</label>
                  <input
                    type="password"
                    required
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    className="w-full bg-bg border border-border rounded-xl p-2.5 text-primary outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-primary font-bold mb-1">{tProfile("newPassword")}</label>
                  <input
                    type="password"
                    required
                    value={passwords.next}
                    onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
                    className="w-full bg-bg border border-border rounded-xl p-2.5 text-primary outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-primary font-bold mb-1">{tProfile("confirmPassword")}</label>
                  <input
                    type="password"
                    required
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    className="w-full bg-bg border border-border rounded-xl p-2.5 text-primary outline-none focus:border-accent"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  {tProfile("updatePasswordBtn")}
                </button>
              </form>
            </div>

            {/* Company Data Card */}
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-4 h-full">
              <div className="flex items-center gap-2 pb-3 border-b border-border">
                <Buildings size={20} className="text-accent" />
                <h2 className="font-lexend font-bold text-base text-primary">
                  {tProfile("companyTitle")}
                </h2>
              </div>

              <form onSubmit={handleCompanySubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-primary font-bold mb-1">{tProfile("tinBin")}</label>
                  <input
                    type="text"
                    required
                    value={companyData.tinBin}
                    onChange={(e) => setCompanyData({ ...companyData, tinBin: e.target.value })}
                    className="w-full bg-bg border border-border rounded-xl p-2.5 text-primary outline-none focus:border-accent font-mono"
                  />
                </div>

                <div>
                  <label className="block text-primary font-bold mb-1">{tProfile("officialEmail")}</label>
                  <input
                    type="email"
                    required
                    value={companyData.officialEmail}
                    onChange={(e) => setCompanyData({ ...companyData, officialEmail: e.target.value })}
                    className="w-full bg-bg border border-border rounded-xl p-2.5 text-primary outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-primary font-bold mb-1">{tProfile("legalAddress")}</label>
                  <input
                    type="text"
                    required
                    value={companyData.legalAddress}
                    onChange={(e) => setCompanyData({ ...companyData, legalAddress: e.target.value })}
                    className="w-full bg-bg border border-border rounded-xl p-2.5 text-primary outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-primary font-bold mb-1">{tProfile("corporatePhone")}</label>
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
                    className="w-full py-2.5 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    {tProfile("saveCompanyBtn")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* USERS MANAGEMENT TAB (ADMIN VIEW INTEGRATED WITH BACKEND REST API) */}
        {activeTab === "users" && (
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm space-y-0">
            {/* Header Toolbar */}
            <div className="p-5 border-b border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Users size={20} className="text-accent" />
                <div>
                  <h2 className="font-lexend font-bold text-base text-primary">
                    {isAdmin ? "User Accounts Management" : tProfile("usersTableTitle")}
                  </h2>
                  <p className="text-xs text-secondary">
                    Total {pagination.total} registered users
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <button
                  onClick={fetchUsers}
                  disabled={loadingUsers}
                  className="p-2 bg-bg hover:bg-surface-raised border border-border text-secondary hover:text-primary rounded-lg transition-colors cursor-pointer"
                  title="Refresh List"
                >
                  <ArrowsClockwise size={16} className={loadingUsers ? "animate-spin text-accent" : ""} />
                </button>

                {isAdmin && (
                  <button
                    onClick={() => setShowAddUserModal(true)}
                    className="px-3.5 py-2 bg-accent hover:bg-accent-hover text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Plus size={16} />
                    <span>Add New User</span>
                  </button>
                )}
              </div>
            </div>

            {/* Filter Bar */}
            <div className="p-4 bg-bg/50 border-b border-border grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Search Bar */}
              <div className="relative">
                <MagnifyingGlass
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search name or email..."
                  className="w-full bg-surface border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-primary outline-none focus:border-accent"
                />
              </div>

              {/* Role Filter */}
              <div>
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-primary outline-none focus:border-accent"
                >
                  <option value="">All Roles</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>

              {/* Blocked Status Filter */}
              <div>
                <select
                  value={blockedFilter}
                  onChange={(e) => {
                    setBlockedFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-primary outline-none focus:border-accent"
                >
                  <option value="">All Account Statuses</option>
                  <option value="active">Active Accounts</option>
                  <option value="blocked">Blocked / Suspended</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-secondary">
                <thead className="bg-bg text-primary uppercase font-bold text-[10px] tracking-wider border-b border-border">
                  <tr>
                    <th className="py-3.5 px-4">ID</th>
                    <th className="py-3.5 px-4">User Details</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Account Status</th>
                    <th className="py-3.5 px-4">Created Date</th>
                    {isAdmin && <th className="py-3.5 px-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loadingUsers ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-secondary">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <ArrowsClockwise size={24} className="animate-spin text-accent" />
                          <span>Loading users from database...</span>
                        </div>
                      </td>
                    </tr>
                  ) : usersList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-secondary">
                        No user accounts match the current query.
                      </td>
                    </tr>
                  ) : (
                    usersList.map((u) => {
                      const isSelf = authUser?.id === u.id;
                      return (
                        <tr key={u.id} className="hover:bg-surface-raised transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-accent">
                            #{u.id}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-primary">
                              {u.name || "—"}
                            </div>
                            {isSelf && (
                              <span className="text-[9px] bg-accent/20 text-accent font-bold px-1.5 py-0.2 rounded uppercase">
                                You
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-primary">{u.email}</td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                u.role === "superadmin"
                                  ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                                  : u.role === "admin"
                                  ? "bg-accent/15 text-accent border border-accent/30"
                                  : "bg-bg text-secondary border border-border"
                              }`}
                            >
                              {u.role.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {isAdmin ? (
                              <button
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
                                  <>
                                    <ToggleLeft size={22} className="text-red-500" />
                                    <span className="text-red-500 font-bold">Blocked</span>
                                  </>
                                ) : (
                                  <>
                                    <ToggleRight size={22} className="text-emerald-500" />
                                    <span className="text-emerald-500">Active</span>
                                  </>
                                )}
                              </button>
                            ) : (
                              <div className="flex items-center gap-1.5 text-xs font-semibold">
                                {u.isBlocked ? (
                                  <>
                                    <XCircle size={18} weight="fill" className="text-red-500 shrink-0" />
                                    <span className="text-red-500 font-bold">Blocked</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle size={18} weight="fill" className="text-emerald-500 shrink-0" />
                                    <span className="text-emerald-500">Active</span>
                                  </>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-secondary font-mono">
                            {new Date(u.createdAt).toLocaleDateString("en-GB")}
                          </td>
                          {isAdmin && (
                            <td className="py-3.5 px-4 text-right space-x-1.5">
                              <button
                                onClick={() => handleOpenEditModal(u)}
                                className="p-1.5 text-secondary hover:text-accent hover:bg-accent/10 rounded transition-colors cursor-pointer"
                                title="Edit User"
                              >
                                <PencilSimple size={16} />
                              </button>
                              <button
                                onClick={() => handleOpenDeleteModal(u)}
                                disabled={isSelf}
                                className={`p-1.5 text-red-500 hover:bg-red-500/10 rounded transition-colors cursor-pointer ${
                                  isSelf ? "opacity-30 cursor-not-allowed" : ""
                                }`}
                                title={isSelf ? "Cannot delete your own account" : "Delete User"}
                              >
                                <Trash size={16} />
                              </button>
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
            {isAdmin && pagination.totalPages > 1 && (
              <div className="p-4 border-t border-border flex items-center justify-between bg-bg/50">
                <span className="text-xs text-secondary">
                  Page <strong className="text-primary">{pagination.page}</strong> of{" "}
                  <strong className="text-primary">{pagination.totalPages}</strong> ({pagination.total} total)
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={pagination.page <= 1}
                    className="p-1.5 border border-border bg-surface text-secondary hover:text-primary disabled:opacity-40 rounded-lg cursor-pointer"
                  >
                    <CaretLeft size={16} />
                  </button>
                  <button
                    onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                    disabled={pagination.page >= pagination.totalPages}
                    className="p-1.5 border border-border bg-surface text-secondary hover:text-primary disabled:opacity-40 rounded-lg cursor-pointer"
                  >
                    <CaretRight size={16} />
                  </button>
                </div>
              </div>
            )}
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
