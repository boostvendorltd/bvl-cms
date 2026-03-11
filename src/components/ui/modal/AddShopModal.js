import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import axios from "@/utils/api";
import { useTranslation } from "react-i18next";

const AddShopModal = ({ isOpen, onClose, onSave }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: "",
        domain_url: "",
        unique_domain: "",
        type_id: "",
        monthly_cost: 0,
        contract_status: "1",
        email: "",
        password: "",
        register_date: new Date().toISOString().split('T')[0],
        phone: "",
        address_1: "",
        address_2: "",
        shop_representative: "",
        initial_cost: "",
        initial_transfer_amount: "",
        monthly_transfer_amount: "",
        payment_method: "0",
        commission_rate: "",
        is_whatsapp: false,
        is_telegram: false,
        contract_update_interval: "12",
        contract_start: "",
        contract_end: "",
        contract_file: null,
    });
    const [shopTypes, setShopTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingTypes, setFetchingTypes] = useState(false);
    const [error, setError] = useState("");
    const [domainErrors, setDomainErrors] = useState({ domain_url: "", unique_domain: "" });
    const [validating, setValidating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchShopTypes = async () => {
                try {
                    setFetchingTypes(true);
                    const response = await axios.get("/cms/shop-types");
                    setShopTypes(response.data);
                    if (response.data.length > 0 && !formData.type_id) {
                        setFormData(prev => ({ ...prev, type_id: response.data[0].id }));
                    }
                } catch (err) {
                    console.error("Error fetching shop types:", err);
                } finally {
                    setFetchingTypes(false);
                }
            };
            fetchShopTypes();
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const checkDomain = async () => {
            if (!formData.domain_url && !formData.unique_domain) return;

            setValidating(true);
            try {
                const params = new URLSearchParams();
                if (formData.domain_url) params.append("domain_url", formData.domain_url);
                if (formData.unique_domain) params.append("unique_domain", formData.unique_domain);

                await axios.get(`/cms/shops/validate-domain?${params.toString()}`);
                setDomainErrors({ domain_url: "", unique_domain: "" });

                // Clear the main error if it was domain related
                if (error === "Please fix the domain errors before proceeding.") {
                    setError("");
                }
            } catch (err) {
                if (err.response?.status === 422 && err.response?.data?.errors) {
                    setDomainErrors({
                        domain_url: err.response.data.errors.domain_url || "",
                        unique_domain: err.response.data.errors.unique_domain || ""
                    });
                    setError("Please fix the domain errors before proceeding.");
                }
            } finally {
                setValidating(false);
            }
        };

        const timeoutId = setTimeout(() => {
            checkDomain();
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [formData.domain_url, formData.unique_domain, isOpen]);

    useEffect(() => {
        if (formData.contract_start && formData.contract_update_interval) {
            try {
                const startDate = new Date(formData.contract_start);
                const monthsToAdd = parseInt(formData.contract_update_interval, 10);

                if (!isNaN(startDate.getTime()) && !isNaN(monthsToAdd)) {
                    const endDate = new Date(startDate);
                    endDate.setMonth(endDate.getMonth() + monthsToAdd);

                    const formattedEndDate = endDate.toISOString().split('T')[0];
                    setFormData(prev => ({ ...prev, contract_end: formattedEndDate }));
                }
            } catch (error) {
                console.error("Date calculation error:", error);
            }
        }
    }, [formData.contract_start, formData.contract_update_interval]);

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        let newValue = value;
        if (type === 'checkbox') newValue = checked;
        if (type === 'file') newValue = files.length > 0 ? files[0] : null;

        setFormData((prev) => ({ ...prev, [name]: newValue }));

        // Clear specific domain errors when user starts typing again
        if (name === "domain_url" || name === "unique_domain") {
            setDomainErrors(prev => ({ ...prev, [name]: "" }));
            // Also clear generic error if it was about domains
            if (error === "Please fix the domain errors before proceeding.") {
                setError("");
            }
        }
    };

    const formatError = (err) => {
        if (typeof err === "string") return err;
        if (err?.errors) {
            const errors = Object.values(err.errors).flat();
            return errors.length > 0 ? errors.join(", ") : (err.message || "An error occurred");
        }
        return err?.message || "An error occurred";
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (domainErrors.domain_url || domainErrors.unique_domain) {
            setError("Please fix the domain errors before proceeding.");
            return;
        }

        setLoading(true);
        setError("");
        try {
            const formDataToSend = new FormData();

            Object.keys(formData).forEach(key => {
                // Determine whether boolean or file or other primitive
                if (key === 'contract_file') {
                    if (formData.contract_file) {
                        formDataToSend.append('contract_file', formData.contract_file);
                    }
                } else if (typeof formData[key] === 'boolean') {
                    // Booleans send as 1 or 0 typically
                    formDataToSend.append(key, formData[key] ? '1' : '0');
                } else if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
                    formDataToSend.append(key, formData[key]);
                }
            });

            await onSave(formDataToSend);
            toast.success("Shop created successfully");
            onClose();
        } catch (err) {
            const errMessage = formatError(err);
            setError(errMessage);
            toast.error(errMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[9999]" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50 transition-opacity" aria-hidden="true" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto z-[10000]">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all flex flex-col max-h-[90vh]">
                                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                                    <Dialog.Title as="h3" className="text-xl font-semibold text-gray-900 dark:text-white">
                                        {t("ADD_SHOP")}
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="p-2 text-gray-400 transition-colors rounded-full hover:bg-gray-200 hover:text-gray-600"
                                    >
                                        <XMarkIcon className="w-6 h-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                                    {error && (
                                        <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-500/20">
                                            {error}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="col-span-1 md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("NAME")} *</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 bg-white dark:bg-gray-700 dark:text-white"
                                                placeholder={t("NAME")}
                                            />
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("DOMAIN")} *</label>
                                                {validating && <span className="text-xs text-blue-500 animate-pulse">Checking...</span>}
                                                {!validating && formData.domain_url && !domainErrors.domain_url && <span className="text-xs text-green-500">✓ Available</span>}
                                            </div>
                                            <input
                                                type="text"
                                                name="domain_url"
                                                value={formData.domain_url}
                                                onChange={handleChange}
                                                required
                                                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm border p-2 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 transition-all ${domainErrors.domain_url ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500"}`}
                                                placeholder="example.com"
                                            />
                                            {domainErrors.domain_url && <p className="mt-1 text-xs text-red-500">{domainErrors.domain_url}</p>}
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("UNIQUE_DOMAIN_ID") || "Unique Domain ID"} *</label>
                                                {validating && <span className="text-xs text-blue-500 animate-pulse">Checking...</span>}
                                                {!validating && formData.unique_domain && !domainErrors.unique_domain && <span className="text-xs text-green-500">✓ Available</span>}
                                            </div>
                                            <input
                                                type="text"
                                                name="unique_domain"
                                                value={formData.unique_domain}
                                                onChange={handleChange}
                                                required
                                                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm border p-2 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 transition-all ${domainErrors.unique_domain ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500"}`}
                                                placeholder="mystore"
                                            />
                                            {domainErrors.unique_domain && <p className="mt-1 text-xs text-red-500">{domainErrors.unique_domain}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("TYPE")} *</label>
                                            <select
                                                name="type_id"
                                                value={formData.type_id}
                                                onChange={handleChange}
                                                required
                                                disabled={fetchingTypes}
                                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 bg-white dark:bg-gray-700 dark:text-white"
                                            >
                                                <option value="">{t("SELECT_TYPE") || "Select Type"}</option>
                                                {shopTypes.map((type) => (
                                                    <option key={type.id} value={type.id}>
                                                        {type.title}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("REGISTER_DATE")}</label>
                                            <input
                                                type="date"
                                                name="register_date"
                                                value={formData.register_date}
                                                onChange={handleChange}
                                                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 bg-white dark:bg-gray-700 dark:text-white dark:[color-scheme:dark]"
                                            />
                                        </div>

                                        <div className="col-span-1 md:col-span-2 pt-4 pb-2 border-b border-gray-100 dark:border-gray-700 mb-2">
                                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{t("CONTRACT_DETAILS")}</h4>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("CONTRACT_STATUS")}</label>
                                            <select
                                                name="contract_status"
                                                value={formData.contract_status}
                                                onChange={handleChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 bg-white dark:bg-gray-700 dark:text-white"
                                            >
                                                <option value="1">{t("PENDING")}</option>
                                                <option value="0">{t("AGREEMENT")}</option>
                                                <option value="2">{t("PREPARING")}</option>
                                                <option value="3">{t("CANCELLATION")}</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("UPDATE_INTERVAL")}</label>
                                            <input
                                                type="number"
                                                name="contract_update_interval"
                                                value={formData.contract_update_interval}
                                                onChange={handleChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 bg-white dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("CONTRACT_START")}</label>
                                            <input
                                                type="date"
                                                name="contract_start"
                                                value={formData.contract_start}
                                                onChange={handleChange}
                                                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 bg-white dark:bg-gray-700 dark:text-white dark:[color-scheme:dark]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("CONTRACT_END")}</label>
                                            <input
                                                type="date"
                                                name="contract_end"
                                                value={formData.contract_end}
                                                onChange={handleChange}
                                                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 bg-white dark:bg-gray-700 dark:text-white dark:[color-scheme:dark]"
                                            />
                                        </div>

                                        <div className="col-span-1 md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("CONTRACT_FILE")}</label>
                                            <input
                                                type="file"
                                                name="contract_file"
                                                onChange={handleChange}
                                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg outline-none transition-all bg-white dark:bg-gray-700 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/50 file:text-blue-700 dark:file:text-blue-400 hover:file:bg-blue-100 dark:hover:file:bg-blue-900"
                                            />
                                        </div>

                                        <div className="col-span-1 md:col-span-2 pt-4 pb-2 border-b border-gray-100 dark:border-gray-700 mb-2">
                                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{t("FINANCIALS")}</h4>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("INITIAL_COST")}</label>
                                            <input
                                                type="number"
                                                name="initial_cost"
                                                value={formData.initial_cost}
                                                onChange={handleChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 bg-white dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("MONTHLY_COST")}</label>
                                            <input
                                                type="number"
                                                name="monthly_cost"
                                                value={formData.monthly_cost}
                                                onChange={handleChange}
                                                step="0.01"
                                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 bg-white dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("INITIAL_TRANSFER")}</label>
                                            <input
                                                type="number"
                                                name="initial_transfer_amount"
                                                value={formData.initial_transfer_amount}
                                                onChange={handleChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 bg-white dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("MONTHLY_TRANSFER")}</label>
                                            <input
                                                type="number"
                                                name="monthly_transfer_amount"
                                                value={formData.monthly_transfer_amount}
                                                onChange={handleChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 bg-white dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("COMMISSION_RATE")}</label>
                                            <input
                                                type="number"
                                                name="commission_rate"
                                                value={formData.commission_rate}
                                                onChange={handleChange}
                                                step="0.01"
                                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 bg-white dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("PAYMENT_METHOD")}</label>
                                            <select
                                                name="payment_method"
                                                value={formData.payment_method}
                                                onChange={handleChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 bg-white dark:bg-gray-700 dark:text-white"
                                            >
                                                <option value="0">{t("BANK_TRANSFER")}</option>
                                                <option value="1">{t("CASH")}</option>
                                                <option value="2">Online Payment</option>
                                            </select>
                                        </div>

                                        <div className="col-span-1 md:col-span-2 pt-4 pb-2 border-b border-gray-100 dark:border-gray-700 mb-2">
                                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{t("CONTACT_LOCATION")}</h4>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("PHONE")}</label>
                                            <input
                                                type="text"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 bg-white dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("REPRESENTATIVE")}</label>
                                            <input
                                                type="text"
                                                name="shop_representative"
                                                value={formData.shop_representative}
                                                onChange={handleChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 bg-white dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>

                                        <div className="col-span-1 md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("ADDRESS_1")}</label>
                                            <input
                                                type="text"
                                                name="address_1"
                                                value={formData.address_1}
                                                onChange={handleChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 bg-white dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>

                                        <div className="col-span-1 md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("ADDRESS_2")}</label>
                                            <input
                                                type="text"
                                                name="address_2"
                                                value={formData.address_2}
                                                onChange={handleChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 bg-white dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>

                                        <div className="col-span-1 md:col-span-2 flex items-center gap-6">
                                            <label className="flex items-center gap-2 cursor-pointer mt-4">
                                                <input
                                                    type="checkbox"
                                                    name="is_whatsapp"
                                                    checked={formData.is_whatsapp}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, is_whatsapp: e.target.checked }))}
                                                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                                                />
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">WhatsApp</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer mt-4">
                                                <input
                                                    type="checkbox"
                                                    name="is_telegram"
                                                    checked={formData.is_telegram}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, is_telegram: e.target.checked }))}
                                                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                                                />
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Telegram</span>
                                            </label>
                                        </div>

                                        <div className="col-span-1 md:col-span-2 pt-4 pb-2 border-b border-gray-100 dark:border-gray-700 mb-2">
                                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{t("OWNER_CREDENTIALS") || "Owner Credentials"}</h4>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("EMAIL")} *</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 bg-white dark:bg-gray-700 dark:text-white"
                                                placeholder="owner@example.com"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("PASSWORD")} *</label>
                                            <input
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 bg-white dark:bg-gray-700 dark:text-white"
                                                placeholder="Min 8 characters"
                                            />
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-8 flex justify-end gap-3 px-2 pb-2">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            disabled={loading}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
                                        >
                                            {t("CANCEL") || "Cancel"}
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 border border-transparent focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {loading ? (t("CREATING") || "Creating...") : (t("ADD_SHOP") || "Add Shop")}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default AddShopModal;
