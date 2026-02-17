"use client";
import React from 'react';
import RouteGuard from '@/components/security/RouteGuard';
import AccountShopsView from '@/components/views/hierarchy/AccountShopsView';

const AccountShopsPage = ({ params }) => {
    const { partnerId, accountId } = React.use(params);
    return (
        <RouteGuard allowedRoles={['root']}>
            <AccountShopsView accountId={accountId} partnerId={partnerId} />
        </RouteGuard>
    );
};

export default AccountShopsPage;
