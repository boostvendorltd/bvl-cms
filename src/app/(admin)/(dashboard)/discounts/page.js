"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchDiscounts,
    createDiscount,
    updateDiscount,
    deleteDiscount,
    toggleDiscountStatus
} from "@/redux/features/ecommerce-slice";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import TableActions from "@/components/tables/TableActions";
import QuickEditModal from "@/components/ui/modal/QuickEditModal";
import ConfirmationModal from "@/components/ui/modal/ConfirmationModal";
import { PencilSquareIcon, TrashIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import RouteGuard from "@/components/security/RouteGuard";

const DiscountsPage = () => {
    const dispatch = useDispatch();
    const { discounts, loading } = useSelector((state) => state.ecommerce);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedDiscount, setSelectedDiscount] = useState(null);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        data: null,
        title: "",
        message: ""
    });

    const [search, setSearch] = useState("");

    useEffect(() => {
        dispatch(fetchDiscounts());
    }, [dispatch]);

    const filteredDiscounts = useMemo(() => {
        return (discounts || []).filter(d => 
            d.name.toLowerCase().includes(search.toLowerCase()) || 
            d.coupon_code.toLowerCase().includes(search.toLowerCase())
        );
    }, [discounts, search]);

    const handleEdit = (d) => {
        setSelectedDiscount(d);
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (d) => {
        setConfirmModal({
            isOpen: true,
            data: d,
            title: "Delete Discount",
            message: `Are you sure you want to delete "${d.name}"?`
        });
    };

    const confirmDelete = async () => {
        try {
            await toast.promise(
                dispatch(deleteDiscount(confirmModal.data.id)).unwrap(),
                {
                    loading: 'Deleting...',
                    success: 'Discount deleted',
                    error: (err) => `Error: ${err.message || err}`
                }
            );
            setConfirmModal({ isOpen: false, data: null });
            dispatch(fetchDiscounts());
        } catch (error) {}
    };

    const handleSave = async (id, formData) => {
        try {
            if (id) {
                await dispatch(updateDiscount({ id, data: formData })).unwrap();
                toast.success("Discount updated");
            } else {
                await dispatch(createDiscount(formData)).unwrap();
                toast.success("Discount created");
            }
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
            dispatch(fetchDiscounts());
        } catch (error) {
            toast.error(error.message || "Operation failed");
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await dispatch(toggleDiscountStatus(id)).unwrap();
            toast.success("Status updated");
            dispatch(fetchDiscounts());
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    return (
        <>
            <PageBreadCrumb pageTitle="Marketing / Discounts" />
            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search names or codes..."
                            className="py-2 pl-9 pr-4 text-sm border border-gray-300 rounded-lg w-64 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-800 dark:text-white"
                        />
                    </div>
                    <TableActions
                        onAdd={() => setIsAddModalOpen(true)}
                        addButtonText="Add Discount"
                    />
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name / Code</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type / Value</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validity</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {loading && discounts.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td></tr>
                            ) : filteredDiscounts.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">No discounts found.</td></tr>
                            ) : filteredDiscounts.map((d) => (
                                <tr key={d.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{d.name}</div>
                                        <div className="text-xs text-blue-500 font-mono font-bold tracking-widest">{d.coupon_code}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 dark:text-white font-semibold">
                                            {d.type === 0 ? d.value : d.value + '%'} 
                                            <span className="text-xs font-normal text-gray-500 ml-1">({d.type === 0 ? 'Fixed' : 'Percentage'})</span>
                                        </div>
                                        <div className="text-xs text-gray-500">Min Order: {d.min_order_amount || 'None'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 dark:text-white">{d.total_used} / {d.usage_limit || '∞'}</div>
                                        <div className="text-xs text-gray-500">Used</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-xs text-gray-500">Starts: {d.start_at ? new Date(d.start_at).toLocaleDateString() : 'N/A'}</div>
                                        <div className="text-xs text-gray-500">Ends: {d.end_at ? new Date(d.end_at).toLocaleDateString() : 'Never'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <button 
                                            onClick={() => handleToggleStatus(d.id)}
                                            className={`px-2 py-1 text-xs font-medium rounded-full ${d.status === 1 ? 'bg-green-100 text-green-800' : d.status === 2 ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'}`}
                                        >
                                            {d.status === 1 ? 'Active' : d.status === 2 ? 'Expired' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleEdit(d)} className="text-blue-600 hover:text-blue-900 mr-3"><PencilSquareIcon className="h-5 w-5" /></button>
                                        <button onClick={() => handleDeleteClick(d)} className="text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5" /></button>
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
                title="Create Discount"
                fields={{
                    name: { label: "Campaign Name", type: "text" },
                    coupon_code: { label: "Coupon Code (e.g. SAVEDEC)", type: "text" },
                    type: { label: "Type", type: "select", options: { 0: "Fixed Amount", 1: "Percentage" } },
                    value: { label: "Discount Value", type: "number" },
                    min_order_amount: { label: "Min Order Amount", type: "number" },
                    max_discount_amount: { label: "Max Discount Amount", type: "number" },
                    usage_limit: { label: "Total Usage Limit", type: "number" },
                    apply_to: { label: "Apply To", type: "select", options: { 0: "Whole Order", 1: "Specific Product", 3: "Shipping" } },
                    status: { label: "Initial Status", type: "select", options: { 1: "Active", 0: "Inactive" } },
                    start_at: { label: "Start Date", type: "date" },
                    end_at: { label: "End Date", type: "date" },
                    description: { label: "Description", type: "textarea" }
                }}
            />

            <QuickEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                data={selectedDiscount}
                onSave={handleSave}
                title="Edit Discount"
                fields={{
                    name: { label: "Campaign Name", type: "text" },
                    coupon_code: { label: "Coupon Code", type: "text" },
                    type: { label: "Type", type: "select", options: { 0: "Fixed Amount", 1: "Percentage" } },
                    value: { label: "Discount Value", type: "number" },
                    min_order_amount: { label: "Min Order Amount", type: "number" },
                    max_discount_amount: { label: "Max Discount Amount", type: "number" },
                    usage_limit: { label: "Total Usage Limit", type: "number" },
                    apply_to: { label: "Apply To", type: "select", options: { 0: "Whole Order", 1: "Specific Product", 3: "Shipping" } },
                    status: { label: "Status", type: "select", options: { 1: "Active", 0: "Inactive" } },
                    start_at: { label: "Start Date", type: "date" },
                    end_at: { label: "End Date", type: "date" },
                    description: { label: "Description", type: "textarea" }
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

export default function DiscountsPageWithGuard() {
    return (
        <RouteGuard allowedRoles={['account', 'shop']} requireShop={true}>
            <DiscountsPage />
        </RouteGuard>
    );
}
