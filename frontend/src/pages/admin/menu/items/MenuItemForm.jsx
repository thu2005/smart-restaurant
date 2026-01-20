import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import menuService from "services/menuService";
import Button from "components/ui/Button";
import Input from "components/ui/Input";
import Icon from "components/AppIcon";
import { toast } from "sonner";
import PhotoManager from "./components/PhotoManager";
import ModifierSelector from "./components/ModifierSelector";

const MenuItemForm = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [activeTab, setActiveTab] = useState("details");
  const [categories, setCategories] = useState([]);
  const [itemData, setItemData] = useState(null);
  const [loading, setLoading] = useState(isEditMode);

  const {
    register,
    handleSubmit,
    reset,
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

  useEffect(() => {
    const loadData = async () => {
      try {
        const cats = await menuService.getCategories();
        // Filter only active categories for menu item creation/editing
        const activeCats = (Array.isArray(cats) ? cats : []).filter(cat => cat.isActive !== false);
        setCategories(activeCats);

        if (isEditMode) {
          const item = await menuService.getItemById(id);
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
        }
      } catch (error) {
        console.error(error);
        toast.error(t('admin.menu.items.messages.loadDataError'));
        if (isEditMode) navigate("/admin/menu/items");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, isEditMode, navigate, reset]);

  const onSubmit = async (data) => {
    try {
      let savedItem;
      if (isEditMode) {
        savedItem = await menuService.updateItem(id, data);
        toast.success(t('admin.menu.items.messages.updateSuccess'));
        setItemData(savedItem); // Update local state
      } else {
        savedItem = await menuService.createItem(data);
        toast.success(t('admin.menu.items.messages.createSuccess'));
        // Redirect to edit mode to allow adding photos/modifiers
        navigate(`/admin/menu/items/${savedItem.id}`, { replace: true });
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
    if (!id) return;
    try {
      const item = await menuService.getItemById(id);
      setItemData(item);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="p-6">{t('common.messages.loading')}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admin/menu/items")}
        >
          <Icon name="ArrowLeft" className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditMode ? t('admin.menu.items.form.titleEdit') : t('admin.menu.items.form.titleCreate')}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode
              ? t('admin.menu.items.form.titleEditName', { name: itemData?.name })
              : t('admin.menu.items.form.subtitleNew')}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {["details", "photos", "modifiers"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              disabled={!isEditMode && tab !== "details"}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
                ${!isEditMode && tab !== "details"
                  ? "opacity-50 cursor-not-allowed"
                  : ""
                }
              `}
            >
              {tab === "details" && t('admin.menu.items.form.tabs.details')}
              {tab === "photos" && t('admin.menu.items.form.tabs.photos')}
              {tab === "modifiers" && t('admin.menu.items.form.tabs.modifiers')}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === "details" && (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 bg-white p-6 rounded-lg border shadow-sm"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.menu.items.form.labels.name')}
                </label>
                <Input
                  {...register("name", { required: t('admin.menu.items.form.validation.nameRequired') })}
                  error={errors.name?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.menu.items.form.labels.category')}
                </label>
                <select
                  {...register("category_id", {
                    required: t('admin.menu.items.form.validation.categoryRequired'),
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                  <p className="text-red-500 text-xs mt-1">
                    {errors.category_id.message}
                  </p>
                )}
                {categories.length === 0 && (
                  <p className="text-amber-600 text-xs mt-1">
                    ⚠️ No active categories found. Please create and activate a category first.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.menu.items.form.labels.price')}
                </label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("price", {
                    required: t('admin.menu.items.form.validation.priceRequired'),
                    min: { value: 0.01, message: t('admin.menu.items.form.validation.pricePositive') },
                  })}
                  error={errors.price?.message}
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.menu.items.form.labels.description')}
                </label>
                <textarea
                  {...register("description")}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.menu.items.form.labels.prepTime')}
                </label>
                <Input
                  type="number"
                  {...register("prep_time_minutes", { min: 0 })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.menu.items.form.labels.status')}
                </label>
                <select
                  {...register("status")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="available">{t('admin.menu.items.status.available')}</option>
                  <option value="unavailable">{t('admin.menu.items.status.unavailable')}</option>
                  <option value="sold_out">{t('admin.menu.items.status.soldOut')}</option>
                </select>
              </div>

              <div className="col-span-2 flex items-center">
                <input
                  type="checkbox"
                  id="is_chef_recommended"
                  {...register("is_chef_recommended")}
                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label
                  htmlFor="is_chef_recommended"
                  className="ml-2 block text-sm text-gray-900"
                >
                  {t('admin.menu.items.form.labels.chefRecommended')}
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? t('admin.menu.items.form.buttons.saving')
                  : isEditMode
                    ? t('admin.menu.items.form.buttons.update')
                    : t('admin.menu.items.form.buttons.create')}
              </Button>
            </div>
          </form>
        )}

        {activeTab === "photos" && isEditMode && (
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <PhotoManager
              itemId={id}
              photos={itemData?.photos}
              onUpdate={refreshItem}
            />
          </div>
        )}

        {activeTab === "modifiers" && isEditMode && (
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <ModifierSelector
              itemId={id}
              attachedGroupIds={itemData?.modifier_groups?.map((g) => g.id) || []}
              onUpdate={refreshItem}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuItemForm;