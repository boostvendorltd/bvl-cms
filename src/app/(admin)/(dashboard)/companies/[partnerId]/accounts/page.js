"use client";
import React from 'react';
import RouteGuard from '@/components/security/RouteGuard';
import PartnerAccountsView from '@/components/views/hierarchy/PartnerAccountsView';

const PartnerAccountsPage = ({ params }) => {
    const { partnerId } = React.use(params);
    return (
        <RouteGuard allowedRoles={['root']}>
            <PartnerAccountsView partnerId={partnerId} />
        </RouteGuard>
    );
};

export default PartnerAccountsPage;
