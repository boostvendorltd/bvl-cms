"use client";
import PageBreadCrumb from "@/(template)/components/common/PageBreadCrumb";
import HierarchyTable from "@/components/tables/HierarchyTable";
import QuickEditModal from "@/(template)/components/ui/modal/QuickEditModal";
import AddAccountModal from "@/(template)/components/ui/modal/AddAccountModal";
import TableActions from "@/(template)/components/tables/TableActions";
import React, { useEffect, useState } from "react";
import axios from "@/(template)/utils/api";
import { useRouter } from "next/navigation";

const PartnerAccountsPage = ({ params }) => {
    const { partnerId } = React.use(params);
    const [accounts, setAccounts] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedRow, setSelectedRow] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const router = useRouter();

    const fetchAccounts = async (page = 1) => {
        try {
            setLoading(true);
            const response = await axios.get(`/cms/partners/${partnerId}/accounts?page=${page}&limit=10`);
            setAccounts(response.data.data);
            setPagination({
                current_page: response.data.current_page,
                last_page: response.data.last_page,
                total: response.data.total
            });
        } catch (error) {
            console.error("Error fetching accounts:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, [partnerId]);

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
        { header: "City/Address", accessor: "address_1" },
        {
            header: "Status",
            header: "Status",
            accessor: "user",
            render: (user) => {
                const value = user?.status;
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
            header: "Created At",
            accessor: "created_at",
            render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
        },
    ];

    const handleIdClick = (row) => {
        setSelectedRow(row);
        setIsEditModalOpen(true);
    };

    const handleAddAccount = () => {
        setIsAddModalOpen(true);
    };

    const handleSaveAccount = async (formData) => {
        await axios.post(`/cms/partners/${partnerId}/accounts`, formData);
        fetchAccounts(); // Refresh list
    };

    const handleDownloadCsv = () => {
        window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/cms/download-csv/accounts/${partnerId}`, '_blank');
    };

    return (
        <>
            <PageBreadCrumb pageTitle="Accounts" />
            <div className="space-y-6">
                <div className="flex justify-end">
                    <TableActions
                        onAdd={handleAddAccount}
                        onDownload={handleDownloadCsv}
                        addButtonText="Add Account"
                    />
                </div>
                <HierarchyTable
                    columns={columns}
                    data={accounts}
                    pagination={pagination}
                    onPageChange={fetchAccounts}
                    onIdClick={handleIdClick}
                />
            </div>

            <QuickEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                data={selectedRow}
                fields={{
                    name: { label: "Account Name" },
                    email: { label: "Email" },
                    phone: { label: "Phone" },
                    account_representative: { label: "Representative" },
                    address_1: { label: "Address" },
                    status: {
                        label: "Status",
                        type: 'select',
                        options: {
                            0: { label: 'Inactive' }, 1: { label: 'Active' }, 2: { label: 'Pending' }, 3: { label: 'Archived' }
                        }
                    },
                    user: { type: 'ignore' },
                    partner_id: { type: 'ignore' }, // Hide ID
                    created_at: { label: "Created At", type: 'datetime' }
                }}
            />

            <AddAccountModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleSaveAccount}
            />
        </>
    );
};

export default PartnerAccountsPage;
