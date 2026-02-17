"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchAttributes, createAttribute, updateAttribute, deleteAttribute, addAttributeValue, deleteAttributeValue,
    bulkDeleteAttributes
} from "@/redux/features/product-slice";
import { getShopId } from "@/utils/auth";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import HierarchyTable from "@/components/tables/HierarchyTable";
import TableActions from "@/components/tables/TableActions";
import QuickEditModal from "@/components/ui/modal/QuickEditModal";
import ConfirmationModal from "@/components/ui/modal/ConfirmationModal";
import { PencilSquareIcon, TrashIcon, PlusCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

// --- Custom Modal For Attribute Values Management ---
const AttributeValuesModal = ({ isOpen, onClose, attribute, onAddValue, onDeleteValue }) => {
    const [newValue, setNewValue] = useState("");
    const [newColor, setNewColor] = useState("#000000");

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newValue.trim()) return;

        try {
            await onAddValue(attribute.id, {
                value: newValue,
                color_code: attribute.type === 'color' ? newColor : null
            });
            setNewValue("");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[9999]" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 border-b pb-2 mb-4">
                                    Manage Values: {attribute?.name}
                                </Dialog.Title>

                                {/* List Existing Values */}
                                <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
                                    {attribute?.values?.length === 0 && <p className="text-sm text-gray-500 italic">No values yet.</p>}
                                    {attribute?.values?.map((val) => (
                                        <div key={val.id} className="flex justify-between items-center p-2 bg-gray-50 rounded border">
                                            <div className="flex items-center gap-2">
                                                {attribute.type === 'color' && (
                                                    <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: val.color_code }}></span>
                                                )}
                                                <span className="text-sm font-medium">{val.value}</span>
                                            </div>
                                            <button
                                                onClick={() => onDeleteValue(attribute.id, val.id)}
                                                className="text-red-500 hover:text-red-700 p-1"
                                            >
                                                <XMarkIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Add New Value Form */}
                                <form onSubmit={handleAdd} className="bg-gray-50 p-3 rounded border">
                                    <h4 className="text-sm font-semibold mb-2">Add New Value</h4>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                placeholder="Value (e.g., Red, XL)"
                                                value={newValue}
                                                onChange={(e) => setNewValue(e.target.value)}
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                            />
                                        </div>
                                        {attribute?.type === 'color' && (
                                            <div>
                                                <input
                                                    type="color"
                                                    value={newColor}
                                                    onChange={(e) => setNewColor(e.target.value)}
                                                    className="h-9 w-9 p-0 border-0 rounded overflow-hidden cursor-pointer"
                                                />
                                            </div>
                                        )}
                                        <button
                                            type="submit"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </form>

                                <div className="mt-6 flex justify-end">
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                                        onClick={onClose}
                                    >
                                        Close
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

const AttributesPage = () => {
    const dispatch = useDispatch();
    const { attributes, loading } = useSelector((state) => state.product);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isValueModalOpen, setIsValueModalOpen] = useState(false);
    const [selectedAttribute, setSelectedAttribute] = useState(null);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        data: null,
        title: "",
        message: ""
    });

    // Bulk Selection State
    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        dispatch(fetchAttributes());
    }, [dispatch]);

    const handleEdit = (row) => {
        setSelectedAttribute(row);
        setIsEditModalOpen(true);
    };

    const handleValues = (row) => {
        setSelectedAttribute(row);
        setIsValueModalOpen(true);
    };

    const handleDeleteClick = (row) => {
        setConfirmModal({
            isOpen: true,
            data: row,
            title: "Delete Attribute",
            message: `Are you sure you want to delete "${row.name}"? This cannot be undone.`
        });
    };

    const confirmDelete = async () => {
        try {
            await toast.promise(
                dispatch(deleteAttribute(confirmModal.data.id)).unwrap(),
                {
                    loading: 'Deleting...',
                    success: 'Attribute deleted successfully',
                    error: (err) => `Error: ${err.message || err}`
                }
            );
            setConfirmModal({ isOpen: false, data: null });
        } catch (error) {
            // Toast handles error
        }
    };

    const handleSave = async (id, formData) => {
        try {
            if (id) {
                await dispatch(updateAttribute({ id, data: formData })).unwrap();
                toast.success("Attribute updated successfully");
            } else {
                await dispatch(createAttribute(formData)).unwrap();
                toast.success("Attribute created successfully");
            }
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
        } catch (error) {
            toast.error(error.message || "Operation failed");
            throw error;
        }
    };

    const handleAddValue = async (id, data) => {
        await dispatch(addAttributeValue({ id, data })).unwrap();
        // Update local selected attribute to show immediate change in modal
        // But since state updates, we rely on the modal re-rendering from updated store state if we passed it correctly
        // Wait, 'selectedAttribute' is local state, it won't auto-update from store unless we sync it.
        // Better: Pass fresh data from store to modal.
    };

    const handleDeleteValue = async (id, valueId) => {
        await dispatch(deleteAttributeValue({ id, valueId })).unwrap();
    };

    // Helper to get fresh attribute data for the modal
    const activeAttributeForModal = attributes.find(a => a.id === selectedAttribute?.id) || selectedAttribute;

    // --- Bulk Selection Handlers ---

    const toggleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = (isChecked) => {
        if (isChecked) {
            setSelectedIds(attributes.map((attr) => attr.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;

        // Show confirmation before deleting
        if (!confirm('Are you sure you want to delete ' + selectedIds.length + ' attributes?')) return;

        try {
            await toast.promise(
                dispatch(bulkDeleteAttributes(selectedIds)).unwrap(),
                {
                    loading: 'Deleting attributes...',
                    success: 'Attributes deleted successfully',
                    error: (err) => `Error: ${err.message || err.message}`
                }
            );
            setSelectedIds([]);
            dispatch(fetchAttributes()); // Re-fetch attributes after bulk delete
        } catch (error) {
            // handled by toast
        }
    };

    const openAddModal = () => {
        setSelectedAttribute(null); // Clear any previously selected attribute
        setIsAddModalOpen(true);
    };

    const columns = [
        { header: "Name", accessor: "name" },
        { header: "Type", accessor: "type", render: (val) => <span className="capitalize">{val}</span> },
        {
            header: "Values",
            accessor: "values",
            render: (values, row) => (
                <div className="flex flex-wrap gap-1 items-center">
                    {values?.slice(0, 3).map((v, i) => (
                        <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border">
                            {row.type === 'color' && (
                                <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: v.color_code }}></span>
                            )}
                            {v.value}
                        </span>
                    ))}
                    {values?.length > 3 && <span className="text-xs text-gray-500">+{values.length - 3} more</span>}
                    <button
                        onClick={() => handleValues(row)}
                        className="ml-1 text-blue-600 hover:text-blue-800 text-xs font-medium"
                    >
                        Manage
                    </button>
                </div>
            )
        },
        {
            header: "Actions",
            accessor: "actions",
            render: (_, row) => (
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => handleEdit(row)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                    >
                        <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => handleDeleteClick(row)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                    >
                        <TrashIcon className="h-5 w-5" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <>
            <PageBreadCrumb pageTitle="Attributes" />
            <div className="space-y-6">
                <br />
                <div className="flex items-center gap-3 mb-6">
                    {selectedIds.length > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">{selectedIds.length} selected</span>
                            <button
                                onClick={handleBulkDelete}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-500 bg-red-50 rounded-lg hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20"
                            >
                                <TrashIcon className="w-4 h-4" />
                                Delete
                            </button>
                        </div>
                    )}
                    <TableActions
                        onAdd={() => openAddModal()}
                        addButtonText="Add Attribute"
                        hideSearch={true} // Simple list for now
                        hideFilter={true}
                    />
                </div>
                <HierarchyTable
                    columns={columns}
                    data={attributes}
                    isLoading={loading}
                    pagination={null}
                    selectable={true}
                    selectedIds={selectedIds}
                    onSelect={toggleSelect}
                    onSelectAll={toggleSelectAll}
                />
            </div>

            {/* Create Modal */}
            <QuickEditModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={(id, data) => handleSave(null, data)}
                title="Create Attribute"
                fields={{
                    name: { label: "Attribute Name", type: "text" },
                    type: {
                        label: "Type",
                        type: "select",
                        options: { text: "Text", select: "Select/Dropdown", radio: "Radio Button", color: "Color Swatch", image: "Pattern/Image" }
                    },
                    is_variant: { label: "Used for Variations?", type: "select", options: { 1: "Yes", 0: "No" } } // Quick hack for bool
                }}
            />

            {/* Edit Modal */}
            <QuickEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                data={selectedAttribute}
                onSave={handleSave}
                title="Edit Attribute"
                fields={{
                    name: { label: "Attribute Name", type: "text" },
                    type: {
                        label: "Type",
                        type: "select",
                        options: { text: "Text", select: "Select/Dropdown", radio: "Radio Button", color: "Color Swatch", image: "Pattern/Image" }
                    },
                    is_variant: { label: "Used for Variations?", type: "select", options: { 1: "Yes", 0: "No" } }
                }}
            />

            {/* Values Modal */}
            <AttributeValuesModal
                isOpen={isValueModalOpen}
                onClose={() => setIsValueModalOpen(false)}
                attribute={activeAttributeForModal}
                onAddValue={handleAddValue}
                onDeleteValue={handleDeleteValue}
            />

            {/* Confirm Modal */}
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, data: null })}
                onConfirm={confirmDelete}
                title={confirmModal.title}
                message={confirmModal.message}
                type="danger"
            />
        </>
    );
};

export default AttributesPage;
