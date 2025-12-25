import React, { useState } from "react";
import menuService from "services/menuService";
import Button from "components/ui/Button";
import Icon from "components/AppIcon";
import { toast } from "sonner";

const PhotoManager = ({ itemId, photos = [], onUpdate }) => {
  const [uploading, setUploading] = useState(false);

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
    if (!window.confirm("Delete this photo?")) return;
    try {
      await menuService.deletePhoto(itemId, photoId);
      toast.success("Photo deleted");
      onUpdate();
    } catch (error) {
      toast.error("Failed to delete photo");
    }
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
              src={photo.url}
              alt="Menu Item"
              className="w-full h-full object-cover"
            />
            {photo.is_primary && (
              <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded shadow">
                Primary
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {!photo.is_primary && (
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
    </div>
  );
};

export default PhotoManager;
