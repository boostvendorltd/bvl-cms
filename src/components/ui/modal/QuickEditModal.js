"use client";
import React, { useState, useEffect } from "react";

export default function QuickEditModal({ isOpen, onClose, data, fields }) {
    if (!isOpen || !data) return null;

    // Helper to get nested value
    const getValue = (obj, path) => {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    };

    const renderField = (key, value) => {
        const config = fields?.[key];

        // If config says ignore, return null
        if (config?.type === 'ignore') return null;

        // Determine label
        const label = config?.label || key.replace(/_/g, " ");

        // For objects without config, try to show something useful or skip
        if (typeof value === "object" && value !== null && !config) return null;

        let displayValue = value;
        let inputType = "text";
        let isReadOnly = true; // Use readOnly by default until save logic exists

        // Handle specific types
        if (config?.type === 'select' && config.options) {
            // If value is ID, look up label
            displayValue = config.options[value] || value;
            if (typeof displayValue === 'object') displayValue = displayValue.label || displayValue;
        } else if (config?.type === 'datetime') {
            displayValue = value ? new Date(value).toLocaleString() : '';
        } else if (config?.formatter) {
            displayValue = config.formatter(value, data);
        }

        return (
            <div key={key} className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize mb-1">
                    {label}
                </label>
                <input
                    type={inputType}
                    readOnly={isReadOnly}
                    value={displayValue || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
            </div>
        );
    };

    return (
        <div
            className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg bg-white rounded-xl shadow-2xl dark:bg-gray-800 overflow-hidden flex flex-col max-h-[85vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {data.name || 'Quick View'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto">
                    {fields ? (
                        // Render based on fields config order
                        Object.keys(fields).map(key => {
                            // Use data[key] directly, or handle if key is not in data but we want to show it (e.g. forced computed field)
                            const val = data[key];
                            return renderField(key, val);
                        })
                    ) : (
                        // Fallback to iterating data keys
                        Object.entries(data).map(([key, value]) => renderField(key, value))
                    )}
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 dark:bg-gray-800 dark:border-gray-700">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
