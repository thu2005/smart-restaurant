import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { createPortal } from "react-dom";
import Icon from "../../../components/AppIcon";
import { tableAPI } from "../../../services/tableService";
import { getRestaurantId } from "../../../services/menuService";
import TableCard from "./components/TableCard";
import TableForm from "./components/TableForm";
import QRPreviewContainer from "./components/QRPreviewContainer";
import PrintPreviewModal from "../../../components/PrintPreviewModal";

const TableManagement = () => {
  const { t } = useTranslation();
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

  // Get user data from localStorage
  const getUserData = () => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  };

  useEffect(() => {
    fetchTables();
  }, [filters]);

  const fetchTables = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = getUserData();
      if (userData.role === "CUSTOMER") {
        setError(t('admin.tables.errors.customerAccess'));
        setTables([]);
        return;
      }
      const restaurantId = userData.restaurantId;
      if (!restaurantId) {
        throw new Error(t('admin.orders.messages.noRestaurant'));
      }
      const result = await tableAPI.getAllTables(restaurantId);
      setTables(result.data || []);
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || t('admin.tables.errors.fetchFailed');
      setError(message);
      console.error("Error fetching tables:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTable = async (tableData) => {
    const restaurantId = getRestaurantId();
    if (!restaurantId) {
      throw new Error(
        "Restaurant ID not found. Please ensure you are logged in."
      );
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
    try {
      const response = await tableAPI.toggleTableActive(table.id);
      // Update only the specific table in state
      setTables((prevTables) =>
        prevTables.map((t) =>
          t.id === table.id ? { ...t, isActive: !t.isActive } : t
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || t('admin.tables.errors.toggleFailed'));
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
      setError(err.response?.data?.message || t('admin.tables.errors.generateFailed'));
    }
  };

  // Regenerate QR from preview modal
  const handleRegenerateQR = async (table) => {
    try {
      const response = await tableAPI.generateQR(table.id);
      setQrData(response.data);
      await fetchTables();
    } catch (err) {
      setError(err.response?.data?.message || t('admin.tables.errors.regenerateFailed'));
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
      const filename =
        format === "pdf" ? "All-Tables-QR.pdf" : "All-Tables-QR.zip";

      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError(t('admin.tables.errors.downloadFailed'));
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
        <h1 className="text-2xl font-heading font-bold text-foreground">
          {t('admin.tables.title')}
        </h1>
        <div className="flex flex-wrap gap-3">
          {/* Regenerate All */}
          <button
            onClick={() => setShowRegenModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-warning/20 text-warning border border-warning/30 rounded-lg hover:bg-warning/30"
            title="Dangerous: Regenerate ALL QR codes"
          >
            <Icon name="RefreshCw" size={18} />
            <span className="hidden sm:inline">{t('admin.tables.actions.regenAll')}</span>
          </button>

          {/* Download ZIP */}
          <button
            onClick={() => handleDownloadAll("zip")}
            disabled={downloadingAll}
            className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 disabled:opacity-50"
            title="Download all QR codes as ZIP"
          >
            <Icon name="FileDown" size={18} />
            <span className="hidden sm:inline">{t('admin.tables.actions.zip')}</span>
          </button>

          {/* Download PDF */}
          <button
            onClick={() => handleDownloadAll("pdf")}
            disabled={downloadingAll}
            className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 disabled:opacity-50"
            title="Download all QR codes as PDF"
          >
            <Icon name="FileText" size={18} />
            <span className="hidden sm:inline">{t('admin.tables.actions.pdf')}</span>
          </button>

          {/* Print / Preview All */}
          <button
            onClick={openAllPrintPreview}
            className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80"
            title="Preview and print all QR codes as PDF"
          >
            <Icon name="Printer" size={18} />
            <span className="hidden sm:inline">{t('admin.tables.actions.printPreview')}</span>
          </button>

          {/* Add Table */}
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            <Icon name="Plus" size={18} />
            {t('admin.tables.actions.addTable')}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-error/10 border border-error/20 rounded-lg p-4 flex items-start gap-3">
          <Icon
            name="AlertCircle"
            className="text-error flex-shrink-0"
            size={20}
          />
          <div className="flex-1">
            <p className="text-error font-medium">{t('common.messages.error')}</p>
            <p className="text-error/80 text-sm">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-error hover:text-error/80"
          >
            <Icon name="X" size={18} />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-card border border-border rounded-lg">
        <select
          value={filters.status}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, status: e.target.value }))
          }
          className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
        >
          <option value="">{t('admin.tables.filters.allStatus')}</option>
          <option value="AVAILABLE">{t('admin.tables.status.AVAILABLE')}</option>
          <option value="OCCUPIED">{t('admin.tables.status.OCCUPIED')}</option>
          <option value="RESERVED">{t('admin.tables.status.RESERVED')}</option>
          <option value="MAINTENANCE">{t('admin.tables.status.MAINTENANCE')}</option>
        </select>
        <select
          value={filters.sortBy}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, sortBy: e.target.value }))
          }
          className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
        >
          <option value="tableNumber">{t('admin.tables.filters.sortByTableNumber')}</option>
          <option value="capacity">{t('admin.tables.filters.sortByCapacity')}</option>
          <option value="createdAt">{t('admin.tables.filters.sortByCreated')}</option>
        </select>
        <button
          onClick={fetchTables}
          className="flex items-center gap-2 px-3 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80"
        >
          <Icon name="RefreshCw" size={18} />
          {t('admin.tables.actions.refresh')}
        </button>
      </div>

      {/* Tables Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Icon
            name="Loader2"
            size={32}
            className="animate-spin text-primary"
          />
        </div>
      ) : tables.length === 0 ? (
        <div className="text-center py-20">
          <Icon
            name="Grid3x3"
            size={48}
            className="mx-auto mb-4 text-muted-foreground opacity-50"
          />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {t('admin.tables.empty.title')}
          </h3>
          <p className="text-muted-foreground mb-6">
            {filters.status
              ? t('admin.tables.empty.descFilter')
              : t('admin.tables.empty.descEmpty')}
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            <Icon name="Plus" size={18} className="inline mr-2" />
            {t('admin.tables.empty.createFirst')}
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
            {t('admin.tables.empty.summaryPlural', { count: tables.length })}
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
      {showRegenModal &&
        createPortal(
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-card rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
              {/* Warning Header */}
              <div className="bg-error/10 px-6 py-4 border-b border-error/20 flex items-center gap-3">
                <div className="p-2 bg-error/20 rounded-full text-error">
                  <Icon name="AlertTriangle" size={24} />
                </div>
                <h3 className="text-lg font-bold text-error">
                  {t('admin.tables.warning.title')}
                </h3>
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
                  {t('admin.tables.warning.message')}
                </p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 bg-muted p-3 rounded-lg">
                  <li>
                    {t('admin.tables.warning.list.stopWorking')}
                  </li>
                  <li>
                    {t('admin.tables.warning.list.noOrders')}
                  </li>
                  <li>
                    {t('admin.tables.warning.list.reprint')}
                  </li>
                </ul>
              </div>

              {/* Footer Buttons */}
              <div className="px-6 py-4 bg-muted border-t border-border flex justify-end gap-3">
                <button
                  onClick={() => setShowRegenModal(false)}
                  className="px-4 py-2 bg-card border border-border rounded-lg text-foreground hover:bg-muted font-medium"
                  disabled={isRegenerating}
                >
                  {t('admin.tables.actions.cancel')}
                </button>
                <button
                  onClick={handleRegenerateAllQRs}
                  disabled={isRegenerating}
                  className="px-4 py-2 bg-error hover:bg-error/90 text-error-foreground rounded-lg font-bold shadow-sm flex items-center gap-2"
                >
                  {isRegenerating ? (
                    <>
                      <Icon
                        name="RefreshCw"
                        size={18}
                        className="animate-spin"
                      />
                      {t('common.actions.processing')}
                    </>
                  ) : (
                    t('admin.tables.actions.confirmRegen')
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
