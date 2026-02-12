"use client";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import HierarchyTable from "@/components/tables/HierarchyTable";
import QuickEditModal from "@/components/ui/modal/QuickEditModal";
import React, { useEffect, useState } from "react";
import axios from "@/utils/api";
import { useRouter } from "next/navigation";

const PartnerAccountsPage = ({ params }) => {
    const { partnerId } = React.use(params);
    const [accounts, setAccounts] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedRow, setSelectedRow] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
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
        setIsModalOpen(true);
    };

    return (
        <>
            <PageBreadCrumb pageTitle="Partner Accounts" />
            <div className="space-y-6">
                <HierarchyTable
                    columns={columns}
                    data={accounts}
                    pagination={pagination}
                    onPageChange={fetchAccounts}
                    onIdClick={handleIdClick}
                />
            </div>

            <QuickEditModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                data={selectedRow}
            />
        </>
    );
};

export default PartnerAccountsPage;
