"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    bulkDeleteCategories
} from "@/redux/features/product-slice";
import { getShopId } from "@/utils/auth";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import TableActions from "@/components/tables/TableActions";
import QuickEditModal from "@/components/ui/modal/QuickEditModal";
import ConfirmationModal from "@/components/ui/modal/ConfirmationModal";
import { PencilSquareIcon, TrashIcon, ChevronRightIcon, ChevronDownIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import AppImage from "@/components/ui/AppImage";

const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const baseURL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/api\/v1\/?$/, '');
    return `${baseURL}${path.startsWith('/') ? '' : '/'}${path}`;
};

const CategoryItem = ({ category, level = 0, onEdit, onDelete, hasChildren, isExpanded, onToggleExpand, selectedIds, onSelect }) => {
    const isSelected = selectedIds.includes(category.id);

    return (
        <div
            className={`
                grid grid-cols-12 gap-4 items-center p-4 border-b border-gray-100 last:border-b-0
                hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors
                ${isSelected ? 'bg-blue-50 dark:bg-blue-900/10' : ''}
            `}
        >
            {/* Checkbox Column */}
            <div className="col-span-1 flex items-center justify-center">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSelect(category.id)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
            </div>

            {/* Name Column with Indentation */}
            <div className="col-span-3 flex items-center gap-3 overflow-hidden">
                <div style={{ paddingLeft: `${level * 24}px` }} className="flex items-center gap-2 w-full">
                    {hasChildren ? (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleExpand(category.id);
                            }}
                            className="p-1 hover:bg-gray-200 rounded text-gray-500 flex-shrink-0"
                        >    {isExpanded ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
                        </button>
                    ) : (
                        <span className="w-6 flex-shrink-0"></span>
                    )}
                    {category?.image && (
                        <div className="relative w-8 h-8 rounded overflow-hidden border flex-shrink-0">
                            <AppImage src={getImageUrl(category?.image)} alt={category?.name} fill className="object-cover" />
                        </div>
                    )}
                    <span className="font-medium text-gray-800 text-sm truncate" title={category?.name}>{category?.name}</span>
                </div>
            </div>

            {/* Other columns shifted */}
            <div className="col-span-3">
                <p className="text-gray-500 text-sm line-clamp-2" title={category?.description}>{category?.description}</p>
            </div>
            <div className="col-span-2">
                <p className="text-gray-500 text-sm line-clamp-1" title={category?.note}>{category?.note}</p>
            </div>
            <div className="col-span-1 text-center">
                <div className="flex items-center gap-2 justify-center">
                    {category?.status === 1 ? (
                        <span className="text-green-600 font-medium text-xs bg-green-50 px-2 py-0.5 rounded">Active</span>
                    ) : (
                        <span className="text-red-600 font-medium text-xs bg-red-50 px-2 py-0.5 rounded">Inactive</span>
                    )}
                </div>
            </div>
            <div className="col-span-2 flex justify-end gap-2">
                <button onClick={() => onEdit(category)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                    <PencilSquareIcon className="h-5 w-5" />
                </button>
                <button onClick={() => onDelete(category)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Delete">
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};

const CategoriesPage = () => {
    const dispatch = useDispatch();
    const { categories, flatCategories, loading } = useSelector((state) => state.product);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        data: null,
        title: "",
        message: ""
    });

    // Bulk Delete Modal State
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

    // Filter State
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    // Bulk Selection State
    const [selectedIds, setSelectedIds] = useState([]);
    const [expandedCategories, setExpandedCategories] = useState([]);

    useEffect(() => {
        const shopId = getShopId();
        if (shopId) {
            dispatch(fetchCategories()); // Fetch Tree
            dispatch(fetchCategories({ flat: true })); // Fetch Flat for dropdowns
        }
    }, [dispatch]);

    // Use Memo for Filtering
    const filteredCategories = useMemo(() => {
        const isFiltered = !!search || statusFilter !== "";
        if (!isFiltered) return categories; // Return Tree if no filter

        // Filter on Flat List
        return (flatCategories || []).filter(cat => {
            const matchesSearch = cat.name.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = statusFilter === "" || cat.status.toString() === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [categories, flatCategories, search, statusFilter]);

    const isFiltered = !!search || statusFilter !== "";

    const handleEdit = (cat) => {
        setSelectedCategory(cat);
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (cat) => {
        setConfirmModal({
            isOpen: true,
            data: cat,
            title: "Delete Category",
            message: `Are you sure you want to delete "${cat.name}"?`
        });
    };

    const confirmDelete = async () => {
        try {
            await toast.promise(
                dispatch(deleteCategory(confirmModal.data.id)).unwrap(),
                {
                    loading: 'Deleting...',
                    success: 'Category deleted',
                    error: (err) => `Error: ${err.message || err}`
                }
            );
            setConfirmModal({ isOpen: false, data: null });
            refreshData();
        } catch (error) {
            // error handled by toast
        }
    };

    const handleSave = async (id, formData) => {
        try {
            // Check for file uploads
            let dataToSend = formData;
            const hasFile = Object.values(formData).some(val => val instanceof File);

            if (hasFile) {
                const fd = new FormData();
                Object.keys(formData).forEach(key => {
                    // For null/undefined, skip. For others append.
                    if (formData[key] !== null && formData[key] !== undefined) {
                        fd.append(key, formData[key]);
                    }
                });
                dataToSend = fd;
            }

            if (id) {
                await dispatch(updateCategory({ id, data: dataToSend })).unwrap();
                toast.success("Category updated");
            } else {
                await dispatch(createCategory(dataToSend)).unwrap();
                toast.success("Category created");
            }
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
            refreshData();
        } catch (error) {
            toast.error(error.message || "Failed");
        }
    };

    const refreshData = () => {
        dispatch(fetchCategories());
        dispatch(fetchCategories({ flat: true }));
    };

    // --- Bulk Selection Handlers ---

    const toggleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    // Helper to get all IDs from structure (Tree or Flat)
    const getAllIds = () => {
        if (isFiltered) {
            return filteredCategories.map(c => c.id);
        }
        // Recursive for tree
        const getTreeIds = (cats) => {
            let ids = [];
            cats.forEach(c => {
                ids.push(c.id);
                if (c.children && c.children.length > 0) {
                    ids = [...ids, ...getTreeIds(c.children)];
                }
            });
            return ids;
        };
        return getTreeIds(categories);
    };

    const toggleSelectAll = (isChecked) => {
        if (isChecked) {
            setSelectedIds(getAllIds());
        } else {
            setSelectedIds([]);
        }
    };

    const handleBulkDeleteClick = () => {
        if (selectedIds.length === 0) return;
        setIsBulkDeleteModalOpen(true);
    };

    const confirmBulkDelete = async () => {
        try {
            await toast.promise(
                dispatch(bulkDeleteCategories(selectedIds)).unwrap(),
                {
                    loading: 'Deleting categories...',
                    success: 'Categories deleted successfully',
                    error: (err) => `Error: ${err.message || err.message}`
                }
            );
            setSelectedIds([]);
            setIsBulkDeleteModalOpen(false);
            refreshData();
        } catch (error) {
            // handled by toast
        }
    };

    const toggleExpand = (id) => {
        setExpandedCategories(prev =>
            prev.includes(id) ? prev.filter(catId => catId !== id) : [...prev, id]
        );
    };

    // Prepare options for Parent Selector
    const parentOptions = {};
    flatCategories?.forEach(c => {
        if (selectedCategory && c.id === selectedCategory?.id) return; // Self check
        parentOptions[c.id] = c.name;
    });
    // Add "None" option
    const parentOptionsWithNone = { "": "None (Root)", ...parentOptions };

    // Recursive rendering helper
    const renderCategories = (cats, level = 0) => {
        return cats.map((cat) => {
            const hasChildren = cat.children && cat.children.length > 0;
            const isExpanded = expandedCategories.includes(cat.id);

            return (
                <div key={cat.id}>
                    <CategoryItem
                        category={cat}
                        level={level}
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                        hasChildren={hasChildren}
                        isExpanded={isExpanded}
                        onToggleExpand={toggleExpand}
                        selectedIds={selectedIds}
                        onSelect={toggleSelect}
                    />
                    {hasChildren && isExpanded && (
                        <div className="border-l border-dashed border-gray-200 ml-4">
                            {renderCategories(cat.children, level + 1)}
                        </div>
                    )}
                </div>
            );
        });
    };

    // Flat rendering helper for Filtered results
    const renderFlatCategories = () => {
        return filteredCategories.map((cat) => (
            <CategoryItem
                key={cat.id}
                category={cat}
                level={0} // No indent for flat search results
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                hasChildren={false}
                isExpanded={false}
                onToggleExpand={() => { }}
                selectedIds={selectedIds}
                onSelect={toggleSelect}
            />
        ));
    };

    return (
        <>
            <PageBreadCrumb pageTitle="Categories" />

            <div className="space-y-6">
                {/* Toolbar */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search categories..."
                                className="py-2 pl-9 pr-4 text-sm border border-gray-300 rounded-lg w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="py-2 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">All Status</option>
                            <option value="1">Active</option>
                            <option value="0">Inactive</option>
                        </select>
                    </form>

                    <div className="flex items-center gap-3">
                        {selectedIds.length > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">{selectedIds.length} selected</span>
                                <button
                                    onClick={handleBulkDeleteClick}
                                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-500 bg-red-50 rounded-lg hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                    Delete
                                </button>
                            </div>
                        )}
                        <TableActions
                            onAdd={() => setIsAddModalOpen(true)}
                            addButtonText="Add Category"
                            hideSearch
                            hideFilter
                        />
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* Header Row */}
                    <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider items-center">
                        <div className="col-span-1 flex justify-center">
                            <input
                                type="checkbox"
                                checked={
                                    filteredCategories.length > 0 && selectedIds.length === getAllIds().length
                                }
                                onChange={(e) => toggleSelectAll(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                        </div>
                        <div className="col-span-3">Name</div>
                        <div className="col-span-3">Description</div>
                        <div className="col-span-2">Note</div>
                        <div className="col-span-1 text-center">Status</div>
                        <div className="col-span-2 text-right">Actions</div>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading categories...</div>
                    ) : filteredCategories.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No categories found.</div>
                    ) : (
                        isFiltered ? renderFlatCategories() : renderCategories(filteredCategories)
                    )}
                </div>
            </div>

            {/* Create Modal */}
            <QuickEditModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={(id, data) => handleSave(null, data)}
                title="Create Category"
                fields={{
                    name: { label: "Category Name", type: "text" },
                    parent_id: { label: "Parent Category", type: "select", options: parentOptionsWithNone },
                    status: { label: "Status", type: "select", options: { 1: "Active", 0: "Inactive" } },
                    image: { label: "Category Image", type: "file" },
                    description: { label: "Description", type: "textarea" }
                }}
            />

            {/* Edit Modal */}
            <QuickEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                data={selectedCategory}
                onSave={handleSave}
                title="Edit Category"
                fields={{
                    name: { label: "Category Name", type: "text" },
                    parent_id: { label: "Parent Category", type: "select", options: parentOptionsWithNone },
                    status: { label: "Status", type: "select", options: { 1: "Active", 0: "Inactive" } },
                    image: { label: "Category Image", type: "file" },
                    description: { label: "Description", type: "textarea" }
                }}
            />

            {/* Single Delete Confirmation */}
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, data: null })}
                onConfirm={confirmDelete}
                title={confirmModal.title}
                message={confirmModal.message}
                type="danger"
            />

            {/* Bulk Delete Confirmation */}
            <ConfirmationModal
                isOpen={isBulkDeleteModalOpen}
                onClose={() => setIsBulkDeleteModalOpen(false)}
                onConfirm={confirmBulkDelete}
                title="Bulk Delete"
                message={`Are you sure you want to delete ${selectedIds.length} categories?`}
                type="danger"
            />
        </>
    );
};

export default CategoriesPage;
