import ComponentCard from "@/(template)/components/common/ComponentCard";
import PageBreadcrumb from "@/(template)/components/common/PageBreadCrumb";
import ResponsiveImage from "@/(template)/components/ui/images/ResponsiveImage";
import ThreeColumnImageGrid from "@/(template)/components/ui/images/ThreeColumnImageGrid";
import TwoColumnImageGrid from "@/(template)/components/ui/images/TwoColumnImageGrid";
import React from "react";
export const metadata = {
  title: "Next.js Images | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Images page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template"
  // other metadata
};
export default function Images() {
  return <div>
      <PageBreadcrumb pageTitle="Images" />
      <div className="space-y-5 sm:space-y-6">
        <ComponentCard title="Responsive image">
          <ResponsiveImage />
        </ComponentCard>
        <ComponentCard title="Image in 2 Grid">
          <TwoColumnImageGrid />
        </ComponentCard>
        <ComponentCard title="Image in 3 Grid">
          <ThreeColumnImageGrid />
        </ComponentCard>
      </div>
    </div>;
}