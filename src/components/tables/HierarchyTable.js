"use client";
import React from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/(template)/components/ui/table";
import Badge from "@/(template)/components/ui/badge/Badge";
import Pagination from "@/(template)/components/tables/Pagination";
import Link from "next/link";

export default function HierarchyTable({
    columns,
    data,
    pagination,
    onPageChange,
    onRowClick,
    onIdClick
}) {
    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] w-full max-w-full">
            <div className="max-w-full overflow-x-auto">
                <div className="min-w-[1300px]">
                    <Table>
                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                            <TableRow>
                                {columns.map((col, index) => (
                                    <TableCell
                                        key={index}
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                    >
                                        {col.header}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHeader>

                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {data.map((row, rowIndex) => (
                                <TableRow key={row.id || rowIndex}>
                                    {columns.map((col, colIndex) => {
                                        const value = row[col.accessor];

                                        // Special handling for First Column (ID) -> Clickable for Modal
                                        if (colIndex === 0) {
                                            return (
                                                <TableCell key={colIndex} className="px-5 py-4 sm:px-6 text-start text-theme-sm">
                                                    <button
                                                        onClick={() => onIdClick && onIdClick(row)}
                                                        className="text-brand-500 hover:text-brand-600 underline"
                                                    >
                                                        #{value}
                                                    </button>
                                                </TableCell>
                                            );
                                        }

                                        // Special handling for Name Column -> Clickable for Navigation / Drill-down
                                        // We assume the column looking for is 'name' or has a flag
                                        if (col.isLink) {
                                            return (
                                                <TableCell key={colIndex} className="px-5 py-4 sm:px-6 text-start">
                                                    <Link
                                                        href={col.getLink(row)}
                                                        className="font-medium text-gray-800 text-theme-sm dark:text-white/90 hover:underline hover:text-brand-500"
                                                    >
                                                        {value}
                                                    </Link>
                                                    {col.subtitleAccessor && (
                                                        <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                                                            {row[col.subtitleAccessor]}
                                                        </span>
                                                    )}
                                                </TableCell>
                                            );
                                        }

                                        // Default rendering
                                        return (
                                            <TableCell key={colIndex} className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                {col.render ? col.render(value, row) : value}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Pagination */}
            {pagination && (
                <div className="p-4 border-t border-gray-100 dark:border-white/[0.05]">
                    <Pagination
                        currentPage={pagination.current_page}
                        totalPages={pagination.last_page}
                        onPageChange={onPageChange}
                    />
                </div>
            )}
        </div>
    );
}
