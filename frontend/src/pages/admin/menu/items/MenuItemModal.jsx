import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import menuService from "services/menuService";
import Button from "components/ui/Button";
import Input from "components/ui/Input";
import Icon from "components/AppIcon";
import { toast } from "sonner";
import PhotoManager from "./components/PhotoManager";
import ModifierSelector from "./components/ModifierSelector";

const MenuItemModal = ({ isOpen, onClose, itemId, onSave }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("details");
  const [categories, setCategories] = useState([]);
  const [itemData, setItemData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Internal ID to handle switching from Create -> Edit mode without closing
  const [currentId, setCurrentId] = useState(itemId);

  const isEditMode = !!currentId;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      category_id: "",
      price: "",
      description: "",
      prep_time_minutes: 0,
      status: "available",
      is_chef_recommended: false,
    },
  });

  // Reset internal state when prop changes
  useEffect(() => {
    if (isOpen) {
      setCurrentId(itemId);
      setActiveTab("details");
    }
  }, [isOpen, itemId]);

  // Fetch data
  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const cats = await menuService.getCategories();
        // Filter only active categories for menu item creation/editing
        const activeCats = (Array.isArray(cats) ? cats : []).filter(cat => cat.isActive !== false);
        setCategories(activeCats);

        if (currentId) {
          const item = await menuService.getItemById(currentId);
          setItemData(item);
          reset({
            name: item.name,
            category_id: item.category_id,
            price: item.price,
            description: item.description || "",
            prep_time_minutes: item.prep_time_minutes || 0,
            status: item.status,
            is_chef_recommended: item.is_chef_recommended,
          });
        } else {
          setItemData(null);
          reset({
            name: "",
            category_id: "",
            price: "",
            description: "",
            prep_time_minutes: 0,
            status: "available",
            is_chef_recommended: false,
          });
        }
      } catch (error) {
        console.error(error);
        toast.error(t('admin.menu.items.messages.loadDataError'));
        onClose();
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [isOpen, currentId, reset]);

  const onSubmit = async (data) => {
    try {
      let savedItem;
      if (isEditMode) {
        savedItem = await menuService.updateItem(currentId, data);
        toast.success(t('admin.menu.items.messages.updateSuccess'));
        setItemData(savedItem);
        onSave(); // Refresh parent list
        onClose();
      } else {
        savedItem = await menuService.createItem(data);
        toast.success(t('admin.menu.items.messages.createSuccessWithPhotos'));
        setCurrentId(savedItem.id); // Switch to edit mode
        setItemData(savedItem);
        onSave(); // Refresh parent list
        // Don't close, let user add photos
      }
    } catch (error) {
      console.error(error);
      const errorMessage = error.response?.data?.message || error.message;
      if (errorMessage?.includes('inactive category')) {
        toast.error(errorMessage);
      } else {
        toast.error(t('admin.menu.items.messages.saveError'));
      }
    }
  };

  const refreshItem = async () => {
    if (!currentId) return;
    try {
      const item = await menuService.getItemById(currentId);
      setItemData(item);
    } catch (error) {
      console.error(error);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col m-4 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">
            {isEditMode ? t('admin.menu.items.form.titleEdit') : t('admin.menu.items.form.titleNew')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <Icon name="X" className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-6">
          <button
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "details"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            onClick={() => setActiveTab("details")}
          >
            {t('admin.menu.items.form.tabs.details')}
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "photos"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700"
              } ${!isEditMode ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={() => isEditMode && setActiveTab("photos")}
            disabled={!isEditMode}
          >
            {t('admin.menu.items.form.tabs.photos')}
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "modifiers"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700"
              } ${!isEditMode ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={() => isEditMode && setActiveTab("modifiers")}
            disabled={!isEditMode}
          >
            {t('admin.menu.items.form.tabs.modifiers')}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!isEditMode && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4 rounded-r-lg">
              <div className="flex">
                <div className="py-1">
                  <Icon name="Info" className="h-5 w-5 text-blue-500 mr-3" />
                </div>
                <div>
                  <p className="text-sm text-blue-700">
                    {t('admin.menu.items.form.infoBox')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-8">{t('common.messages.loading')}</div>
          ) : (
            <>
              {activeTab === "details" && (
                <form
                  id="item-form"
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label={t('admin.menu.items.form.labels.name')}
                      {...register("name", {
                        required: t('admin.menu.items.form.validation.nameRequired'),
                        minLength: {
                          value: 2,
                          message: t('admin.menu.items.form.validation.nameMin')
                        },
                        maxLength: {
                          value: 80,
                          message: t('admin.menu.items.form.validation.nameMax')
                        }
                      })}
                      error={errors.name?.message}
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('admin.menu.items.form.labels.category')}
                      </label>
                      <select
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        {...register("category_id", {
                          required: t('admin.menu.items.form.validation.categoryRequired'),
                        })}
                      >
                        <option value="">{t('admin.menu.items.form.placeholders.selectCategory')}</option>
                        {categories.length === 0 && (
                          <option disabled>No active categories available</option>
                        )}
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      {errors.category_id && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.category_id.message}
                        </p>
                      )}
                      {categories.length === 0 && (
                        <p className="text-sm text-amber-600 mt-1">
                          ⚠️ No active categories found. Please create and activate a category first.
                        </p>
                      )}
                    </div>
                    <Input
                      label={t('admin.menu.items.form.labels.price')}
                      type="number"
                      step="0.01"
                      {...register("price", {
                        required: t('admin.menu.items.form.validation.priceRequired'),
                        min: {
                          value: 0.01,
                          message: t('admin.menu.items.form.validation.pricePositive')
                        },
                        max: {
                          value: 999999,
                          message: t('admin.menu.items.form.validation.priceMax')
                        }
                      })}
                      error={errors.price?.message}
                    />
                    <Input
                      label={t('admin.menu.items.form.labels.prepTime')}
                      type="number"
                      {...register("prep_time_minutes", {
                        min: {
                          value: 0,
                          message: t('admin.menu.items.form.validation.prepTimeNegative')
                        },
                        max: {
                          value: 240,
                          message: t('admin.menu.items.form.validation.prepTimeMax')
                        }
                      })}
                      error={errors.prep_time_minutes?.message}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.menu.items.form.labels.description')}
                    </label>
                    <textarea
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[100px]"
                      {...register("description", {
                        maxLength: {
                          value: 500,
                          message: t('admin.menu.items.form.validation.descMax')
                        }
                      })}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('admin.menu.items.form.labels.status')}
                      </label>
                      <select
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        {...register("status")}
                      >
                        <option value="available">{t('admin.menu.items.status.available')}</option>
                        <option value="sold_out">{t('admin.menu.items.status.soldOut')}</option>
                        <option value="unavailable">{t('admin.menu.items.status.unavailable')}</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <input
                        type="checkbox"
                        id="is_chef_recommended"
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        {...register("is_chef_recommended")}
                      />
                      <label
                        htmlFor="is_chef_recommended"
                        className="text-sm font-medium text-gray-700"
                      >
                        {t('admin.menu.items.form.labels.chefRecommended')}
                      </label>
                    </div>
                  </div>
                </form>
              )}

              {activeTab === "photos" && isEditMode && (
                <PhotoManager
                  itemId={currentId}
                  photos={itemData?.photos || []}
                  onUpdate={refreshItem}
                />
              )}

              {activeTab === "modifiers" && isEditMode && (
                <ModifierSelector
                  itemId={currentId}
                  attachedGroupIds={itemData?.modifier_groups?.map(g => g.id) || []}
                  onUpdate={refreshItem}
                />
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-2 rounded-b-lg">
          <Button variant="outline" onClick={onClose}>
            {t('common.actions.cancel')}
          </Button>
          {activeTab === "details" && (
            <Button
              type="submit"
              form="item-form"
              disabled={isSubmitting || loading}
            >
              {isSubmitting
                ? t('admin.menu.items.form.buttons.saving')
                : isEditMode
                  ? t('admin.menu.items.form.buttons.saveChanges')
                  : t('admin.menu.items.form.buttons.create')}
            </Button>
          )}
          {activeTab !== "details" && <Button onClick={onClose}>{t('admin.menu.items.form.buttons.done')}</Button>}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MenuItemModal;
