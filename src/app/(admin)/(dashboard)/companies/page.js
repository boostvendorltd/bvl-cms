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
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const CompaniesPage = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const { partners, pagination, isLoading } = useSelector((state) => state.hierarchy);

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
        dispatch(fetchPartners({ page: 1 }));
    }, [dispatch]);

    const handlePageChange = (page) => {
        dispatch(fetchPartners({ page }));
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
                <div className="flex justify-end">
                    <TableActions
                        onAdd={() => setIsAddModalOpen(true)}
                        onDownload={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/cms/download-csv/partners`, '_blank')}
                        addButtonText="Add Partner"
                    />
                </div>
                <div className="flex flex-col gap-10">
                    <HierarchyTable
                        columns={columns}
                        data={partners}
                        pagination={pagination}
                        isLoading={isLoading}
                        onPageChange={handlePageChange}
                        onIdClick={handleEditClick}
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
        </>
    );
};

export default CompaniesPage;
