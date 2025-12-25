import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import Button from "components/ui/Button";
import Input from "components/ui/Input";
import Icon from "components/AppIcon";
import menuService from "services/menuService";
import { toast } from "sonner";

const ModifierGroupModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
}) => {
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      selection_type: "single",
      is_required: false,
      min_selections: 0,
      max_selections: 1,
      options: [], // We will handle options here too
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "options",
  });

  const selectionType = watch("selection_type");

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          name: initialData.name,
          selection_type: initialData.selection_type || "single",
          is_required: initialData.is_required || false,
          min_selections: initialData.min_selections || 0,
          max_selections: initialData.max_selections || 1,
          options: initialData.options || [],
        });
      } else {
        reset({
          name: "",
          selection_type: "single",
          is_required: false,
          min_selections: 0,
          max_selections: 1,
          options: [{ name: "", price_adjustment: 0 }],
        });
      }
    }
  }, [isOpen, initialData, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 my-8">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white rounded-t-lg z-10">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <Icon name="X" className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Group Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Group Name *
              </label>
              <Input
                {...register("name", { required: "Name is required" })}
                placeholder="e.g. Size, Toppings"
                error={errors.name?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selection Type
              </label>
              <select
                {...register("selection_type")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="single">Single Select (Radio)</option>
                <option value="multiple">Multi Select (Checkbox)</option>
              </select>
            </div>

            <div className="flex items-center pt-6">
              <input
                type="checkbox"
                id="is_required"
                {...register("is_required")}
                className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label
                htmlFor="is_required"
                className="ml-2 block text-sm text-gray-900"
              >
                Required Selection
              </label>
            </div>

            {selectionType === "multiple" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Selections
                  </label>
                  <Input
                    type="number"
                    {...register("min_selections", {
                      valueAsNumber: true,
                      min: 0,
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Selections
                  </label>
                  <Input
                    type="number"
                    {...register("max_selections", {
                      valueAsNumber: true,
                      min: 1,
                    })}
                  />
                </div>
              </>
            )}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-md font-medium">Options</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: "", price_adjustment: 0 })}
              >
                <Icon name="Plus" className="w-4 h-4 mr-1" /> Add Option
              </Button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-3 items-start">
                  <div className="flex-1">
                    <Input
                      {...register(`options.${index}.name`, { required: true })}
                      placeholder="Option Name"
                      className="h-9"
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      type="number"
                      step="0.01"
                      {...register(`options.${index}.price_adjustment`, {
                        valueAsNumber: true,
                      })}
                      placeholder="Price"
                      className="h-9"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-red-500 h-9 w-9"
                    onClick={() => remove(index)}
                  >
                    <Icon name="Trash2" className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Modifier Group"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModifierGroupModal;
