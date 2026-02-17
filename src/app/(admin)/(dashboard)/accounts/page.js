"use client";
import React from 'react';
import RouteGuard from '@/components/security/RouteGuard';
import { useSelector } from 'react-redux';
import PartnerAccountsView from '@/components/views/hierarchy/PartnerAccountsView';

const AccountsPage = ({ params }) => {
    // If route is /accounts, assume logged in user is partner.
    const { user } = useSelector((state) => state.auth);
    // If somehow accesses without partner info, View will handle empty ID or loading state
    return <PartnerAccountsView partnerId={user?.partner?.id} />;
};

export default function AccountsPageWithGuard({ params }) {
    return (
        <RouteGuard allowedRoles={['partner']}>
            <AccountsPage params={params} />
        </RouteGuard>
    );
}
