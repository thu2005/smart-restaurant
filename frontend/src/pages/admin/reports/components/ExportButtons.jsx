import React from 'react';
import { useTranslation } from 'react-i18next';
import { FileDown, FileSpreadsheet } from 'lucide-react';

const ExportButtons = ({ onExportPDF, onExportCSV, disabled = false }) => {
    const { t } = useTranslation();

    return (
        <div className="flex gap-2">
            <button
                onClick={onExportPDF}
                disabled={disabled}
                className="px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted/50 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title={t('reports.export.pdfTitle')}
            >
                <FileDown className="w-4 h-4" />
                <span className="hidden sm:inline">{t('reports.export.pdf')}</span>
            </button>
            <button
                onClick={onExportCSV}
                disabled={disabled}
                className="px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted/50 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title={t('reports.export.csvTitle')}
            >
                <FileSpreadsheet className="w-4 h-4" />
                <span className="hidden sm:inline">{t('reports.export.csv')}</span>
            </button>
        </div>
    );
};

export default ExportButtons;
