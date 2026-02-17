"use client";
import React from 'react';
import RouteGuard from '@/components/security/RouteGuard';
import ShopCustomersView from '@/components/views/hierarchy/ShopCustomersView';

const ShopCustomersPage = ({ params }) => {
    const { shopId } = React.use(params);
    return (
        <RouteGuard allowedRoles={['root']}>
            <ShopCustomersView shopId={shopId} />
        </RouteGuard>
    );
};

export default ShopCustomersPage;
