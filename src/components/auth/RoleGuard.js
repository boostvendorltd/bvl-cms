"use client";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";

const RoleGuard = ({ children, allowedRoles }) => {
    const { user, isLoading } = useSelector((state) => state.auth);
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && user) {
            const userRole = user.role;
            const userType = user.type;

            // Normalize user role and type for comparison
            // Root: type=0
            // Partner: role='partner' or type=2
            // Account: role='account' or type=3
            // Shop: role='shop' or type=5

            let currentRole = 'unknown';
            if (userType === 0) currentRole = 'root';
            else if (userRole === 'partner' || userType === 2) currentRole = 'partner';
            else if (userRole === 'account' || userType === 3) currentRole = 'account';
            else if (userRole === 'shop' || userType === 5) currentRole = 'shop';

            // Check if user has permission
            if (!allowedRoles.includes(currentRole)) {
                // Redirect logic based on role
                if (currentRole === 'root') router.push('/companies');
                else if (currentRole === 'partner') router.push('/accounts');
                else if (currentRole === 'account') router.push('/shops');
                else if (currentRole === 'shop') router.push('/customers');
                else router.push('/signin');
            }
        }
    }, [user, isLoading, allowedRoles, router]);

    if (isLoading || !user) {
        return <div className="flex items-center justify-center min-h-screen dark:text-white">Loading...</div>; // Or a spinner
    }

    return children;
};

export default RoleGuard;
