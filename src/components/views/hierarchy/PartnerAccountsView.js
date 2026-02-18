"use client";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import HierarchyTable from "@/components/tables/HierarchyTable";
import QuickEditModal from "@/components/ui/modal/QuickEditModal";
import AddAccountModal from "@/components/ui/modal/AddAccountModal";
import ConfirmationModal from "@/components/ui/modal/ConfirmationModal";
import TableActions from "@/components/tables/TableActions";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchPartnerAccounts,
    createAccount,
    updateAccount,
    approveAccount,
    toggleAccountStatus,
    bulkDeleteAccounts,
    bulkUpdateAccountStatus
} from "@/redux/features/hierarchy-slice";
import { PencilSquareIcon, MagnifyingGlassIcon, TrashIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const PartnerAccountsView = ({ partnerId }) => {
    const dispatch = useDispatch();
    const { currentPartnerAccounts, pagination, isLoading } = useSelector((state) => state.hierarchy);
    const { user } = useSelector((state) => state.auth);

    const [selectedRow, setSelectedRow] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Filter & Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Selection State
    const [selectedIds, setSelectedIds] = useState([]);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Confirmation State
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        type: "danger",
        onConfirm: () => { },
        isLoading: false
    });

    const closeConfirmModal = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

    const isRoot = user?.type === 0;
    const isAdmin = user?.type === 4;
    const isPartner = user?.type === 2;

    const canEdit = isRoot || isAdmin;
    const canManageStatus = isRoot || isAdmin;
    const showActions = canEdit || canManageStatus;

    useEffect(() => {
        if (partnerId) {
            dispatch(fetchPartnerAccounts({ partnerId, page: 1, search: searchQuery, status: statusFilter !== "all" ? statusFilter : undefined }));
        }
    }, [dispatch, partnerId, searchQuery, statusFilter]);

    const handlePageChange = (page) => {
        dispatch(fetchPartnerAccounts({ partnerId, page, search: searchQuery, status: statusFilter !== "all" ? statusFilter : undefined }));
    };

    const handleEditClick = (row) => {
        setSelectedRow(row);
        setIsEditModalOpen(true);
    };

    const handleToggleStatus = (row) => {
        const action = row.user?.status === 1 ? "deactivate" : "activate";
        setConfirmModal({
            isOpen: true,
            title: `${action === 'activate' ? 'Activate' : 'Deactivate'} Account`,
            message: `Are you sure you want to ${action} ${row.name}?`,
            type: action === 'activate' ? 'info' : 'danger',
            confirmText: action === 'activate' ? 'Activate' : 'Deactivate',
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, isLoading: true }));
                try {
                    await toast.promise(
                        dispatch(toggleAccountStatus(row.id)).unwrap(),
                        {
                            loading: `${action === 'activate' ? 'Activating' : 'Deactivating'} account...`,
                            success: `Account ${action === 'activate' ? 'activated' : 'deactivated'} successfully!`,
                            error: (err) => `Error: ${err}`
                        }
                    );
                    dispatch(fetchPartnerAccounts({ partnerId, page: pagination.current_page }));
                    closeConfirmModal();
                } catch (error) {
                    // Toast handles error
                } finally {
                    setConfirmModal(prev => ({ ...prev, isLoading: false }));
                }
            }
        });
    };

    const handleApprove = (row) => {
        setConfirmModal({
            isOpen: true,
            title: "Approve Account",
            message: `Are you sure you want to approve ${row.name}?`,
            type: "warning",
            confirmText: "Approve",
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, isLoading: true }));
                try {
                    await toast.promise(
                        dispatch(approveAccount(row.id)).unwrap(),
                        {
                            loading: 'Approving account...',
                            success: 'Account approved successfully!',
                            error: (err) => `Error: ${err}`
                        }
                    );
                    dispatch(fetchPartnerAccounts({ partnerId, page: pagination.current_page }));
                    closeConfirmModal();
                } catch (error) {
                    // Toast handles error
                } finally {
                    setConfirmModal(prev => ({ ...prev, isLoading: false }));
                }
            }
        });
    };

    const handleSaveAccount = async (id, formData) => {
        try {
            await toast.promise(
                dispatch(updateAccount({ id, data: formData })).unwrap(),
                {
                    loading: 'Updating account...',
                    success: 'Account updated successfully!',
                    error: (err) => `Error: ${err}`
                }
            );
            dispatch(fetchPartnerAccounts({ partnerId, page: pagination.current_page }));
        } catch (error) {
            throw error;
        }
    };

    const handleCreateAccount = async (formData) => {
        try {
            await toast.promise(
                dispatch(createAccount({ partnerId, data: formData })).unwrap(),
                {
                    loading: 'Creating account...',
                    success: 'Account created successfully!',
                    error: (err) => `Error: ${err}`
                }
            );
            dispatch(fetchPartnerAccounts({ partnerId, page: 1 }));
            setIsAddModalOpen(false); // Explicit close if success
        } catch (error) {
            throw error;
        }
    };

    // Selection Handlers
    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedIds(currentPartnerAccounts.map(a => a.id));
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
    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await toast.promise(
                dispatch(bulkDeleteAccounts({ partnerId, ids: selectedIds })).unwrap(),
                {
                    loading: 'Deleting accounts...',
                    success: 'Accounts deleted successfully',
                    error: (err) => `Error: ${err}`
                }
            );
            setSelectedIds([]);
            dispatch(fetchPartnerAccounts({ partnerId, page: pagination.current_page, search: searchQuery, status: statusFilter !== "all" ? statusFilter : undefined }));
            setIsDeleteModalOpen(false);
        } catch (error) {
            // Toast handles error
        }
    };

    // Bulk Status Update
    const handleBulkStatusUpdate = async (status) => {
        if (selectedIds.length === 0) return;
        try {
            await toast.promise(
                dispatch(bulkUpdateAccountStatus({ partnerId, ids: selectedIds, status })).unwrap(),
                {
                    loading: 'Updating status...',
                    success: 'Status updated successfully',
                    error: (err) => `Error: ${err}`
                }
            );
            setSelectedIds([]);
            dispatch(fetchPartnerAccounts({ partnerId, page: pagination.current_page, search: searchQuery, status: statusFilter !== "all" ? statusFilter : undefined }));
        } catch (error) {
            // Toast handles error
        }
    };

    // Link Logic
    const getPartnerAccountsLink = (row) => {
        // Root view: /companies/[pId]/accounts/[aId]/shops
        if (user.type === 0) {
            return `/companies/${partnerId}/accounts/${row.id}/shops`;
        }
        // Partner view: /accounts/[aId]/shops
        if (user.role === 'partner') {
            return `/accounts/${row.id}/shops`;
        }
        // Fallback
        return `/companies/${partnerId}/accounts/${row.id}/shops`;
    };

    const columns = [
        ...(canEdit ? [{ header: "ID", accessor: "id" }] : []),
        {
            header: "Name",
            accessor: "name",
            isLink: true,
            getLink: getPartnerAccountsLink
        },
        {
            header: "Email",
            accessor: "email"
        },
        { header: "Phone", accessor: "phone" },
        { header: "Representative", accessor: "account_representative" },
        { header: "Address Line 1", accessor: "address_1" },
        { header: "Address Line 2", accessor: "address_2" },
        {
            header: "Status",
            accessor: "user",
            render: (user) => {
                const status = user?.status;
                let label = 'Unknown';
                let color = 'bg-gray-100 text-gray-800';

                // Map status
                if (status === 1) { label = 'Active'; color = 'bg-green-100 text-green-800'; }
                else if (status === 0) { label = 'Inactive'; color = 'bg-red-100 text-red-800'; }
                else if (status === 2 || user?.is_approved === 0) { label = 'Pending'; color = 'bg-orange-100 text-orange-800'; }

                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
                        {label}
                    </span>
                );
            }
        },
        ...(showActions ? [{
            header: "Actions",
            accessor: "actions",
            render: (_, row) => (
                <div className="flex items-center space-x-2">


                    {canEdit && (
                        <>
                            {/* Approve Button (Only if unapproved/pending) */}
                            {(row.user?.is_approved === 0) && (
                                <button
                                    onClick={() => handleApprove(row)}
                                    className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                                >
                                    Approve
                                </button>
                            )}

                            <button
                                onClick={() => handleEditClick(row)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                title="Edit"
                            >
                                <PencilSquareIcon className="h-5 w-5" />
                            </button>
                        </>
                    )}

                    {canManageStatus && (
                        <button
                            onClick={() => handleToggleStatus(row)}
                            className={`px-3 py-1 text-xs rounded border ${row.user?.status === 1
                                ? 'border-red-500 text-red-600 hover:bg-red-50'
                                : 'border-green-500 text-green-600 hover:bg-green-50'
                                }`}
                        >
                            {row.user?.status === 1 ? 'Deactivate' : 'Activate'}
                        </button>
                    )}
                </div>
            )
        }] : [])
    ];

    return (
        <>
            <PageBreadCrumb pageTitle="Accounts" />
            <div className="space-y-6">

                {/* Toolbar */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search accounts..."
                                className="py-2 pl-9 pr-4 text-sm border border-gray-300 rounded-lg w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="py-2 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="all">All Status</option>
                            <option value="1">Active</option>
                            <option value="0">Inactive</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-3">
                        {selectedIds.length > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">{selectedIds.length} selected</span>
                                {/* Bulk Status: Root (0) & Admin (4) */}
                                {(user?.type === 0 || user?.type === 4) && (
                                    <>
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
                                    </>
                                )}
                                {/* Bulk Delete: Root (0) Only */}
                                {user?.type === 0 && (
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
                            onAdd={canEdit ? () => setIsAddModalOpen(true) : null}
                            onDownload={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/cms/download-csv/accounts/${partnerId}`, '_blank')}
                            addButtonText="Add Account"
                        />
                    </div>
                </div>

                <HierarchyTable
                    columns={columns}
                    data={currentPartnerAccounts}
                    pagination={pagination}
                    isLoading={isLoading}
                    onPageChange={handlePageChange}
                    onIdClick={handleEditClick}
                    selectable={!isPartner}
                    selectedIds={selectedIds}
                    onSelect={handleSelectRow}
                    onSelectAll={handleSelectAll}
                />

                <QuickEditModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    data={selectedRow}
                    onSave={handleSaveAccount}
                    title="Edit Account"
                    fields={{
                        name: { label: "Account Name", type: "text" },
                        email: { label: "Email", type: "email" },
                        phone: { label: "Phone", type: "text" },
                        account_representative: { label: "Representative", type: "text" },
                        address_1: { label: "Address Line 1", type: "text" },
                        address_2: { label: "Address Line 2", type: "text" }
                    }}
                />

                <AddAccountModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={handleCreateAccount}
                />

                <ConfirmationModal
                    isOpen={confirmModal.isOpen}
                    onClose={closeConfirmModal}
                    onConfirm={confirmModal.onConfirm}
                    title={confirmModal.title}
                    message={confirmModal.message}
                    type={confirmModal.type}
                    confirmText={confirmModal.confirmText}
                    isLoading={confirmModal.isLoading}
                />

                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    title="Delete Accounts"
                    message={`Are you sure you want to delete ${selectedIds.length} account(s)? This action cannot be undone.`}
                    confirmText="Delete"
                    confirmColor="bg-red-600 hover:bg-red-700"
                />
            </div>
        </>
    );
};

export default PartnerAccountsView;
