import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Icon from "../../../components/AppIcon";
import { tableAPI } from "../../../services/tableService";
import TableCard from "./components/TableCard";
import TableForm from "./components/TableForm";
import QRPreviewContainer from "./components/QRPreviewContainer";
import PrintPreviewModal from "../../../components/PrintPreviewModal";

const TableManagement = () => {
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingTable, setEditingTable] = useState(null);
    const [filters, setFilters] = useState({
        status: "",
        sortBy: "tableNumber",
        sortOrder: "asc",
    });

    // QR Preview state
    const [showQRPreview, setShowQRPreview] = useState(false);
    const [selectedTable, setSelectedTable] = useState(null);
    const [qrData, setQrData] = useState(null);

    // Print Preview state
    const [showPrintPreview, setShowPrintPreview] = useState(false);
    const [previewTableId, setPreviewTableId] = useState(null);

    // Batch operations
    const [downloadingAll, setDownloadingAll] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [showRegenModal, setShowRegenModal] = useState(false);

    // Get restaurantId from localStorage or user context
    const getRestaurantId = () => {
        try {
            const userData = JSON.parse(localStorage.getItem("user") || "{}");
            return userData.restaurantId;
        } catch {
            return null;
        }
    };

    useEffect(() => {
        fetchTables();
    }, [filters]);

    const fetchTables = async () => {
        try {
            setLoading(true);
            setError(null);

            const restaurantId = getRestaurantId();
            if (!restaurantId) {
                throw new Error("Restaurant ID not found. Please log in.");
            }

            const result = await tableAPI.getAllTables(restaurantId);
            setTables(result.data || []);
        } catch (err) {
            const message = err.response?.data?.message || err.message || "Failed to fetch tables";
            setError(message);
            console.error("Error fetching tables:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTable = async (tableData) => {
        const restaurantId = getRestaurantId();
        if (!restaurantId) {
            throw new Error("Restaurant ID not found. Please ensure you are logged in.");
        }

        await tableAPI.createTable({ ...tableData, restaurantId });
        await fetchTables();
        setShowForm(false);
    };

    const handleUpdateTable = async (tableData) => {
        await tableAPI.updateTable(editingTable.id, tableData);
        await fetchTables();
        setShowForm(false);
        setEditingTable(null);
    };

    const handleEdit = (table) => {
        setEditingTable(table);
        setShowForm(true);
    };

    const handleToggleStatus = async (table) => {
        const newStatus = table.status === "AVAILABLE" ? "MAINTENANCE" : "AVAILABLE";
        try {
            await tableAPI.updateTableStatus(table.id, newStatus);
            await fetchTables();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update status");
        }
    };

    // Generate QR for single table
    const handleGenerateQR = async (table) => {
        try {
            setSelectedTable(table);

            // If table has QR, fetch it; otherwise generate new
            const response = await tableAPI.generateQR(table.id);
            setQrData(response.data);
            setShowQRPreview(true);
            await fetchTables(); // Refresh to update QR status
        } catch (err) {
            setError(err.response?.data?.message || "Failed to generate QR code");
        }
    };

    // Regenerate QR from preview modal
    const handleRegenerateQR = async (table) => {
        try {
            const response = await tableAPI.generateQR(table.id);
            setQrData(response.data);
            await fetchTables();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to regenerate QR code");
        }
    };

    // Batch regenerate all QRs
    const handleRegenerateAllQRs = async () => {
        try {
            setIsRegenerating(true);
            const result = await tableAPI.regenerateAllQRs();
            alert(`Success! ${result.count || 0} QR codes regenerated.`);
            setShowRegenModal(false);
            await fetchTables();
        } catch (err) {
            alert("An error occurred while regenerating QR codes.");
            console.error("Bulk regen failed:", err);
        } finally {
            setIsRegenerating(false);
        }
    };

    // Download all QRs as ZIP or PDF
    const handleDownloadAll = async (format) => {
        try {
            setDownloadingAll(true);
            const restaurantId = getRestaurantId();
            const blob = await tableAPI.downloadAllQR(format, "single", restaurantId);
            const filename = format === "pdf" ? "All-Tables-QR.pdf" : "All-Tables-QR.zip";

            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            setError("Download failed. Please try again.");
            console.error("Download all failed:", err);
        } finally {
            setDownloadingAll(false);
        }
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingTable(null);
    };

    const closeQRPreview = () => {
        setShowQRPreview(false);
        setSelectedTable(null);
        setQrData(null);
    };

    const openAllPrintPreview = () => {
        setPreviewTableId(null);
        setShowPrintPreview(true);
    };

    const openSinglePrintPreview = (tableId) => {
        setPreviewTableId(tableId);
        setShowPrintPreview(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl font-heading font-bold text-foreground">Table Management</h1>
                <div className="flex flex-wrap gap-3">
                    {/* Regenerate All */}
                    <button
                        onClick={() => setShowRegenModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-warning/20 text-warning border border-warning/30 rounded-lg hover:bg-warning/30"
                        title="Dangerous: Regenerate ALL QR codes"
                    >
                        <Icon name="RefreshCw" size={18} />
                        <span className="hidden sm:inline">Regen All</span>
                    </button>

                    {/* Download ZIP */}
                    <button
                        onClick={() => handleDownloadAll("zip")}
                        disabled={downloadingAll}
                        className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 disabled:opacity-50"
                        title="Download all QR codes as ZIP"
                    >
                        <Icon name="FileDown" size={18} />
                        <span className="hidden sm:inline">ZIP</span>
                    </button>

                    {/* Download PDF */}
                    <button
                        onClick={() => handleDownloadAll("pdf")}
                        disabled={downloadingAll}
                        className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 disabled:opacity-50"
                        title="Download all QR codes as PDF"
                    >
                        <Icon name="FileText" size={18} />
                        <span className="hidden sm:inline">PDF</span>
                    </button>

                    {/* Print / Preview All */}
                    <button
                        onClick={openAllPrintPreview}
                        className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80"
                        title="Preview and print all QR codes as PDF"
                    >
                        <Icon name="Printer" size={18} />
                        <span className="hidden sm:inline">Print / Preview</span>
                    </button>

                    {/* Add Table */}
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                    >
                        <Icon name="Plus" size={18} />
                        Add Table
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-error/10 border border-error/20 rounded-lg p-4 flex items-start gap-3">
                    <Icon name="AlertCircle" className="text-error flex-shrink-0" size={20} />
                    <div className="flex-1">
                        <p className="text-error font-medium">Error</p>
                        <p className="text-error/80 text-sm">{error}</p>
                    </div>
                    <button onClick={() => setError(null)} className="text-error hover:text-error/80">
                        <Icon name="X" size={18} />
                    </button>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-4 p-4 bg-card border border-border rounded-lg">
                <select
                    value={filters.status}
                    onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                    className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                >
                    <option value="">All Status</option>
                    <option value="AVAILABLE">Available</option>
                    <option value="OCCUPIED">Occupied</option>
                    <option value="RESERVED">Reserved</option>
                    <option value="MAINTENANCE">Maintenance</option>
                </select>
                <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value }))}
                    className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                >
                    <option value="tableNumber">Sort by Table Number</option>
                    <option value="capacity">Sort by Capacity</option>
                    <option value="createdAt">Sort by Created</option>
                </select>
                <button
                    onClick={fetchTables}
                    className="flex items-center gap-2 px-3 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80"
                >
                    <Icon name="RefreshCw" size={18} />
                    Refresh
                </button>
            </div>

            {/* Tables Grid */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Icon name="Loader2" size={32} className="animate-spin text-primary" />
                </div>
            ) : tables.length === 0 ? (
                <div className="text-center py-20">
                    <Icon name="Grid3x3" size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Tables Found</h3>
                    <p className="text-muted-foreground mb-6">
                        {filters.status ? "Try adjusting your filters or create a new table." : "Get started by creating your first table."}
                    </p>
                    <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
                        <Icon name="Plus" size={18} className="inline mr-2" />
                        Create First Table
                    </button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tables.map((table) => (
                            <TableCard
                                key={table.id}
                                table={table}
                                onEdit={handleEdit}
                                onToggleStatus={handleToggleStatus}
                                onGenerateQR={handleGenerateQR}
                                onPrint={() => openSinglePrintPreview(table.id)}
                            />
                        ))}
                    </div>
                    <div className="text-center text-muted-foreground">
                        Showing {tables.length} table{tables.length !== 1 ? "s" : ""}
                    </div>
                </>
            )}

            {/* Form Modal */}
            {showForm && (
                <TableForm
                    table={editingTable}
                    onSubmit={editingTable ? handleUpdateTable : handleCreateTable}
                    onClose={closeForm}
                />
            )}

            {/* QR Preview Modal */}
            {showQRPreview && selectedTable && (
                <QRPreviewContainer
                    table={selectedTable}
                    qrData={qrData}
                    onRegenerate={handleRegenerateQR}
                    onClose={closeQRPreview}
                />
            )}

            {/* Print Preview Modal */}
            {showPrintPreview && (
                <PrintPreviewModal
                    isOpen={showPrintPreview}
                    onClose={() => setShowPrintPreview(false)}
                    tableId={previewTableId}
                />
            )}

            {/* Regenerate All Confirmation Modal */}
            {showRegenModal && createPortal(
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-card rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                        {/* Warning Header */}
                        <div className="bg-error/10 px-6 py-4 border-b border-error/20 flex items-center gap-3">
                            <div className="p-2 bg-error/20 rounded-full text-error">
                                <Icon name="AlertTriangle" size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-error">Important Warning</h3>
                            <button
                                onClick={() => setShowRegenModal(false)}
                                className="ml-auto text-muted-foreground hover:text-foreground"
                            >
                                <Icon name="X" size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <p className="text-foreground font-medium mb-2">
                                Are you sure you want to regenerate QR codes for ALL tables?
                            </p>
                            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 bg-muted p-3 rounded-lg">
                                <li>All existing QR codes will <strong>stop working immediately</strong>.</li>
                                <li>Customers using old QR codes will no longer be able to place orders.</li>
                                <li>You will need to <strong>reprint and replace all</strong> new QR codes.</li>
                            </ul>
                        </div>

                        {/* Footer Buttons */}
                        <div className="px-6 py-4 bg-muted border-t border-border flex justify-end gap-3">
                            <button
                                onClick={() => setShowRegenModal(false)}
                                className="px-4 py-2 bg-card border border-border rounded-lg text-foreground hover:bg-muted font-medium"
                                disabled={isRegenerating}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRegenerateAllQRs}
                                disabled={isRegenerating}
                                className="px-4 py-2 bg-error hover:bg-error/90 text-error-foreground rounded-lg font-bold shadow-sm flex items-center gap-2"
                            >
                                {isRegenerating ? (
                                    <>
                                        <Icon name="RefreshCw" size={18} className="animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    "Confirm Regeneration"
                                )}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default TableManagement;