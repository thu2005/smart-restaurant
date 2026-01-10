import React from "react";
import Icon from "../../../../components/AppIcon";

const TableCard = ({ table, onEdit, onToggleStatus, onGenerateQR, onPrint }) => {
    const isActive = table.isActive;

    const getStatusBadge = () => {
        const statusMap = {
            AVAILABLE: { bg: "bg-success/20", text: "text-success", label: "Available" },
            OCCUPIED: { bg: "bg-warning/20", text: "text-warning", label: "Occupied" },
            RESERVED: { bg: "bg-primary/20", text: "text-primary", label: "Reserved" },
            MAINTENANCE: { bg: "bg-error/20", text: "text-error", label: "Maintenance" },
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
                        Table {table.tableNumber}
                    </h3>
                    {getStatusBadge()}
                </div>
                <div className="flex gap-2">
                    {table.qrCode && (
                        <span className="inline-flex items-center gap-1 text-primary text-sm">
                            <Icon name="QrCode" size={16} />
                            <span className="font-medium">QR Ready</span>
                        </span>
                    )}
                </div>
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Icon name="Users" size={18} />
                    <span>Capacity: <strong className="text-foreground">{table.capacity}</strong> persons</span>
                </div>

                {table.location && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Icon name="MapPin" size={18} />
                        <span>{table.location}</span>
                    </div>
                )}

                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Icon name="Calendar" size={16} />
                    <span>Created: {new Date(table.createdAt).toLocaleDateString()}</span>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                <button
                    onClick={() => onGenerateQR(table)}
                    className="flex items-center gap-1 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
                >
                    <Icon name="QrCode" size={16} />
                    {table.qrCode ? 'View QR' : 'Generate QR'}
                </button>

                <button
                    onClick={() => onPrint?.(table)}
                    className="flex items-center gap-1 px-3 py-2 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80"
                >
                    <Icon name="Printer" size={16} />
                    Print
                </button>

                <button
                    onClick={() => onEdit(table)}
                    className="flex items-center gap-1 px-3 py-2 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80"
                >
                    <Icon name="Edit" size={16} />
                    Edit
                </button>

                <button
                    onClick={() => onToggleStatus?.(table)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${isActive
                        ? "bg-warning/20 text-warning hover:bg-warning/30"
                        : "bg-success/20 text-success hover:bg-success/30"
                        }`}
                >
                    {isActive ? "Deactivate" : "Activate"}
                </button>
            </div>
        </div>
    );
};

export default TableCard;