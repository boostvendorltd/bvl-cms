import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

const initialState = {
    partners: [],
    currentPartnerAccounts: [],
    currentAccountShops: [],
    shopTypes: [],
    isLoading: false,
    error: null,
    pagination: {
        total: 0,
        current_page: 1,
        last_page: 1
    }
};

// --- Partners ---

export const fetchPartners = createAsyncThunk(
    "hierarchy/fetchPartners",
    async ({ page = 1, limit = 10, search = '', status = '' } = {}, { rejectWithValue }) => {
        try {
            const query = new URLSearchParams({ page, limit, search, status }).toString();
            const response = await api.get(`/cms/partners?${query}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch partners");
        }
    }
);

export const bulkDeletePartners = createAsyncThunk(
    "hierarchy/bulkDeletePartners",
    async (ids, { rejectWithValue }) => {
        try {
            const response = await api.post("/cms/partners/bulk-delete", { ids });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to delete partners");
        }
    }
);

export const bulkUpdatePartnerStatus = createAsyncThunk(
    "hierarchy/bulkUpdatePartnerStatus",
    async ({ ids, status }, { rejectWithValue }) => {
        try {
            const response = await api.post("/cms/partners/bulk-status", { ids, status });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to update partners status");
        }
    }
);

export const createPartner = createAsyncThunk(
    "hierarchy/createPartner",
    async (partnerData, { rejectWithValue }) => {
        try {
            const response = await api.post("/cms/partners", partnerData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to create partner");
        }
    }
);

export const updatePartner = createAsyncThunk(
    "hierarchy/updatePartner",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/cms/partners/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to update partner");
        }
    }
);

export const togglePartnerStatus = createAsyncThunk(
    "hierarchy/togglePartnerStatus",
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.put(`/cms/partners/${id}/status`);
            return { id, status: response.data.status };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to toggle status");
        }
    }
);

// --- Accounts ---

export const fetchPartnerAccounts = createAsyncThunk(
    "hierarchy/fetchPartnerAccounts",
    async ({ partnerId, page = 1, limit = 10, search = '', status = '' }, { rejectWithValue }) => {
        try {
            const query = new URLSearchParams({ page, limit, search, status }).toString();
            const response = await api.get(`/cms/partners/${partnerId}/accounts?${query}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch accounts");
        }
    }
);

export const bulkDeleteAccounts = createAsyncThunk(
    "hierarchy/bulkDeleteAccounts",
    async ({ partnerId, ids }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/cms/partners/${partnerId}/accounts/bulk-delete`, { ids });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to delete accounts");
        }
    }
);

export const bulkUpdateAccountStatus = createAsyncThunk(
    "hierarchy/bulkUpdateAccountStatus",
    async ({ partnerId, ids, status }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/cms/partners/${partnerId}/accounts/bulk-status`, { ids, status });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to update accounts status");
        }
    }
);

export const createAccount = createAsyncThunk(
    "hierarchy/createAccount",
    async ({ partnerId, data }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/cms/partners/${partnerId}/accounts`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to create account");
        }
    }
);

export const updateAccount = createAsyncThunk(
    "hierarchy/updateAccount",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/cms/accounts/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to update account");
        }
    }
);

export const approveAccount = createAsyncThunk(
    "hierarchy/approveAccount",
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.put(`/cms/accounts/${id}/approve`);
            return response.data; // Only returns message
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to approve account");
        }
    }
);

export const toggleAccountStatus = createAsyncThunk(
    "hierarchy/toggleAccountStatus",
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.put(`/cms/accounts/${id}/status`);
            return { id, status: response.data.status };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to toggle status");
        }
    }
);

// --- Shops ---

export const fetchAccountShops = createAsyncThunk(
    "hierarchy/fetchAccountShops",
    async ({ accountId, page = 1, limit = 10, search = '', status = '' }, { rejectWithValue }) => {
        try {
            const query = new URLSearchParams({ page, limit, search, status }).toString();
            const response = await api.get(`/cms/accounts/${accountId}/shops?${query}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch shops");
        }
    }
);

