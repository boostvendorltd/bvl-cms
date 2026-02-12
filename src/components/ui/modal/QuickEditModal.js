"use client";
import React from "react";

export default function QuickEditModal({ isOpen, onClose, data }) {
    if (!isOpen || !data) return null;

    return (
        <div
            className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg p-6 bg-white rounded-xl shadow-lg dark:bg-gray-800"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Quick Edit: {data.name}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    {Object.entries(data).map(([key, value]) => {
                        if (typeof value === "object") return null; // Skip nested objects for simple view
                        return (
                            <div key={key} className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                                    {key.replace(/_/g, " ")}
                                </label>
                                <input
                                    type="text"
                                    readOnly
                                    value={value || ""}
                                    className="mt-1 p-2 w-full rounded-md border border-gray-300 bg-gray-50 text-gray-900 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-brand-500"
                                />
                            </div>
                        );
                    })}
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                        Close
                    </button>
                    <button
                        className="px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 focus:ring-4 focus:ring-brand-500/20"
                        onClick={() => alert("Save functionality would go here.")}
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
