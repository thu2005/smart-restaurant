import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import Button from "components/ui/Button";
import Input from "components/ui/Input";
import Select from "components/ui/Select";
import Icon from "components/AppIcon";

const CategoryModal = ({ isOpen, onClose, onSubmit, initialData, title }) => {
  const { t } = useTranslation();
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
    { value: "active", label: t('common.status.active') },
    { value: "inactive", label: t('common.status.inactive') },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
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
              {t('admin.menu.categories.modal.nameLabel')}
            </label>
            <Input
              {...register("name", {
                required: t('admin.menu.categories.modal.validation.nameRequired'),
                minLength: {
                  value: 2,
                  message: t('admin.menu.categories.modal.validation.nameMin'),
                },
                maxLength: {
                  value: 50,
                  message: t('admin.menu.categories.modal.validation.nameMax'),
                },
              })}
              placeholder={t('admin.menu.categories.modal.namePlaceholder')}
              error={errors.name?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.menu.categories.modal.descriptionLabel')}
            </label>
            <textarea
              {...register("description", {
                maxLength: {
                  value: 500,
                  message: t('admin.menu.categories.modal.validation.descMax')
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              rows="3"
              placeholder={t('admin.menu.categories.modal.descriptionPlaceholder')}
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.menu.categories.modal.orderLabel')}
              </label>
              <Input
                type="number"
                {...register("display_order", {
                  min: { value: 0, message: t('admin.menu.categories.modal.validation.orderMin') },
                  valueAsNumber: true,
                })}
                placeholder={t('admin.menu.categories.modal.orderPlaceholder')}
                error={errors.display_order?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.menu.categories.modal.statusLabel')}
              </label>
              <select
                {...register("status")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="active">{t('common.status.active')}</option>
                <option value="inactive">{t('common.status.inactive')}</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={onClose} type="button">
              {t('common.actions.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('admin.menu.categories.modal.savingBtn') : t('admin.menu.categories.modal.saveBtn')}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default CategoryModal;
