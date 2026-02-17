"use client";
import React from 'react';
import RouteGuard from '@/components/security/RouteGuard';
import { useSelector } from 'react-redux';
import ShopCustomersView from '@/components/views/hierarchy/ShopCustomersView';

const CustomersPage = () => {
    // URL: /customers
    // Assuming user is Shop, get shopId from user
    const { user } = useSelector((state) => state.auth);

    return <ShopCustomersView shopId={user?.shop?.id} />;
};

export default function CustomersPageWithGuard() {
    return (
        <RouteGuard allowedRoles={['shop']}>
            <CustomersPage />
        </RouteGuard>
    );
}
