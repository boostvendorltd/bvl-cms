"use client";
import React, { use } from 'react';
import ShopCustomersView from '@/components/views/hierarchy/ShopCustomersView';

const AccountShopCustomersPage = ({ params }) => {
    // URL: /shops/[shopId]/customers
    const { shopId } = use(params);

    return <ShopCustomersView shopId={shopId} />;
};

export default AccountShopCustomersPage;
