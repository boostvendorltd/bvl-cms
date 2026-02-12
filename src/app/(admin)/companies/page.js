"use client";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import HierarchyTable from "@/components/tables/HierarchyTable";
import QuickEditModal from "@/components/ui/modal/QuickEditModal";
import React, { useEffect, useState } from "react";
import axios from "@/utils/api";
import { useRouter } from "next/navigation";

const CompaniesPage = () => {
    const [partners, setPartners] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedRow, setSelectedRow] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

    const fetchPartners = async (page = 1) => {
        try {
            setLoading(true);
            const response = await axios.get(`/cms/partners?page=${page}&limit=10`);
            setPartners(response.data.data);
            setPagination({
                current_page: response.data.current_page,
                last_page: response.data.last_page,
                total: response.data.total
            });
        } catch (error) {
            console.error("Error fetching partners:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPartners();
    }, []);

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
            accessor: "user", // Status is on User model usually, or Partner? Partner has no status in fillable. User has status.
            render: (user) => {
                const status = user?.status;
                const statusMap = {
                    0: { label: 'Inactive', color: 'bg-red-100 text-red-800' },
                    1: { label: 'Active', color: 'bg-green-100 text-green-800' },
                    2: { label: 'Pending', color: 'bg-orange-100 text-orange-800' },
                    3: { label: 'Archived', color: 'bg-gray-100 text-gray-800' },
                };
                const config = statusMap[status] || { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };

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
            <PageBreadCrumb pageTitle="Companies (Partners)" />
            <div className="space-y-6">
                <div className="flex flex-col gap-10">
                    <HierarchyTable
                        columns={columns}
                        data={partners}
                        pagination={pagination}
                        onPageChange={fetchPartners}
                        onIdClick={handleIdClick}
                    />
                </div>
            </div>

            <QuickEditModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                data={selectedRow}
            />
        </>
    );
};

export default CompaniesPage;
