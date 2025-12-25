import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import Button from "components/ui/Button";
import Input from "components/ui/Input";
import Select from "components/ui/Select";
import Icon from "components/AppIcon";

const CategoryModal = ({ isOpen, onClose, onSubmit, initialData, title }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      display_order: 0,
      status: "active",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          name: initialData.name,
          description: initialData.description || "",
          display_order: initialData.display_order || 0,
          status: initialData.status || "active",
        });
      } else {
        reset({
          name: "",
          description: "",
          display_order: 0,
          status: "active",
        });
      }
    }
  }, [isOpen, initialData, reset]);

  if (!isOpen) return null;

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <Icon name="X" className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <Input
              {...register("name", {
                required: "Name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
                maxLength: {
                  value: 50,
                  message: "Name must be less than 50 characters",
                },
              })}
              placeholder="Category Name"
              error={errors.name?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register("description")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              rows="3"
              placeholder="Optional description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Order
              </label>
              <Input
                type="number"
                {...register("display_order", {
                  min: { value: 0, message: "Order must be non-negative" },
                  valueAsNumber: true,
                })}
                placeholder="0"
                error={errors.display_order?.message}
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Category"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
