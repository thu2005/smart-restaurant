import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { createPortal } from "react-dom";
import Icon from "../../../../components/AppIcon";
import { LOCATIONS, STATUS_OPTIONS, validateTableData } from "../../../../utils/tableConstants";

const TableForm = ({ table, onSubmit, onClose }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        tableNumber: "",
        capacity: "",
        location: "",
        customLocation: "",
        status: "AVAILABLE",
        description: "",
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (table) {
            const isCustomLocation = table.location && !LOCATIONS.includes(table.location);
            setFormData({
                tableNumber: table.tableNumber || "",
                capacity: table.capacity || "",
                location: isCustomLocation ? "custom" : (table.location || ""),
                customLocation: isCustomLocation ? table.location : "",
                status: table.status || "AVAILABLE",
                description: table.description || "",
            });
        }
    }, [table]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const finalLocation = formData.location === "custom" ? formData.customLocation : formData.location;

        const validationErrors = validateTableData({
            ...formData,
            capacity: parseInt(formData.capacity),
        });

        if (!finalLocation || finalLocation.trim() === "") {
            validationErrors.location = t('admin.tables.form.validation.locationRequired');
        }

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                ...formData,
                location: finalLocation,
                capacity: parseInt(formData.capacity),
            });
            onClose();
        } catch (error) {
            setErrors({ submit: error.message || t('admin.tables.errors.saveFailed') });
        } finally {
            setIsSubmitting(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[110]">
            <div className="bg-card rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-foreground">
                        {table ? t('admin.tables.form.titleEdit') : t('admin.tables.form.titleNew')}
                    </h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <Icon name="X" size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {errors.submit && (
                        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg text-sm">
                            {errors.submit}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            {t('admin.tables.form.labels.tableNumber')} <span className="text-error">*</span>
                        </label>
                        <input
                            type="text"
                            name="tableNumber"
                            value={formData.tableNumber}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-lg border ${errors.tableNumber ? "border-error" : "border-border"} bg-background text-foreground`}
                            placeholder={t('admin.tables.form.placeholders.tableNumber')}
                        />
                        {errors.tableNumber && <p className="text-error text-sm mt-1">{errors.tableNumber}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            {t('admin.tables.form.labels.capacity')} <span className="text-error">*</span>
                        </label>
                        <input
                            type="number"
                            name="capacity"
                            value={formData.capacity}
                            onChange={handleChange}
                            min="1"
                            max="20"
                            className={`w-full px-4 py-3 rounded-lg border ${errors.capacity ? "border-error" : "border-border"} bg-background text-foreground`}
                            placeholder={t('admin.tables.form.placeholders.capacity')}
                        />
                        {errors.capacity && <p className="text-error text-sm mt-1">{errors.capacity}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            {t('admin.tables.form.labels.location')} <span className="text-error">*</span>
                        </label>
                        <select
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-lg border ${errors.location ? "border-error" : "border-border"} bg-background text-foreground`}
                        >
                            <option value="">{t('admin.tables.form.placeholders.selectLocation')}</option>
                            {LOCATIONS.map((loc) => (
                                <option key={loc} value={loc}>{t(`admin.tables.locations.${loc}`) || loc}</option>
                            ))}
                            <option value="custom">{t('admin.tables.form.labels.customLocation')}</option>
                        </select>
                        {formData.location === "custom" && (
                            <input
                                type="text"
                                name="customLocation"
                                value={formData.customLocation}
                                onChange={handleChange}
                                className="w-full px-4 py-3 mt-2 rounded-lg border border-border bg-background text-foreground"
                                placeholder={t('admin.tables.form.placeholders.customLocation')}
                            />
                        )}
                        {errors.location && <p className="text-error text-sm mt-1">{errors.location}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            {t('admin.tables.form.labels.status')} <span className="text-error">*</span>
                        </label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground"
                        >
                            {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{t(`admin.tables.status.${opt.value}`)}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50"
                        >
                            {isSubmitting ? t('admin.tables.form.submit.saving') : table ? t('admin.tables.form.submit.update') : t('admin.tables.form.submit.create')}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80"
                        >
                            {t('admin.tables.actions.cancel')}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default TableForm;