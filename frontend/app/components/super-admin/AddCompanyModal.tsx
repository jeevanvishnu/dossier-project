import React, { useState, useRef, useEffect } from "react";
import { X, UploadSimple, Trash, Buildings, EnvelopeSimple, Phone, MapPin, Calendar, Camera } from "@phosphor-icons/react";
import { api, handleApiError } from "../../lib/axios";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export interface CompanyData {
  id?: number;
  name: string;
  email: string;
  mobile?: string | null;
  address?: string | null;
  imageUrl?: string | null;
  subscriptionStartDate?: string | Date | null;
  subscriptionEndDate?: string | Date | null;
}

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  companyToEdit?: CompanyData | null;
}

const formatDateForInput = (dateVal?: string | Date | null) => {
  if (!dateVal) return "";
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
};

export function CompanyModal({ isOpen, onClose, onSuccess, companyToEdit }: CompanyModalProps) {
  const t = useTranslations("superAdmin");
  const isEditing = Boolean(companyToEdit);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    address: "",
    imageUrl: "",
    subscriptionStartDate: new Date().toISOString().split("T")[0],
    subscriptionEndDate: "",
  });
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (companyToEdit) {
      setFormData({
        name: companyToEdit.name || "",
        email: companyToEdit.email || "",
        mobile: companyToEdit.mobile || "",
        address: companyToEdit.address || "",
        imageUrl: companyToEdit.imageUrl || "",
        subscriptionStartDate: formatDateForInput(companyToEdit.subscriptionStartDate) || new Date().toISOString().split("T")[0],
        subscriptionEndDate: formatDateForInput(companyToEdit.subscriptionEndDate),
      });
    } else {
      setFormData({
        name: "",
        email: "",
        mobile: "",
        address: "",
        imageUrl: "",
        subscriptionStartDate: new Date().toISOString().split("T")[0],
        subscriptionEndDate: "",
      });
    }
  }, [companyToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("toastImageSizeExceeded"));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, imageUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, imageUrl: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = { ...formData };
      if (!payload.imageUrl) delete payload.imageUrl;
      if (!payload.subscriptionEndDate) {
        payload.subscriptionEndDate = null;
      }

      if (isEditing && companyToEdit?.id) {
        const res = await api.patch(`/admin/companies/${companyToEdit.id}`, payload);
        if (res.data.success) {
          toast.success(t("toastCompanyUpdated"));
          onSuccess();
          onClose();
        }
      } else {
        const res = await api.post("/admin/companies", payload);
        if (res.data.success) {
          toast.success(t("toastCompanyCreated"));
          onSuccess();
          onClose();
          setFormData({
            name: "",
            email: "",
            mobile: "",
            address: "",
            imageUrl: "",
            subscriptionStartDate: new Date().toISOString().split("T")[0],
            subscriptionEndDate: "",
          });
        }
      }
    } catch (err: any) {
      handleApiError(err, isEditing ? "Failed to update company" : "Failed to create company");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-2xl p-7 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <div>
            <h2 className="text-xl font-bold font-lexend text-primary">
              {isEditing ? t("modalEditCompanyTitle") : t("modalAddCompanyTitle")}
            </h2>
            <p className="text-xs text-secondary mt-1">
              {isEditing ? t("modalEditCompanySub") : t("modalAddCompanySub")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-secondary hover:text-primary hover:bg-surface-raised transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Logo Upload (Circular) */}
          <div className="flex flex-col items-center justify-center pt-1 pb-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageFileChange}
              className="hidden"
            />
            <div className="relative group">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 rounded-full border-2 border-dashed border-border hover:border-accent bg-bg flex items-center justify-center overflow-hidden cursor-pointer transition-all shadow-inner group-hover:ring-4 group-hover:ring-accent/20"
                title={t("companyLogo")}
              >
                {formData.imageUrl ? (
                  <img
                    src={formData.imageUrl}
                    alt="Company Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-secondary group-hover:text-accent transition-colors">
                    <Camera size={28} />
                    <span className="text-[10px] font-medium mt-1">{t("upload")}</span>
                  </div>
                )}
              </div>

              {formData.imageUrl && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-1 -right-1 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md transition-transform hover:scale-110"
                  title="Remove Logo"
                >
                  <Trash size={14} weight="bold" />
                </button>
              )}
            </div>
            <p className="text-[11px] text-secondary mt-2">
              {t("companyLogo")} <span className="text-muted">{t("optional")}</span>
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-primary ml-1">{t("companyNameLabel")} <span className="text-red-400">*</span></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Buildings size={18} className="text-secondary" />
              </div>
              <input
                type="text"
                name="name"
                placeholder={t("enterCompanyNamePlaceholder")}
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-surface-raised/50 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent focus:bg-bg transition-all"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-primary ml-1">{t("emailLabel")} <span className="text-red-400">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeSimple size={18} className="text-secondary" />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder={t("enterEmailPlaceholder")}
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-surface-raised/50 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent focus:bg-bg transition-all"
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-primary ml-1">{t("mobileLabel")}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone size={18} className="text-secondary" />
                </div>
                <input
                  type="text"
                  name="mobile"
                  placeholder={t("enterMobilePlaceholder")}
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full bg-surface-raised/50 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent focus:bg-bg transition-all"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-primary ml-1">{t("subStartDateLabel")}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar size={18} className="text-secondary" />
                </div>
                <input
                  type="date"
                  name="subscriptionStartDate"
                  value={formData.subscriptionStartDate}
                  onChange={handleChange}
                  className="w-full bg-surface-raised/50 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent focus:bg-bg transition-all"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-primary ml-1">
                {t("subEndDateLabel")} <span className="text-secondary font-normal">{t("optional")}</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar size={18} className="text-secondary" />
                </div>
                <input
                  type="date"
                  name="subscriptionEndDate"
                  value={formData.subscriptionEndDate}
                  onChange={handleChange}
                  className="w-full bg-surface-raised/50 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent focus:bg-bg transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-primary ml-1">{t("addressLabel")}</label>
            <div className="relative">
              <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                <MapPin size={18} className="text-secondary" />
              </div>
              <textarea
                name="address"
                placeholder={t("enterAddressPlaceholder")}
                value={formData.address}
                onChange={handleChange}
                rows={2}
                className="w-full bg-surface-raised/50 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent focus:bg-bg transition-all resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-5 border-t border-border/60 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 bg-bg hover:bg-surface-raised border border-border rounded-xl text-sm text-secondary hover:text-primary font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-border"
            >
              {t("modalDeleteCompanyCancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg"
            >
              {loading ? (isEditing ? t("saving") : t("creating")) : (isEditing ? t("saveChanges") : t("createCompany"))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Export alias for backwards compatibility
export const AddCompanyModal = CompanyModal;
