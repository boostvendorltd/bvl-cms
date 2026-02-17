"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "@/utils/api";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { Fragment } from "react";

import { usePathname } from "next/navigation";

const ShopSelector = () => {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const [shops, setShops] = useState([]);
    const [selectedShop, setSelectedShop] = useState(null);
    const [loading, setLoading] = useState(false);
    const pathname = usePathname();

    // Check if we are on a product feature page
    const isProductPage = pathname.startsWith('/products') ||
        pathname.startsWith('/categories') ||
        pathname.startsWith('/attributes');

    useEffect(() => {
        if (!isAuthenticated || !user) return;

        const loadShops = async () => {
            setLoading(true);
            try {
                let availableShops = [];

                if (user.role === 'account') {
                    if (user.account?.id) {
                        const response = await api.get(`/cms/accounts/${user.account.id}/shops`);
                        availableShops = response.data.data || [];
                    }
                } else if (user.role === 'shop') {
                    if (user.shop) {
                        availableShops = [user.shop];
                    }
                } else if (user.role === 'partner') {
                    // TODO: Implement partner shop selection
                } else if (user.role === 'root' || user.role === 'administrator') {
                    const response = await api.get(`/cms/all-shops`);
                    availableShops = response.data.data || [];
                }

                setShops(availableShops);
                const storedShopId = localStorage.getItem("current_shop_id");
                if (storedShopId) {
                    const found = availableShops.find(s => s.id == storedShopId);
                    if (found) {
                        setSelectedShop(found);
                    } else if (availableShops.length > 0) {
                        // Stored ID invalid, but we have shops. Default to first.
                        handleSelect(availableShops[0]);
                    }
                } else if (availableShops.length > 0) {
                    // No stored ID, default to first shop
                    handleSelect(availableShops[0]);
                }
            } catch (error) {
                console.error("Failed to fetch shops for selector", error);
            } finally {
                setLoading(false);
            }
        };

        loadShops();
    }, [user, isAuthenticated]);

    const handleSelect = (shop) => {
        const currentStoredId = localStorage.getItem("current_shop_id");
        if (currentStoredId && currentStoredId == shop.id) {
            setSelectedShop(shop);
            return;
        }

        setSelectedShop(shop);
        localStorage.setItem("current_shop_id", shop.id);
        window.location.reload();
    };

    if (!isProductPage) return null;

    if (!isAuthenticated || !user) return null;

    const allowedRoles = ['account', 'shop', 'root', 'administrator'];
    if (!allowedRoles.includes(user.role)) return null;

    if (loading) return <div className="text-sm text-gray-500 animate-pulse">Loading shops...</div>;

    if (shops.length === 0) return <div className="text-sm text-gray-400">No shops available</div>;

    if (shops.length === 1) {
        return (
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="text-xs text-gray-500 uppercase font-semibold">Shop:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[150px]">{shops[0].name}</span>
            </div>
        );
    }

    return (
        <div className="w-60 relative z-50">
            <Listbox value={selectedShop} onChange={handleSelect}>
                <div className="relative">
                    <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white dark:bg-gray-900 py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm border border-gray-200 dark:border-gray-700">
                        <span className={`block truncate ${!selectedShop ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                            {selectedShop ? selectedShop.name : "Select a Shop..."}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronUpDownIcon
                                className="h-5 w-5 text-gray-400"
                                aria-hidden="true"
                            />
                        </span>
                    </Listbox.Button>
                    <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                            {shops.map((shop, shopIdx) => (
                                <Listbox.Option
                                    key={shopIdx}
                                    className={({ active }) =>
                                        `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100' : 'text-gray-900 dark:text-gray-100'
                                        }`
                                    }
                                    value={shop}
                                >
                                    {({ selected }) => (
                                        <>
                                            <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                                {shop.name}
                                            </span>
                                            {selected ? (
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600 dark:text-indigo-400">
                                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                </span>
                                            ) : null}
                                        </>
                                    )}
                                </Listbox.Option>
                            ))}
                        </Listbox.Options>
                    </Transition>
                </div>
            </Listbox>
        </div>
    );
};

export default ShopSelector;
