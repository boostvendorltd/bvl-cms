"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories, createCategory, updateCategory, deleteCategory } from "@/redux/features/product-slice";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import TableActions from "@/components/tables/TableActions";
import QuickEditModal from "@/components/ui/modal/QuickEditModal";
import ConfirmationModal from "@/components/ui/modal/ConfirmationModal";
import { PencilSquareIcon, TrashIcon, ChevronRightIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const CategoryItem = ({ category, level = 0, onEdit, onDelete, flatCategories }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = category.children && category.children.length > 0;

    return (
        <div className="border-b last:border-b-0 border-gray-100">
            <div className={`flex items-center justify-between py-3 px-4 hover:bg-gray-50 ${level > 0 ? 'bg-gray-50/50' : ''}`} style={{ paddingLeft: `${level * 20 + 16}px` }}>
                <div className="flex items-center gap-2">
                    {hasChildren ? (
                        <button onClick={() => setIsExpanded(!isExpanded)} className="text-gray-500 hover:text-gray-700">
                            {isExpanded ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
                        </button>
                    ) : (
                        <span className="w-4"></span>
                    )}
                    {category.image && (
                        <img src={category.image} alt="" className="w-8 h-8 rounded object-cover border" />
                    )}
                    <span className="font-medium text-gray-800 text-sm">{category.name}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => onEdit(category)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                        <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => onDelete(category)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Delete">
                        <TrashIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
            {isExpanded && hasChildren && (
                <div className="border-l border-gray-100 ml-4">
                    {category.children.map(child => (
                        <CategoryItem
                            key={child.id}
                            category={child}
                            level={level + 1}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const CategoriesPage = () => {
    const dispatch = useDispatch();
    const { categories, flatCategories, loading } = useSelector((state) => state.product);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, data: null });

    useEffect(() => {
        dispatch(fetchCategories()); // Fetch Tree
        dispatch(fetchCategories({ flat: true })); // Fetch Flat for dropdowns
    }, [dispatch]);

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
            // Refetch to update tree
            dispatch(fetchCategories());
            dispatch(fetchCategories({ flat: true }));
        } catch (error) {
            // error handled by toast
        }
    };

    const handleSave = async (id, formData) => {
        try {
            if (id) {
                await dispatch(updateCategory({ id, data: formData })).unwrap();
                toast.success("Category updated");
            } else {
                await dispatch(createCategory(formData)).unwrap();
                toast.success("Category created");
            }
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
            dispatch(fetchCategories());
            dispatch(fetchCategories({ flat: true }));
        } catch (error) {
            toast.error(error.message || "Failed");
        }
    };

    // Prepare options for Parent Selector
    // Flattened categories needed here.
    const parentOptions = {};
    flatCategories?.forEach(c => {
        if (selectedCategory && c.id === selectedCategory.id) return; // Self check
        parentOptions[c.id] = c.name; // Basic listing, could add depth indicator if we had logic for it
    });
    // Add "None" option
    const parentOptionsWithNone = { "": "None (Root)", ...parentOptions };

    return (
        <>
            <PageBreadCrumb pageTitle="Categories" />
            <div className="space-y-6">
                <div className="flex justify-end">
                    <TableActions
                        onAdd={() => setIsAddModalOpen(true)}
                        addButtonText="Add Category"
                        hideSearch={true}
                        hideFilter={true}
                    />
                </div>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    {loading && <div className="p-4 text-center text-gray-500">Loading...</div>}
                    {!loading && categories.length === 0 && <div className="p-8 text-center text-gray-500">No categories found. Create one!</div>}

                    <div className="divide-y divide-gray-100">
                        {categories.map(cat => (
                            <CategoryItem
                                key={cat.id}
                                category={cat}
                                onEdit={handleEdit}
                                onDelete={handleDeleteClick}
                            />
                        ))}
                    </div>
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
                    description: { label: "Description", type: "textarea" }
                }}
            />

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

export default CategoriesPage;
