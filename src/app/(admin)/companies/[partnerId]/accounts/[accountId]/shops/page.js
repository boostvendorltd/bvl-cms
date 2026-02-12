"use client";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import HierarchyTable from "@/components/tables/HierarchyTable";
import QuickEditModal from "@/components/ui/modal/QuickEditModal";
import AddShopModal from "@/components/ui/modal/AddShopModal";
import TableActions from "@/components/tables/TableActions";
import React, { useEffect, useState } from "react";
import axios from "@/utils/api";
import { useRouter } from "next/navigation";

const AccountShopsPage = ({ params }) => {
    const { partnerId, accountId } = React.use(params);
    const [shops, setShops] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedRow, setSelectedRow] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const router = useRouter();

    const fetchShops = async (page = 1) => {
        try {
            setLoading(true);
            const response = await axios.get(`/cms/accounts/${accountId}/shops?page=${page}&limit=10`);
            setShops(response.data.data);
            setPagination({
                current_page: response.data.current_page,
                last_page: response.data.last_page,
                total: response.data.total
            });
        } catch (error) {
            console.error("Error fetching shops:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShops();
    }, [accountId]);

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
            header: "Type",
            accessor: "shop_type",
            render: (type) => type ? type.title : 'N/A'
        },
        { header: "Contract", accessor: "contract_status" },
        {
            header: "Cost",
            accessor: "monthly_cost",
            render: (cost) => cost ? `$${cost}` : 'N/A'
        },
        {
            header: "Status",
            accessor: "status",
            render: (value) => {
                const statusMap = {
                    0: { label: 'Inactive', color: 'bg-red-100 text-red-800' },
                    1: { label: 'Active', color: 'bg-green-100 text-green-800' },
                    2: { label: 'Pending', color: 'bg-orange-100 text-orange-800' },
                    3: { label: 'Archived', color: 'bg-gray-100 text-gray-800' },
                };
                const config = statusMap[value] || { label: value || 'Unknown', color: 'bg-gray-100 text-gray-800' };

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

    const handleAddShop = () => {
        setIsAddModalOpen(true);
    };

    const handleSaveShop = async (formData) => {
        await axios.post(`/cms/accounts/${accountId}/shops`, formData);
        fetchShops(); // Refresh list
    };

    const handleDownloadCsv = () => {
        window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/cms/download-csv/shops/${accountId}`, '_blank');
    };

    return (
        <>
            <PageBreadCrumb pageTitle="Account Shops" />
            <div className="space-y-6">
                <div className="flex justify-end">
                    <TableActions
                        onAdd={handleAddShop}
                        onDownload={handleDownloadCsv}
                        addButtonText="Add Shop"
                    />
                </div>
                <HierarchyTable
                    columns={columns}
                    data={shops}
                    pagination={pagination}
                    onPageChange={fetchShops}
                    onIdClick={handleIdClick}
                />
            </div>

            <QuickEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                data={selectedRow}
            />

            <AddShopModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleSaveShop}
            />
        </>
    );
};

export default AccountShopsPage;
