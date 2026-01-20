import React, { useState, useEffect } from "react";
import Icon from "../../../../components/AppIcon";
import Button from "../../../../components/ui/Button";
import authService from "../../../../services/authService";

const EditProfileModal = ({ isOpen, onClose, user, onUpdateSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || user.name || "",
        phone: user.phone || "",
      });
      setAvatarPreview(user.avatar || null);
    }
    // Reset errors when modal opens
    setError(null);
    setFieldErrors({});
  }, [user, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Validate fullName: only letters and spaces
    if (formData.fullName && !/^[A-Za-z\s]+$/.test(formData.fullName)) {
      errors.fullName = "Full name must only contain letters and spaces";
    }
    
    if (formData.fullName && formData.fullName.trim().length < 2) {
      errors.fullName = "Full name must be at least 2 characters";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    // Client-side validation
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    try {
      // 1. Update Profile Info
      await authService.updateProfile(formData);

      // 2. Update Avatar if changed
      if (avatarFile) {
        const formDataAvatar = new FormData();
        formDataAvatar.append("avatar", avatarFile);
        await authService.updateAvatar(formDataAvatar);
      }

      // 3. Refresh user data
      const updatedUser = await authService.getMe();
      
      onUpdateSuccess(updatedUser);
      onClose();
    } catch (err) {
      console.error("Update profile error:", err);
      
      // Handle validation errors from backend
      if (err.errors && Array.isArray(err.errors)) {
        const backendErrors = {};
        err.errors.forEach(error => {
          if (error.path) {
            backendErrors[error.path] = error.msg;
          }
        });
        setFieldErrors(backendErrors);
        setError("Please fix the errors below");
      } else {
        setError(err.message || "Failed to update profile");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-heading font-bold">Edit Profile</h2>
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="X" size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20 flex items-start gap-2">
               <Icon name="AlertCircle" size={16} className="mt-0.5" />
               <span>{error}</span>
            </div>
          )}

          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group cursor-pointer">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-muted bg-muted flex items-center justify-center">
                 {avatarPreview ? (
                   <img 
                     src={avatarPreview} 
                     alt="Avatar Preview" 
                     className="w-full h-full object-cover"
                   />
                 ) : (
                   <span className="text-3xl font-bold text-muted-foreground">
                     {(formData.fullName || "U").charAt(0).toUpperCase()}
                   </span>
                 )}
              </div>
              <label 
                htmlFor="avatar-upload"
                className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer"
              >
                <Icon name="Camera" size={24} />
              </label>
              <input 
                id="avatar-upload"
                type="file" 
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            <p className="text-xs text-muted-foreground">Click image to change avatar</p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
             <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <div className="relative">
                   <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Icon name="User" size={18} />
                   </div>
                   <input 
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all ${
                        fieldErrors.fullName 
                          ? 'border-destructive focus:border-destructive' 
                          : 'border-border focus:border-primary'
                      }`}
                      placeholder="Enter your full name"
                      required
                   />
                </div>
                {fieldErrors.fullName && (
                   <p className="text-xs text-destructive flex items-center gap-1">
                      <Icon name="AlertCircle" size={12} />
                      {fieldErrors.fullName}
                   </p>
                )}
                <p className="text-xs text-muted-foreground">Only letters and spaces allowed</p>
             </div>

             <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Phone Number</label>
                <div className="relative">
                   <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Icon name="Phone" size={18} />
                   </div>
                   <input 
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="Enter phone number"
                   />
                </div>
             </div>
             
             {/* Email (Read-only) */}
             <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                 <div className="relative">
                   <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Icon name="Mail" size={18} />
                   </div>
                   <input 
                      type="email"
                      value={user?.email || ""}
                      readOnly
                      disabled
                      className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-muted-foreground cursor-not-allowed"
                   />
                </div>
             </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2">
             <Button variant="ghost" onClick={onClose} type="button">
                Cancel
             </Button>
             <Button type="submit" isLoading={loading}>
                Save Changes
             </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
