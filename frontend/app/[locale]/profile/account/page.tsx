"use client";

import React, { useState } from "react";
import { AppShell } from "../../../components/AppShell";
import { ComingSoon } from "../../../components/ComingSoon";
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
} from "@phosphor-icons/react";
import toast from "react-hot-toast";

export default function AccountSettingsPage() {
  const tProfile = useTranslations("profile");
  const [activeTab, setActiveTab] = useState<"users" | "avatar" | "password" | "company">("users");

  // User List Management State (Admin View)
  const [users, setUsers] = useState([
    {
      id: "USR-101",
      lastName: "Saparov",
      firstName: "Alikhan",
      loginHandle: "a.saparov",
      role: "Admin",
      active: true,
    },
    {
      id: "USR-102",
      lastName: "Zhumagaliyeva",
      firstName: "Daniya",
      loginHandle: "d.zhumagaliyeva",
      role: "User",
      active: true,
    },
    {
      id: "USR-103",
      lastName: "Tulegenov",
      firstName: "Murat",
      loginHandle: "m.tulegenov",
      role: "User",
      active: false,
    },
  ]);

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    loginHandle: "",
    role: "User",
  });

  // Photo Upload State
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  // Password Update State
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  // Company Data Form State
  const [companyData, setCompanyData] = useState({
    tinBin: "990240001892",
    legalAddress: "14 Dostyk Ave, Medeu District, Almaty 050010, Kazakhstan",
    officialEmail: "compliance@pharma.kz",
    additionalAddress: "28 Mangilik El Ave, Astana 010000, Kazakhstan",
    corporatePhone: "+7 (7172) 79-88-00",
  });

  const handleToggleUserActive = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, active: !u.active } : u))
    );
    toast.success(`User ${userId} status updated.`);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    toast.error(`User ${userId} deleted.`);
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = {
      id: `USR-${100 + users.length + 1}`,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      loginHandle: newUser.loginHandle,
      role: newUser.role,
      active: true,
    };
    setUsers([...users, created]);
    setShowAddUserModal(false);
    setNewUser({ firstName: "", lastName: "", loginHandle: "", role: "User" });
    toast.success(`User ${created.loginHandle} created successfully!`);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Check max size 50 KB
      if (file.size > 50 * 1024) {
        setAvatarError("File size exceeds limit (Max 50 KB required).");
        toast.error("Avatar error: Exceeds maximum size of 50 KB.");
        return;
      }

      // Check dimension limits (max 130x130 px)
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        if (img.width > 130 || img.height > 130) {
          setAvatarError(`Dimensions ${img.width}x${img.height}px exceed maximum allowed 130x130 pixels.`);
          toast.error("Avatar error: Dimensions must be max 130x130 px.");
        } else {
          setAvatarPreview(img.src);
          toast.success("Avatar uploaded and validated!");
        }
      };
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.next.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }
    if (passwords.next !== passwords.confirm) {
      toast.error("New passwords do not match.");
      return;
    }
    toast.success("Password updated securely!");
    setPasswords({ current: "", next: "", confirm: "" });
  };

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Company representation data saved successfully!");
  };

  return (
    <AppShell>
      {/* Active Coming Soon View */}
      <ComingSoon
        title={tProfile("title")}
        description={tProfile("sub")}
      />

      {/* 
      ========================================================================
      ORIGINAL ACCOUNT PROFILE PAGE DESIGN CODE (COMMENTED OUT FOR PRESERVATION)
      ========================================================================
      <div className="space-y-6">
        <div className="bg-surface border border-border p-5 rounded-2xl shadow-xs">
          <span className="text-[10px] uppercase tracking-wider font-bold text-accent px-2 py-0.5 rounded bg-accent/10 border border-accent/20">
            Organization & Security Controls
          </span>
          <h1 className="font-lexend text-2xl font-bold text-primary mt-1">
            Account & Login Settings (/profile/account)
          </h1>
          <p className="text-xs text-secondary">
            User administration table, avatar photo uploads, security credential updates, and corporate TIN/BIN details.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-surface border border-border p-1.5 rounded-2xl overflow-x-auto shadow-xs">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 shrink-0 ${
              activeTab === "users" ? "bg-accent text-white" : "text-secondary hover:text-primary"
            }`}
          >
            <Users size={16} />
            <span>User List Management (Admin)</span>
          </button>

          <button
            onClick={() => setActiveTab("avatar")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 shrink-0 ${
              activeTab === "avatar" ? "bg-accent text-white" : "text-secondary hover:text-primary"
            }`}
          >
            <UploadSimple size={16} />
            <span>Photo Upload (Avatar)</span>
          </button>

          <button
            onClick={() => setActiveTab("password")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 shrink-0 ${
              activeTab === "password" ? "bg-accent text-white" : "text-secondary hover:text-primary"
            }`}
          >
            <LockKey size={16} />
            <span>Password Update</span>
          </button>

          <button
            onClick={() => setActiveTab("company")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 shrink-0 ${
              activeTab === "company" ? "bg-accent text-white" : "text-secondary hover:text-primary"
            }`}
          >
            <Buildings size={16} />
            <span>Company Data & Representation</span>
          </button>
        </div>

        {activeTab === "users" && (
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={20} className="text-accent" />
                <h2 className="font-lexend font-bold text-base text-primary">
                  User List Management Table (Admin Panel)
                </h2>
              </div>

              <button
                onClick={() => setShowAddUserModal(true)}
                className="px-3 py-1.5 bg-accent hover:bg-accent-hover text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Plus size={16} />
                <span>Add User</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-secondary">
                <thead className="bg-bg text-primary uppercase font-bold text-[10px] tracking-wider border-b border-border">
                  <tr>
                    <th className="py-3.5 px-4">User ID</th>
                    <th className="py-3.5 px-4">Last Name</th>
                    <th className="py-3.5 px-4">First Name</th>
                    <th className="py-3.5 px-4">Login Handle</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Active Status Toggle</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-surface-raised transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-accent">{u.id}</td>
                      <td className="py-3.5 px-4 font-semibold text-primary">{u.lastName}</td>
                      <td className="py-3.5 px-4 font-semibold text-primary">{u.firstName}</td>
                      <td className="py-3.5 px-4 font-mono text-secondary">@{u.loginHandle}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            u.role === "Admin"
                              ? "bg-accent/15 text-accent border border-accent/30"
                              : "bg-bg text-secondary border border-border"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleUserActive(u.id)}
                          className="flex items-center gap-1.5 text-xs font-semibold"
                        >
                          {u.active ? (
                            <>
                              <ToggleRight size={22} className="text-emerald-500" />
                              <span className="text-emerald-500">Active</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft size={22} className="text-muted" />
                              <span className="text-muted">Disabled</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => toast.success(`Continued session for user ${u.loginHandle}`)}
                          className="px-2.5 py-1 text-[10px] font-bold bg-bg hover:bg-surface-raised text-accent border border-border rounded"
                        >
                          Continue
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                          title="Delete User"
                        >
                          <Trash size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "avatar" && (
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm max-w-xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <UploadSimple size={20} className="text-accent" />
              <h2 className="font-lexend font-bold text-base text-primary">
                Photo Upload Card (Custom Avatar Zone)
              </h2>
            </div>

            <div className="bg-bg p-4 rounded-xl border border-border space-y-2 text-xs">
              <span className="font-bold text-accent block uppercase tracking-wider">Dimension Limits</span>
              <p className="text-secondary">• Maximum file size: <strong className="text-primary">50 KB</strong></p>
              <p className="text-secondary">• Maximum width & height: <strong className="text-primary">130 x 130 pixels</strong></p>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <div className="w-24 h-24 rounded-full bg-bg border-2 border-accent/40 overflow-hidden flex items-center justify-center shrink-0">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-lexend font-bold text-2xl text-accent">AZ</span>
                )}
              </div>

              <div className="space-y-2 flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="block w-full text-xs text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-accent file:text-white hover:file:bg-accent-hover file:cursor-pointer cursor-pointer"
                />
                {avatarError && (
                  <p className="text-xs text-red-500 font-medium">{avatarError}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "password" && (
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm max-w-lg space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <LockKey size={20} className="text-accent" />
              <h2 className="font-lexend font-bold text-base text-primary">
                Security Password Update Panel
              </h2>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-primary font-bold mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  className="w-full bg-bg border border-border rounded-xl p-2.5 text-primary outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-primary font-bold mb-1">New Security Password (Min 8 Chars)</label>
                <input
                  type="password"
                  required
                  value={passwords.next}
                  onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
                  className="w-full bg-bg border border-border rounded-xl p-2.5 text-primary outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-primary font-bold mb-1">Confirm New Security Password</label>
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
                className="w-full py-2.5 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl transition-all shadow-sm"
              >
                Update Security Password
              </button>
            </form>
          </div>
        )}

        {activeTab === "company" && (
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm max-w-2xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <Buildings size={20} className="text-accent" />
              <h2 className="font-lexend font-bold text-base text-primary">
                Company Data & Representation Panel
              </h2>
            </div>

            <form onSubmit={handleCompanySubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-primary font-bold mb-1">Tax ID / TIN / BIN</label>
                  <input
                    type="text"
                    required
                    value={companyData.tinBin}
                    onChange={(e) => setCompanyData({ ...companyData, tinBin: e.target.value })}
                    className="w-full bg-bg border border-border rounded-xl p-2.5 text-primary outline-none focus:border-accent font-mono"
                  />
                </div>

                <div>
                  <label className="block text-primary font-bold mb-1">Official Corporate Email</label>
                  <input
                    type="email"
                    required
                    value={companyData.officialEmail}
                    onChange={(e) => setCompanyData({ ...companyData, officialEmail: e.target.value })}
                    className="w-full bg-bg border border-border rounded-xl p-2.5 text-primary outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-primary font-bold mb-1">Legal Registered Address</label>
                <input
                  type="text"
                  required
                  value={companyData.legalAddress}
                  onChange={(e) => setCompanyData({ ...companyData, legalAddress: e.target.value })}
                  className="w-full bg-bg border border-border rounded-xl p-2.5 text-primary outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-primary font-bold mb-1">Additional Operational Address</label>
                <input
                  type="text"
                  value={companyData.additionalAddress}
                  onChange={(e) => setCompanyData({ ...companyData, additionalAddress: e.target.value })}
                  className="w-full bg-bg border border-border rounded-xl p-2.5 text-primary outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-primary font-bold mb-1">Corporate Representation Phone</label>
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
                  className="w-full py-2.5 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl transition-all shadow-sm"
                >
                  Save Changes (Corporate Profile)
                </button>
              </div>
            </form>
          </div>
        )}

        {showAddUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-surface border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-lexend font-bold text-base text-primary">Add New User to Organization</h3>
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="text-xs text-muted hover:text-primary"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddUserSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-primary font-bold mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                    className="w-full bg-bg border border-border rounded-lg p-2 text-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-primary font-bold mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                    className="w-full bg-bg border border-border rounded-lg p-2 text-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-primary font-bold mb-1">Login Handle</label>
                  <input
                    type="text"
                    required
                    value={newUser.loginHandle}
                    onChange={(e) => setNewUser({ ...newUser, loginHandle: e.target.value })}
                    placeholder="e.g. j.doe"
                    className="w-full bg-bg border border-border rounded-lg p-2 text-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-primary font-bold mb-1">Assigned Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full bg-bg border border-border rounded-lg p-2 text-primary outline-none"
                  >
                    <option value="User">User (Limited to Projects)</option>
                    <option value="Admin">Admin (Full Access & User Management)</option>
                  </select>
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                    className="px-3 py-1.5 bg-bg text-secondary border border-border rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-accent text-white rounded-lg font-bold"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      */}
    </AppShell>
  );
}
