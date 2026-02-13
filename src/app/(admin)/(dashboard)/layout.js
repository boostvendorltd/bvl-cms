"use client";

import { useSidebar } from "@/(template)/context/SidebarContext";
import AppHeader from "@/(template)/layout/AppHeader";
import AppSidebar from "@/(template)/layout/AppSidebar";
import Backdrop from "@/(template)/layout/Backdrop";
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { fetchUserProfile } from "@/(template)/redux/features/auth-slice";

export default function AdminLayout({
  children
}) {
  const {
    isExpanded,
    isHovered,
    isMobileOpen
  } = useSidebar();

  const dispatch = useDispatch();
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated && !user) {
      dispatch(fetchUserProfile())
        .unwrap()
        .catch(() => {
          router.push("/signin");
        });
    }
  }, [isAuthenticated, user, dispatch, router]);

  if (isLoading || !isAuthenticated) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  const mainContentMargin = isMobileOpen ? "ml-0" : isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]";
  return <div className="min-h-screen xl:flex">
    <AppSidebar />
    <Backdrop />
    <div className={`flex-1 min-w-0 transition-all duration-300 ease-in-out ${mainContentMargin}`}>
      <AppHeader />
      <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">{children}</div>
    </div>
  </div>;
}