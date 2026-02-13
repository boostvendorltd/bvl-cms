"use client";

import React, { useState, useEffect } from "react";
import Backdrop from "@/(template)/layout/Backdrop";
import { XMarkIcon } from "@heroicons/react/24/outline";
import axios from "@/(template)/utils/api";

const AddShopModal = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: "",
        domain_url: "",
        unique_domain: "",
        type_id: "",
        monthly_cost: 0,
        contract_status: "1", // Default Pending
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

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await onSave(formData);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create shop");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Backdrop onClick={onClose} />
            <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 pointer-events-none">
                <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl pointer-events-auto overflow-hidden flex flex-col max-h-[90vh]">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="text-xl font-semibold text-gray-900">Add New Shop</h3>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 transition-colors rounded-full hover:bg-gray-200 hover:text-gray-600"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="My Store"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Domain URL *</label>
                                <input
                                    type="text"
                                    name="domain_url"
                                    value={formData.domain_url}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="mystore.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Unique Domain ID *</label>
                                <input
                                    type="text"
                                    name="unique_domain"
                                    value={formData.unique_domain}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="mystore"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Shop Type *</label>
                                <select
                                    name="type_id"
                                    value={formData.type_id}
                                    onChange={handleChange}
                                    required
                                    disabled={fetchingTypes}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Cost ($)</label>
                                <input
                                    type="number"
                                    name="monthly_cost"
                                    value={formData.monthly_cost}
                                    onChange={handleChange}
                                    step="0.01"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Register Date</label>
                                <input
                                    type="date"
                                    name="register_date"
                                    value={formData.register_date}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Contract Details */}
                        <div className="border-t border-gray-100 pt-4 mt-6">
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Contract Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contract Status</label>
                                    <select
                                        name="contract_status"
                                        value={formData.contract_status}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                                    >
                                        <option value="1">Pending</option>
                                        <option value="0">Agreement</option>
                                        <option value="2">Preparing</option>
                                        <option value="3">Cancellation</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Update Interval (Months)</label>
                                    <input
                                        type="number"
                                        name="contract_update_interval"
                                        value={formData.contract_update_interval}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        name="contract_start"
                                        value={formData.contract_start}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        name="contract_end"
                                        value={formData.contract_end}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Financials */}
                        <div className="border-t border-gray-100 pt-4 mt-6">
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Financials</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Initial Cost ($)</label>
                                    <input
                                        type="number"
                                        name="initial_cost"
                                        value={formData.initial_cost}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Cost ($)</label>
                                    <input
                                        type="number"
                                        name="monthly_cost"
                                        value={formData.monthly_cost}
                                        onChange={handleChange}
                                        step="0.01"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Initial Transfer ($)</label>
                                    <input
                                        type="number"
                                        name="initial_transfer_amount"
                                        value={formData.initial_transfer_amount}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Transfer ($)</label>
                                    <input
                                        type="number"
                                        name="monthly_transfer_amount"
                                        value={formData.monthly_transfer_amount}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Commission Rate (%)</label>
                                    <input
                                        type="number"
                                        name="commission_rate"
                                        value={formData.commission_rate}
                                        onChange={handleChange}
                                        step="0.01"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                                    <select
                                        name="payment_method"
                                        value={formData.payment_method}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                                    >
                                        <option value="0">Bank Transfer</option>
                                        <option value="1">Cash</option>
                                        <option value="2">Online Payment</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Contact & Location */}
                        <div className="border-t border-gray-100 pt-4 mt-6">
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Contact & Location</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Representative</label>
                                    <input
                                        type="text"
                                        name="shop_representative"
                                        value={formData.shop_representative}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address 1</label>
                                    <input
                                        type="text"
                                        name="address_1"
                                        value={formData.address_1}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address 2 (Optional)</label>
                                    <input
                                        type="text"
                                        name="address_2"
                                        value={formData.address_2}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
                                        <span className="text-sm text-gray-700">WhatsApp</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="is_telegram"
                                            checked={formData.is_telegram}
                                            onChange={(e) => setFormData(prev => ({ ...prev, is_telegram: e.target.checked }))}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">Telegram</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-4 mt-6">
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Owner Credentials</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Owner Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        placeholder="owner@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        placeholder="Min 8 characters"
                                    />
                                </div>
                            </div>
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? "Creating..." : "Create Shop"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AddShopModal;
