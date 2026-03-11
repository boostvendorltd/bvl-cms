"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
    fetchPartners,
    fetchPartnersList,
    createPartner,
    updatePartner,
    togglePartnerStatus,
    approvePartner,
    deletePartner,
    bulkUpdatePartnerStatus,
    bulkDeletePartners
} from "@/redux/features/hierarchy-slice";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import HierarchyTable from "@/components/tables/HierarchyTable";
import TableActions from "@/components/tables/TableActions";
import QuickEditModal from "@/components/ui/modal/QuickEditModal";
import AddPartnerModal from "@/components/ui/modal/AddPartnerModal";
import ConfirmationModal from "@/components/ui/modal/ConfirmationModal";
import toast from "react-hot-toast";
import {
    MagnifyingGlassIcon,
    TrashIcon,
    PencilSquareIcon
} from "@heroicons/react/24/outline";

const CompaniesPage = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { partners, partnersList, pagination, isLoading } = useSelector((state) => state.hierarchy);
    const { user } = useSelector((state) => state.auth);

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedRow, setSelectedRow] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => { },
        isLoading: false,
        type: "danger",
        confirmText: t("CONFIRM")
    });

    const closeConfirmModal = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

    useEffect(() => {
        dispatch(fetchPartners({ page: 1, search: searchQuery, status: statusFilter !== "all" ? statusFilter : undefined }));
    }, [dispatch, searchQuery, statusFilter]);

    useEffect(() => {
        dispatch(fetchPartnersList());
    }, [dispatch]);

    const handlePageChange = (page) => {
        dispatch(fetchPartners({ page, search: searchQuery, status: statusFilter !== "all" ? statusFilter : undefined }));
    };

    const handleEditClick = (row) => {
        setSelectedRow(row);
        setIsEditModalOpen(true);
    };

    const handleToggleStatus = (row) => {
        const newStatus = row.user?.status === 1 ? 0 : 1;
        const action = newStatus === 1 ? t("ACTIVATE") : t("DEACTIVATE");

        setConfirmModal({
            isOpen: true,
            title: `${action} ${t("PARTNERS").slice(0, -1)}`,
            message: `${t("CONFIRM_ACTION_MSG", { action: action.toLowerCase(), name: row.name })}`,
            type: "warning",
            confirmText: action,
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, isLoading: true }));
                try {
                    await toast.promise(
                        dispatch(togglePartnerStatus({ id: row.id, status: newStatus })).unwrap(),
                        {
                            loading: t("UPDATING_STATUS"),
                            success: t("STATUS_UPDATED"),
                            error: (err) => `${t("ERROR")}: ${formatError(err)}`
                        }
                    );
                    dispatch(fetchPartners({ page: pagination.current_page }));
                    closeConfirmModal();
                } catch (error) {
                } finally {
                    setConfirmModal(prev => ({ ...prev, isLoading: false }));
                }
            }
        });
    };

    const handleSelectRow = (id, checked) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(rowId => rowId !== id));
        }
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedIds(partners.map(p => p.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleBulkStatusUpdate = async (status) => {
        try {
            await toast.promise(
                dispatch(bulkUpdatePartnerStatus({ ids: selectedIds, status })).unwrap(),
                {
                    loading: t("UPDATING_STATUS"),
                    success: t("STATUS_UPDATED"),
                    error: (err) => `${t("ERROR")}: ${formatError(err)}`
                }
            );
            setSelectedIds([]);
            dispatch(fetchPartners({ page: pagination.current_page }));
        } catch (error) {
        }
    };

    const handleBulkDelete = () => {
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await toast.promise(
                dispatch(bulkDeletePartners(selectedIds)).unwrap(),
                {
                    loading: t("DELETING"),
                    success: t("DELETED_SUCCESS"),
                    error: (err) => `${t("ERROR")}: ${formatError(err)}`
                }
            );
            setSelectedIds([]);
            dispatch(fetchPartners({ page: pagination.current_page, search: searchQuery, status: statusFilter !== "all" ? statusFilter : undefined }));
            setIsDeleteModalOpen(false);
        } catch (error) {
        }
    };

    const handleApprove = (row) => {
        setConfirmModal({
            isOpen: true,
            title: t("APPROVE_PARTNER"),
            message: t("CONFIRM_APPROVE_MSG", { name: row.name }),
            type: "warning",
            confirmText: t("APPROVE"),
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, isLoading: true }));
                try {
                    await toast.promise(
                        dispatch(approvePartner(row.id)).unwrap(),
                        {
                            loading: t("APPROVING"),
                            success: t("APPROVED_SUCCESS"),
                            error: (err) => `${t("ERROR")}: ${formatError(err)}`
                        }
                    );
                    dispatch(fetchPartners({ page: pagination.current_page }));
                    closeConfirmModal();
                } catch (error) {
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
            return errors.length > 0 ? errors.join(", ") : (err.message || t("AN_ERROR_OCCURRED"));
        }
        return err?.message || t("AN_ERROR_OCCURRED");
    };

    const handleSavePartner = async (id, formData) => {
        try {
            await toast.promise(
                dispatch(updatePartner({ id, data: formData })).unwrap(),
                {
                    loading: t("SAVING"),
                    success: t("SAVED_SUCCESS"),
                    error: (err) => `${t("ERROR")}: ${formatError(err)}`
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
                    loading: t("CREATING"),
                    success: t("CREATED_SUCCESS"),
                    error: (err) => `${t("ERROR")}: ${formatError(err)}`
                }
            );
            dispatch(fetchPartners({ page: 1 }));
            setIsAddModalOpen(false);
        } catch (error) {
            throw error;
        }
    };

    const columns = [
        { header: t("SL"), accessor: "id" },
        {
            header: t("NAME"),
            accessor: "name",
            isLink: true,
            getLink: (row) => `/companies/${row.id}/accounts`,
        },
        {
            header: t("PARENT_PARTNER"),
            accessor: "parent",
            render: (parent) => parent?.name || t("NONE")
        },
        { header: t("EMAIL"), accessor: "email" },
        { header: t("PHONE"), accessor: "phone" },
        { header: t("ADDRESS_1"), accessor: "address_1" },
        { header: t("ADDRESS_2"), accessor: "address_2" },
        {
            header: t("COMMISSION"),
            accessor: "commission_rate",
            render: (value, row) => `${value || 0}% (${t(row.commission_type || 'percentage').toUpperCase()})`
        },
        { header: t("NOTE"), accessor: "note" },
        {
            header: t("STATUS"),
            accessor: "user",
            render: (user) => {
                const status = user?.status;
                let label = t('UNKNOWN');
                let color = 'bg-gray-100 text-gray-800';
                if (status === 1) { label = t('ACTIVE'); color = 'bg-green-100 text-green-800'; }
                else if (status === 0) { label = t('INACTIVE'); color = 'bg-red-100 text-red-800'; }
                else if (status === 2 || user?.is_approved === 0) { label = t('PENDING'); color = 'bg-orange-100 text-orange-800'; }

                return (

                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${color}`}>
                        {label}
                    </span>
                );
            }
        },
        {
            header: t("ACTIONS"),
            accessor: "actions",
            render: (_, row) => (
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => handleEditClick(row)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title={t("EDIT")}
                    >
                        <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => handleToggleStatus(row)}
                        className={`px-3 py-1 text-sm rounded border ${row.user?.status === 1
                            ? 'border-red-500 text-red-600 hover:bg-red-50'
                            : 'border-green-500 text-green-600 hover:bg-green-50'
                            }`}
                    >
                        {row.user?.status === 1 ? t('DEACTIVATE') : t('ACTIVATE')}
                    </button>
                    {row.user?.is_approved === 0 && (
                        <button
                            onClick={() => handleApprove(row)}
                            className="bg-green-600 text-white px-2 py-1 rounded text-sm hover:bg-green-700"
                        >
                            {t("APPROVE")}
                        </button>
                    )}
                </div>
            )
        }
    ];


    return (
        <>
            <PageBreadCrumb pageTitle={t("PARTNERS")} />
            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t("SEARCH_PARTNERS")}
                                className="py-2 pl-9 pr-4 text-sm border border-gray-300 rounded-lg w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:text-white/90"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="py-2 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-gray-400"
                        >
                            <option value="all">{t("ALL_STATUS")}</option>
                            <option value="1">{t("ACTIVE")}</option>
                            <option value="0">{t("INACTIVE")}</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-3">
                        {selectedIds.length > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">{selectedIds.length} {t("SELECTED")}</span>
                                <button
                                    onClick={() => handleBulkStatusUpdate(1)}
                                    className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-md hover:bg-emerald-100"
                                >
                                    {t("ACTIVATE")}
                                </button>
                                <button
                                    onClick={() => handleBulkStatusUpdate(0)}
                                    className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                >
                                    {t("DEACTIVATE")}
                                </button>
                                <button
                                    onClick={handleBulkDelete}
                                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-500 bg-red-50 rounded-lg hover:bg-red-100"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                    {t("DELETE")}
                                </button>
                            </div>
                        )}
                        <TableActions
                            onAdd={() => setIsAddModalOpen(true)}
                            onDownload={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/cms/download-csv/partners`, '_blank')}
                            addButtonText={t("ADD_PARTNER")}
                        />
                    </div>
                </div>

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

            <QuickEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                data={{
                    ...selectedRow,
                    email: selectedRow?.user?.email,
                    phone: selectedRow?.user?.phone,
                    name: selectedRow?.user?.name
                }}
                onSave={handleSavePartner}
                title={t("EDIT_PARTNER")}
                fields={{
                    name: { label: t("NAME"), type: "text" },
                    parent_partner_id: {
                        label: t("PARENT_PARTNER"),
                        type: "select",
                        options: [
                            { value: "", label: t("NONE") },
                            ...partnersList.map(p => ({ value: p.id, label: p.name }))
                        ]
                    },
                    email: { label: t("EMAIL"), type: "email" },
                    phone: { label: t("PHONE"), type: "text" },
                    commission_rate: { label: t("COMMISSION_RATE"), type: "number" },
                    commission_type: {
                        label: t("COMMISSION_TYPE"),
                        type: "select",
                        options: { percentage: t("PERCENTAGE"), fixed: t("FIXED") }
                    },
                    address_1: { label: t("ADDRESS_1"), type: "text" },
                    address_2: { label: t("ADDRESS_2"), type: "text" },
                    note: { label: t("NOTE"), type: "textarea" }
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
                title={t("DELETE_PARTNERS")}
                message={t("CONFIRM_DELETE_MSG", { count: selectedIds.length })}
                confirmText={t("DELETE")}
                confirmColor="bg-red-600 hover:bg-red-700"
            />
        </>
    );
};

export default CompaniesPage;
