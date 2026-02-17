"use client";
import React, { use } from 'react';
import { useSelector } from 'react-redux';
import AccountShopsView from '@/components/views/hierarchy/AccountShopsView';

const PartnerShopsPage = ({ params }) => {
    // URL: /accounts/[accountId]/shops
    // Assuming user is Partner, so they see accounts/[id]/shops
    const { accountId } = use(params);
    const { user } = useSelector((state) => state.auth);

    return <AccountShopsView accountId={accountId} partnerId={user?.partner?.id} />;
};

export default PartnerShopsPage;
