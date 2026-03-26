import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/utils/api";

// --- TAXES ---
export const fetchTaxes = createAsyncThunk(
    "ecommerce/fetchTaxes",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/cms/taxes");
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch taxes");
        }
    }
);

export const createTax = createAsyncThunk(
    "ecommerce/createTax",
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.post("/cms/taxes", data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to create tax");
        }
    }
);

export const updateTax = createAsyncThunk(
    "ecommerce/updateTax",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/cms/taxes/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to update tax");
        }
    }
);

export const deleteTax = createAsyncThunk(
    "ecommerce/deleteTax",
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/cms/taxes/${id}`);
            return { id, message: response.data.message };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to delete tax");
        }
    }
);

export const toggleTaxStatus = createAsyncThunk(
    "ecommerce/toggleTaxStatus",
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.put(`/cms/taxes/${id}/status`);
            return { id, is_active: response.data.is_active };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to toggle tax status");
        }
    }
);

// --- DISCOUNTS ---
export const fetchDiscounts = createAsyncThunk(
    "ecommerce/fetchDiscounts",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/cms/discounts");
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch discounts");
        }
    }
);

export const createDiscount = createAsyncThunk(
    "ecommerce/createDiscount",
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.post("/cms/discounts", data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to create discount");
        }
    }
);

export const updateDiscount = createAsyncThunk(
    "ecommerce/updateDiscount",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/cms/discounts/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to update discount");
        }
    }
);

export const deleteDiscount = createAsyncThunk(
    "ecommerce/deleteDiscount",
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/cms/discounts/${id}`);
            return { id, message: response.data.message };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to delete discount");
        }
    }
);

export const toggleDiscountStatus = createAsyncThunk(
    "ecommerce/toggleDiscountStatus",
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.put(`/cms/discounts/${id}/status`);
            return { id, status: response.data.status };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to toggle discount status");
        }
    }
);

const ecommerceSlice = createSlice({
    name: "ecommerce",
    initialState: {
        taxes: [],
        discounts: [],
        loading: false,
        error: null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // --- Taxes ---
            .addCase(fetchTaxes.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchTaxes.fulfilled, (state, action) => {
                state.loading = false;
                state.taxes = action.payload.data;
            })
            .addCase(fetchTaxes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // --- Discounts ---
            .addCase(fetchDiscounts.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchDiscounts.fulfilled, (state, action) => {
                state.loading = false;
                state.discounts = action.payload.data;
            })
            .addCase(fetchDiscounts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError } = ecommerceSlice.actions;
export default ecommerceSlice.reducer;
