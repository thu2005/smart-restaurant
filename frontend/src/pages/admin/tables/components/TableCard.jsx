import React from "react";
import { useTranslation } from "react-i18next";
import Icon from "../../../../components/AppIcon";

const TableCard = ({ table, onEdit, onToggleStatus, onGenerateQR, onPrint }) => {
    const { t } = useTranslation();
    const isActive = table.isActive;

    const getStatusBadge = () => {
        const statusMap = {
            AVAILABLE: { bg: "bg-success/20", text: "text-success", label: t('admin.tables.status.AVAILABLE') },
            OCCUPIED: { bg: "bg-warning/20", text: "text-warning", label: t('admin.tables.status.OCCUPIED') },
            RESERVED: { bg: "bg-primary/20", text: "text-primary", label: t('admin.tables.status.RESERVED') },
            MAINTENANCE: { bg: "bg-error/20", text: "text-error", label: t('admin.tables.status.MAINTENANCE') },
        };
        const status = statusMap[table.status] || statusMap.AVAILABLE;
        return (
            <span className={`px-2 py-1 rounded text-xs font-medium ${status.bg} ${status.text}`}>
                {status.label}
            </span>
        );
    };

    return (
        <div className="bg-card border border-border rounded-xl p-5 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-foreground mb-1">
                        {t('admin.orders.card.table', { number: table.tableNumber })}
                    </h3>
                    {getStatusBadge()}
                </div>
                <div className="flex gap-2">
                    {table.qrCode && (
                        <span className="inline-flex items-center gap-1 text-primary text-sm">
                            <Icon name="QrCode" size={16} />
                            <span className="font-medium">{t('admin.tables.card.qrReady')}</span>
                        </span>
                    )}
                </div>
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Icon name="Users" size={18} />
                    <span>{t('admin.tables.card.capacityLabel')}: <strong className="text-foreground">{table.capacity}</strong> {t('admin.tables.card.capacityUnit')}</span>
                </div>

                {table.location && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Icon name="MapPin" size={18} />
                        <span>{t(`admin.tables.locations.${table.location}`, { defaultValue: table.location })}</span>
                    </div>
                )}

                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Icon name="Calendar" size={16} />
                    <span>{t('admin.tables.card.created', { date: new Date(table.createdAt).toLocaleDateString() })}</span>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                <button
                    onClick={() => onGenerateQR(table)}
                    className="flex items-center gap-1 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
                >
                    <Icon name="QrCode" size={16} />
                    {table.qrCode ? t('admin.tables.actions.viewQR') : t('admin.tables.actions.generateQR')}
                </button>

                <button
                    onClick={() => onPrint?.(table)}
                    className="flex items-center gap-1 px-3 py-2 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80"
                >
                    <Icon name="Printer" size={16} />
                    {t('admin.tables.actions.print')}
                </button>

                <button
                    onClick={() => onEdit(table)}
                    className="flex items-center gap-1 px-3 py-2 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80"
                >
                    <Icon name="Edit" size={16} />
                    {t('admin.tables.actions.edit')}
                </button>

                <button
                    onClick={() => onToggleStatus?.(table)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${isActive
                        ? "bg-warning/20 text-warning hover:bg-warning/30"
                        : "bg-success/20 text-success hover:bg-success/30"
                        }`}
                >
                    {isActive ? t('admin.tables.actions.deactivate') : t('admin.tables.actions.activate')}
                </button>
            </div>
        </div>
    );
};

export default TableCard;