"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchShippingMethods,
    createShippingMethod,
    updateShippingMethod,
    deleteShippingMethod
} from "@/redux/features/shipping-slice";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import TableActions from "@/components/tables/TableActions";
import QuickEditModal from "@/components/ui/modal/QuickEditModal";
import ConfirmationModal from "@/components/ui/modal/ConfirmationModal";
import { PencilSquareIcon, TrashIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import RouteGuard from "@/components/security/RouteGuard";

const ShippingMethodsPage = () => {
    const dispatch = useDispatch();
    const { methods, loading } = useSelector((state) => state.shipping);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        data: null,
        title: "",
        message: ""
    });

    const [search, setSearch] = useState("");

    useEffect(() => {
        dispatch(fetchShippingMethods());
    }, [dispatch]);

    const filteredMethods = useMemo(() => {
        return (methods || []).filter(method => 
            method.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [methods, search]);

    const handleEdit = (method) => {
        setSelectedMethod(method);
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (method) => {
        setConfirmModal({
            isOpen: true,
            data: method,
            title: "Delete Shipping Method",
            message: `Are you sure you want to delete "${method.name}"?`
        });
    };

    const confirmDelete = async () => {
        try {
            await toast.promise(
                dispatch(deleteShippingMethod(confirmModal.data.id)).unwrap(),
                {
                    loading: 'Deleting...',
                    success: 'Method deleted',
                    error: (err) => `Error: ${err.message || err}`
                }
            );
            setConfirmModal({ isOpen: false, data: null });
        } catch (error) {}
    };

    const handleSave = async (id, formData) => {
        try {
            if (id) {
                await dispatch(updateShippingMethod({ id, data: formData })).unwrap();
                toast.success("Shipping method updated");
            } else {
                await dispatch(createShippingMethod(formData)).unwrap();
                toast.success("Shipping method created");
            }
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
        } catch (error) {
            toast.error(error.message || "Operation failed");
        }
    };

    return (
        <>
            <PageBreadCrumb pageTitle="Shipping Methods" />
            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search methods..."
                            className="py-2 pl-9 pr-4 text-sm border border-gray-300 rounded-lg w-64 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-800 dark:text-white"
                        />
                    </div>
                    <TableActions
                        onAdd={() => setIsAddModalOpen(true)}
                        addButtonText="Add Shipping Method"
                    />
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Method Name</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cost</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Free Threshold</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {loading && methods.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td></tr>
                            ) : filteredMethods.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">No methods found.</td></tr>
                            ) : filteredMethods.map((method) => (
                                <tr key={method.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{method.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        ${parseFloat(method.cost).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {method.min_order_amount ? `$${parseFloat(method.min_order_amount).toFixed(2)}+` : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">{method.type.replace('_', ' ')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${method.is_active ? 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-500' : 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-500'}`}>
                                            {method.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleEdit(method)} className="text-blue-600 hover:text-blue-900 mr-3 dark:text-blue-400"><PencilSquareIcon className="h-5 w-5" /></button>
                                        <button onClick={() => handleDeleteClick(method)} className="text-red-600 hover:text-red-900 dark:text-red-400"><TrashIcon className="h-5 w-5" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <QuickEditModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={(id, data) => handleSave(null, data)}
                title="Add Shipping Method"
                fields={{
                    name: { label: "Method Name", type: "text" },
                    cost: { label: "Cost ($)", type: "number" },
                    min_order_amount: { label: "Free Shipping Threshold ($)", type: "number" },
                    type: { label: "Calculation Type", type: "select", options: { flat: "Flat Rate", weight_based: "Weight Based" } },
                    is_active: { label: "Active", type: "select", options: { 1: "Yes", 0: "No" } }
                }}
            />

            <QuickEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                data={selectedMethod}
                onSave={handleSave}
                title="Edit Shipping Method"
                fields={{
                    name: { label: "Method Name", type: "text" },
                    cost: { label: "Cost ($)", type: "number" },
                    min_order_amount: { label: "Free Shipping Threshold ($)", type: "number" },
                    type: { label: "Calculation Type", type: "select", options: { flat: "Flat Rate", weight_based: "Weight Based" } },
                    is_active: { label: "Active", type: "select", options: { 1: "Yes", 0: "No" } }
                }}
            />

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, data: null })}
                onConfirm={confirmDelete}
                title={confirmModal.title}
                message={confirmModal.message}
                type="danger"
            />
        </>
    );
};

export default function ShippingMethodsPageWithGuard() {
    return (
        <RouteGuard allowedRoles={['account', 'shop']} requireShop={true}>
            <ShippingMethodsPage />
        </RouteGuard>
    );
}
