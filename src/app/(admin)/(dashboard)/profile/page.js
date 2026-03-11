"use client";

import UserAddressCard from "@/components/user-profile/UserAddressCard";
import UserInfoCard from "@/components/user-profile/UserInfoCard";
import React from "react";
import { useTranslation } from "react-i18next";

export default function Profile() {
  const { t } = useTranslation();
  return <div>
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
        {t("PROFILE")}
      </h3>
      <div className="space-y-6">
        <UserInfoCard />
        <UserAddressCard />
      </div>
    </div>
  </div>;
}