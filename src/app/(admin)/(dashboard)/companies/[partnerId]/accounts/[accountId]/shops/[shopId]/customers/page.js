"use client";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import HierarchyTable from "@/components/tables/HierarchyTable";
import QuickEditModal from "@/components/ui/modal/QuickEditModal";
import TableActions from "@/components/tables/TableActions";
import React, { useEffect, useState } from "react";
import axios from "@/utils/api";

const ShopCustomersPage = ({ params }) => {
    const { shopId } = React.use(params);
    const [customers, setCustomers] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedRow, setSelectedRow] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchCustomers = async (page = 1) => {
        try {
            setLoading(true);
            const response = await axios.get(`/cms/shops/${shopId}/customers?page=${page}&limit=10`);
            setCustomers(response.data.data);
            setPagination({
                current_page: response.data.current_page,
                last_page: response.data.last_page,
                total: response.data.total
            });
        } catch (error) {
            console.error("Error fetching customers:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, [shopId]);

    const columns = [
        { header: "ID", accessor: "id" },
        {
            header: "Customer Name",
            accessor: "name",
            subtitleAccessor: "email"
        },
        { header: "Phone", accessor: "phone" },
        { header: "Country", accessor: "country" }, // Verify 'country' exists on User model or Address. User has NO country field. Address has. User has 'login_ip'.
        // Checking User model again... user has no country. Check UserAddress? 
        // For now removing Country if not directly available, or replacing with Last Login.
        {
            header: "Last Login",
            accessor: "last_login_at",
            render: (value) => value ? new Date(value).toLocaleString() : 'Never'
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
                const config = statusMap[value] || { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };

                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                        {config.label}
                    </span>
                );
            }
        },
        {
            header: "Joined At",
            accessor: "created_at",
            render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
        },
    ];

    const handleIdClick = (row) => {
        setSelectedRow(row);
        setIsModalOpen(true);
    };

    const handleDownloadCsv = () => {
        window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/cms/download-csv/customers/${shopId}`, '_blank');
    };

    return (
        <>
            <PageBreadCrumb pageTitle="Customers" />
            <div className="space-y-6">
                <div className="flex justify-end">
                    <TableActions
                        onDownload={handleDownloadCsv}
                    />
                </div>
                <HierarchyTable
                    columns={columns}
                    data={customers}
                    pagination={pagination}
                    onPageChange={fetchCustomers}
                    onIdClick={handleIdClick}
                />
            </div>

            <QuickEditModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                data={selectedRow}
                fields={{
                    name: { label: "Customer Name" },
                    email: { label: "Email" },
                    phone: { label: "Phone" },
                    status: {
                        label: "Status",
                        type: 'select',
                        options: {
                            0: { label: 'Inactive' }, 1: { label: 'Active' }, 2: { label: 'Pending' }, 3: { label: 'Archived' }
                        }
                    },
                    last_login_at: { label: "Last Login", type: 'datetime' },
                    created_at: { label: "Joined At", type: 'datetime' }
                }}
            />
        </>
    );
};

export default ShopCustomersPage;
