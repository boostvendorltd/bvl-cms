"use client";

import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { ExclamationTriangleIcon, InformationCircleIcon } from "@heroicons/react/24/outline";

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "danger", // danger, warning, info
    isLoading = false
}) => {

    const getIcon = () => {
        if (type === "danger") return <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />;
        if (type === "warning") return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />;
        return <InformationCircleIcon className="h-6 w-6 text-blue-600" />;
    };

    const getButtonColor = () => {
        if (type === "danger") return "bg-red-600 hover:bg-red-700 focus:ring-red-500";
        if (type === "warning") return "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500";
        return "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500";
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
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all border border-gray-200 dark:border-gray-700">
                                <div className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${type === 'danger' ? 'bg-red-100 dark:bg-red-900/40' : type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/40' : 'bg-blue-100 dark:bg-blue-900/40'}`}>
                                            {getIcon()}
                                        </div>
                                        <div className="mt-1">
                                            <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white/90">
                                                {title}
                                            </Dialog.Title>
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {message}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex flex-row-reverse gap-3">
                                    <button
                                        type="button"
                                        className={`inline-flex w-full justify-center rounded-lg px-3 py-2 text-sm font-semibold text-white shadow-sm sm:w-auto ${getButtonColor()} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        onClick={onConfirm}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Processing...' : confirmText}
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 inline-flex w-full justify-center rounded-lg bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 sm:mt-0 sm:w-auto"
                                        onClick={onClose}
                                        disabled={isLoading}
                                    >
                                        {cancelText}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default ConfirmationModal;
