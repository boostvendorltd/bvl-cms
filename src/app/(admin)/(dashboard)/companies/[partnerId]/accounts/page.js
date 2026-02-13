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
    toggleAccountStatus
} from "@/redux/features/hierarchy-slice";
import { useRouter } from "next/navigation";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const PartnerAccountsPage = ({ params }) => {
    const { partnerId } = React.use(params);
    const dispatch = useDispatch();
    const router = useRouter();
    const { currentPartnerAccounts, pagination, isLoading } = useSelector((state) => state.hierarchy);

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
        dispatch(fetchPartnerAccounts({ partnerId, page: 1 }));
    }, [dispatch, partnerId]);

    const handlePageChange = (page) => {
        dispatch(fetchPartnerAccounts({ partnerId, page }));
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
            // setIsAddModalOpen(false); // Modal checks for error, if none (we awaited), it closes? 
            // Wait, AddAccountModal calls onSave. If checks try/catch.
            // If we don't throw, it closes.
            setIsAddModalOpen(false); // Explicit close if success
        } catch (error) {
            throw error;
        }
    };

    const columns = [
        { header: "ID", accessor: "id" },
        {
            header: "Account Name",
            accessor: "name",
            isLink: true,
            getLink: (row) => `/companies/${partnerId}/accounts/${row.id}/shops`,
            subtitleAccessor: "email"
        },
        { header: "Phone", accessor: "phone" },
        { header: "Representative", accessor: "account_representative" },
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
        {
            header: "Actions",
            accessor: "actions",
            render: (_, row) => (
                <div className="flex items-center space-x-2">
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
            <PageBreadCrumb pageTitle="Accounts" />
            <div className="space-y-6">
                <div className="flex justify-end">
                    <TableActions
                        onAdd={() => setIsAddModalOpen(true)}
                        onDownload={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/cms/download-csv/accounts/${partnerId}`, '_blank')}
                        addButtonText="Add Account"
                    />
                </div>
                <HierarchyTable
                    columns={columns}
                    data={currentPartnerAccounts}
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
                onSave={handleSaveAccount}
                title="Edit Account"
                fields={{
                    name: { label: "Account Name", type: "text" },
                    email: { label: "Email", type: "email" },
                    phone: { label: "Phone", type: "text" },
                    account_representative: { label: "Representative", type: "text" },
                    address_1: { label: "Address", type: "textarea" }
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
        </>
    );
};

export default PartnerAccountsPage;
