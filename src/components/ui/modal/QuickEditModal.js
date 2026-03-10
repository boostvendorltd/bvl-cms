"use client";
import React, { useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

const QuickEditModal = ({ isOpen, onClose, data, onSave, title = "Edit Item", fields }) => {
    const [formData, setFormData] = useState({});

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

                const actualKey = config[key].dataKey || key;
                let value;
                if (actualKey.includes('.')) {
                    value = actualKey.split('.').reduce((o, i) => o ? o[i] : undefined, data);
                } else {
                    value = data[actualKey];
                }

                if (config[key].type === 'date' && value) {
                    value = value.split('T')[0];
                }

                initialData[key] = value !== undefined && value !== null ? value : "";
            });
            setFormData(initialData);
        } else {
            const initialData = {};
            Object.keys(config).forEach(key => {
                const field = config[key];
                if (field.type === 'ignore' || field.type === 'section') return;

                if (field.type === 'select' && field.options) {
                    const firstOption = Array.isArray(field.options)
                        ? field.options[0]
                        : Object.entries(field.options)[0];

                    if (Array.isArray(field.options)) {
                        initialData[key] = firstOption?.value !== undefined ? firstOption.value : "";
                    } else {
                        initialData[key] = firstOption ? firstOption[0] : "";
                    }
                } else {
                    initialData[key] = "";
                }
            });
            setFormData(initialData);
        }
    }, [data, config]);

    useEffect(() => {
        if (formData.contract_start && formData.contract_update_interval) {
            try {
                const startDate = new Date(formData.contract_start);
                const monthsToAdd = parseInt(formData.contract_update_interval, 10);

                if (!isNaN(startDate.getTime()) && !isNaN(monthsToAdd)) {
                    const endDate = new Date(startDate);
                    endDate.setMonth(endDate.getMonth() + monthsToAdd);

                    const formattedEndDate = endDate.toISOString().split('T')[0];
                    if (formData.contract_end !== formattedEndDate) {
                        setFormData(prev => ({ ...prev, contract_end: formattedEndDate }));
                    }
                }
            } catch (error) {
                console.error("Date calculation error:", error);
            }
        }
    }, [formData.contract_start, formData.contract_update_interval]);

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
            const options = Array.isArray(fieldConfig.options)
                ? fieldConfig.options
                : Object.entries(fieldConfig.options || {}).map(([val, label]) => ({
                    value: val,
                    label: typeof label === 'object' ? label.label : label
                }));

            return (
                <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
                    <select
                        name={key}
                        value={value}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 bg-white dark:bg-gray-700 dark:text-white"
                    >
                        {options.map((opt, idx) => (
                            <option key={`${opt.value}-${idx}`} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
            );
        }

        if (type === 'textarea') {
            return (
                <div key={key} className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
                    <textarea
                        name={key}
                        value={value}
                        onChange={handleChange}
                        rows={5}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 bg-white dark:bg-gray-700 dark:text-white"
                    />
                </div>
            );
        }

        if (type === 'file') {
            const acceptValue = config[key].accept || "*/*";
            const actualKey = config[key].dataKey || key;
            const dbValue = data ? (actualKey.includes('.') ? actualKey.split('.').reduce((o, i) => o ? o[i] : undefined, data) : data[actualKey]) : null;

            return (
                <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
                    <input
                        type="file"
                        name={key}
                        onChange={(e) => setFormData({ ...formData, [key]: e.target.files[0] })}
                        accept={acceptValue}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg outline-none transition-all bg-white dark:bg-gray-700 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/50 file:text-blue-700 dark:file:text-blue-400 hover:file:bg-blue-100 dark:hover:file:bg-blue-900"
                    />
                    {!formData[key] && dbValue && typeof dbValue === 'string' && (
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            Current:
                            <a
                                href={`http://localhost:8000/storage${dbValue}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-1 text-blue-500 hover:text-blue-700 hover:underline"
                            >
                                {dbValue.split('/').pop()}
                            </a>
                        </div>
                    )}
                </div>
            );
        }

        if (type === 'checkbox') {
            return (
                <div key={key} className="flex items-center gap-2 mt-4">
                    <input
                        type="checkbox"
                        name={key}
                        checked={!!value || value === 1 || value === '1'}
                        onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
                </div>
            );
        }

        if (type === 'br') {
            return <div key={key} className="col-span-1 md:col-span-2 h-0" />;
        }

        if (type === 'section') {
            return (
                <div key={key} className="col-span-1 md:col-span-2 pt-4 pb-2 border-b border-gray-100 dark:border-gray-700 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{label}</h4>
                </div>
            );
        }

        return (
            <div key={key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
                <input
                    type={type}
                    name={key}
                    value={value}
                    onChange={handleChange}
                    disabled={fieldConfig.disabled}
                    onClick={(e) => type === 'date' && e.target.showPicker && e.target.showPicker()}
                    step={type === 'number' ? "0.01" : undefined}
                    className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 bg-white dark:bg-gray-700 dark:text-white dark:[color-scheme:dark] ${fieldConfig.disabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed text-gray-500 dark:text-gray-400' : ''}`}
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
                            <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all flex flex-col max-h-[90vh]">
                                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                                    <Dialog.Title as="h3" className="text-xl font-semibold text-gray-900 dark:text-white">
                                        {title}
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="p-2 text-gray-400 transition-colors rounded-full hover:bg-gray-200 hover:text-gray-600"
                                    >
                                        <XMarkIcon className="w-6 h-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.entries(config).map(([key, fieldConfig]) => renderInput(key, fieldConfig))}
                                    </div>

                                    <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-8 flex justify-end gap-3 px-2 pb-2">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 border border-transparent focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
