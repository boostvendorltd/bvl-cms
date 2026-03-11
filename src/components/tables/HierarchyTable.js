"use client";
import React from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Pagination from "@/components/tables/Pagination";
import Link from "next/link";

export default function HierarchyTable({
    columns,
    data,
    pagination,
    onPageChange,
    onRowClick,
    onIdClick,
    selectable = false,
    selectedIds = [],
    onSelect,
    onSelectAll
}) {
    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] w-full max-w-full">
            <div className="max-w-full overflow-x-auto">
                <div className="min-w-[1600px]">
                    <Table>
                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                            <TableRow>
                                {selectable && (
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start w-12">
                                        <input
                                            type="checkbox"
                                            checked={data.length > 0 && selectedIds.length === data.length}
                                            onChange={(e) => onSelectAll(e.target.checked)}
                                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                        />
                                    </TableCell>
                                )}
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
                                    {selectable && (
                                        <TableCell className="px-5 py-4 sm:px-6 w-12">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(row.id)}
                                                onChange={(e) => onSelect(row.id, e.target.checked)}
                                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                            />
                                        </TableCell>
                                    )}
                                    {columns.map((col, colIndex) => {
                                        const value = row[col.accessor];

                                        // Special handling for ID Column -> Clickable for Modal
                                        if (col.accessor === 'id') {
                                            return (
                                                <TableCell key={colIndex} className="px-5 py-4 sm:px-6 text-start text-theme-sm">
                                                    {onIdClick ? (
                                                        <button
                                                            onClick={() => onIdClick(row)}
                                                            className="text-brand-500 hover:text-brand-600 underline cursor-pointer"
                                                        >
                                                            #{value}
                                                        </button>
                                                    ) : (
                                                        <span className="text-gray-700 dark:text-gray-300">#{value}</span>
                                                    )}
                                                </TableCell>
                                            );
                                        }

                                        // Special handling for Name Column -> Clickable for Navigation / Drill-down
                                        if (col.isLink) {
                                            return (
                                                <TableCell key={colIndex} className="p-0 text-start">
                                                    <Link
                                                        href={col.getLink(row)}
                                                        className="block px-5 py-4 sm:px-6 font-medium text-gray-800 text-theme-sm dark:text-white/90 hover:underline hover:text-brand-500 w-full h-full transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
                                                    >
                                                        {value}
                                                        {col.subtitleAccessor && (
                                                            <span className="block text-gray-500 text-theme-xs dark:text-gray-400 font-normal">
                                                                {row[col.subtitleAccessor]}
                                                            </span>
                                                        )}
                                                    </Link>
                                                </TableCell>
                                            );
                                        }

                                        // Default rendering
                                        return (
                                            <TableCell key={colIndex} className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                {col.render ? col.render(value, row) : (typeof value === 'object' && value !== null ? JSON.stringify(value) : value)}
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
