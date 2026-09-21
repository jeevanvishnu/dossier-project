import React, { useState, useRef, useEffect } from "react";
import { X, UploadSimple, Trash, Buildings, EnvelopeSimple, Phone, MapPin } from "@phosphor-icons/react";
import { api, handleApiError } from "../../lib/axios";
import { toast } from "sonner";

export interface CompanyData {
  id?: number;
  name: string;
  email: string;
  mobile?: string | null;
  address?: string | null;
  imageUrl?: string | null;
}

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  companyToEdit?: CompanyData | null;
}

export function CompanyModal({ isOpen, onClose, onSuccess, companyToEdit }: CompanyModalProps) {
  const isEditing = Boolean(companyToEdit);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    address: "",
    imageUrl: "",
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
      });
    } else {
      setFormData({ name: "", email: "", mobile: "", address: "", imageUrl: "" });
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
      toast.error("Image file size exceeds 5MB limit");
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

      if (isEditing && companyToEdit?.id) {
        const res = await api.patch(`/admin/companies/${companyToEdit.id}`, payload);
        if (res.data.success) {
          toast.success("Company updated successfully");
          onSuccess();
          onClose();
        }
      } else {
        const res = await api.post("/admin/companies", payload);
        if (res.data.success) {
          toast.success("Company created successfully");
          onSuccess();
          onClose();
          setFormData({ name: "", email: "", mobile: "", address: "", imageUrl: "" });
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
      <div className="bg-surface border border-border rounded-2xl p-7 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <div>
            <h2 className="text-xl font-bold font-lexend text-primary">
              {isEditing ? "Edit Company" : "Add New Company"}
            </h2>
            <p className="text-xs text-secondary mt-1">
              {isEditing ? "Update existing company details in the system" : "Register a new client company in the system"}
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
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-primary ml-1">Company Name <span className="text-red-400">*</span></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Buildings size={18} className="text-secondary" />
              </div>
              <input
                type="text"
                name="name"
                placeholder="Enter a company name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-surface-raised/50 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent focus:bg-bg transition-all"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-primary ml-1">Email <span className="text-red-400">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeSimple size={18} className="text-secondary" />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter an email address"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-surface-raised/50 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent focus:bg-bg transition-all"
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-primary ml-1">Mobile</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone size={18} className="text-secondary" />
                </div>
                <input
                  type="text"
                  name="mobile"
                  placeholder="Enter mobile number"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full bg-surface-raised/50 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent focus:bg-bg transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-primary ml-1">Address</label>
            <div className="relative">
              <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                <MapPin size={18} className="text-secondary" />
              </div>
              <textarea
                name="address"
                placeholder="Enter an address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                className="w-full bg-surface-raised/50 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent focus:bg-bg transition-all resize-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-primary ml-1">Company Logo <span className="text-secondary font-normal">(Optional)</span></label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageFileChange}
              className="hidden"
            />

            {formData.imageUrl ? (
              <div className="flex items-center gap-4 p-3 bg-surface-raised/30 border border-border/80 rounded-xl hover:border-border transition-colors">
                <div className="w-14 h-14 rounded-lg bg-surface border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                  <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-primary truncate">Logo Selected</p>
                  <p className="text-xs text-secondary mt-0.5">Custom image uploaded</p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="p-2 text-secondary hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-red-400/50 group"
                  title="Remove logo"
                >
                  <Trash size={18} className="group-hover:scale-110 transition-transform" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border/60 hover:border-accent bg-surface-raised/30 hover:bg-accent/5 rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
              >
                <div className="p-3 rounded-full bg-bg border border-border/50 group-hover:bg-accent/10 group-hover:border-accent/30 transition-colors">
                  <UploadSimple size={24} className="text-secondary group-hover:text-accent transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary group-hover:text-accent transition-colors">Click to upload logo</p>
                  <p className="text-[11px] text-secondary mt-1">SVG, PNG, JPG or WEBP (Max 5MB)</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-5 border-t border-border/60 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 bg-bg hover:bg-surface-raised border border-border rounded-xl text-sm text-secondary hover:text-primary font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-border"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg"
            >
              {loading ? (isEditing ? "Saving..." : "Creating...") : (isEditing ? "Save Changes" : "Create Company")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Export alias for backwards compatibility
export const AddCompanyModal = CompanyModal;
