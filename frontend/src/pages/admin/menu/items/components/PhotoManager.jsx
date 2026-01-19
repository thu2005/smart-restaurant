import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { createPortal } from "react-dom";
import menuService from "services/menuService";
import Button from "components/ui/Button";
import Icon from "components/AppIcon";
import { toast } from "sonner";

const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "");

const PhotoManager = ({ itemId, photos = [], onUpdate }) => {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("photos", files[i]);
    }

    try {
      setUploading(true);
      await menuService.uploadPhotos(itemId, formData);
      toast.success(t('admin.menu.items.photos.messages.uploadSuccess'));
      onUpdate(); // Refresh parent
    } catch (error) {
      console.error(error);
      toast.error(t('admin.menu.items.photos.messages.uploadError'));
    } finally {
      setUploading(false);
      e.target.value = ""; // Reset input
    }
  };

  const handleDelete = async (photoId) => {
    setDeleteConfirm(photoId);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await menuService.deletePhoto(itemId, deleteConfirm);
      toast.success(t('admin.menu.items.photos.messages.deleteSuccess'));
      onUpdate();
    } catch (error) {
      toast.error(t('admin.menu.items.photos.messages.deleteError'));
    } finally {
      setDeleteConfirm(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const handleSetPrimary = async (photoId) => {
    try {
      await menuService.setPrimaryPhoto(itemId, photoId);
      toast.success(t('admin.menu.items.photos.messages.primarySuccess'));
      onUpdate();
    } catch (error) {
      toast.error(t('admin.menu.items.photos.messages.primaryError'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{t('admin.menu.items.photos.title')}</h3>
        <div className="relative">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploading}
          />
          <Button disabled={uploading}>
            <Icon name="Upload" className="w-4 h-4 mr-2" />
            {uploading ? t('admin.menu.items.photos.uploadingBtn') : t('admin.menu.items.photos.uploadBtn')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative group border rounded-lg overflow-hidden aspect-square"
          >
            {/* <img ... /> */}
            <img
              src={photo.url?.startsWith("http") ? photo.url : `${BASE_URL}${photo.url}`}
              alt={t('admin.menu.items.form.labels.name')}
              className="w-full h-full object-cover"
            />
            {(photo.is_primary || photo.isPrimary) && (
              <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded shadow">
                {t('admin.menu.items.photos.primaryBadge')}
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {!(photo.is_primary || photo.isPrimary) && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleSetPrimary(photo.id)}
                  title={t('admin.menu.items.photos.setPrimary')}
                >
                  <Icon name="Star" className="w-4 h-4" />
                </Button>
              )}
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(photo.id)}
                title={t('common.actions.delete')}
              >
                <Icon name="Trash2" className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        {photos.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
            {t('admin.menu.items.photos.empty')}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[120]">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold mb-4">{t('admin.menu.items.photos.deleteConfirm')}</h3>
            <p className="text-gray-600 mb-6">
              {t('admin.menu.items.photos.deleteMessage')}
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={cancelDelete}>
                {t('common.actions.cancel')}
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                {t('common.actions.delete')}
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default PhotoManager;
