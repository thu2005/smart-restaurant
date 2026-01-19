import React from "react";
import { useTranslation } from "react-i18next";
import Icon from "./AppIcon";

const StatusToggleModal = ({ isOpen, onClose, onConfirm, userName, currentStatus, loading }) => {
    const { t } = useTranslation();
    if (!isOpen) return null;

    const action = currentStatus ? "deactivate" : "activate";
    const titleKey = currentStatus ? "admin.users.status.deactivateTitle" : "admin.users.status.activateTitle";
    const messageKey = currentStatus ? "admin.users.status.deactivateMessage" : "admin.users.status.activateMessage";
    const actionLabelKey = "common.actions." + action;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b">
                    <div className="flex items-center gap-3">
                        <div className={`h-12 w-12 rounded-full ${currentStatus ? 'bg-orange-100' : 'bg-green-100'} flex items-center justify-center`}>
                            <Icon name={currentStatus ? "UserX" : "UserCheck"} size={24} className={currentStatus ? "text-orange-600" : "text-green-600"} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{t(titleKey)}</h2>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-gray-600">
                        {t(messageKey, { name: userName })}
                    </p>
                </div>

                {/* Actions */}
                <div className="p-6 border-t flex gap-3">
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className={`flex-1 ${currentStatus ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'} text-white px-4 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                    >
                        {loading ? (
                            <>
                                <Icon name="Loader2" size={20} className="animate-spin" />
                                {t('common.actions.processing')}
                            </>
                        ) : (
                            <>
                                <Icon name={currentStatus ? "UserX" : "UserCheck"} size={20} />
                                {t(actionLabelKey)}
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                    >
                        {t('common.actions.cancel')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StatusToggleModal;
