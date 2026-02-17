"use client";
import React, { useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

const QuickEditModal = ({ isOpen, onClose, data, onSave, title = "Edit Item", fields }) => {
    const [formData, setFormData] = useState({});

    // Default configuration if fields prop is not provided (Backward compatibility for Partners)
    const defaultFields = {
        name: { label: "Name", type: "text" },
        email: { label: "Email", type: "email" },
        phone: { label: "Phone", type: "text" },
        commission_rate: { label: "Commission Rate", type: "number" },
        commission_type: {
            label: "Commission Type",
            type: "select",
            options: { percentage: "Percentage", fixed: "Fixed" }
        },
        address_1: { label: "Address", type: "text" }
    };

    const config = fields || defaultFields;

    useEffect(() => {
        if (data) {
            const initialData = {};
            Object.keys(config).forEach(key => {
                if (config[key].type === 'ignore') return;

                let value = data[key];

                // Handle nested objects if necessary, though flat data is expected mostly
                // Special handling for specific fields or formatting
                if (config[key].type === 'date' && value) {
                    // Start/End date might come as full ISO string, extract YYYY-MM-DD
                    value = value.split('T')[0];
                }

                initialData[key] = value !== undefined && value !== null ? value : "";
            });
            // Preserve ID if needed, but onSave takes ID separately
            setFormData(initialData);
        }
    }, [data, config]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await onSave(data?.id, formData);
            onClose();
        } catch (error) {
            console.error("Save failed", error);
        }
    };

    const renderInput = (key, fieldConfig) => {
        if (fieldConfig.type === 'ignore') return null;

        const label = fieldConfig.label || key;
        const type = fieldConfig.type || 'text';
        const value = formData[key] || "";

        if (type === 'select') {
            return (
                <div key={key}>
                    <label className="block text-sm font-medium text-gray-700">{label}</label>
                    <select
                        name={key}
                        value={value}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 bg-white"
                    >
                        {Object.entries(fieldConfig.options || {}).map(([optValue, optLabel]) => (
                            <option key={optValue} value={optValue}>
                                {typeof optLabel === 'object' ? optLabel.label : optLabel}
                            </option>
                        ))}
                    </select>
                </div>
            );
        }

        if (type === 'textarea') {
            return (
                <div key={key} className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">{label}</label>
                    <textarea
                        name={key}
                        value={value}
                        onChange={handleChange}
                        rows={5}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    />
                </div>
            );
        }

        if (type === 'file') {
            return (
                <div key={key}>
                    <label className="block text-sm font-medium text-gray-700">{label}</label>
                    <input
                        type="file"
                        name={key}
                        onChange={(e) => setFormData({ ...formData, [key]: e.target.files[0] })}
                        accept="image/*"
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    {/* Show existing image if available and no new file selected */}
                    {!formData[key] && data?.[key] && typeof data[key] === 'string' && (
                        <div className="mt-2 text-xs text-gray-500">
                            Current: {data[key].split('/').pop()}
                        </div>
                    )}
                </div>
            );
        }

        if (type === 'section') {
            return (
                <div key={key} className="col-span-1 md:col-span-2 pt-4 pb-2 border-b border-gray-100 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{label}</h4>
                </div>
            );
        }

        return (
            <div key={key}>
                <label className="block text-sm font-medium text-gray-700">{label}</label>
                <input
                    type={type}
                    name={key}
                    value={value}
                    onChange={handleChange}
                    disabled={fieldConfig.disabled}
                    onClick={(e) => type === 'date' && e.target.showPicker && e.target.showPicker()}
                    step={type === 'number' ? "0.01" : undefined}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 ${fieldConfig.disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`}
                />
            </div>
        );
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
                            <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <div className="flex justify-between items-center mb-4">
                                    <Dialog.Title as="h3" className="text-xl font-medium leading-6 text-gray-900">
                                        {title}
                                    </Dialog.Title>
                                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.entries(config).map(([key, fieldConfig]) => renderInput(key, fieldConfig))}
                                    </div>

                                    <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-100">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                        >
                                            Save Changes
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

export default QuickEditModal;
