import React, { useState, useEffect, useRef } from "react";
import { X, Camera, Trash, UserGear, UploadSimple } from "@phosphor-icons/react";
import { api, handleApiError } from "../../lib/axios";
import { toast } from "sonner";

interface AddCompanyUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  memberToEdit?: any | null;
}

export function AddCompanyUserModal({ isOpen, onClose, onSuccess, memberToEdit }: AddCompanyUserModalProps) {
  const isEditing = Boolean(memberToEdit);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    companyId: "",
    maxUsers: 10,
    storageGb: 5,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCompanies();
    }
  }, [isOpen]);

  useEffect(() => {
    if (memberToEdit) {
      setFormData({
        name: memberToEdit.user?.name || "",
        email: memberToEdit.user?.email || "",
        companyId: memberToEdit.company?.id ? String(memberToEdit.company.id) : "",
        maxUsers: memberToEdit.maxUsers || 10,
        storageGb: memberToEdit.storageGb || 5,
      });
      setImagePreview(memberToEdit.user?.imageUrl || null);
      setImageBase64(null);
    } else {
      setFormData({ name: "", email: "", companyId: "", maxUsers: 10, storageGb: 5 });
      setImagePreview(null);
      setImageBase64(null);
    }
  }, [memberToEdit, isOpen]);

  const fetchCompanies = async () => {
    try {
      const res = await api.get("/admin/companies");
      if (res.data.success) {
        setCompanies(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch companies:", error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Avatar image size must be under 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageBase64("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: name === "maxUsers" || name === "storageGb" ? parseInt(value) || 0 : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyId) {
      toast.error("Please select a company");
      return;
    }
    
    setLoading(true);

    try {
      const payload: any = { 
        ...formData,
        companyId: parseInt(formData.companyId)
      };

      if (imageBase64 !== null) {
        payload.imageBase64 = imageBase64;
      }

      if (isEditing && memberToEdit?.id) {
        const res = await api.patch(`/admin/company-members/${memberToEdit.id}`, payload);
        if (res.data.success) {
          toast.success(res.data.message || "Company Admin updated successfully");
          onSuccess();
          onClose();
        }
      } else {
        const res = await api.post("/admin/company-members", payload);
        if (res.data.success) {
          toast.success(res.data.message || "Company Admin added successfully");
          onSuccess();
          onClose();
          setFormData({ name: "", email: "", companyId: "", maxUsers: 10, storageGb: 5 });
          setImagePreview(null);
          setImageBase64(null);
        }
      }
    } catch (err: any) {
      handleApiError(err, isEditing ? "Failed to update company admin" : "Failed to add company admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <h2 className="text-lg font-bold font-lexend text-primary">
            {isEditing ? "Edit Company Admin" : "Add Company Admin"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-secondary hover:text-primary hover:bg-bg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Upload (Circular) */}
          <div className="flex flex-col items-center justify-center pt-1 pb-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <div className="relative group">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-full border-2 border-dashed border-border hover:border-accent bg-bg flex items-center justify-center overflow-hidden cursor-pointer transition-all shadow-inner group-hover:ring-4 group-hover:ring-accent/20"
                title="Upload Profile Picture"
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Admin Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-secondary group-hover:text-accent transition-colors">
                    <Camera size={26} />
                    <span className="text-[10px] font-medium mt-0.5">Upload</span>
                  </div>
                )}
              </div>

              {imagePreview && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-1 -right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md transition-transform hover:scale-110"
                  title="Remove Avatar"
                >
                  <Trash size={12} weight="bold" />
                </button>
              )}
            </div>
            <p className="text-[11px] text-secondary mt-2">
              Admin Profile Picture <span className="text-muted">(Optional)</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-primary mb-1">Company *</label>
            <select
              name="companyId"
              value={formData.companyId}
              onChange={handleChange}
              className="w-full bg-bg border border-border rounded-xl px-3 py-2 text-sm text-primary focus:outline-none focus:border-accent"
              required
            >
              <option value="">Select Company</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>{company.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-primary mb-1">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-bg border border-border rounded-xl px-3 py-2 text-sm text-primary focus:outline-none focus:border-accent"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-primary mb-1">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-bg border border-border rounded-xl px-3 py-2 text-sm text-primary focus:outline-none focus:border-accent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-primary mb-1">Max Users Limit</label>
              <input
                type="number"
                name="maxUsers"
                min="1"
                value={formData.maxUsers}
                onChange={handleChange}
                className="w-full bg-bg border border-border rounded-xl px-3 py-2 text-sm text-primary focus:outline-none focus:border-accent"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-primary mb-1">Storage Limit (GB)</label>
              <input
                type="number"
                name="storageGb"
                min="1"
                value={formData.storageGb}
                onChange={handleChange}
                className="w-full bg-bg border border-border rounded-xl px-3 py-2 text-sm text-primary focus:outline-none focus:border-accent"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-bg hover:bg-surface-raised border border-border rounded-xl text-sm text-secondary font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-semibold transition-colors shadow-xs disabled:opacity-50"
            >
              {loading ? (isEditing ? "Saving..." : "Adding...") : (isEditing ? "Save Changes" : "Add Admin")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

