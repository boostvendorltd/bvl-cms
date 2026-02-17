"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

const RouteGuard = ({ children, allowedRoles }) => {
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
                setAuthorized(true);
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
