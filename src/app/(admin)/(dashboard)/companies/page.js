"use client";
import RouteGuard from "@/components/security/RouteGuard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import HierarchyTable from "@/components/tables/HierarchyTable";
import QuickEditModal from "@/components/ui/modal/QuickEditModal";
import AddPartnerModal from "@/components/ui/modal/AddPartnerModal";
import ConfirmationModal from "@/components/ui/modal/ConfirmationModal";
import TableActions from "@/components/tables/TableActions";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPartners, createPartner, updatePartner, togglePartnerStatus, fetchPartnersList, approvePartner } from "@/redux/features/hierarchy-slice";
import { useRouter } from "next/navigation";
import { PencilSquareIcon, MagnifyingGlassIcon, TrashIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { bulkDeletePartners, bulkUpdatePartnerStatus } from "@/redux/features/hierarchy-slice";

const CompaniesPage = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const { partners, partnersList, pagination, isLoading } = useSelector((state) => state.hierarchy);
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

    useEffect(() => {
        dispatch(fetchPartners({ page: 1, search: searchQuery, status: statusFilter !== "all" ? statusFilter : undefined }));
        dispatch(fetchPartnersList());
    }, [dispatch, searchQuery, statusFilter]);

    const handlePageChange = (page) => {
        dispatch(fetchPartners({ page, search: searchQuery, status: statusFilter !== "all" ? statusFilter : undefined }));
    };

    const handleEditClick = (row) => {
        setSelectedRow(row);
        setIsEditModalOpen(true);
    };

    const handleToggleStatus = (row) => {
        const action = row.user?.status === 1 ? "deactivate" : "activate";
        setConfirmModal({
            isOpen: true,
            title: `${action === 'activate' ? 'Activate' : 'Deactivate'} Partner`,
            message: `Are you sure you want to ${action} ${row.name}?`,
            type: action === 'activate' ? 'info' : 'danger',
            confirmText: action === 'activate' ? 'Activate' : 'Deactivate',
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, isLoading: true }));
                try {
                    await toast.promise(
                        dispatch(togglePartnerStatus(row.id)).unwrap(),
                        {
                            loading: `${action === 'activate' ? 'Activating' : 'Deactivating'} partner...`,
                            success: `Partner ${action === 'activate' ? 'activated' : 'deactivated'} successfully!`,
                            error: (err) => `Error: ${err}`
                        }
                    );
                    dispatch(fetchPartners({ page: pagination.current_page }));
                    closeConfirmModal();
                } catch (error) {
                    // Toast handles error display
                } finally {
                    setConfirmModal(prev => ({ ...prev, isLoading: false }));
                }
            }
        });
    };

    // Selection Handlers
    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedIds(partners.map(p => p.id));
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
                dispatch(bulkDeletePartners(selectedIds)).unwrap(),
                {
                    loading: 'Deleting partners...',
                    success: 'Partners deleted successfully',
                    error: (err) => `Error: ${err}`
                }
            );
            setSelectedIds([]);
            dispatch(fetchPartners({ page: pagination.current_page, search: searchQuery, status: statusFilter !== "all" ? statusFilter : undefined }));
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
                dispatch(bulkUpdatePartnerStatus({ ids: selectedIds, status })).unwrap(),
                {
                    loading: 'Updating status...',
                    success: 'Status updated successfully',
                    error: (err) => `Error: ${err}`
                }
            );
            setSelectedIds([]);
            dispatch(fetchPartners({ page: pagination.current_page, search: searchQuery, status: statusFilter !== "all" ? statusFilter : undefined }));
        } catch (error) {
            // Toast handles error
        }
    };

    const handleApprove = (row) => {
        setConfirmModal({
            isOpen: true,
            title: "Approve Partner",
            message: `Are you sure you want to approve ${row.name}?`,
            type: "warning",
            confirmText: "Approve",
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, isLoading: true }));
                try {
                    await toast.promise(
                        dispatch(approvePartner(row.id)).unwrap(),
                        {
                            loading: 'Approving partner...',
                            success: 'Partner approved successfully!',
                            error: (err) => `Error: ${formatError(err)}`
                        }
                    );
                    dispatch(fetchPartners({ page: pagination.current_page }));
                    closeConfirmModal();
                } catch (error) {
                    // Toast handles error
                } finally {
                    setConfirmModal(prev => ({ ...prev, isLoading: false }));
                }
            }
        });
    };

    const formatError = (err) => {
        if (typeof err === "string") return err;
        if (err?.errors) {
            const errors = Object.values(err.errors).flat();
            return errors.length > 0 ? errors.join(", ") : (err.message || "An error occurred");
        }
        return err?.message || "An error occurred";
    };

    const handleSavePartner = async (id, formData) => {
        try {
            await toast.promise(
                dispatch(updatePartner({ id, data: formData })).unwrap(),
                {
                    loading: 'Updating partner...',
                    success: 'Partner updated successfully!',
                    error: (err) => `Error: ${formatError(err)}`
                }
            );
            dispatch(fetchPartners({ page: pagination.current_page }));
        } catch (error) {
            throw error;
        }
    };

    const handleCreatePartner = async (formData) => {
        try {
            await toast.promise(
                dispatch(createPartner(formData)).unwrap(),
                {
                    loading: 'Creating partner...',
                    success: 'Partner created successfully!',
                    error: (err) => `Error: ${formatError(err)}`
                }
            );
            dispatch(fetchPartners({ page: 1 }));
            setIsAddModalOpen(false);
        } catch (error) {
            throw error;
        }
    };

    const columns = [
        { header: "ID", accessor: "id" },
        {
            header: "Name",
            accessor: "name",
            isLink: true,
            getLink: (row) => `/companies/${row.id}/accounts`,
        },
        {
            header: "Parent Partner",
            accessor: "parent",
            render: (parent) => parent?.name || 'None'
        },
        { header: "Email", accessor: "email" },
        { header: "Phone", accessor: "phone" },
        { header: "Address 1", accessor: "address_1" },
        { header: "Address 2", accessor: "address_2" },
        {
            header: "Commission",
            accessor: "commission_rate",
            render: (value, row) => `${value || 0}% (${row.commission_type || 'percentage'})`
        },
        { header: "Note", accessor: "note" },
        {
            header: "Status",
            accessor: "user",
            render: (user) => {
                const status = user?.status;
                let label = 'Unknown';
                let color = 'bg-gray-100 text-gray-800';

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
        {
            header: "Actions",
            accessor: "actions",
            render: (_, row) => (
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => handleEditClick(row)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                    >
                        <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => handleToggleStatus(row)}
                        className={`px-3 py-1 text-xs rounded border ${row.user?.status === 1
                            ? 'border-red-500 text-red-600 hover:bg-red-50'
                            : 'border-green-500 text-green-600 hover:bg-green-50'
                            }`}
                    >
                        {row.user?.status === 1 ? 'Deactivate' : 'Activate'}
                    </button>
                    {row.user?.is_approved === 0 && (
                        <button
                            onClick={() => handleApprove(row)}
                            className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                        >
                            Approve
                        </button>
                    )}
                </div>
            )
        }
    ];

    return (
        <>
            <PageBreadCrumb pageTitle="Partners" />
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
                                placeholder="Search partners..."
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
                            onAdd={() => setIsAddModalOpen(true)}
                            onDownload={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/cms/download-csv/partners`, '_blank')}
                            addButtonText="Add Partner"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-10">
                    <HierarchyTable
                        columns={columns}
                        data={partners}
                        pagination={pagination}
                        isLoading={isLoading}
                        onPageChange={handlePageChange}
                        onIdClick={handleEditClick}
                        selectable={true}
                        selectedIds={selectedIds}
                        onSelect={handleSelectRow}
                        onSelectAll={handleSelectAll}
                    />
                </div>
            </div>

            <QuickEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                data={{
                    ...selectedRow,
                    partner_name: selectedRow?.name,
                    name: selectedRow?.user?.name
                }}
                onSave={handleSavePartner}
                title="Edit Partner"
                fields={{
                    name: { label: "Name", type: "text" },
                    parent_partner_id: {
                        label: "Parent Partner",
                        type: "select",
                        options: {
                            "": "None",
                            ...partnersList.reduce((acc, p) => ({ ...acc, [p.id]: p.name }), {})
                        }
                    },
                    email: { label: "Email", type: "email" },
                    phone: { label: "Phone", type: "text" },
                    commission_rate: { label: "Commission Rate (%)", type: "number" },
                    commission_type: {
                        label: "Commission Type",
                        type: "select",
                        options: { percentage: "Percentage", fixed: "Fixed" }
                    },
                    address_1: { label: "Address Line 1", type: "text" },
                    address_2: { label: "Address Line 2", type: "text" },
                    note: { label: "Note", type: "textarea" }
                }}
            />

            <AddPartnerModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleCreatePartner}
                partners={partnersList}
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
                title="Delete Partners"
                message={`Are you sure you want to delete ${selectedIds.length} partner(s)? This action cannot be undone.`}
                confirmText="Delete"
                confirmColor="bg-red-600 hover:bg-red-700"
            />
        </>
    );
};

export default function CompaniesPageWithGuard() {
    return (
        <RouteGuard allowedRoles={['root']}>
            <CompaniesPage />
        </RouteGuard>
    );
}
