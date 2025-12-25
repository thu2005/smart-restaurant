import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import menuService from "services/menuService";
import Button from "components/ui/Button";
import Input from "components/ui/Input";
import Icon from "components/AppIcon";
import { toast } from "sonner";
import PhotoManager from "./components/PhotoManager";
import ModifierSelector from "./components/ModifierSelector";

const MenuItemForm = () => {
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
        setCategories(Array.isArray(cats) ? cats : []);

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
        toast.error("Failed to load data");
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
        toast.success("Item updated successfully");
        setItemData(savedItem); // Update local state
      } else {
        savedItem = await menuService.createItem(data);
        toast.success("Item created successfully");
        // Redirect to edit mode to allow adding photos/modifiers
        navigate(`/admin/menu/items/${savedItem.id}`, { replace: true });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save item");
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

  if (loading) return <div className="p-6">Loading...</div>;

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
            {isEditMode ? "Edit Menu Item" : "Create Menu Item"}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode
              ? `Editing ${itemData?.name}`
              : "Add a new item to your menu"}
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
                ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
                ${
                  !isEditMode && tab !== "details"
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }
              `}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
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
                  Item Name *
                </label>
                <Input
                  {...register("name", { required: "Name is required" })}
                  error={errors.name?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  {...register("category_id", {
                    required: "Category is required",
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Select Category</option>
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("price", {
                    required: "Price is required",
                    min: { value: 0.01, message: "Price must be positive" },
                  })}
                  error={errors.price?.message}
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  {...register("description")}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prep Time (mins)
                </label>
                <Input
                  type="number"
                  {...register("prep_time_minutes", { min: 0 })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  {...register("status")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                  <option value="sold_out">Sold Out</option>
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
                  Chef Recommended
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : isEditMode
                  ? "Update Item"
                  : "Create Item"}
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
