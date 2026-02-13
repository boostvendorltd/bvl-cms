"use client";
import PageBreadCrumb from "@/(template)/components/common/PageBreadCrumb";
import HierarchyTable from "@/components/tables/HierarchyTable";
import QuickEditModal from "@/(template)/components/ui/modal/QuickEditModal";
import AddPartnerModal from "@/(template)/components/ui/modal/AddPartnerModal";
import TableActions from "@/(template)/components/tables/TableActions";
import React, { useEffect, useState } from "react";
import axios from "@/(template)/utils/api";
import { useRouter } from "next/navigation";

const CompaniesPage = () => {
    const [partners, setPartners] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedRow, setSelectedRow] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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
        setIsEditModalOpen(true);
    };

    const handleAddPartner = () => {
        setIsAddModalOpen(true);
    };

    const handleSavePartner = async (formData) => {
        await axios.post("/cms/partners", formData);
        fetchPartners(); // Refresh list
    };

    const handleDownloadCsv = () => {
        window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/cms/download-csv/partners`, '_blank');
    };

    return (
        <>
            <PageBreadCrumb pageTitle="Partners" />
            <div className="space-y-6">
                <div className="flex justify-end">
                    <TableActions
                        onAdd={handleAddPartner}
                        onDownload={handleDownloadCsv}
                        addButtonText="Add Partner"
                    />
                </div>
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
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                data={selectedRow}
                fields={{
                    name: { label: "Partner Name" },
                    email: { label: "Email" },
                    phone: { label: "Phone" },
                    commission_rate: { label: "Commission Rate", formatter: (val) => (val || 0) + '%' },
                    commission_type: { label: "Commission Type", type: 'select', options: { 'percentage': 'Percentage', 'fixed': 'Fixed Amount' } }, // Hardcoding map for now or import
                    status: {
                        label: "Status",
                        type: 'select',
                        options: {
                            0: { label: 'Inactive' }, 1: { label: 'Active' }, 2: { label: 'Pending' }, 3: { label: 'Archived' }
                        }
                    },
                    user: { type: 'ignore' }, // Don't show nested user obj
                    created_at: { label: "Created At", type: 'datetime' },
                    address_1: { label: "Address" }
                }}
            />

            <AddPartnerModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleSavePartner}
            />
        </>
    );
};

export default CompaniesPage;
