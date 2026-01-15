import React from 'react';
import { FileDown, FileSpreadsheet } from 'lucide-react';

const ExportButtons = ({ onExportPDF, onExportCSV, disabled = false }) => {
    return (
        <div className="flex gap-2">
            <button
                onClick={onExportPDF}
                disabled={disabled}
                className="px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted/50 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Export as PDF"
            >
                <FileDown className="w-4 h-4" />
                <span className="hidden sm:inline">Export PDF</span>
            </button>
            <button
                onClick={onExportCSV}
                disabled={disabled}
                className="px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted/50 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Export as CSV"
            >
                <FileSpreadsheet className="w-4 h-4" />
                <span className="hidden sm:inline">Export CSV</span>
            </button>
        </div>
    );
};

export default ExportButtons;
