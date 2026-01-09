import React, { useState } from "react";
import { createPortal } from "react-dom";
import menuService from "services/menuService";
import Button from "components/ui/Button";
import Icon from "components/AppIcon";
import { toast } from "sonner";

const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "");

const PhotoManager = ({ itemId, photos = [], onUpdate }) => {
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
      toast.success("Photos uploaded successfully");
      onUpdate(); // Refresh parent
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload photos");
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
      toast.success("Photo deleted");
      onUpdate();
    } catch (error) {
      toast.error("Failed to delete photo");
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
      toast.success("Primary photo updated");
      onUpdate();
    } catch (error) {
      toast.error("Failed to set primary photo");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Item Photos</h3>
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
            {uploading ? "Uploading..." : "Upload Photos"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative group border rounded-lg overflow-hidden aspect-square"
          >
            <img
              src={`${BASE_URL}${photo.url}`}
              alt="Menu Item"
              className="w-full h-full object-cover"
            />
            {(photo.is_primary || photo.isPrimary) && (
              <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded shadow">
                Primary
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {!(photo.is_primary || photo.isPrimary) && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleSetPrimary(photo.id)}
                  title="Set as Primary"
                >
                  <Icon name="Star" className="w-4 h-4" />
                </Button>
              )}
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(photo.id)}
                title="Delete"
              >
                <Icon name="Trash2" className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        {photos.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
            No photos uploaded yet.
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[120]">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold mb-4">Delete this photo?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this photo? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={cancelDelete}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
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
