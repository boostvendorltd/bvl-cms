"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import TableActions from "@/components/tables/TableActions";
import { fetchOrders, updateOrderStatus } from "@/redux/features/order-slice";
import {
    PencilSquareIcon,
    EyeIcon,
    MagnifyingGlassIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import RouteGuard from "@/components/security/RouteGuard";

const STATUS_MAP = {
    0: { label: "Pending", color: "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400" },
    1: { label: "Processing", color: "bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400" },
    2: { label: "Shipped", color: "bg-blue-light-50 text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-400" },
    3: { label: "Delivered", color: "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-400" },
    4: { label: "Cancelled", color: "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-400" },
    5: { label: "Refunded", color: "bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-white/80" },
};

const OrdersPage = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const { orders, pagination, loading } = useSelector((state) => state.order);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const loadOrders = useCallback(() => {
        const params = { page: currentPage, per_page: 15 };
        if (search) params.search = search;
        if (statusFilter !== "") params.status = statusFilter;
        dispatch(fetchOrders(params));
    }, [dispatch, currentPage, search, statusFilter]);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        loadOrders();
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await toast.promise(
                dispatch(updateOrderStatus({ id, status: newStatus })).unwrap(),
                {
                    loading: 'Updating status...',
                    success: 'Order status updated successfully',
                    error: (err) => `Error: ${err.message || err}`
                }
            );
            loadOrders();
        } catch (error) {
            // handled by toast
        }
    };

    return (
        <>
            <PageBreadCrumb pageTitle="Order Management" />
            <div className="space-y-5">
                {/* Toolbar */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <form onSubmit={handleSearch} className="flex items-center gap-2">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search orders..."
                                className="py-2 pl-9 pr-4 text-sm border border-gray-300 rounded-lg w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:text-white/90 dark:bg-gray-900 dark:border-gray-800"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                            className="py-2 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-gray-400 dark:bg-gray-900 dark:border-gray-800"
                        >
                            <option value="">All Status</option>
                            {Object.entries(STATUS_MAP).map(([val, {label}]) => (
                                <option key={val} value={val}>{label}</option>
                            ))}
                        </select>
                    </form>
                </div>

                {/* Table */}
                <div className="overflow-hidden bg-white border border-gray-200 rounded-xl shadow-sm dark:bg-gray-900 dark:border-gray-800">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th className="px-4 py-3 text-xs font-semibold tracking-wide text-left text-gray-500 dark:text-gray-400 uppercase">Order Details</th>
                                    <th className="px-4 py-3 text-xs font-semibold tracking-wide text-left text-gray-500 dark:text-gray-400 uppercase">Customer</th>
                                    <th className="px-4 py-3 text-xs font-semibold tracking-wide text-left text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                    <th className="px-4 py-3 text-xs font-semibold tracking-wide text-right text-gray-500 dark:text-gray-400 uppercase">Total</th>
                                    <th className="px-4 py-3 text-xs font-semibold tracking-wide text-center text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-gray-600 dark:text-gray-400">
                                {loading && orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-12 text-center">Loading orders...</td>
                                    </tr>
                                ) : orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-12 text-center">No orders found.</td>
                                    </tr>
                                ) : (
                                    orders.map((order) => {
                                        const status = STATUS_MAP[order.order_status] || STATUS_MAP[0];
                                        return (
                                            <tr key={order.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-800 dark:text-white/90">{order.order_number}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-sm">
                                                        <p className="font-medium text-gray-800 dark:text-white/90">{order.user_name}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">{order.user_phone}</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <select 
                                                        value={order.order_status}
                                                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                                        className={`px-2.5 py-0.5 text-xs font-medium rounded-full cursor-pointer appearance-none outline-none border-none ${status.color}`}
                                                    >
                                                        {Object.entries(STATUS_MAP).map(([val, {label}]) => (
                                                            <option key={val} value={val} className="text-gray-700 bg-white">{label}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-3 text-sm font-medium text-right text-gray-800 dark:text-white/90">
                                                    ${parseFloat(order.grand_total).toFixed(2)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button
                                                            onClick={() => router.push(`/orders/${order.id}`)}
                                                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors rounded-md"
                                                            title="View Details"
                                                        >
                                                            <EyeIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.last_page > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Page {pagination.current_page} of {pagination.last_page} ({pagination.total} items)
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-1.5 text-gray-500 dark:text-gray-400 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeftIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(pagination.last_page, p + 1))}
                                    disabled={currentPage === pagination.last_page}
                                    className="p-1.5 text-gray-500 dark:text-gray-400 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <ChevronRightIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default function OrdersPageWithGuard() {
    return (
        <RouteGuard allowedRoles={['account', 'shop']} requireShop={true}>
            <OrdersPage />
        </RouteGuard>
    );
}
