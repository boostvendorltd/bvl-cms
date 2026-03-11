"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
    fetchAccountShops,
    fetchShopTypes,
    createShop,
    updateShop,
    toggleShopStatus,
    approveShop,
    deleteShop,
    bulkUpdateShopStatus,
    bulkDeleteShops
} from "@/redux/features/hierarchy-slice";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import HierarchyTable from "@/components/tables/HierarchyTable";
import TableActions from "@/components/tables/TableActions";
import QuickEditModal from "@/components/ui/modal/QuickEditModal";
import AddShopModal from "@/components/ui/modal/AddShopModal";
import ConfirmationModal from "@/components/ui/modal/ConfirmationModal";
import toast from "react-hot-toast";
import {
    MagnifyingGlassIcon,
    TrashIcon,
    PencilSquareIcon,
    PhotoIcon,
    GlobeAltIcon
} from "@heroicons/react/24/outline";

const AccountShopsView = ({ accountId }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { currentAccountShops, shopTypes, pagination, isLoading } = useSelector((state) => state.hierarchy);
    const { user } = useSelector((state) => state.auth);

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedRow, setSelectedRow] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const isPartner = user?.type === 2 || user?.role === 'partner';
    const isRoot = user?.type === 0;
    const canEdit = isRoot || isPartner;

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
        if (accountId) {
            dispatch(fetchAccountShops({ accountId, page: 1, search: searchQuery, status: statusFilter !== "all" ? statusFilter : undefined }));
        }
        dispatch(fetchShopTypes());
    }, [dispatch, accountId, searchQuery, statusFilter]);

    const handlePageChange = (page) => {
        dispatch(fetchAccountShops({ accountId, page, search: searchQuery, status: statusFilter !== "all" ? statusFilter : undefined }));
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
            title: `${action} ${t("SHOPS").slice(0, -1)}`,
            message: t("CONFIRM_ACTION_MSG", { action: action.toLowerCase(), name: row.name }),
            type: "warning",
            confirmText: action,
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, isLoading: true }));
                try {
                    await toast.promise(
                        dispatch(toggleShopStatus({ id: row.id, status: newStatus })).unwrap(),
                        {
                            loading: t("UPDATING_STATUS"),
                            success: t("STATUS_UPDATED"),
                            error: (err) => `${t("ERROR")}: ${err}`
                        }
                    );
                    dispatch(fetchAccountShops({ accountId, page: pagination.current_page }));
                    closeConfirmModal();
                } catch (error) {
                } finally {
                    setConfirmModal(prev => ({ ...prev, isLoading: false }));
                }
            }
        });
    };

    const handleApprove = (row) => {
        setConfirmModal({
            isOpen: true,
            title: t("APPROVE_SHOP"),
            message: t("CONFIRM_APPROVE_MSG", { name: row.name }),
            type: "warning",
            confirmText: t("APPROVE"),
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, isLoading: true }));
                try {
                    await toast.promise(
                        dispatch(approveShop(row.id)).unwrap(),
                        {
                            loading: t("APPROVING"),
                            success: t("APPROVED_SUCCESS"),
                            error: (err) => `${t("ERROR")}: ${err}`
                        }
                    );
                    dispatch(fetchAccountShops({ accountId, page: pagination.current_page }));
                    closeConfirmModal();
                } catch (error) {
                } finally {
                    setConfirmModal(prev => ({ ...prev, isLoading: false }));
                }
            }
        });
    };

    const handleSaveShop = async (id, formData) => {
        try {
            const dataToSubmit = new FormData();
            Object.keys(formData).forEach(key => {
                const value = formData[key];
                if (value !== null && value !== undefined && value !== '') {
                    if (typeof value === 'boolean') {
                        dataToSubmit.append(key, value ? '1' : '0');
                    } else if (key === 'contract_file' && value instanceof File) {
                        dataToSubmit.append(key, value);
                    } else if (key !== 'contract_file') {
                        dataToSubmit.append(key, value);
                    }
                }
            });
            dataToSubmit.append('_method', 'PUT');

            await toast.promise(
                dispatch(updateShop({ id, data: dataToSubmit })).unwrap(),
                {
                    loading: t("SAVING"),
                    success: t("SAVED_SUCCESS"),
                    error: (err) => `${t("ERROR")}: ${err}`
                }
            );
            dispatch(fetchAccountShops({ accountId, page: pagination.current_page }));
        } catch (error) {
            throw error;
        }
    };

    const handleCreateShop = async (formData) => {
        try {
            await toast.promise(
                dispatch(createShop({ accountId, data: formData })).unwrap(),
                {
                    loading: t("CREATING"),
                    success: t("CREATED_SUCCESS"),
                    error: (err) => `${t("ERROR")}: ${err}`
                }
            );
            dispatch(fetchAccountShops({ accountId, page: 1 }));
            setIsAddModalOpen(false);
        } catch (error) {
            throw error;
        }
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedIds(currentAccountShops.map(s => s.id));
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
                dispatch(bulkDeleteShops({ accountId, ids: selectedIds })).unwrap(),
                {
                    loading: t("DELETING"),
                    success: t("DELETED_SUCCESS"),
                    error: (err) => `${t("ERROR")}: ${err}`
                }
            );
            setSelectedIds([]);
            dispatch(fetchAccountShops({ accountId, page: pagination.current_page, search: searchQuery, status: statusFilter !== "all" ? statusFilter : undefined }));
            setIsDeleteModalOpen(false);
        } catch (error) {
        }
    };

    const handleBulkStatusUpdate = async (status) => {
        if (selectedIds.length === 0) return;
        try {
            await toast.promise(
                dispatch(bulkUpdateShopStatus({ accountId, ids: selectedIds, status })).unwrap(),
                {
                    loading: t("UPDATING_STATUS"),
                    success: t("STATUS_UPDATED"),
                    error: (err) => `${t("ERROR")}: ${err}`
                }
            );
            setSelectedIds([]);
            dispatch(fetchAccountShops({ accountId, page: pagination.current_page, search: searchQuery, status: statusFilter !== "all" ? statusFilter : undefined }));
        } catch (error) {
        }
    };

    const getShopLink = (row) => {
        if (user.type === 0) {
            // Root
            const pId = row.account?.partner?.id;
            const aId = row.account_id;
            return `/companies/${pId}/accounts/${aId}/shops/${row.id}/customers`;
        }
        if (user.role === 'partner') {
            const aId = row.account_id;
            return `/accounts/${aId}/shops/${row.id}/customers`;
        }
        if (user.role === 'account_representative') {
            return `/shops/${row.id}/customers`;
        }
        return `/shops/${row.id}/customers`;
    };

    const columns = [
        { header: t("ID"), accessor: "id" },
        {
            header: t("LOGO"),
            accessor: "logo",
            render: (logo) => logo ? (
                <div className="relative group">
                    <img src={logo} alt="Logo" className="w-8 h-8 rounded object-contain border bg-gray-50" />
                    <div className="hidden group-hover:block absolute z-10 top-0 left-10 p-2 bg-white border shadow-xl rounded-lg">
                        <img src={logo} alt="Preview" className="w-32 h-32 object-contain" />
                    </div>
                </div>
            ) : <PhotoIcon className="w-8 h-8 text-gray-300" />
        },
        {
            header: t("BANNER"),
            accessor: "banner",
            render: (banner) => banner ? (
                <div className="relative group">
                    <img src={banner} alt="Banner" className="w-12 h-6 rounded object-cover border bg-gray-50" />
                    <div className="hidden group-hover:block absolute z-10 top-0 left-14 p-2 bg-white border shadow-xl rounded-lg">
                        <img src={banner} alt="Preview" className="w-48 h-24 object-cover" />
                    </div>
                </div>
            ) : <div className="w-12 h-6 bg-gray-50 border rounded flex items-center justify-center"><PhotoIcon className="w-4 h-4 text-gray-200" /></div>
        },
        {
            header: t("SHOP_NAME"),
            accessor: "name",
            isLink: true,
            getLink: getShopLink,
        },
        {
            header: t("REPRESENTATIVE"),
            accessor: "shop_representative",
            render: (val) => <span className="text-gray-600 dark:text-gray-400 text-sm">{val || "-"}</span>
        },
        {
            header: t("DOMAIN"),
            accessor: "domain",
            render: (domain) => domain ? (
                <a 
                    href={domain.url?.startsWith('http') ? domain.url : `https://${domain.url}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline transition-colors text-sm"
                >
                    <GlobeAltIcon className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[120px]">
                        {typeof domain === 'object' ? (domain.unique_domain || domain.url) : domain}
                    </span>
                </a>
            ) : <span className="text-gray-400 text-sm italic">{t("NO_DOMAIN")}</span>
        },
        {
            header: t("EMAIL"),
            accessor: "email",
            render: (email) => email ? (
                <span className="text-gray-600 dark:text-gray-400 text-sm truncate max-w-[140px] block">{email}</span>
            ) : <span className="text-gray-400 text-sm">{t("NO_EMAIL")}</span>
        },
        {
            header: t("PHONE"),
            accessor: "phone",
            render: (val) => <span className="text-gray-600 dark:text-gray-400 text-sm">{val || "-"}</span>
        },
        {
            header: t("TYPE"),
            accessor: "type",
            render: (type, row) => {
                const shopType = row.shopType || row.shop_type;
                const typeName = shopType?.title || type || "UNKNOWN";
                const isEcommerce = String(typeName).toLowerCase().includes('ecommerce');
                
                // Convert "E-commerce" to "ECOMMERCE", "Pharmacy" to "PHARMACY"
                const translationKey = String(typeName)
                    .replace(/[-]/g, '') // Remove dashes (E-commerce -> Ecommerce)
                    .replace(/[\s]/g, '_') // Replace spaces with underscore
                    .toUpperCase();
                
                return (
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${isEcommerce ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                        {t(translationKey)}
                    </span>
                );
            }
        },
        {
            header: t("CONTRACT_START"),
            accessor: "contract_start",
            render: (date) => <span className="text-sm text-gray-600 dark:text-gray-400">{date ? date.split('T')[0] : '-'}</span>
        },
        {
            header: t("CONTRACT_END"),
            accessor: "contract_end",
            render: (date) => <span className="text-sm text-gray-600 dark:text-gray-400">{date ? date.split('T')[0] : '-'}</span>
        },
        {
            header: t("REGISTER_DATE"),
            accessor: "created_at",
            render: (date) => <span className="text-gray-600 dark:text-gray-400 text-sm">{date ? date.split('T')[0] : '-'}</span>
        },
        {
            header: t("STATUS"),
            accessor: "status",
            render: (status, row) => {
                let label = t('UNKNOWN');
                let color = 'bg-gray-100 text-gray-800';

                if (row.is_approved === 0 || status === 2) { label = t('PENDING'); color = 'bg-orange-100 text-orange-800'; }
                else if (status === 1) { label = t('ACTIVE'); color = 'bg-green-100 text-green-800'; }
                else if (status === 0) { label = t('INACTIVE'); color = 'bg-red-100 text-red-800'; }
                else if (status === 3) { label = t('ARCHIVED'); color = 'bg-gray-200 text-gray-600'; }

                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
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
                        className={`px-3 py-1 text-xs rounded border ${row.status === 1
                            ? 'border-red-500 text-red-600 hover:bg-red-50'
                            : 'border-green-500 text-green-600 hover:bg-green-50'
                            }`}
                    >
                        {row.status === 1 ? t("DEACTIVATE") : t("ACTIVATE")}
                    </button>
                    {row.is_approved === 0 && (
                        <button
                            onClick={() => handleApprove(row)}
                            className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                        >
                            {t("APPROVE")}
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
            <PageBreadCrumb pageTitle={t("SHOPS")} />
            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t("SEARCH_SHOPS")}
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
                        {!isPartner && selectedIds.length > 0 && (
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
                            onAdd={canEdit ? () => setIsAddModalOpen(true) : null}
                            onDownload={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/cms/download-csv/shops/${accountId}`, '_blank')}
                            addButtonText={t("ADD_SHOP")}
                        />
                    </div>
                </div>

                <HierarchyTable
                    columns={columns}
                    data={currentAccountShops}
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
                    onSave={handleSaveShop}
                    title={t("EDIT_SHOP")}
                    fields={{
                        name: { label: t("NAME"), type: "text" },
                        domain_url: { label: t("DOMAIN"), type: "text", dataKey: "domain.url", disabled: !isRoot },
                        unique_domain: { label: "Unique Domain ID", type: "text", dataKey: "domain.unique_domain", disabled: !isRoot },
                        type_id: {
                            label: t("TYPE"),
                            type: "select",
                            dataKey: "type",
                            options: shopTypes.map(type => ({ value: type.id, label: type.title }))
                        },
                        register_date: { label: t("REGISTER_DATE"), type: "date", dataKey: "domain.register_date" },

                        contract_section: { label: t("CONTRACT_DETAILS"), type: "section" },
                        contract_status: {
                            label: t("CONTRACT_STATUS"),
                            type: "select",
                            options: {
                                1: t("PENDING"),
                                0: t("AGREEMENT"),
                                2: t("PREPARING"),
                                3: t("CANCELLATION")
                            }
                        },
                        contract_update_interval: { label: t("UPDATE_INTERVAL"), type: "number" },
                        contract_start: { label: t("CONTRACT_START"), type: "date" },
                        contract_end: { label: t("CONTRACT_END"), type: "date" },
                        contract_file: { label: t("CONTRACT_FILE"), type: "file", accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png" },

                        financial_section: { label: t("FINANCIALS"), type: "section" },
                        initial_cost: { label: t("INITIAL_COST"), type: "number" },
                        monthly_cost: { label: t("MONTHLY_COST"), type: "number" },
                        initial_transfer_amount: { label: t("INITIAL_TRANSFER"), type: "number" },
                        monthly_transfer_amount: { label: t("MONTHLY_TRANSFER"), type: "number" },
                        commission_rate: { label: t("COMMISSION_RATE"), type: "number" },
                        payment_method: {
                            label: t("PAYMENT_METHOD"),
                            type: "select",
                            options: { 0: t("BANK_TRANSFER"), 1: t("CASH"), 2: "Online Payment" }
                        },

                        contact_section: { label: t("CONTACT_LOCATION"), type: "section" },
                        phone: { label: t("PHONE"), type: "text" },
                        shop_representative: { label: t("REPRESENTATIVE"), type: "text" },
                        address_1: { label: t("ADDRESS_1"), type: "text" },
                        address_2: { label: t("ADDRESS_2"), type: "text" },
                        social_spacing: { type: "br" },
                        is_whatsapp: { label: "WhatsApp", type: "checkbox" },
                        is_telegram: { label: "Telegram", type: "checkbox" },
                    }}
                />

                <AddShopModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={handleCreateShop}
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
                    title={t("DELETE_SHOPS")}
                    message={t("CONFIRM_DELETE_MSG", { count: selectedIds.length })}
                    confirmText={t("DELETE")}
                    confirmColor="bg-red-600 hover:bg-red-700"
                />
            </div>
        </>
    );
};

export default AccountShopsView;
