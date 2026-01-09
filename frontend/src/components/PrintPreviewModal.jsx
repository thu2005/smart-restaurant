import { X, Printer, Grid, FileText, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { tableAPI } from "../services/tableService";

const PrintPreviewModal = ({ isOpen, onClose, tableId = null }) => {
  const [layout, setLayout] = useState("single"); // 'single' | 'grid'
  const [pdfUrl, setPdfUrl] = useState(null);
  const [currentBlob, setCurrentBlob] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) setLayout("single");
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) loadPreview();

    return () => {
      if (pdfUrl) window.URL.revokeObjectURL(pdfUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, layout, tableId]);

  const loadPreview = async () => {
    try {
      setLoading(true);
      let blob;

      if (tableId) {
        // Single Table PDF
        blob = await tableAPI.downloadQR(tableId, "pdf");
      } else {
        // All Tables PDF (use restaurantId to filter if available)
        const restaurantId = getRestaurantId();
        blob = await tableAPI.downloadAllQR("pdf", layout, restaurantId);
      }

      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
      setCurrentBlob(blob);
    } catch (error) {
      console.error("Preview failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const iframe = document.getElementById("pdf-preview-frame");
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.print();
    }
  };

  const getRestaurantId = () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      return userData.restaurantId;
    } catch {
      return null;
    }
  };

  const handleDownload = () => {
    if (!currentBlob) return;

    const filename = tableId
      ? "Table-QR.pdf"
      : `All-Tables-QR-${layout}.pdf`;

    const url = window.URL.createObjectURL(currentBlob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black bg-opacity-75 p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Printer size={24} />
            {tableId
              ? "Print Preview (Single Table)"
              : "Print Preview (All Tables)"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-72 bg-gray-50 border-r border-gray-200 p-6 flex flex-col gap-6">
            {/* Layout Options for All Tables */}
            {!tableId && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
                  Layout Options
                </label>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setLayout("single")}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${layout === "single"
                      ? "bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500"
                      : "bg-white border-gray-200"
                      }`}
                  >
                    <FileText size={20} />
                    <div className="text-left">
                      <div className="font-medium">Single Page</div>
                      <div className="text-xs opacity-75">1 QR per page</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setLayout("grid")}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${layout === "grid"
                      ? "bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500"
                      : "bg-white border-gray-200"
                      }`}
                  >
                    <Grid size={20} />
                    <div className="text-left">
                      <div className="font-medium">Grid Layout</div>
                      <div className="text-xs opacity-75">6 QRs per page</div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Actions Buttons */}
            <div className="mt-auto flex flex-col gap-3">
              <p className="text-xs text-gray-500 text-center">Actions</p>
              <button
                onClick={handlePrint}
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg"
              >
                <Printer size={20} /> Print Now
              </button>

              <button
                onClick={handleDownload}
                disabled={loading}
                className="w-full py-3 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-bold flex items-center justify-center gap-2"
              >
                <Download size={20} /> Download PDF
              </button>
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 bg-gray-200 relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white p-4 rounded-full shadow-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              </div>
            ) : pdfUrl ? (
              <iframe
                id="pdf-preview-frame"
                src={pdfUrl}
                className="w-full h-full border-none"
                title="PDF Preview"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Failed to load preview
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PrintPreviewModal;