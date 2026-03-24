"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import ConfirmationModal from "@/components/ui/modal/ConfirmationModal";
import {
    fetchProduct,
    createProduct,
    updateProduct,
    clearCurrentProduct,
    fetchAttributes,
    fetchCategories,
    uploadProductImages,
    deleteProductImage,
    setPrimaryImage,
    generateVariants,
    bulkUpdateVariants,
    deleteVariant,
} from "@/redux/features/product-slice";
import {
    PhotoIcon,
    TrashIcon,
    StarIcon,
    PlusIcon,
    ArrowLeftIcon,
    CheckCircleIcon,
    XMarkIcon,
    BoltIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";

const TABS = [
    { id: "general", label: "General" },
    { id: "variants", label: "Variants" },
    { id: "media", label: "Media" },
];

const ProductEditorPage = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const params = useParams();
    const isEdit = params?.id && params.id !== "create";
    const productId = isEdit ? params.id : null;

    const { currentProduct, attributes, flatCategories, loading } = useSelector((s) => s.product);

    const [activeTab, setActiveTab] = useState("general");
    const [saving, setSaving] = useState(false);

    // --- Form State ---
    const [form, setForm] = useState({
        name: "",
        short_description: "",
        description: "",
        status: 1,
        category_ids: [],
        attribute_ids: [],
        // Default variant
        price: "",
        compare_price: "",
        cost_per_item: "",
        sku: "",
        quantity: 0,
        weight: "",
    });

    // Load data
    useEffect(() => {
        dispatch(fetchAttributes());
        dispatch(fetchCategories({ flat: true }));
        if (productId) {
            dispatch(fetchProduct(productId));
        }
        return () => dispatch(clearCurrentProduct());
    }, [dispatch, productId]);

    // Populate form when product loads
    useEffect(() => {
        if (currentProduct && isEdit) {
            const defaultVariant = currentProduct.variants?.find((v) => v.is_default) || currentProduct.variants?.[0];
            setForm({
                name: currentProduct.name || "",
                short_description: currentProduct.short_description || "",
                description: currentProduct.description || "",
                status: currentProduct.status ?? 1,
                category_ids: currentProduct.categories?.map((c) => c.id) || [],
                attribute_ids: currentProduct.attributes?.map((a) => a.id) || [],
                price: defaultVariant?.price || "",
                compare_price: defaultVariant?.compare_price || "",
                cost_per_item: defaultVariant?.cost_per_item || "",
                sku: defaultVariant?.sku || "",
                quantity: defaultVariant?.quantity || 0,
                weight: defaultVariant?.weight || "",
            });
        }
    }, [currentProduct, isEdit]);



    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleCategoryToggle = (catId) => {
        setForm((prev) => ({
            ...prev,
            category_ids: prev.category_ids.includes(catId)
                ? prev.category_ids.filter((id) => id !== catId)
                : [...prev.category_ids, catId],
        }));
    };

    const handleAttributeToggle = (attrId) => {
        setForm((prev) => ({
            ...prev,
            attribute_ids: prev.attribute_ids.includes(attrId)
                ? prev.attribute_ids.filter((id) => id !== attrId)
                : [...prev.attribute_ids, attrId],
        }));
    };

    // --- Save ---
    const handleSave = async () => {
        if (!form.name.trim()) {
            toast.error("Product name is required.");
            setActiveTab("general");
            return;
        }
        setSaving(true);
        try {
            if (isEdit) {
                await dispatch(updateProduct({ id: productId, data: form })).unwrap();
                toast.success("Product updated!");
            } else {
                const result = await dispatch(createProduct(form)).unwrap();
                toast.success("Product created!");
                router.push(`/products/${result.id}`);
            }
        } catch (err) {
            toast.error(err?.message || "Failed to save product.");
        }
        setSaving(false);
    };

    // --- Image Upload ---
    const fileInputRef = useRef(null);
    const handleImageUpload = async (e) => {
        const files = e.target.files;
        if (!files?.length || !productId) return;
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append("images[]", files[i]);
        }
        try {
            await dispatch(uploadProductImages({ id: productId, formData })).unwrap();
            dispatch(fetchProduct(productId));
            toast.success("Images uploaded!");
        } catch (err) {
            toast.error("Failed to upload images.");
        }
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleDeleteImage = (imageId) => {
        setDeleteImageTarget(imageId);
    };

    const confirmDeleteImage = async () => {
        if (!deleteImageTarget) return;
        try {
            await toast.promise(
                dispatch(deleteProductImage({ productId, imageId: deleteImageTarget })).unwrap(),
                {
                    loading: 'Deleting image...',
                    success: 'Image deleted.',
                    error: (err) => `Error: ${err.message || 'Failed to delete'}`
                }
            );
            dispatch(fetchProduct(productId));
        } catch (err) {
            // handled by toast
        }
        setDeleteImageTarget(null);
    };

    const handleSetPrimary = async (imageId) => {
        try {
            await dispatch(setPrimaryImage({ productId, imageId })).unwrap();
            dispatch(fetchProduct(productId));
            toast.success("Primary image updated.");
        } catch (err) {
            toast.error("Failed to update primary image.");
        }
    };

    const storageUrl = typeof window !== "undefined"
        ? `${window.location.protocol}//${window.location.hostname}:8000/storage`
        : "";

    // --- Variant Generation ---
    const [variantGenOpen, setVariantGenOpen] = useState(false);
    const [selectedGenAttrs, setSelectedGenAttrs] = useState({});
    const [genDefaults, setGenDefaults] = useState({ price: "", quantity: 0 });
    const [variantEdits, setVariantEdits] = useState({});
    const [deleteVariantTarget, setDeleteVariantTarget] = useState(null);
    const [deleteImageTarget, setDeleteImageTarget] = useState(null);

    const availableAttributes = attributes.filter((a) => form.attribute_ids.includes(a.id) && a.values?.length > 0);

    const handleGenAttrValueToggle = (attrId, valueId) => {
        setSelectedGenAttrs((prev) => {
            const current = prev[attrId] || [];
            return {
                ...prev,
                [attrId]: current.includes(valueId)
                    ? current.filter((id) => id !== valueId)
                    : [...current, valueId],
            };
        });
    };

    const handleGenerate = async () => {
        const attrData = Object.entries(selectedGenAttrs)
            .filter(([, vals]) => vals.length > 0)
            .map(([attrId, value_ids]) => ({
                attribute_id: parseInt(attrId),
                value_ids,
            }));

        if (attrData.length === 0) {
            toast.error("Select at least one attribute value.");
            return;
        }

        try {
            const result = await dispatch(
                generateVariants({
                    id: productId,
                    data: {
                        attributes: attrData,
                        defaults: {
                            price: parseFloat(genDefaults.price) || 0,
                            quantity: parseInt(genDefaults.quantity) || 0,
                        },
                    },
                })
            ).unwrap();
            toast.success(result.message);
            setVariantGenOpen(false);
            setSelectedGenAttrs({});
            dispatch(fetchProduct(productId));
        } catch (err) {
            toast.error("Variant generation failed.");
        }
    };

    const handleVariantFieldChange = (variantId, field, value) => {
        setVariantEdits((prev) => ({
            ...prev,
            [variantId]: { ...prev[variantId], [field]: value },
        }));
    };

    const handleSaveVariants = async () => {
        const edits = Object.entries(variantEdits);
        if (edits.length === 0) {
            toast.error("No changes to save.");
            return;
        }
        const variants = edits.map(([id, fields]) => ({ id: parseInt(id), ...fields }));
        try {
            await dispatch(bulkUpdateVariants({ id: productId, data: { variants } })).unwrap();
            setVariantEdits({});
            toast.success("Variants updated!");
            dispatch(fetchProduct(productId));
        } catch (err) {
            toast.error("Failed to update variants.");
        }
    };

    const handleDeleteVariant = async () => {
        if (!deleteVariantTarget) return;
        try {
            await dispatch(deleteVariant({ productId, variantId: deleteVariantTarget.id })).unwrap();
            setDeleteVariantTarget(null);
            toast.success("Variant deleted.");
            dispatch(fetchProduct(productId));
        } catch (err) {
            toast.error(err?.message || "Cannot delete variant.");
            setDeleteVariantTarget(null);
        }
    };

    const productVariants = currentProduct?.variants || [];
    const hasVariantCombinations = productVariants.some((v) => v.combinations?.length > 0);

    const getVariantLabel = (variant) => {
        // default varient -------
        if (!variant.combinations?.length) return;
        return variant.combinations
            .map((c) => c.attribute_value?.value || "")
            .filter(Boolean)
            .join(" / ");
    };

    // ------ RENDER ------
    return (
        <>
            <PageBreadCrumb pageTitle={isEdit ? "Edit Product" : "Create Product"} />

            {/* Toast */}


            <div className="space-y-5">
                {/* Top Bar */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => router.push("/products")}
                        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                        Back to Products
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                    >
                        {saving ? (
                            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        ) : (
                            <CheckCircleIcon className="w-4 h-4" />
                        )}
                        {isEdit ? "Save Changes" : "Create Product"}
                    </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex gap-6">
                        {TABS.map((tab) => {
                            const disabled = !isEdit && tab.id !== "general";
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => !disabled && setActiveTab(tab.id)}
                                    disabled={disabled}
                                    className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                                        ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500"
                                        : disabled
                                            ? "border-transparent text-gray-300 dark:text-gray-600 cursor-not-allowed"
                                            : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600"
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* ===== TAB: GENERAL ===== */}
                {activeTab === "general" && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Main form */}
                        <div className="space-y-5 lg:col-span-2">
                            <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl space-y-4">
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white/90">Product Information</h3>
                                <div>
                                    <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Name *</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => handleChange("name", e.target.value)}
                                        placeholder="e.g., Winter Jacket"
                                        className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Short Description</label>
                                    <input
                                        type="text"
                                        value={form.short_description}
                                        onChange={(e) => handleChange("short_description", e.target.value)}
                                        placeholder="Brief product summary"
                                        maxLength={500}
                                        className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                                    <textarea
                                        value={form.description}
                                        onChange={(e) => handleChange("description", e.target.value)}
                                        rows={5}
                                        placeholder="Detailed product description..."
                                        className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                    />
                                </div>
                            </div>

                            {/* Pricing (default variant) */}
                            <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl space-y-4">
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white/90">Pricing & Inventory</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Price</label>
                                        <div className="relative">
                                            <span className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2 text-sm">$</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={form.price}
                                                onChange={(e) => handleChange("price", e.target.value)}
                                                placeholder="0.00"
                                                className="w-full py-2.5 pl-7 pr-4 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Compare Price</label>
                                        <div className="relative">
                                            <span className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2 text-sm">$</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={form.compare_price}
                                                onChange={(e) => handleChange("compare_price", e.target.value)}
                                                placeholder="0.00"
                                                className="w-full py-2.5 pl-7 pr-4 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Cost per Item</label>
                                        <div className="relative">
                                            <span className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2 text-sm">$</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={form.cost_per_item}
                                                onChange={(e) => handleChange("cost_per_item", e.target.value)}
                                                placeholder="0.00"
                                                className="w-full py-2.5 pl-7 pr-4 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">SKU</label>
                                        <input
                                            type="text"
                                            value={form.sku}
                                            onChange={(e) => handleChange("sku", e.target.value)}
                                            placeholder="Auto-generated if empty"
                                            className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
                                        <input
                                            type="number"
                                            value={form.quantity}
                                            onChange={(e) => handleChange("quantity", parseInt(e.target.value) || 0)}
                                            className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Weight (kg)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={form.weight}
                                            onChange={(e) => handleChange("weight", e.target.value)}
                                            placeholder="0.00"
                                            className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-5">
                            {/* Status */}
                            <div className="p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl space-y-3">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white/90">Status</h3>
                                <select
                                    value={form.status}
                                    onChange={(e) => handleChange("status", parseInt(e.target.value))}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value={1}>Active</option>
                                    <option value={0}>Inactive</option>
                                    <option value={2}>Draft</option>
                                </select>
                            </div>

                            {/* Categories */}
                            <div className="p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl space-y-3">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white/90">Categories</h3>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {flatCategories.length === 0 ? (
                                        <p className="text-xs text-gray-400">No categories found.</p>
                                    ) : (
                                        flatCategories.map((cat) => (
                                            <label key={cat.id} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={form.category_ids.includes(cat.id)}
                                                    onChange={() => handleCategoryToggle(cat.id)}
                                                    className="w-4 h-4 text-blue-600 rounded border-gray-300"
                                                />
                                                <span style={{ paddingLeft: `${(cat.depth || 0) * 16}px` }}>
                                                    {cat.depth > 0 && <span className="text-gray-300 mr-1">└</span>}
                                                    {cat.name}
                                                </span>
                                            </label>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Attributes */}
                            <div className="p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl space-y-3">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white/90">Attributes</h3>
                                <p className="text-xs text-gray-400">Select attributes to enable variant generation.</p>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {attributes.length === 0 ? (
                                        <p className="text-xs text-gray-400">No attributes found.</p>
                                    ) : (
                                        attributes.map((attr) => (
                                            <label key={attr.id} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={form.attribute_ids.includes(attr.id)}
                                                    onChange={() => handleAttributeToggle(attr.id)}
                                                    className="w-4 h-4 text-blue-600 rounded border-gray-300"
                                                />
                                                {attr.name}
                                                <span className="text-xs text-gray-400">({attr.values?.length || 0} values)</span>
                                            </label>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== TAB: VARIANTS ===== */}
                {activeTab === "variants" && isEdit && (
                    <div className="space-y-5">
                        {/* Generator */}
                        <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-white/90">Variant Generator</h3>
                                    <p className="text-sm text-gray-500">Select attribute values to generate variant combinations.</p>
                                </div>
                                <button
                                    onClick={() => setVariantGenOpen(!variantGenOpen)}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                                >
                                    <BoltIcon className="w-4 h-4" />
                                    {variantGenOpen ? "Cancel" : "Generate Variants"}
                                </button>
                            </div>

                            {variantGenOpen && (
                                <div className="pt-4 space-y-4 border-t border-gray-100">
                                    {availableAttributes.length === 0 ? (
                                        <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                                            No attributes with values are assigned. Go to the General tab and select attributes first.
                                        </p>
                                    ) : (
                                        <>
                                            {availableAttributes.map((attr) => (
                                                <div key={attr.id} className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{attr.name}</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {attr.values?.map((val) => {
                                                            const selected = (selectedGenAttrs[attr.id] || []).includes(val.id);
                                                            return (
                                                                <button
                                                                    key={val.id}
                                                                    onClick={() => handleGenAttrValueToggle(attr.id, val.id)}
                                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border transition-colors ${selected
                                                                        ? "bg-blue-600 text-white border-blue-600"
                                                                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                                                                        }`}
                                                                >
                                                                    {val.color_code && (
                                                                        <span
                                                                            className="w-3 h-3 rounded-full border border-gray-200"
                                                                            style={{ backgroundColor: val.color_code }}
                                                                        />
                                                                    )}
                                                                    {val.value}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}

                                            <div className="grid grid-cols-2 gap-4 pt-3">
                                                <div>
                                                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Default Price</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={genDefaults.price}
                                                        onChange={(e) => setGenDefaults((p) => ({ ...p, price: e.target.value }))}
                                                        placeholder="0.00"
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Default Quantity</label>
                                                    <input
                                                        type="number"
                                                        value={genDefaults.quantity}
                                                        onChange={(e) => setGenDefaults((p) => ({ ...p, quantity: e.target.value }))}
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleGenerate}
                                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                                            >
                                                <BoltIcon className="w-4 h-4" />
                                                Generate Now
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Existing Variants Table */}
                        <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white/90">
                                    Variants ({productVariants.length})
                                </h3>
                                {Object.keys(variantEdits).length > 0 && (
                                    <button
                                        onClick={handleSaveVariants}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <CheckCircleIcon className="w-4 h-4" />
                                        Save Changes ({Object.keys(variantEdits).length})
                                    </button>
                                )}
                            </div>

                            {productVariants.length === 0 ? (
                                <p className="py-8 text-sm text-center text-gray-400">
                                    No variants yet. Use the generator above to create combinations.
                                </p>
                            ) : (
                                console.log("productVariants", productVariants),
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                                            <tr>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Variant</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">SKU</th>
                                                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Price</th>
                                                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Compare Price</th>
                                                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Cost Per Item</th>
                                                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Qty</th>
                                                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Weight</th>
                                                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                            {productVariants.map((v) => {
                                                const edits = variantEdits[v.id] || {};
                                                return (
                                                    <tr key={v.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                                                        <td className="px-3 py-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium text-gray-800 dark:text-gray-200">{getVariantLabel(v)}</span>
                                                                {v.is_default && (
                                                                    <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">Default</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <input
                                                                type="text"
                                                                defaultValue={v.sku}
                                                                onChange={(e) => handleVariantFieldChange(v.id, "sku", e.target.value)}
                                                                className="w-32 px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded focus:ring-1 focus:ring-blue-500 outline-none"
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2 text-right">
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                defaultValue={v.price}
                                                                onChange={(e) => handleVariantFieldChange(v.id, "price", parseFloat(e.target.value))}
                                                                className="w-24 px-2 py-1 text-xs text-right border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded focus:ring-1 focus:ring-blue-500 outline-none"
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2 text-right">
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                defaultValue={v.compare_price}
                                                                onChange={(e) => handleVariantFieldChange(v.id, "compare_price", parseFloat(e.target.value))}
                                                                className="w-24 px-2 py-1 text-xs text-right border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded focus:ring-1 focus:ring-blue-500 outline-none"
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2 text-right">
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                defaultValue={v.cost_per_item}
                                                                onChange={(e) => handleVariantFieldChange(v.id, "cost_per_item", parseFloat(e.target.value))}
                                                                className="w-24 px-2 py-1 text-xs text-right border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded focus:ring-1 focus:ring-blue-500 outline-none"
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2 text-right">
                                                            <input
                                                                type="number"
                                                                defaultValue={v.quantity}
                                                                onChange={(e) => handleVariantFieldChange(v.id, "quantity", parseInt(e.target.value))}
                                                                className="w-20 px-2 py-1 text-xs text-right border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded focus:ring-1 focus:ring-blue-500 outline-none"
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2 text-right">
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                defaultValue={v.weight || ""}
                                                                onChange={(e) => handleVariantFieldChange(v.id, "weight", parseFloat(e.target.value))}
                                                                className="w-20 px-2 py-1 text-xs text-right border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded focus:ring-1 focus:ring-blue-500 outline-none"
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2 text-center">
                                                            <button
                                                                onClick={() => setDeleteVariantTarget(v)}
                                                                className="p-1 text-gray-400 rounded hover:text-red-600 hover:bg-red-50 transition-colors"
                                                                title="Delete variant"
                                                            >
                                                                <TrashIcon className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ===== TAB: MEDIA ===== */}
                {activeTab === "media" && isEdit && (
                    <div className="space-y-5">
                        <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl space-y-4">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white/90">Product Images</h3>

                            {/* Upload Drop Zone */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-blue-400 dark:hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-500/10 transition-colors"
                            >
                                <PhotoIcon className="w-10 h-10 text-gray-400" />
                                <div className="text-center">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Click to upload images</p>
                                    <p className="text-xs text-gray-400">JPEG, PNG, WebP — max 5MB each</p>
                                    <p className="text-xs text-gray-400">Recommended size: 400x400px</p>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </div>

                            {/* Image Grid */}
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                {currentProduct?.images?.map((img) => (
                                    <div
                                        key={img.id}
                                        className="relative overflow-hidden border border-gray-200 rounded-xl group aspect-square"
                                    >
                                        <img
                                            src={`${storageUrl}/${img.image_path}`}
                                            alt={img.alt_text || "Product image"}
                                            className="object-cover w-full h-full"
                                        />
                                        {/* Primary badge */}
                                        {img.is_primary ? (
                                            <div className="absolute top-2 left-2">
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-yellow-400 text-yellow-900 rounded-full">
                                                    <StarIconSolid className="w-3 h-3" />
                                                    Primary
                                                </span>
                                            </div>
                                        ) : null}
                                        {/* Overlay actions */}
                                        <div className="absolute inset-0 flex items-end justify-center gap-2 pb-3 transition-opacity opacity-0 bg-gradient-to-t from-black/60 via-transparent to-transparent group-hover:opacity-100">
                                            {!img.is_primary && (
                                                <button
                                                    onClick={() => handleSetPrimary(img.id)}
                                                    className="p-1.5 text-white bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors"
                                                    title="Set as primary"
                                                >
                                                    <StarIcon className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDeleteImage(img.id)}
                                                className="p-1.5 text-white bg-red-600/80 rounded-lg backdrop-blur-sm hover:bg-red-600 transition-colors"
                                                title="Delete"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {(!currentProduct?.images || currentProduct.images.length === 0) && (
                                <p className="py-6 text-sm text-center text-gray-400">No images uploaded yet.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Variant Confirmation */}
            <ConfirmationModal
                isOpen={!!deleteVariantTarget}
                title="Delete Variant"
                message={`Delete variant "${getVariantLabel(deleteVariantTarget || {})}"? This cannot be undone.`}
                confirmText="Delete"
                onConfirm={handleDeleteVariant}
                onClose={() => setDeleteVariantTarget(null)}
            />

            {/* Delete Image Confirmation */}
            <ConfirmationModal
                isOpen={!!deleteImageTarget}
                title="Delete Image"
                message="Are you sure you want to delete this image? This cannot be undone."
                confirmText="Delete"
                onConfirm={confirmDeleteImage}
                onClose={() => setDeleteImageTarget(null)}
            />
        </>
    );
};

export default ProductEditorPage;
