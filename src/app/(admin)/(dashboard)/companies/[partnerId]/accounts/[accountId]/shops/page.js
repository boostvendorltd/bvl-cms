"use client";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import HierarchyTable from "@/components/tables/HierarchyTable";
import QuickEditModal from "@/components/ui/modal/QuickEditModal";
import AddShopModal from "@/components/ui/modal/AddShopModal";
import ConfirmationModal from "@/components/ui/modal/ConfirmationModal";
import TableActions from "@/components/tables/TableActions";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchAccountShops,
    createShop,
    updateShop,
    approveShop,
    toggleShopStatus,
    fetchShopTypes
} from "@/redux/features/hierarchy-slice";
import { useRouter } from "next/navigation";
import { PencilSquareIcon, MagnifyingGlassIcon, TrashIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { bulkDeleteShops, bulkUpdateShopStatus } from "@/redux/features/hierarchy-slice";

const AccountShopsPage = ({ params }) => {
    const { partnerId, accountId } = React.use(params);
    const dispatch = useDispatch();
    const router = useRouter();
    const { currentAccountShops, shopTypes, pagination, isLoading } = useSelector((state) => state.hierarchy);

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
        dispatch(fetchAccountShops({ accountId, page: 1, search: searchQuery, status: statusFilter !== "all" ? statusFilter : undefined }));
        dispatch(fetchShopTypes());
    }, [dispatch, accountId, searchQuery, statusFilter]);

    const handlePageChange = (page) => {
        dispatch(fetchAccountShops({ accountId, page, search: searchQuery, status: statusFilter !== "all" ? statusFilter : undefined }));
    };

    const handleEditClick = (row) => {
        // Prepare row data for QuickEditModal (flatten nested objects if needed)
        const preparedRow = {
            ...row,
            domain_url: row.domain?.url || '', // Extract URL from domain object
            type_id: row.type_id || row.shop_type?.id, // Ensure type_id exists
        };
        setSelectedRow(preparedRow);
        setIsEditModalOpen(true);
    };

    const handleToggleStatus = (row) => {
        const action = (row.status == 1 || row.status == '1') ? "deactivate" : "activate";
        setConfirmModal({
            isOpen: true,
            title: `${action === 'activate' ? 'Activate' : 'Deactivate'} Shop`,
            message: `Are you sure you want to ${action} ${row.name}?`,
            type: action === 'activate' ? 'info' : 'danger',
            confirmText: action === 'activate' ? 'Activate' : 'Deactivate',
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, isLoading: true }));
                try {
                    await toast.promise(
                        dispatch(toggleShopStatus(row.id)).unwrap(),
                        {
                            loading: `${action === 'activate' ? 'Activating' : 'Deactivating'} shop...`,
                            success: `Shop ${action === 'activate' ? 'activated' : 'deactivated'} successfully!`,
                            error: (err) => `Error: ${err}`
                        }
                    );
                    dispatch(fetchAccountShops({ accountId, page: pagination.current_page }));
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
            title: "Approve Shop",
            message: `Are you sure you want to approve and activate ${row.name}? This will enable the domain.`,
            type: "warning",
            confirmText: "Approve & Activate",
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, isLoading: true }));
                try {
                    await toast.promise(
                        dispatch(approveShop(row.id)).unwrap(),
                        {
                            loading: 'Approving shop...',
                            success: 'Shop approved and activated successfully!',
                            error: (err) => `Error: ${err}`
                        }
                    );
                    dispatch(fetchAccountShops({ accountId, page: pagination.current_page }));
                    closeConfirmModal();
                } catch (error) {
                    // Toast handles error
                } finally {
                    setConfirmModal(prev => ({ ...prev, isLoading: false }));
                }
            }
        });
    };

    const handleSaveShop = async (id, formData) => {
        try {
            // Inject email from selectedRow to satisfy backend requirement without exposing it in UI
            const dataToSubmit = {
                ...formData,
                email: selectedRow?.user?.email
            };

            await toast.promise(
                dispatch(updateShop({ id, data: dataToSubmit })).unwrap(),
                {
                    loading: 'Updating shop...',
                    success: 'Shop updated successfully!',
                    error: (err) => `Error: ${err}`
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
                    loading: 'Creating shop...',
                    success: 'Shop created successfully!',
                    error: (err) => `Error: ${err}`
                }
            );
            dispatch(fetchAccountShops({ accountId, page: 1 }));
            setIsAddModalOpen(false);
        } catch (error) {
            throw error;
        }
    };

    // Selection Handlers
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

    // Bulk Delete
    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await toast.promise(
                dispatch(bulkDeleteShops({ accountId, ids: selectedIds })).unwrap(),
                {
                    loading: 'Deleting shops...',
                    success: 'Shops deleted successfully',
                    error: (err) => `Error: ${err}`
                }
            );
            setSelectedIds([]);
            dispatch(fetchAccountShops({ accountId, page: pagination.current_page, search: searchQuery, status: statusFilter !== "all" ? statusFilter : undefined }));
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
                dispatch(bulkUpdateShopStatus({ accountId, ids: selectedIds, status })).unwrap(),
                {
                    loading: 'Updating status...',
                    success: 'Status updated successfully',
                    error: (err) => `Error: ${err}`
                }
            );
            setSelectedIds([]);
            dispatch(fetchAccountShops({ accountId, page: pagination.current_page, search: searchQuery, status: statusFilter !== "all" ? statusFilter : undefined }));
        } catch (error) {
            // Toast handles error
        }
    };

    const columns = [
        { header: "ID", accessor: "id" },
        {
            header: "Shop Name",
            accessor: "name",
            isLink: true,
            getLink: (row) => `/companies/${partnerId}/accounts/${accountId}/shops/${row.id}/customers`,
        },
        {
            header: "Domain",
            accessor: "domain",
            render: (domain) => domain ? domain.url : 'No Domain'
        },
        {
            header: "Email",
            accessor: "user",
            render: (user) => user ? user.email : 'No Email'
        },
        {
            header: "Type",
            accessor: "shop_type",
            render: (type) => type ? type.title : 'N/A'
        },
        {
            header: "Contract",
            accessor: "contract_status",
            render: (value) => {
                const map = {
                    0: 'Agreement',
                    1: 'Pending',
                    2: 'Preparing',
                    3: 'Cancellation'
                };
                return map[value] || 'Unknown';
            }
        },
        { header: "Contract Start Date", accessor: "contract_start_date" },
        { header: "Contract End Date", accessor: "contract_end_date" },
        {
            header: "Status",
            accessor: "status",
            render: (value) => {
                // Shop Status Map: 0=Inactive, 1=Active, 2=Pending, 3=Archived
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
            header: "Actions",
            accessor: "actions",
            render: (_, row) => (
                <div className="flex items-center space-x-2">
                    {/* Approve Button (Only if Pending status=2) */}
                    {(row.status === 2 || row.status === '2') && (
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

                    <button
                        onClick={() => handleToggleStatus(row)}
                        className={`px-3 py-1 text-xs rounded border ${row.status === 1 || row.status === '1'
                            ? 'border-red-500 text-red-600 hover:bg-red-50'
                            : 'border-green-500 text-green-600 hover:bg-green-50'
                            }`}
                    >
                        {row.status == 1 ? 'Deactivate' : 'Activate'}
                    </button>
                </div>
            )
        }
    ];

    return (
        <>
            <PageBreadCrumb pageTitle="Shops" />
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
                                placeholder="Search shops..."
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
                            onDownload={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/cms/download-csv/shops/${accountId}`, '_blank')}
                            addButtonText="Add Shop"
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
                    selectable={true}
                    selectedIds={selectedIds}
                    onSelect={handleSelectRow}
                    onSelectAll={handleSelectAll}
                />


                <QuickEditModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    data={selectedRow}
                    onSave={handleSaveShop}
                    title="Edit Shop"
                    fields={{
                        name: { label: "Shop Name", type: "text" },
                        // email removed to prevent UI editing and tampering
                        domain_url: { label: "Domain (URL)", type: "text" }, // Changed to text and domain_url
                        status: {
                            label: "Status",
                            type: 'select',
                            options: { 0: 'Inactive', 1: 'Active', 2: 'Pending', 3: 'Archived' }
                        },
                        contract_status: {
                            label: "Contract Status",
                            type: 'select',
                            options: { 0: 'Agreement', 1: 'Pending', 2: 'Preparing', 3: 'Cancellation' }
                        },
                        monthly_cost: { label: "Monthly Cost ($)", type: "number" },
                        initial_cost: { label: "Initial Cost ($)", type: "number" },
                        contract_start: { label: "Contract Start", type: "date" },
                        contract_end: { label: "Contract End", type: "date" },
                        register_date: { label: "Register Date", type: "date" },
                        type_id: {
                            label: "Shop Type",
                            type: "select",
                            options: shopTypes.reduce((acc, type) => ({ ...acc, [type.id]: type.title }), {})
                        }
                    }}
                />

                <AddShopModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={handleCreateShop}
                    shopTypes={shopTypes} // Pass fetched types to modal
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
                    title="Delete Shops"
                    message={`Are you sure you want to delete ${selectedIds.length} shop(s)? This action cannot be undone.`}
                    confirmText="Delete"
                    confirmColor="bg-red-600 hover:bg-red-700"
                />
            </div>
        </>
    );
};

export default AccountShopsPage;
