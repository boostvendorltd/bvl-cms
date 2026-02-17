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
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const AccountShopsPage = ({ params }) => {
    const { partnerId, accountId } = React.use(params);
    const dispatch = useDispatch();
    const router = useRouter();
    const { currentAccountShops, shopTypes, pagination, isLoading } = useSelector((state) => state.hierarchy);

    const [selectedRow, setSelectedRow] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
        dispatch(fetchAccountShops({ accountId, page: 1 }));
        dispatch(fetchShopTypes());
    }, [dispatch, accountId]);

    const handlePageChange = (page) => {
        dispatch(fetchAccountShops({ accountId, page }));
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
                <div className="flex justify-end">
                    <TableActions
                        onAdd={() => setIsAddModalOpen(true)}
                        onDownload={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/cms/download-csv/shops/${accountId}`, '_blank')}
                        addButtonText="Add Shop"
                    />
                </div>
                <HierarchyTable
                    columns={columns}
                    data={currentAccountShops}
                    pagination={pagination}
                    isLoading={isLoading}
                    onPageChange={handlePageChange}
                    onIdClick={handleEditClick}
                />
            </div>

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
        </>
    );
};

export default AccountShopsPage;
