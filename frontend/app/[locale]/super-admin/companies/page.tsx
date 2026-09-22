"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/app/components/AppShell";
import { api } from "@/app/lib/axios";
import { Plus, Buildings, Trash, PencilSimple } from "@phosphor-icons/react";
import { AddCompanyModal } from "@/app/components/super-admin/AddCompanyModal";
import { ConfirmModal } from "@/app/components/ui/ConfirmModal";
import { toast } from "sonner";
import { CompaniesTableSkeleton } from "@/app/components/ui/Skeleton";

const getSubscriptionBadge = (endDateStr?: string | null) => {
  if (!endDateStr) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
        Unlimited
      </span>
    );
  }
  const endDate = new Date(endDateStr);
  const isExpired = endDate.getTime() < Date.now();
  const formattedDate = endDate.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

  if (isExpired) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20" title={`Expired on ${formattedDate}`}>
        Expired ({formattedDate})
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" title={`Active until ${formattedDate}`}>
      Active (until {formattedDate})
    </span>
  );
};

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null);
  
  // Custom Delete Modal state
  const [companyToDelete, setCompanyToDelete] = useState<{ id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/companies");
      if (res.data.success) {
        setCompanies(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch companies:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleOpenAddModal = () => {
    setSelectedCompany(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (company: any) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!companyToDelete) return;
    
    setIsDeleting(true);
    try {
      const res = await api.delete(`/admin/companies/${companyToDelete.id}`);
      if (res.data.success) {
        toast.success("Company deleted successfully");
        fetchCompanies();
      }
    } catch (error) {
      console.error("Failed to delete company:", error);
      toast.error("Failed to delete company");
    } finally {
      setIsDeleting(false);
      setCompanyToDelete(null);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-lexend text-primary">Companies</h2>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
          >
            <Plus size={18} weight="bold" />
            Add Company
          </button>
        </div>

        <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-white">
              <thead className="bg-bg border-b border-border text-xs uppercase tracking-wider font-semibold text-white/90">
                <tr>
                  <th className="px-6 py-4 text-white font-bold">Company</th>
                  <th className="px-6 py-4 text-white font-bold">Email</th>
                  <th className="px-6 py-4 text-white font-bold">Mobile</th>
                  <th className="px-6 py-4 text-white font-bold">Subscription</th>
                  <th className="px-6 py-4 text-white font-bold">Address</th>
                  <th className="px-6 py-4 text-right text-white font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <CompaniesTableSkeleton rows={5} />
                ) : companies.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-white/70">
                      No companies found.
                    </td>
                  </tr>
                ) : (
                  companies.map((company) => (
                    <tr key={company.id} className="hover:bg-bg/50 transition-colors">
                      <td className="px-6 py-4 text-white">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-bg border border-border flex items-center justify-center overflow-hidden shrink-0">
                            {company.imageUrl ? (
                              <img src={company.imageUrl} alt={company.name} className="w-full h-full object-cover" />
                            ) : (
                              <Buildings size={20} className="text-white/60" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{company.name}</p>
                            <p className="text-[11px] text-white/60">ID: {company.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white">{company.email}</td>
                      <td className="px-6 py-4 text-white">{company.mobile || "-"}</td>
                      <td className="px-6 py-4 text-white">{getSubscriptionBadge(company.subscriptionEndDate)}</td>
                      <td className="px-6 py-4 max-w-[200px] truncate text-white">{company.address || "-"}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleOpenEditModal(company)}
                            className="p-1.5 text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-600 border border-emerald-500/30 rounded-lg transition-colors cursor-pointer"
                            title="Edit Company"
                          >
                            <PencilSimple size={16} weight="bold" />
                          </button>
                          <button
                            onClick={() => setCompanyToDelete({ id: company.id, name: company.name })}
                            className="p-1.5 text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/30 rounded-lg transition-colors cursor-pointer"
                            title="Delete"
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

      <AddCompanyModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchCompanies}
        companyToEdit={selectedCompany}
      />

      <ConfirmModal
        isOpen={Boolean(companyToDelete)}
        onClose={() => setCompanyToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Company"
        description={
          <span>
            Are you sure you want to delete <strong className="text-primary font-semibold">{companyToDelete?.name}</strong>? This action cannot be undone.
          </span>
        }
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
        variant="danger"
      />
    </AppShell>
  );
}

