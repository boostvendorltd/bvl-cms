"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
    fetchShopCustomers,
    createCustomer,
    updateCustomer,
    toggleCustomerStatus,
    deleteCustomer,
    bulkUpdateCustomerStatus,
    bulkDeleteCustomers
} from "@/redux/features/hierarchy-slice";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import HierarchyTable from "@/components/tables/HierarchyTable";
import TableActions from "@/components/tables/TableActions";
import QuickEditModal from "@/components/ui/modal/QuickEditModal";
import AddCustomerModal from "@/components/ui/modal/AddCustomerModal";
import ConfirmationModal from "@/components/ui/modal/ConfirmationModal";
import toast from "react-hot-toast";
import {
    MagnifyingGlassIcon,
    TrashIcon,
    PencilSquareIcon,
    UserCircleIcon
} from "@heroicons/react/24/outline";

const ShopCustomersView = ({ shopId }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { currentShopCustomers, pagination, isLoading } = useSelector((state) => state.hierarchy);
    const { user } = useSelector((state) => state.auth);

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedRow, setSelectedRow] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const isPartner = user?.type === 2 || user?.role === 'partner';
    const isRoot = user?.type === 0 || user?.role === 'root';
    const isAdministrator = user?.type === 4 || user?.role === 'administrator';
    const isAccount = user?.type === 3 || user?.role === 'account';
    const isShop = user?.type === 5 || user?.role === 'shop';
    const isFullAdmin = isRoot || isAdministrator;

    const canEdit = isFullAdmin || isPartner;
    const canAdd = isFullAdmin;
    const canToggle = isFullAdmin || isAccount || isShop;

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
        if (shopId) {
            dispatch(fetchShopCustomers({ shopId, page: 1, search: searchQuery, status: statusFilter !== "all" ? statusFilter : undefined }));
        }
    }, [dispatch, shopId, searchQuery, statusFilter]);

    const handlePageChange = (page) => {
        dispatch(fetchShopCustomers({ shopId, page, search: searchQuery, status: statusFilter !== "all" ? statusFilter : undefined }));
    };

    const handleEditClick = (row) => {
        setSelectedRow(row);
        setIsEditModalOpen(true);
    };

    const handleToggleStatus = (row) => {
        const newStatus = row.status === 1 ? 0 : 1;
        const action = newStatus === 1 ? t("ACTIVATE") : t("DEACTIVATE");

        setConfirmModal({
            isOpen: true,
            title: `${action} ${t("CUSTOMERS").slice(0, -1)}`,
            message: t("CONFIRM_ACTION_MSG", { action: action.toLowerCase(), name: row.name || t("THIS_CUSTOMER") }),
            type: "warning",
            confirmText: action,
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, isLoading: true }));
                try {
                    await toast.promise(
                        dispatch(toggleCustomerStatus({ shopId, id: row.id, status: newStatus })).unwrap(),
                        {
                            loading: t("UPDATING_STATUS"),
                            success: t("STATUS_UPDATED"),
                            error: (err) => `${t("ERROR")}: ${err}`
                        }
                    );
                    dispatch(fetchShopCustomers({ shopId, page: pagination.current_page }));
                    closeConfirmModal();
                } catch (error) {
                } finally {
                    setConfirmModal(prev => ({ ...prev, isLoading: false }));
                }
            }
        });
    };

    const handleSaveCustomer = async (id, formData) => {
        try {
            await toast.promise(
                dispatch(updateCustomer({ shopId, id, data: formData })).unwrap(),
                {
                    loading: t("SAVING"),
                    success: t("SAVED_SUCCESS"),
                    error: (err) => `${t("ERROR")}: ${err}`
                }
            );
            dispatch(fetchShopCustomers({ shopId, page: pagination.current_page }));
        } catch (error) {
            throw error;
        }
    };

    const handleCreateCustomer = async (formData) => {
        try {
            await toast.promise(
                dispatch(createCustomer({ shopId, data: formData })).unwrap(),
                {
                    loading: t("CREATING"),
                    success: t("CREATED_SUCCESS"),
                    error: (err) => `${t("ERROR")}: ${err}`
                }
            );
            dispatch(fetchShopCustomers({ shopId, page: 1 }));
            setIsAddModalOpen(false);
        } catch (error) {
            throw error;
        }
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedIds(currentShopCustomers.map(c => c.id));
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

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await toast.promise(
                dispatch(bulkDeleteCustomers({ shopId, ids: selectedIds })).unwrap(),
                {
                    loading: t("DELETING"),
                    success: t("DELETED_SUCCESS"),
                    error: (err) => `${t("ERROR")}: ${err}`
                }
            );
            setSelectedIds([]);
            dispatch(fetchShopCustomers({ shopId, page: pagination.current_page, search: searchQuery, status: statusFilter !== "all" ? statusFilter : undefined }));
            setIsDeleteModalOpen(false);
        } catch (error) {
        }
    };

    const handleBulkStatusUpdate = async (status) => {
        if (selectedIds.length === 0) return;
        try {
            await toast.promise(
                dispatch(bulkUpdateCustomerStatus({ shopId, ids: selectedIds, status })).unwrap(),
                {
                    loading: t("UPDATING_STATUS"),
                    success: t("STATUS_UPDATED"),
                    error: (err) => `${t("ERROR")}: ${err}`
                }
            );
            setSelectedIds([]);
            dispatch(fetchShopCustomers({ shopId, page: pagination.current_page, search: searchQuery, status: statusFilter !== "all" ? statusFilter : undefined }));
        } catch (error) {
        }
    };

    const columns = [
        { header: t("ID"), accessor: "id" },
        {
            header: t("CUSTOMER_NAME"),
            accessor: "name",
            render: (name, row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border">
                        {row.avatar ? (
                            <img src={row.avatar} alt={name} className="w-full h-full object-cover" />
                        ) : (
                            <UserCircleIcon className="w-6 h-6 text-gray-400" />
                        )}
                    </div>
                    <span className="font-medium text-gray-700 dark:text-gray-200 text-sm">{name || t("UNNAMED")}</span>
                </div>
            )
        },
        {
            header: t("EMAIL"),
            accessor: "email",
            render: (val) => <span className="text-gray-600 dark:text-gray-400 text-sm">{val || '-'}</span>
        },
        {
            header: t("PHONE"),
            accessor: "phone",
            render: (val) => <span className="text-gray-600 dark:text-gray-400 text-sm">{val || '-'}</span>
        },
        {
            header: t("DATE_OF_BIRTH"),
            accessor: "dob",
            render: (dob) => <span className="text-gray-600 dark:text-gray-400 text-sm">{dob ? new Date(dob).toLocaleDateString() : '-'}</span>
        },
        {
            header: t("GENDER"),
            accessor: "gender",
            render: (gender) => (
                <span className="capitalize text-gray-600 dark:text-gray-400 text-sm">
                    {t(String(gender || "").toUpperCase()) || '-'}
                </span>
            )
        },
        {
            header: t("LAST_LOGIN"),
            accessor: "last_login_at",
            render: (date) => <span className="text-gray-600 dark:text-gray-400 text-sm">{date ? new Date(date).toLocaleString() : t("NEVER")}</span>
        },
        {
            header: t("STATUS"),
            accessor: "status",
            render: (status) => {
                const s = Number(status);
                let label = t('UNKNOWN');
                let color = 'bg-gray-100 text-gray-800';

                if (s === 1) { label = t('ACTIVE'); color = 'bg-green-100 text-green-800'; }
                else if (s === 0) { label = t('INACTIVE'); color = 'bg-red-100 text-red-800'; }
                else if (s === 2) { label = t('PENDING'); color = 'bg-orange-100 text-orange-800'; }
                else if (s === 3) { label = t('ARCHIVED'); color = 'bg-gray-200 text-gray-600'; }

                return (
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${color}`}>
                        {label}
                    </span>
                );
            }
        },
        {
            header: t("JOINED_AT"),
            accessor: "created_at",
            render: (date) => <span className="text-gray-600 dark:text-gray-400 text-sm">{date ? new Date(date).toLocaleDateString() : '-'}</span>
        },
        {
            header: t("ACTIONS"),
            accessor: "actions",
            render: (_, row) => (
                <div className="flex items-center space-x-2">
                    {canEdit && (
                        <button
                            onClick={() => handleEditClick(row)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title={t("EDIT")}
                        >
                            <PencilSquareIcon className="h-5 w-5" />
                        </button>
                    )}
                    {canToggle && (
                        <button
                            onClick={() => handleToggleStatus(row)}
                            className={`px-3 py-1 text-sm rounded border ${row.status === 1
                                ? 'border-red-500 text-red-600 hover:bg-red-50'
                                : 'border-green-500 text-green-600 hover:bg-green-50'
                                }`}
                        >
                            {row.status === 1 ? t("DEACTIVATE") : t("ACTIVATE")}
                        </button>
                    )}
                    {isRoot && (
                        <button
                            onClick={() => {
                                setSelectedIds([row.id]);
                                setIsDeleteModalOpen(true);
                            }}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                            title={t("DELETE")}
                        >
                            <TrashIcon className="h-5 w-5" />
                        </button>
                    )}
                </div>
            )
        }
    ];

    return (
        <>
            <PageBreadCrumb pageTitle={t("CUSTOMERS")} />
            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t("SEARCH_CUSTOMERS")}
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
                            <option value="2">{t("PENDING")}</option>
                            <option value="3">{t("ARCHIVED")}</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-3">
                        {selectedIds.length > 0 && canToggle && (
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
                                {user?.type === 0 && (
                                    <button
                                        onClick={handleBulkDelete}
                                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-500 bg-red-50 rounded-lg hover:bg-red-100"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                        {t("DELETE")}
                                    </button>
                                )}
                            </div>
                        )}
                        <TableActions
                            onAdd={canAdd ? () => setIsAddModalOpen(true) : null}
                            onDownload={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/cms/download-csv/customers/${shopId}`, '_blank')}
                            addButtonText={t("ADD_CUSTOMER")}
                        />
                    </div>
                </div>

                <HierarchyTable
                    columns={columns}
                    data={currentShopCustomers}
                    pagination={pagination}
                    isLoading={isLoading}
                    onPageChange={handlePageChange}
                    onIdClick={canEdit ? handleEditClick : null}
                    selectable={!isPartner}
                    selectedIds={selectedIds}
                    onSelect={handleSelectRow}
                    onSelectAll={handleSelectAll}
                />

                <QuickEditModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    data={selectedRow}
                    onSave={handleSaveCustomer}
                    title={t("EDIT_CUSTOMER")}
                    fields={{
                        name: { label: t("NAME"), type: "text" },
                        email: { label: t("EMAIL"), type: "email", disabled: !isFullAdmin },
                        phone: { label: t("PHONE"), type: "text" },
                        dob: { label: t("DATE_OF_BIRTH"), type: "date" },
                        gender: {
                            label: t("GENDER"),
                            type: "select",
                            options: { male: t("MALE"), female: t("FEMALE"), other: t("OTHER") }
                        },
                        address_1: { label: t("ADDRESS_1"), type: "text" },
                        address_2: { label: t("ADDRESS_2"), type: "text" }
                    }}
                />

                <AddCustomerModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={handleCreateCustomer}
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
                    title={t("DELETE_CUSTOMERS")}
                    message={t("CONFIRM_DELETE_MSG", { count: selectedIds.length })}
                    confirmText={t("DELETE")}
                    confirmColor="bg-red-600 hover:bg-red-700"
                />
            </div>
        </>
    );
};

export default ShopCustomersView;
