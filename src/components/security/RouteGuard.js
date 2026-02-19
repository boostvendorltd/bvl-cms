"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

const RouteGuard = ({ children, allowedRoles, requireShop = false }) => {
    const { user, isLoading } = useSelector((state) => state.auth);
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        if (!isLoading && user) {
            let role = 'guest';
            if (user.type === 0) role = 'root';
            else if (user.type === 4) role = 'administrator';
            else if (user.role === 'partner' || user.type === 2) role = 'partner';
            else if (user.role === 'account' || user.type === 3) role = 'account';
            else if (user.role === 'shop' || user.type === 5) role = 'shop';

            if (allowedRoles.includes(role)) {
                // If shop is required and user is an account, check if they have shops
                if (requireShop && role === 'account') {
                    if (user.account?.shops?.length > 0) {
                        setAuthorized(true);
                    } else {
                        router.push('/shops');
                    }
                } else if (requireShop && role === 'shop') {
                    if (user.shop) {
                        setAuthorized(true);
                    } else {
                        router.push('/');
                    }
                } else {
                    setAuthorized(true);
                }
            } else {
                // Redirect unauthorized users
                if (role === 'root' || role === 'administrator') router.push('/companies');
                else if (role === 'partner') router.push('/accounts');
                else if (role === 'account') router.push('/shops');
                else if (role === 'shop') router.push('/customers');
                else router.push('/signin');
            }
        }
    }, [user, isLoading, router, allowedRoles]);

    if (isLoading || !authorized) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return children;
};

export default RouteGuard;
