"use client";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";

/**
 * Guard component for Product-related pages.
 * Only allows Root, Administrator, or Account/Shop users with at least one shop.
 */
const ProductGuard = ({ children }) => {
    const { user, isLoading } = useSelector((state) => state.auth);
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && user) {
            const userType = Number(user.type);

            // Root (0) and Administrator (4) should also be redirected as per revised requirement
            if ([0, 4].includes(userType)) {
                router.replace("/companies"); // Or another appropriate dashboard
                return;
            }

            // Partner (2) and Customer (1) should never see products
            if ([1, 2].includes(userType)) {
                router.replace("/");
                return;
            }

            // Account (3): Must have at least one shop
            if (userType === 3) {
                if (!user.account?.shops?.length) {
                    router.replace("/shops"); // Redirect to shops page to create a shop
                }
                return;
            }

            // Shop (5): Must have shop profile data
            if (userType === 5) {
                if (!user.shop) {
                    router.replace("/");
                }
                return;
            }
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen dark:text-white">Loading...</div>;
    }

    // While redirecting or checking, don't show children
    if (!user) return null;

    return children;
};

export default ProductGuard;
