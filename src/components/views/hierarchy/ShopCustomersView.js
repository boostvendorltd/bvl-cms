"use client";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import HierarchyTable from "@/components/tables/HierarchyTable";
import QuickEditModal from "@/components/ui/modal/QuickEditModal";
import TableActions from "@/components/tables/TableActions";
import ConfirmationModal from "@/components/ui/modal/ConfirmationModal";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "@/utils/api";
import { MagnifyingGlassIcon, TrashIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { useSelector } from "react-redux";

const ShopCustomersView = ({ shopId }) => {
    const { user } = useSelector((state) => state.auth);
    const [customers, setCustomers] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedRow, setSelectedRow] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filter & Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Selection State
    const [selectedIds, setSelectedIds] = useState([]);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const isRoot = user?.type === 0;
    const isAdmin = user?.type === 4;
    const isPartner = user?.type === 2;
    const isAccount = user?.type === 3 || user?.role === 'account';

    // Permission flags: Customer management is usually for Shop/Account/Admin/Root.
    // However, user requested Partner (and potentially Account) to be watch only here.
    const canEdit = isRoot || isAdmin;
    const canManageStatus = isRoot || isAdmin;
    const canBulkAction = isRoot || isAdmin;
    const canDelete = isRoot || isAdmin;
    const showActions = canEdit || canManageStatus || canDelete;

    // Confirmation Modal for single-row status toggle
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => { },
        isLoading: false
    });
    const closeConfirmModal = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

    const fetchCustomers = async (page = 1) => {
        try {
            setLoading(true);
            const params = {
                page,
                limit: 10,
                search: searchQuery,
                status: statusFilter !== "all" ? statusFilter : undefined
            };
            const response = await axios.get(`/cms/shops/${shopId}/customers`, { params });
            setCustomers(response.data.data);
            setPagination({
                current_page: response.data.current_page,
                last_page: response.data.last_page,
                total: response.data.total
            });
        } catch (error) {
            console.error("Error fetching customers:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (shopId) {
            fetchCustomers(1);
        }
    }, [shopId, searchQuery, statusFilter]);

    // Selection Handlers
    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedIds(customers.map(c => c.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectRow = (id, checked) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(rowId => rowId !== id));
        }
    };

    // Bulk Delete
    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await toast.promise(
                axios.post(`/cms/shops/${shopId}/customers/bulk-delete`, { ids: selectedIds }),
                {
                    loading: 'Deleting customers...',
                    success: 'Customers deleted successfully',
                    error: 'Failed to delete customers'
                }
            );
            setSelectedIds([]);
            fetchCustomers(pagination?.current_page || 1);
            setIsDeleteModalOpen(false);
        } catch (error) {
            console.error(error);
        }
    };

    // Bulk Status Update
    const handleBulkStatusUpdate = async (status) => {
        if (selectedIds.length === 0) return;
        try {
            await toast.promise(
                axios.post(`/cms/shops/${shopId}/customers/bulk-status`, {
                    ids: selectedIds,
                    status: parseInt(status)
                }),
                {
                    loading: 'Updating status...',
                    success: 'Status updated successfully',
                    error: 'Failed to update status'
                }
            );
            setSelectedIds([]);
            fetchCustomers(pagination?.current_page || 1);
        } catch (error) {
            console.error(error);
        }
    };

    const handleToggleStatus = (row) => {
        const newStatus = row.status === 1 ? 0 : 1;
        const action = newStatus === 1 ? "Activate" : "Deactivate";

        setConfirmModal({
            isOpen: true,
            title: `${action} Customer`,
            message: `Are you sure you want to ${action.toLowerCase()} ${row.name || 'this customer'}?`,
            isLoading: false,
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, isLoading: true }));
                try {
                    await toast.promise(
                        axios.put(`/cms/shops/${shopId}/customers/${row.id}`, {
                            ...row,
                            status: newStatus
                        }),
                        {
                            loading: `${action === 'Activate' ? 'Activating' : 'Deactivating'} customer...`,
                            success: `Customer ${action === 'Activate' ? 'activated' : 'deactivated'} successfully`,
                            error: 'Failed to update status'
                        }
                    );
                    fetchCustomers(pagination?.current_page || 1);
                    closeConfirmModal();
                } catch (error) {
                    console.error(error);
                } finally {
                    setConfirmModal(prev => ({ ...prev, isLoading: false }));
                }
            }
        });
    };





    const columns = [
        ...(canManageStatus ? [{ header: "ID", accessor: "id" }] : []),
        {
            header: "Customer Name",
            accessor: "name",
        },
        { header: "Email", accessor: "email" },
        { header: "Phone", accessor: "phone" },
        {
            header: "Date of Birth",
            accessor: "dob",
            render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
        },
        {
            header: "Gender",
            accessor: "gender",
            render: (value) => {
                if (value === null || value === undefined) return 'N/A';
                const genderMap = { 0: 'Male', 1: 'Female', 2: 'Other' };
                return genderMap[value] || 'N/A';
            }
        },
        {
            header: "Avatar",
            accessor: "avatar",
            render: (value) => value ? (
                <img src={value} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
            ) : (
                <img src="/images/user/default.jpg" alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
            )
        },
        {
            header: "Last Login",
            accessor: "last_login_at",
            render: (value) => value ? new Date(value).toLocaleString() : 'Never'
        },
        {
            header: "Status",
            accessor: "status",
            render: (value) => {
                const statusMap = {
                    0: { label: 'Inactive', color: 'bg-red-100 text-red-800' },
                    1: { label: 'Active', color: 'bg-green-100 text-green-800' },
                    2: { label: 'Pending', color: 'bg-orange-100 text-orange-800' },
                    3: { label: 'Archived', color: 'bg-gray-100 text-gray-800' },
                };
                const config = statusMap[value] || { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };

                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                        {config.label}
                    </span>
                );
            }
        },
        {
            header: "Joined At",
            accessor: "created_at",
            render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
        },
        ...(showActions ? [{
            header: "Actions",
            accessor: "actions",
            render: (_, row) => (
                <div className="flex items-center space-x-2">
                    {canEdit && (
                        <button
                            onClick={() => handleIdClick(row)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit"
                        >
                            <PencilSquareIcon className="h-5 w-5" />
                        </button>
                    )}

                    {canManageStatus && (
                        <button
                            onClick={() => handleToggleStatus(row)}
                            className={`px-3 py-1 text-xs rounded border ${row.status === 1
                                ? 'border-red-500 text-red-600 hover:bg-red-50'
                                : 'border-green-500 text-green-600 hover:bg-green-50'
                                }`}
                        >
                            {row.status === 1 ? 'Deactivate' : 'Activate'}
                        </button>
                    )}
                    {canDelete && (
                        <button
                            onClick={() => {
                                setSelectedIds([row.id]);
                                setIsDeleteModalOpen(true);
                            }}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                            title="Delete"
                        >
                            <TrashIcon className="h-5 w-5" />
                        </button>
                    )}
                </div>
            )
        }] : [])
    ];

    const handleIdClick = (row) => {
        setSelectedRow(row);
        setIsModalOpen(true);
    };

    const handleDownloadCsv = () => {
        window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/cms/download-csv/customers/${shopId}`, '_blank');
    };

    const handleSave = async (id, formData) => {
        try {
            await axios.put(`/cms/shops/${shopId}/customers/${id}`, formData);
            toast.success("Customer updated successfully");
            setIsModalOpen(false);
            fetchCustomers(pagination?.current_page || 1);
        } catch (error) {
            console.error("Update failed", error);
            toast.error(error.response?.data?.message || "Failed to update customer");
        }
    };

    return (
        <>
            <PageBreadCrumb pageTitle="Customers" />
            <div className="space-y-5">
                {/* Toolbar */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search customers..."
                                className="py-2 pl-9 pr-4 text-sm border border-gray-300 rounded-lg w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:text-white/90"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="py-2 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-gray-400"
                        >
                            <option value="all">All Status</option>
                            <option value="1">Active</option>
                            <option value="0">Inactive</option>
                            <option value="2">Pending</option>
                            <option value="3">Archived</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-3">
                        {canBulkAction && selectedIds.length > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">{selectedIds.length} selected</span>
                                {/* Bulk Status: Root (0) & Admin (4) */}
                                <button
                                    onClick={() => handleBulkStatusUpdate(1)}
                                    className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-md hover:bg-emerald-100"
                                >
                                    Activate
                                </button>
                                <button
                                    onClick={() => handleBulkStatusUpdate(0)}
                                    className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                >
                                    Deactivate
                                </button>
                                {/* Bulk Delete: Root (0) Only */}
                                {canDelete && (
                                    <button
                                        onClick={handleBulkDelete}
                                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-500 bg-red-50 rounded-lg hover:bg-red-100"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                        Delete
                                    </button>
                                )}
                            </div>
                        )}
                        <TableActions
                            onDownload={handleDownloadCsv}
                        />
                    </div>
                </div>
                <HierarchyTable
                    columns={columns}
                    data={customers}
                    pagination={pagination}
                    onPageChange={fetchCustomers}
                    onIdClick={canEdit ? handleIdClick : undefined}
                    selectable={canEdit}
                    selectedIds={selectedIds}
                    onSelect={handleSelectRow}
                    onSelectAll={handleSelectAll}
                />
            </div>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Customers"
                message={`Are you sure you want to delete ${selectedIds.length} customer(s)? This action cannot be undone.`}
                confirmText="Delete"
                confirmColor="bg-red-600 hover:bg-red-700"
            />

            {/* Single-row status toggle confirmation */}
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={closeConfirmModal}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText="Confirm"
                isLoading={confirmModal.isLoading}
            />

            <QuickEditModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                data={selectedRow}
                onSave={handleSave}
                title="Edit Customer"
                fields={{
                    name: { label: "Customer Name" },
                    email: { label: "Email" },
                    phone: { label: "Phone" },
                    status: {
                        label: "Status",
                        type: 'select',
                        options: {
                            0: { label: 'Inactive' }, 1: { label: 'Active' }, 2: { label: 'Pending' }, 3: { label: 'Archived' }
                        }
                    },
                    last_login_at: { label: "Last Login", type: 'datetime' },
                    created_at: { label: "Joined At", type: 'datetime' }
                }}
            />
        </>
    );
};

export default ShopCustomersView;
