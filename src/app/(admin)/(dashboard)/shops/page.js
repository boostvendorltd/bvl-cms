"use client";
import React from 'react';
import RouteGuard from '@/components/security/RouteGuard';
import { useSelector } from 'react-redux';
import AccountShopsView from '@/components/views/hierarchy/AccountShopsView';

const ShopsPage = () => {
    // If route is /shops, assume logged in user is account.
    const { user } = useSelector((state) => state.auth);
    // User role should be checked by route protection but if here, is likely account
    return <AccountShopsView accountId={user?.account?.id} />;
};

export default function ShopsPageWithGuard() {
    return (
        <RouteGuard allowedRoles={['account']}>
            <ShopsPage />
        </RouteGuard>
    );
}
