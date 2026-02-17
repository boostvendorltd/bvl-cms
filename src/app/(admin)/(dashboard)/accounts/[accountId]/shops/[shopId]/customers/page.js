"use client";
import React, { use } from 'react';
import { useSelector } from 'react-redux';
import ShopCustomersView from '@/components/views/hierarchy/ShopCustomersView';

const PartnerShopCustomersPage = ({ params }) => {
    // URL: /accounts/[accountId]/shops/[shopId]/customers
    const { shopId } = use(params);

    return <ShopCustomersView shopId={shopId} />;
};

export default PartnerShopCustomersPage;
