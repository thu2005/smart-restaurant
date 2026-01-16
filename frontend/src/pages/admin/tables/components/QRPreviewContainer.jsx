import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { createPortal } from "react-dom";
import Icon from "../../../../components/AppIcon";
import { tableAPI } from "../../../../services/tableService";

const QRPreviewContainer = ({ table, qrData, onRegenerate, onClose }) => {
  const { t } = useTranslation();
  const [downloading, setDownloading] = useState(false);

  const handleRegenerateQR = async () => {
    try {
      await onRegenerate(table);
    } catch (error) {
      console.error("Error regenerating QR:", error);
    }
  };

  // Helper to handle blob download
  const downloadBlob = (blob, fileName) => {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Fetch PNG from server
  const handleDownloadPNG = async () => {
    try {
      setDownloading(true);
      const blob = await tableAPI.downloadQR(table.id, "png");
      downloadBlob(blob, `table-${table.tableNumber}-qr.png`);
    } catch (error) {
      console.error("Error downloading PNG:", error);
    } finally {
      setDownloading(false);
    }
  };

  // Fetch PDF from server
  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      const blob = await tableAPI.downloadQR(table.id, "pdf");
      downloadBlob(blob, `table-${table.tableNumber}-qr.pdf`);
    } catch (error) {
      console.error("Error downloading PDF:", error);
    } finally {
      setDownloading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('common.status.notAvailable');
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // No QR data - show generate prompt
  if (!qrData) {
    return createPortal(
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-card rounded-xl shadow-2xl max-w-md w-full p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-muted rounded-full mb-4">
              <Icon name="QrCode" size={40} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t('admin.tables.qr.noQRTitle')}
            </h3>
            <p className="text-muted-foreground mb-6">
              {t('admin.tables.qr.noQRDesc', { number: table?.tableNumber })}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleRegenerateQR}
                disabled={downloading}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 flex items-center gap-2"
              >
                <Icon name="QrCode" size={18} />
                {t('admin.tables.qr.generateBtn')}
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80"
              >
                {t('admin.tables.actions.cancel')}
              </button>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-primary px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-primary-foreground">
            {t('admin.tables.qr.previewTitle', { number: table?.tableNumber })}
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRegenerateQR}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-primary-foreground px-4 py-2 rounded-lg transition-all text-sm font-medium"
              disabled={downloading}
            >
              <Icon
                name="RefreshCw"
                size={16}
                className={downloading ? "animate-spin" : ""}
              />
              {t('admin.tables.qr.regenerate')}
            </button>
            <button
              onClick={onClose}
              className="text-primary-foreground hover:bg-white/20 p-2 rounded-lg"
            >
              <Icon name="X" size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: QR Code */}
            <div className="flex flex-col items-center justify-center">
              <div className="bg-muted p-8 rounded-2xl">
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  {qrData.qrCode ? (
                    <img
                      src={qrData.qrCode}
                      alt={`QR Code for Table ${table?.tableNumber}`}
                      className="w-56 h-56"
                    />
                  ) : (
                    <div className="w-56 h-56 flex items-center justify-center bg-muted rounded">
                      <Icon
                        name="QrCode"
                        size={64}
                        className="text-muted-foreground"
                      />
                    </div>
                  )}
                </div>
              </div>
              <p className="text-center text-sm text-muted-foreground mt-4 font-semibold">
                {t('admin.orders.card.table', { number: table?.tableNumber })}
              </p>
            </div>

            {/* Right: Table Information */}
            <div className="flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-6 border-b border-border pb-2">
                  {t('admin.tables.qr.infoTitle')}
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground font-medium">
                      {t('admin.tables.qr.tableName')}
                    </span>
                    <span className="text-foreground font-bold text-lg">
                      {t('admin.orders.card.table', { number: table?.tableNumber })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground font-medium flex items-center gap-2">
                      <Icon name="Users" size={16} />
                      {t('admin.tables.qr.capacity')}
                    </span>
                    <span className="text-foreground font-bold text-lg">
                      {t('admin.tables.qr.seats', { count: table?.capacity })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground font-medium flex items-center gap-2">
                      <Icon name="MapPin" size={16} />
                      {t('admin.tables.qr.location')}
                    </span>
                    <span className="text-foreground font-bold text-lg">
                      {t(`admin.tables.locations.${table?.location}`) || table?.location || t('common.status.notAvailable')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground font-medium flex items-center gap-2">
                      <Icon name="Calendar" size={16} />
                      {t('admin.tables.qr.qrCreated')}
                    </span>
                    <span className="text-foreground font-bold text-lg">
                      {formatDate(qrData?.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Download Buttons */}
              <div className="mt-8 flex gap-4">
                <button
                  onClick={handleDownloadPNG}
                  disabled={downloading}
                  className="flex-1 bg-error hover:bg-error/90 text-error-foreground px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Icon name="Download" size={20} />
                  {t('admin.tables.actions.downloadPNG')}
                </button>
                <button
                  onClick={handleDownloadPDF}
                  disabled={downloading}
                  className="flex-1 bg-muted hover:bg-muted/80 text-foreground px-6 py-3 rounded-lg font-semibold transition-colors border border-border flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Icon name="FileText" size={20} />
                  {t('admin.tables.actions.downloadPDF')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default QRPreviewContainer;
