import React, { useState } from "react";
import { createPortal } from "react-dom";
import Icon from "../AppIcon";
import { useTranslation } from "react-i18next";

/**
 * Customer Login/Register Modal
 * Shows a tabbed interface for login and registration
 */
const CustomerLoginModal = ({ isOpen, onClose, onSuccess }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("login");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        fullName: "",
        phone: "",
    });

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (activeTab === "login") {
                await onSuccess?.("login", {
                    email: formData.email,
                    password: formData.password,
                });
            } else {
                await onSuccess?.("register", {
                    email: formData.email,
                    password: formData.password,
                    fullName: formData.fullName,
                    phone: formData.phone,
                });
            }
            onClose();
        } catch (err) {
            setError(err.message || t("auth.errors.general"));
        } finally {
            setIsLoading(false);
        }
    };

    const switchTab = (tab) => {
        setActiveTab(tab);
        setError(null);
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="text-xl font-heading font-semibold text-foreground">
                        {activeTab === "login" ? t("auth.login.title") : t("auth.register.title")}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-muted transition-colors"
                    >
                        <Icon name="X" size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border">
                    <button
                        onClick={() => switchTab("login")}
                        className={`flex-1 py-3 text-center font-medium transition-colors ${activeTab === "login"
                            ? "text-primary border-b-2 border-primary"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        {t("auth.login.tab")}
                    </button>
                    <button
                        onClick={() => switchTab("register")}
                        className={`flex-1 py-3 text-center font-medium transition-colors ${activeTab === "register"
                            ? "text-primary border-b-2 border-primary"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        {t("auth.register.tab")}
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
                            {error}
                        </div>
                    )}

                    {activeTab === "register" && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">
                                    {t("auth.form.fullName")}
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder={t("auth.form.fullNamePlaceholder")}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">
                                    {t("auth.form.phone")}
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder={t("auth.form.phonePlaceholder")}
                                />
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            {t("auth.form.email")}
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder={t("auth.form.emailPlaceholder")}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            {t("auth.form.password")}
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            minLength={6}
                            className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder={activeTab === "register" ? t("auth.form.passwordPlaceholderCtx") : t("auth.form.passwordPlaceholder")}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Icon name="Loader2" size={20} className="animate-spin" />
                                {activeTab === "login" ? t("auth.login.submitting") : t("auth.register.submitting")}
                            </>
                        ) : (
                            activeTab === "login" ? t("auth.login.submit") : t("auth.register.submit")
                        )}
                    </button>

                    <p className="text-center text-sm text-muted-foreground">
                        {activeTab === "login" ? (
                            <>
                                {t("auth.login.noAccount")}{" "}
                                <button
                                    type="button"
                                    onClick={() => switchTab("register")}
                                    className="text-primary hover:underline font-medium"
                                >
                                    {t("auth.login.registerLink")}
                                </button>
                            </>
                        ) : (
                            <>
                                {t("auth.register.hasAccount")}{" "}
                                <button
                                    type="button"
                                    onClick={() => switchTab("login")}
                                    className="text-primary hover:underline font-medium"
                                >
                                    {t("auth.register.loginLink")}
                                </button>
                            </>
                        )}
                    </p>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default CustomerLoginModal;