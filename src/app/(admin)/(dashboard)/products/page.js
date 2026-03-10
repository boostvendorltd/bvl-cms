"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import TableActions from "@/components/tables/TableActions";
import ConfirmationModal from "@/components/ui/modal/ConfirmationModal";
import {
    fetchProducts,
    deleteProduct,
    duplicateProduct,
    bulkUpdateProductStatus,
    bulkDeleteProducts
} from "@/redux/features/product-slice";
import {
    PencilSquareIcon,
    TrashIcon,
    DocumentDuplicateIcon,
    EyeIcon,
    MagnifyingGlassIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import AppImage from "@/components/ui/AppImage";

const STATUS_MAP = {
    0: { label: "Inactive", color: "bg-gray-100 text-gray-700" },
    1: { label: "Active", color: "bg-emerald-100 text-emerald-700" },
    2: { label: "Draft", color: "bg-amber-100 text-amber-700" },
};

const ProductsPage = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const { products, pagination, loading } = useSelector((state) => state.product);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [selectedIds, setSelectedIds] = useState([]);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    const loadProducts = useCallback(() => {
        const params = { page: currentPage, per_page: 15 };
        if (search) params.search = search;
        if (statusFilter !== "") params.status = statusFilter;
        dispatch(fetchProducts(params));
    }, [dispatch, currentPage, search, statusFilter]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        loadProducts();
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await toast.promise(
                dispatch(deleteProduct(deleteTarget.id)).unwrap(),
                {
                    loading: 'Deleting...',
                    success: 'Product deleted successfully',
                    error: (err) => `Error: ${err.message || err}`
                }
            );
            setDeleteTarget(null);
            loadProducts();
        } catch (error) {
            // handled by toast
        }
    };

    const handleDuplicate = async (id) => {
        try {
            await toast.promise(
                dispatch(duplicateProduct(id)).unwrap(),
                {
                    loading: 'Duplicating...',
                    success: 'Product duplicated successfully',
                    error: (err) => `Error: ${err.message || err}`
                }
            );
            loadProducts();
        } catch (error) {
            // handled by toast
        }
    };

    const handleBulkStatus = async (status) => {
        if (selectedIds.length === 0) return;
        try {
            await toast.promise(
                dispatch(bulkUpdateProductStatus({ product_ids: selectedIds, status })).unwrap(),
                {
                    loading: 'Updating status...',
                    success: 'Products status updated',
                    error: (err) => `Error: ${err.message || err}`
                }
            );
            setSelectedIds([]);
            loadProducts();
        } catch (error) {
            // handled by toast
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;

        if (!confirm('Are you sure you want to delete ' + selectedIds.length + ' products?')) return;

        try {
            await toast.promise(
                dispatch(bulkDeleteProducts(selectedIds)).unwrap(),
                {
                    loading: 'Deleting products...',
                    success: 'Products deleted successfully',
                    error: (err) => `Error: ${err.message || err}`
                }
            );
            setSelectedIds([]);
            loadProducts();
        } catch (error) {
            // handled by toast
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === products.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(products.map((p) => p.id));
        }
    };

    const getPrimaryImage = (product) => {
        const img = product.images?.[0];
        if (!img) return null;
        return img.image_path;
    };

    const getPrice = (product) => {
        const v = product.variants?.[0];
        return v ? parseFloat(v.price).toFixed(2) : "—";
    };

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith("http")) return path;
        const baseURL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/api\/v1\/?$/, '');
        return `${baseURL}/storage/${path}`;
    };

    return (
        <>
            <PageBreadCrumb pageTitle="Products" />
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
                                placeholder="Search products..."
                                className="py-2 pl-9 pr-4 text-sm border border-gray-300 rounded-lg w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:text-white/90"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                            className="py-2 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-gray-400"
                        >
                            <option value="">All Status</option>
                            <option value="1">Active</option>
                            <option value="0">Inactive</option>
                            <option value="2">Draft</option>
                        </select>
                    </form>

                    <div className="flex items-center gap-3">
                        {selectedIds.length > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">{selectedIds.length} selected</span>
                                <button
                                    onClick={() => handleBulkStatus(1)}
                                    className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-md hover:bg-emerald-100"
                                >
                                    Activate
                                </button>
                                <button
                                    onClick={() => handleBulkStatus(0)}
                                    className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                >
                                    Deactivate
                                </button>
                                <button
                                    onClick={handleBulkDelete}
                                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-500 bg-red-50 rounded-lg hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                    Delete
                                </button>
                            </div>
                        )}
                        <TableActions
                            onAdd={() => router.push("/products/create")}
                            addButtonText="Add Product"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden bg-white border border-gray-200 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th className="w-12 px-4 py-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.length === products.length && products.length > 0}
                                            onChange={toggleSelectAll}
                                            className="w-4 h-4 text-blue-600 rounded border-gray-300"
                                        />
                                    </th>
                                    <th className="px-4 py-3 text-xs font-semibold tracking-wide text-left text-gray-500 dark:text-gray-400 uppercase">Product</th>
                                    <th className="px-4 py-3 text-xs font-semibold tracking-wide text-left text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                    <th className="px-4 py-3 text-xs font-semibold tracking-wide text-left text-gray-500 dark:text-gray-400 uppercase">Category</th>
                                    <th className="px-4 py-3 text-xs font-semibold tracking-wide text-right text-gray-500 dark:text-gray-400 uppercase">Price</th>
                                    <th className="px-4 py-3 text-xs font-semibold tracking-wide text-center text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-gray-400 dark:text-white">
                                            <div className="flex items-center justify-center gap-2">
                                                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                Loading...
                                            </div>
                                        </td>
                                    </tr>
                                ) : products.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                                            No products found. Create your first product!
                                        </td>
                                    </tr>
                                ) : (
                                    products.map((product) => {
                                        const status = STATUS_MAP[product.status] || STATUS_MAP[0];
                                        const imgPath = getPrimaryImage(product);
                                        return (
                                            <tr key={product.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(product.id)}
                                                        onChange={() => toggleSelect(product.id)}
                                                        className="w-4 h-4 text-blue-600 rounded border-gray-300"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative flex-shrink-0 w-10 h-10 overflow-hidden bg-gray-100 dark:bg-gray-700 rounded-lg">
                                                            {imgPath ? (
                                                                <AppImage
                                                                    src={getImageUrl(imgPath)}
                                                                    alt={product.name}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex items-center justify-center w-full h-full text-gray-400 dark:text-gray-500">
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white/90">{product.name}</p>
                                                            {product.short_description && (
                                                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{product.short_description}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full ${status.color}`}>
                                                        {status.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-wrap gap-1">
                                                        {product.categories?.slice(0, 2).map((cat) => (
                                                            <span key={cat.id} className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 rounded-md">
                                                                {cat.name}
                                                            </span>
                                                        ))}
                                                        {product.categories?.length > 2 && (
                                                            <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 rounded-md">
                                                                +{product.categories.length - 2}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm font-medium text-right text-gray-900 dark:text-white/90">
                                                    ${getPrice(product)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button
                                                            onClick={() => router.push(`/products/${product.id}`)}
                                                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 transition-colors rounded-md"
                                                            title="Edit"
                                                        >
                                                            <PencilSquareIcon className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDuplicate(product.id)}
                                                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400 transition-colors rounded-md"
                                                            title="Duplicate"
                                                        >
                                                            <DocumentDuplicateIcon className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteTarget(product)}
                                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-colors rounded-md"
                                                            title="Delete"
                                                        >
                                                            <TrashIcon className="w-4 h-4" />
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

            {/* Delete Confirmation */}
            <ConfirmationModal
                isOpen={!!deleteTarget}
                title="Delete Product"
                message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                onConfirm={handleDelete}
                onClose={() => setDeleteTarget(null)}
            />
        </>
    );
};

import RouteGuard from "@/components/security/RouteGuard";

export default function ProductsPageWithGuard() {
    return (
        <RouteGuard allowedRoles={['account', 'shop']} requireShop={true}>
            <ProductsPage />
        </RouteGuard>
    );
}