export const bulkDeleteShops = createAsyncThunk(
    "hierarchy/bulkDeleteShops",
    async ({ accountId, ids }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/cms/accounts/${accountId}/shops/bulk-delete`, { ids });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to delete shops");
        }
    }
);

export const bulkUpdateShopStatus = createAsyncThunk(
    "hierarchy/bulkUpdateShopStatus",
    async ({ accountId, ids, status }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/cms/accounts/${accountId}/shops/bulk-status`, { ids, status });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to update shops status");
        }
    }
);

export const createShop = createAsyncThunk(
    "hierarchy/createShop",
    async ({ accountId, data }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/cms/accounts/${accountId}/shops`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to create shop");
        }
    }
);

export const updateShop = createAsyncThunk(
    "hierarchy/updateShop",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/cms/shops/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to update shop");
        }
    }
);

export const approveShop = createAsyncThunk(
    "hierarchy/approveShop",
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.put(`/cms/shops/${id}/approve`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to approve shop");
        }
    }
);

export const toggleShopStatus = createAsyncThunk(
    "hierarchy/toggleShopStatus",
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.put(`/cms/shops/${id}/status`);
            return { id, status: response.data.status };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to toggle status");
        }
    }
);

export const fetchShopTypes = createAsyncThunk(
    "hierarchy/fetchShopTypes",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/cms/shop-types");
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch shop types");
        }
    }
);


const hierarchySlice = createSlice({
    name: "hierarchy",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Partners
            .addCase(fetchPartners.pending, (state) => { state.isLoading = true; })
            .addCase(fetchPartners.fulfilled, (state, action) => {
                state.isLoading = false;
                state.partners = action.payload.data;
                state.pagination = {
                    total: action.payload.total,
                    current_page: action.payload.current_page,
                    last_page: action.payload.last_page
                };
            })
            .addCase(fetchPartners.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(createPartner.fulfilled, (state, action) => {
                state.partners.unshift(action.payload.data);
            })
            .addCase(updatePartner.fulfilled, (state, action) => {
                const index = state.partners.findIndex(p => p.id === action.payload.data.id);
                if (index !== -1) {
                    state.partners[index] = action.payload.data;
                }
            })
            // Accounts
            .addCase(fetchPartnerAccounts.pending, (state) => { state.isLoading = true; })
            .addCase(fetchPartnerAccounts.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentPartnerAccounts = action.payload.data;
                state.pagination = {
                    total: action.payload.total,
                    current_page: action.payload.current_page,
                    last_page: action.payload.last_page
                };
            })
            .addCase(createAccount.fulfilled, (state, action) => {
                state.currentPartnerAccounts.unshift(action.payload.data);
            })
            .addCase(updateAccount.fulfilled, (state, action) => {
                const index = state.currentPartnerAccounts.findIndex(a => a.id === action.payload.data.id);
                if (index !== -1) {
                    state.currentPartnerAccounts[index] = action.payload.data;
                }
            })
            .addCase(approveAccount.fulfilled, (state, action) => {
                // We'd ideally need the ID in the payload to update state locally without refetch
                // But for now, we usually dispatch fetchPartnerAccounts again or handle it in UI
            })
            // Shops
            .addCase(fetchAccountShops.pending, (state) => { state.isLoading = true; })
            .addCase(fetchAccountShops.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentAccountShops = action.payload.data;
                state.pagination = {
                    total: action.payload.total,
                    current_page: action.payload.current_page,
                    last_page: action.payload.last_page
                };
            })
            .addCase(createShop.fulfilled, (state, action) => {
                state.currentAccountShops.unshift(action.payload.data);
            })
            .addCase(updateShop.fulfilled, (state, action) => {
                const index = state.currentAccountShops.findIndex(s => s.id === action.payload.data.id);
                if (index !== -1) {
                    state.currentAccountShops[index] = action.payload.data;
                }
            })
            // Shop Types
            .addCase(fetchShopTypes.fulfilled, (state, action) => {
                state.shopTypes = action.payload;
            });
    }
});

export const { clearError } = hierarchySlice.actions;
export default hierarchySlice.reducer;
