"use client";

import React from "react";
import { PlusIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";

const TableActions = ({ onAdd, onDownload, addButtonText = "Add New", downloadButtonText = "Download CSV" }) => {
    return (
        <div className="flex flex-wrap items-center gap-3">
            {onDownload && (
                <button
                    onClick={onDownload}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    {downloadButtonText}
                </button>
            )}
            {onAdd && (
                <button
                    onClick={onAdd}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <PlusIcon className="w-4 h-4" />
                    {addButtonText}
                </button>
            )}
        </div>
    );
};

export default TableActions;
