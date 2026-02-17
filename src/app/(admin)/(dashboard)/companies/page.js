"use client";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import HierarchyTable from "@/components/tables/HierarchyTable";
import QuickEditModal from "@/components/ui/modal/QuickEditModal";
import AddPartnerModal from "@/components/ui/modal/AddPartnerModal";
import ConfirmationModal from "@/components/ui/modal/ConfirmationModal";
import TableActions from "@/components/tables/TableActions";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPartners, createPartner, updatePartner, togglePartnerStatus } from "@/redux/features/hierarchy-slice";
import { useRouter } from "next/navigation";
import { PencilSquareIcon, MagnifyingGlassIcon, TrashIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { bulkDeletePartners, bulkUpdatePartnerStatus } from "@/redux/features/hierarchy-slice";

const CompaniesPage = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const { partners, pagination, isLoading } = useSelector((state) => state.hierarchy);
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

    const handleSavePartner = async (id, formData) => {
        try {
            await toast.promise(
                dispatch(updatePartner({ id, data: formData })).unwrap(),
                {
                    loading: 'Updating partner...',
                    success: 'Partner updated successfully!',
                    error: (err) => `Error: ${err}`
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
                    error: (err) => `Error: ${err}`
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
            header: "Partner Name",
            accessor: "name",
            isLink: true,
            getLink: (row) => `/companies/${row.id}/accounts`,
            subtitleAccessor: "email"
        },
        { header: "Phone", accessor: "phone" },
        {
            header: "Commission",
            accessor: "commission_rate",
            render: (value, row) => `${value || 0}% (${row.commission_type || 'N/A'})`
        },
        {
            header: "Status",
            accessor: "user",
            render: (user) => {
                const status = user?.status;
                const config = status === 1
                    ? { label: 'Active', color: 'bg-green-100 text-green-800' }
                    : { label: 'Inactive', color: 'bg-red-100 text-red-800' };

                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                        {config.label}
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
                data={selectedRow}
                onSave={handleSavePartner}
                title="Edit Partner"
                fields={{
                    name: { label: "Partner Name", type: "text" },
                    email: { label: "Email", type: "email" },
                    phone: { label: "Phone", type: "text" },
                    commission_rate: { label: "Commission Rate (%)", type: "number" },
                    commission_type: {
                        label: "Commission Type",
                        type: "select",
                        options: { percentage: "Percentage", fixed: "Fixed" }
                    },
                    address_1: { label: "Address", type: "textarea" }
                }}
            />

            <AddPartnerModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleCreatePartner}
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

export default CompaniesPage;
