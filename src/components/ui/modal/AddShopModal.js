import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import axios from "@/utils/api";

const AddShopModal = ({ isOpen, onClose, onSave }) => {
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
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

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
            await onSave(formData);
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
                                        Add New Shop
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

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Shop Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-gray-700 dark:text-white"
                                            placeholder="My Store"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Domain URL *</label>
                                                {validating && <span className="text-xs text-blue-500 animate-pulse">Checking...</span>}
                                                {!validating && formData.domain_url && !domainErrors.domain_url && <span className="text-xs text-green-500">✓ Available</span>}
                                            </div>
                                            <input
                                                type="text"
                                                name="domain_url"
                                                value={formData.domain_url}
                                                onChange={handleChange}
                                                required
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-all bg-white dark:bg-gray-700 dark:text-white ${domainErrors.domain_url ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"}`}
                                                placeholder="mystore.com"
                                            />
                                            {domainErrors.domain_url && <p className="mt-1 text-xs text-red-500">{domainErrors.domain_url}</p>}
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Unique Domain ID *</label>
                                                {validating && <span className="text-xs text-blue-500 animate-pulse">Checking...</span>}
                                                {!validating && formData.unique_domain && !domainErrors.unique_domain && <span className="text-xs text-green-500">✓ Available</span>}
                                            </div>
                                            <input
                                                type="text"
                                                name="unique_domain"
                                                value={formData.unique_domain}
                                                onChange={handleChange}
                                                required
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-all bg-white dark:bg-gray-700 dark:text-white ${domainErrors.unique_domain ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"}`}
                                                placeholder="mystore"
                                            />
                                            {domainErrors.unique_domain && <p className="mt-1 text-xs text-red-500">{domainErrors.unique_domain}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Shop Type *</label>
                                            <select
                                                name="type_id"
                                                value={formData.type_id}
                                                onChange={handleChange}
                                                required
                                                disabled={fetchingTypes}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-gray-700 dark:text-white"
                                            >
                                                <option value="">Select Type</option>
                                                {shopTypes.map((type) => (
                                                    <option key={type.id} value={type.id}>
                                                        {type.title}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monthly Cost ($)</label>
                                            <input
                                                type="number"
                                                name="monthly_cost"
                                                value={formData.monthly_cost}
                                                onChange={handleChange}
                                                step="0.01"
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Register Date</label>
                                            <input
                                                type="date"
                                                name="register_date"
                                                value={formData.register_date}
                                                onChange={handleChange}
                                                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-6">
                                        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Contract Details</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contract Status</label>
                                                <select
                                                    name="contract_status"
                                                    value={formData.contract_status}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-gray-700 dark:text-white"
                                                >
                                                    <option value="1">Pending</option>
                                                    <option value="0">Agreement</option>
                                                    <option value="2">Preparing</option>
                                                    <option value="3">Cancellation</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Update Interval (Months)</label>
                                                <input
                                                    type="number"
                                                    name="contract_update_interval"
                                                    value={formData.contract_update_interval}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                                                <input
                                                    type="date"
                                                    name="contract_start"
                                                    value={formData.contract_start}
                                                    onChange={handleChange}
                                                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                                                <input
                                                    type="date"
                                                    name="contract_end"
                                                    value={formData.contract_end}
                                                    onChange={handleChange}
                                                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-6">
                                        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Financials</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Initial Cost ($)</label>
                                                <input
                                                    type="number"
                                                    name="initial_cost"
                                                    value={formData.initial_cost}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monthly Cost ($)</label>
                                                <input
                                                    type="number"
                                                    name="monthly_cost"
                                                    value={formData.monthly_cost}
                                                    onChange={handleChange}
                                                    step="0.01"
                                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Initial Transfer ($)</label>
                                                <input
                                                    type="number"
                                                    name="initial_transfer_amount"
                                                    value={formData.initial_transfer_amount}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monthly Transfer ($)</label>
                                                <input
                                                    type="number"
                                                    name="monthly_transfer_amount"
                                                    value={formData.monthly_transfer_amount}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Commission Rate (%)</label>
                                                <input
                                                    type="number"
                                                    name="commission_rate"
                                                    value={formData.commission_rate}
                                                    onChange={handleChange}
                                                    step="0.01"
                                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
                                                <select
                                                    name="payment_method"
                                                    value={formData.payment_method}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-gray-700 dark:text-white"
                                                >
                                                    <option value="0">Bank Transfer</option>
                                                    <option value="1">Cash</option>
                                                    <option value="2">Online Payment</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-6">
                                        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Contact & Location</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                                                <input
                                                    type="text"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Representative</label>
                                                <input
                                                    type="text"
                                                    name="shop_representative"
                                                    value={formData.shop_representative}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address 1</label>
                                                <input
                                                    type="text"
                                                    name="address_1"
                                                    value={formData.address_1}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address 2 (Optional)</label>
                                                <input
                                                    type="text"
                                                    name="address_2"
                                                    value={formData.address_2}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                            <div className="flex items-center gap-6 mt-2">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        name="is_whatsapp"
                                                        checked={formData.is_whatsapp}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, is_whatsapp: e.target.checked }))}
                                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">WhatsApp</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        name="is_telegram"
                                                        checked={formData.is_telegram}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, is_telegram: e.target.checked }))}
                                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                                    />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">Telegram</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-6">
                                        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Owner Credentials</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Owner Email *</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-gray-700 dark:text-white"
                                                    placeholder="owner@example.com"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password *</label>
                                                <input
                                                    type="password"
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-gray-700 dark:text-white"
                                                    placeholder="Min 8 characters"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-0 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-3 mt-6">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            disabled={loading}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {loading ? "Creating..." : "Create Shop"}
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
