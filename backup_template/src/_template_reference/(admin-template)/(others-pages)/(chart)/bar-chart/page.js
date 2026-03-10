import BarChartOne from "@/(template)/components/charts/bar/BarChartOne";
import ComponentCard from "@/(template)/components/common/ComponentCard";
import PageBreadcrumb from "@/(template)/components/common/PageBreadCrumb";
import React from "react";

export const metadata = {
  title: "Next.js Bar Chart | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Bar Chart page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template"
};

export default function page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Bar Chart" />
      <div className="space-y-6">
        <ComponentCard title="Bar Chart 1">
          <BarChartOne />
        </ComponentCard>
      </div>
    </div>
  );
}