"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchTaxes,
    createTax,
    updateTax,
    deleteTax,
    toggleTaxStatus
} from "@/redux/features/ecommerce-slice";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import TableActions from "@/components/tables/TableActions";
import QuickEditModal from "@/components/ui/modal/QuickEditModal";
import ConfirmationModal from "@/components/ui/modal/ConfirmationModal";
import { PencilSquareIcon, TrashIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import RouteGuard from "@/components/security/RouteGuard";

const TaxesPage = () => {
    const dispatch = useDispatch();
    const { taxes, loading } = useSelector((state) => state.ecommerce);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedTax, setSelectedTax] = useState(null);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        data: null,
        title: "",
        message: ""
    });

    const [search, setSearch] = useState("");

    useEffect(() => {
        dispatch(fetchTaxes());
    }, [dispatch]);

    const filteredTaxes = useMemo(() => {
        return (taxes || []).filter(tax => 
            tax.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [taxes, search]);

    const handleEdit = (tax) => {
        setSelectedTax(tax);
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (tax) => {
        setConfirmModal({
            isOpen: true,
            data: tax,
            title: "Delete Tax Rule",
            message: `Are you sure you want to delete "${tax.name}"?`
        });
    };

    const confirmDelete = async () => {
        try {
            await toast.promise(
                dispatch(deleteTax(confirmModal.data.id)).unwrap(),
                {
                    loading: 'Deleting...',
                    success: 'Tax rule deleted',
                    error: (err) => `Error: ${err.message || err}`
                }
            );
            setConfirmModal({ isOpen: false, data: null });
            dispatch(fetchTaxes());
        } catch (error) {}
    };

    const handleSave = async (id, formData) => {
        try {
            if (id) {
                await dispatch(updateTax({ id, data: formData })).unwrap();
                toast.success("Tax rule updated");
            } else {
                await dispatch(createTax(formData)).unwrap();
                toast.success("Tax rule created");
            }
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
            dispatch(fetchTaxes());
        } catch (error) {
            toast.error(error.message || "Operation failed");
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await dispatch(toggleTaxStatus(id)).unwrap();
            toast.success("Status updated");
            dispatch(fetchTaxes());
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    return (
        <>
            <PageBreadCrumb pageTitle="Tax Rules" />
            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search tax rules..."
                            className="py-2 pl-9 pr-4 text-sm border border-gray-300 rounded-lg w-64 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-800 dark:text-white"
                        />
                    </div>
                    <TableActions
                        onAdd={() => setIsAddModalOpen(true)}
                        addButtonText="Add Tax Rule"
                    />
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apply To</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {loading && taxes.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td></tr>
                            ) : filteredTaxes.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">No tax rules found.</td></tr>
                            ) : filteredTaxes.map((tax) => (
                                <tr key={tax.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{tax.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {tax.rate}{tax.type === 'percentage' ? '%' : ''}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">{tax.type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {tax.apply_to === 0 ? 'All Products' : tax.apply_to === 1 ? 'Specific Products' : 'Shipping'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <button 
                                            onClick={() => handleToggleStatus(tax.id)}
                                            className={`px-2 py-1 text-xs font-medium rounded-full ${tax.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                        >
                                            {tax.is_active ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleEdit(tax)} className="text-blue-600 hover:text-blue-900 mr-3"><PencilSquareIcon className="h-5 w-5" /></button>
                                        <button onClick={() => handleDeleteClick(tax)} className="text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5" /></button>
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
                title="Create Tax Rule"
                fields={{
                    name: { label: "Rule Name", type: "text" },
                    rate: { label: "Rate", type: "number" },
                    type: { label: "Type", type: "select", options: { percentage: "Percentage (%)", fixed: "Fixed Amount" } },
                    apply_to: { label: "Apply To", type: "select", options: { 0: "All Products", 1: "Specific (Product level)", 2: "Shipping" } },
                    is_active: { label: "Active", type: "select", options: { 1: "Yes", 0: "No" } },
                    note: { label: "Internal Note", type: "textarea" }
                }}
            />

            <QuickEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                data={selectedTax}
                onSave={handleSave}
                title="Edit Tax Rule"
                fields={{
                    name: { label: "Rule Name", type: "text" },
                    rate: { label: "Rate", type: "number" },
                    type: { label: "Type", type: "select", options: { percentage: "Percentage (%)", fixed: "Fixed Amount" } },
                    apply_to: { label: "Apply To", type: "select", options: { 0: "All Products", 1: "Specific (Product level)", 2: "Shipping" } },
                    is_active: { label: "Active", type: "select", options: { 1: "Yes", 0: "No" } },
                    note: { label: "Internal Note", type: "textarea" }
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

export default function TaxesPageWithGuard() {
    return (
        <RouteGuard allowedRoles={['account', 'shop']} requireShop={true}>
            <TaxesPage />
        </RouteGuard>
    );
}
