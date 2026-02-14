import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// --- Attributes ---

export const fetchAttributes = createAsyncThunk(
    'product/fetchAttributes',
    async (params, { rejectWithValue }) => {
        try {
            const response = await api.get('/cms/attributes', { params });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const createAttribute = createAsyncThunk(
    'product/createAttribute',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.post('/cms/attributes', data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const updateAttribute = createAsyncThunk(
    'product/updateAttribute',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/cms/attributes/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const deleteAttribute = createAsyncThunk(
    'product/deleteAttribute',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/cms/attributes/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const addAttributeValue = createAsyncThunk(
    'product/addAttributeValue',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/cms/attributes/${id}/values`, data);
            return { attributeId: id, value: response.data };
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const deleteAttributeValue = createAsyncThunk(
    'product/deleteAttributeValue',
    async ({ id, valueId }, { rejectWithValue }) => {
        try {
            await api.delete(`/cms/attributes/${id}/values/${valueId}`);
            return { attributeId: id, valueId };
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

// --- Categories ---

export const fetchCategories = createAsyncThunk(
    'product/fetchCategories',
    async (params, { rejectWithValue }) => {
        try {
            const response = await api.get('/cms/categories', { params });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const createCategory = createAsyncThunk(
    'product/createCategory',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.post('/cms/categories', data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const updateCategory = createAsyncThunk(
    'product/updateCategory',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/cms/categories/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const deleteCategory = createAsyncThunk(
    'product/deleteCategory',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/cms/categories/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

// --- Products ---

export const fetchProducts = createAsyncThunk(
    'product/fetchProducts',
    async (params, { rejectWithValue }) => {
        try {
            const response = await api.get('/cms/products', { params });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const fetchProduct = createAsyncThunk(
    'product/fetchProduct',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`/cms/products/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const createProduct = createAsyncThunk(
    'product/createProduct',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.post('/cms/products', data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const updateProduct = createAsyncThunk(
    'product/updateProduct',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/cms/products/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const deleteProduct = createAsyncThunk(
    'product/deleteProduct',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/cms/products/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const duplicateProduct = createAsyncThunk(
    'product/duplicateProduct',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.post(`/cms/products/${id}/duplicate`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const bulkUpdateProductStatus = createAsyncThunk(
    'product/bulkUpdateStatus',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.post('/cms/products/bulk-status', data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

// --- Product Images ---

export const uploadProductImages = createAsyncThunk(
    'product/uploadImages',
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/cms/products/${id}/images`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const deleteProductImage = createAsyncThunk(
    'product/deleteImage',
    async ({ productId, imageId }, { rejectWithValue }) => {
        try {
            await api.delete(`/cms/products/${productId}/images/${imageId}`);
            return { productId, imageId };
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const setPrimaryImage = createAsyncThunk(
    'product/setPrimaryImage',
    async ({ productId, imageId }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/cms/products/${productId}/images/${imageId}/primary`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

// --- Variants ---

export const generateVariants = createAsyncThunk(
    'product/generateVariants',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/cms/products/${id}/generate-variants`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const bulkUpdateVariants = createAsyncThunk(
    'product/bulkUpdateVariants',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/cms/products/${id}/variants`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const deleteVariant = createAsyncThunk(
    'product/deleteVariant',
    async ({ productId, variantId }, { rejectWithValue }) => {
        try {
            await api.delete(`/cms/products/${productId}/variants/${variantId}`);
            return { productId, variantId };
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const updateDefaultVariant = createAsyncThunk(
    'product/updateDefaultVariant',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/cms/products/${id}/variant`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

const initialState = {
    attributes: [],
    categories: [],
    flatCategories: [],
    products: [],
    currentProduct: null,
    pagination: { current_page: 1, last_page: 1, total: 0 },
    loading: false,
    error: null,
};

const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
        clearCurrentProduct: (state) => {
            state.currentProduct = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Attributes
            .addCase(fetchAttributes.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchAttributes.fulfilled, (state, action) => {
                state.loading = false;
                state.attributes = action.payload;
            })
            .addCase(fetchAttributes.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            .addCase(createAttribute.fulfilled, (state, action) => { state.attributes.unshift(action.payload); })
            .addCase(updateAttribute.fulfilled, (state, action) => {
                const i = state.attributes.findIndex((a) => a.id === action.payload.id);
                if (i !== -1) state.attributes[i] = action.payload;
            })
            .addCase(deleteAttribute.fulfilled, (state, action) => {
                state.attributes = state.attributes.filter((a) => a.id !== action.payload);
            })
            .addCase(addAttributeValue.fulfilled, (state, action) => {
                const attr = state.attributes.find((a) => a.id == action.payload.attributeId);
                if (attr) { if (!attr.values) attr.values = []; attr.values.push(action.payload.value); }
            })
            .addCase(deleteAttributeValue.fulfilled, (state, action) => {
                const attr = state.attributes.find((a) => a.id == action.payload.attributeId);
                if (attr?.values) attr.values = attr.values.filter((v) => v.id !== action.payload.valueId);
            })

            // Categories
            .addCase(fetchCategories.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.loading = false;
                const isFlat = action.meta.arg?.flat;
                if (isFlat) { state.flatCategories = action.payload; }
                else { state.categories = action.payload; }
            })
            .addCase(fetchCategories.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            .addCase(createCategory.fulfilled, (state, action) => {
                if (state.flatCategories.length > 0) state.flatCategories.push(action.payload);
            })

            // Products List
            .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.products = action.payload.data || [];
                state.pagination = {
                    current_page: action.payload.current_page,
                    last_page: action.payload.last_page,
                    total: action.payload.total,
                };
            })
            .addCase(fetchProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            // Single Product
            .addCase(fetchProduct.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.currentProduct = action.payload;
            })
            .addCase(fetchProduct.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            .addCase(createProduct.fulfilled, (state, action) => {
                state.currentProduct = action.payload;
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                state.currentProduct = action.payload;
            })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.products = state.products.filter((p) => p.id !== action.payload);
            })
            .addCase(duplicateProduct.fulfilled, (state, action) => {
                state.products.unshift(action.payload);
            })

            // Variants
            .addCase(generateVariants.fulfilled, (state, action) => {
                if (state.currentProduct) {
                    state.currentProduct.variants = action.payload.variants;
                }
            })
            .addCase(bulkUpdateVariants.fulfilled, (state, action) => {
                if (state.currentProduct) {
                    state.currentProduct.variants = action.payload.variants;
                }
            })
            .addCase(deleteVariant.fulfilled, (state, action) => {
                if (state.currentProduct?.variants) {
                    state.currentProduct.variants = state.currentProduct.variants.filter(
                        (v) => v.id !== action.payload.variantId
                    );
                }
            });
    },
});

export const { clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;
