import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import { useTranslation } from "react-i18next";
import Icon from "../../components/AppIcon";

const VerifyEmail = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");
    const [status, setStatus] = useState("verifying"); // verifying, success, error
    const [message, setMessage] = useState(t("auth.verifyEmail.verifying.message"));
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        const verify = async () => {
            if (!token) {
                setStatus("error");
                setMessage(t("auth.verifyEmail.error.messageNoToken"));
                return;
            }

            try {
                // Minimum loading time for better UX
                await new Promise(resolve => setTimeout(resolve, 1500));

                await authService.verifyEmail(token);
                setStatus("success");
                setMessage(t("auth.verifyEmail.success.message"));
            } catch (error) {
                setStatus("error");
                setMessage(error.message || t("auth.verifyEmail.error.messageDefault"));
            }
        };

        verify();
    }, [token]);

    const handleLoginRedirect = () => {
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center animate-fade-in">
                {/* Status Icon */}
                <div className="flex justify-center mb-6">
                    {status === "verifying" && (
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
                            <Icon name="Loader2" size={40} className="text-primary animate-spin" />
                        </div>
                    )}
                    {status === "success" && (
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-scale-in">
                            <Icon name="Check" size={40} className="text-green-600" />
                        </div>
                    )}
                    {status === "error" && (
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center animate-shake">
                            <Icon name="AlertTriangle" size={40} className="text-red-600" />
                        </div>
                    )}
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {status === "verifying" && t("auth.verifyEmail.verifying.title")}
                    {status === "success" && t("auth.verifyEmail.success.title")}
                    {status === "error" && t("auth.verifyEmail.error.title")}
                </h1>

                {/* Message */}
                <p className="text-gray-600 mb-8">
                    {message}
                </p>

                {/* Actions */}
                <div className="space-y-3">
                    {status === "success" && (
                        <button
                            onClick={handleLoginRedirect}
                            className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
                        >
                            <Icon name="LogIn" size={18} />
                            {t("auth.verifyEmail.success.button")}
                        </button>
                    )}

                    {status === "error" && (
                        <button
                            onClick={handleLoginRedirect}
                            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-all"
                        >
                            {t("auth.verifyEmail.error.button")}
                        </button>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-sm text-gray-500">
                <p>{t("auth.verifyEmail.footer", { year: new Date().getFullYear() })}</p>
            </div>
        </div>
    );
};

export default VerifyEmail;
