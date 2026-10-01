"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/app/components/AppShell";
import { api } from "@/app/lib/axios";
import { Plus, UserGear, Trash, Database, Users, PencilSimple } from "@phosphor-icons/react";
import { AddCompanyUserModal } from "@/app/components/super-admin/AddCompanyUserModal";
import { ConfirmModal } from "@/app/components/ui/ConfirmModal";
import { toast } from "sonner";
import { CompanyUsersTableSkeleton } from "@/app/components/ui/Skeleton";
import { useTranslations } from "next-intl";

export default function CompanyUsersPage() {
  const t = useTranslations("superAdmin");
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  
  // Custom Delete Modal state
  const [adminToRemove, setAdminToRemove] = useState<{ id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleConfirmDelete = async () => {
    if (!adminToRemove) return;
    setIsDeleting(true);
    try {
      const res = await api.delete(`/admin/company-members/${adminToRemove.id}`);
      if (res.data.success) {
        toast.success(t("toastAdminRemoved"));
        fetchMembers();
      }
    } catch (error) {
      console.error("Failed to remove company member:", error);
      toast.error(t("toastAdminRemoveFailed"));
    } finally {
      setIsDeleting(false);
      setAdminToRemove(null);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-lexend text-primary">{t("companyAdminsTitle")}</h2>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
          >
            <Plus size={18} weight="bold" />
            {t("addAdmin")}
          </button>
        </div>

        <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-primary">
              <thead className="bg-bg border-b border-border text-xs uppercase tracking-wider font-semibold text-secondary">
                <tr>
                  <th className="px-6 py-4 text-primary font-bold">{t("colAdminName")}</th>
                  <th className="px-6 py-4 text-primary font-bold">{t("colCompany")}</th>
                  <th className="px-6 py-4 text-primary font-bold">{t("colUserLimit")}</th>
                  <th className="px-6 py-4 text-primary font-bold">{t("colStorageLimit")}</th>
                  <th className="px-6 py-4 text-right text-primary font-bold">{t("colActions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <CompanyUsersTableSkeleton rows={5} />
                ) : members.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-secondary">
                      {t("noAdminsFound")}
                    </td>
                  </tr>
                ) : (
                  members.map((member) => (
                    <tr key={member.id} className="hover:bg-bg/50 transition-colors">
                      <td className="px-6 py-4 text-primary">
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
                            <p className="font-semibold text-primary">{member.user.name}</p>
                            <p className="text-[11px] text-secondary">{member.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-primary">
                        <span className="font-medium text-primary px-2.5 py-1 bg-bg border border-border rounded-lg text-xs">
                          {member.company.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-primary">
                        <div className="flex items-center gap-1.5 text-blue-400 text-xs font-medium">
                          <Users size={16} />
                          {member.maxUsers} {t("maxUsers")}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-primary">
                        <div className="flex items-center gap-1.5 text-purple-400 text-xs font-medium">
                          <Database size={16} />
                          {member.storageGb} {t("gbStorage")}
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
                            onClick={() => setAdminToRemove({ id: member.id, name: member.user.name })}
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

      <ConfirmModal
        isOpen={Boolean(adminToRemove)}
        onClose={() => setAdminToRemove(null)}
        onConfirm={handleConfirmDelete}
        title={t("modalRemoveAdminTitle")}
        description={
          <span>
            Are you sure you want to remove <strong className="text-primary font-semibold">{adminToRemove?.name}</strong> from this company?
          </span>
        }
        confirmText={t("modalRemoveAdminConfirm")}
        cancelText={t("modalRemoveAdminCancel")}
        isLoading={isDeleting}
        variant="danger"
      />
    </AppShell>
  );
}
