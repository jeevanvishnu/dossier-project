"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/app/components/AppShell";
import { api } from "@/app/lib/axios";
import { Plus, UserGear, Trash, Database, Users, PencilSimple } from "@phosphor-icons/react";
import { AddCompanyUserModal } from "@/app/components/super-admin/AddCompanyUserModal";
import { toast } from "sonner";

export default function CompanyUsersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/company-members");
      if (res.data.success) {
        setMembers(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch company members:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleOpenAddModal = () => {
    setSelectedMember(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (member: any) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from this company?`)) return;
    try {
      const res = await api.delete(`/admin/company-members/${id}`);
      if (res.data.success) {
        toast.success("Company member removed successfully");
        fetchMembers();
      }
    } catch (error) {
      console.error("Failed to remove company member:", error);
      toast.error("Failed to remove company member");
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-lexend text-primary">Company Users (Admins)</h2>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
          >
            <Plus size={18} weight="bold" />
            Add Admin
          </button>
        </div>

        <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-white">
              <thead className="bg-bg border-b border-border text-xs uppercase tracking-wider font-semibold text-white/90">
                <tr>
                  <th className="px-6 py-4 text-white font-bold">Admin Name</th>
                  <th className="px-6 py-4 text-white font-bold">Company</th>
                  <th className="px-6 py-4 text-white font-bold">Limits</th>
                  <th className="px-6 py-4 text-right text-white font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-white/70">
                      Loading...
                    </td>
                  </tr>
                ) : members.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-white/70">
                      No company admins found.
                    </td>
                  </tr>
                ) : (
                  members.map((member) => (
                    <tr key={member.id} className="hover:bg-bg/50 transition-colors">
                      <td className="px-6 py-4 text-white">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-accent/15 text-accent flex items-center justify-center shrink-0 overflow-hidden border border-border/80">
                            {member.user.imageUrl ? (
                              <img
                                src={member.user.imageUrl}
                                alt={member.user.name || "Admin"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <UserGear size={20} weight="fill" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{member.user.name}</p>
                            <p className="text-[11px] text-white/60">{member.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white">
                        <span className="font-medium text-white px-2.5 py-1 bg-bg border border-border rounded-lg text-xs">
                          {member.company.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white">
                        <div className="flex items-center gap-4 text-xs font-medium">
                          <div className="flex items-center gap-1.5 text-blue-400">
                            <Users size={16} />
                            {member.maxUsers} max users
                          </div>
                          <div className="flex items-center gap-1.5 text-purple-400">
                            <Database size={16} />
                            {member.storageGb} GB storage
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(member)}
                            className="p-1.5 text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-600 border border-emerald-500/30 rounded-lg transition-colors cursor-pointer"
                            title="Edit Admin"
                          >
                            <PencilSimple size={16} weight="bold" />
                          </button>
                          <button
                            onClick={() => handleDelete(member.id, member.user.name)}
                            className="p-1.5 text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/30 rounded-lg transition-colors cursor-pointer"
                            title="Remove Admin"
                          >
                            <Trash size={16} weight="bold" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AddCompanyUserModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchMembers}
        memberToEdit={selectedMember}
      />
    </AppShell>
  );
}
