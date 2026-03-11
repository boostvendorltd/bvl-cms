import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

const initialState = {
    partners: [],
    partnersList: [],
    currentPartnerAccounts: [],
    currentAccountShops: [],
    currentShopCustomers: [],
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

export const fetchPartnersList = createAsyncThunk(
    "hierarchy/fetchPartnersList",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/cms/partners/list");
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch partners list");
        }
    }
);

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
            return rejectWithValue(error.response?.data || error.message || "Failed to create partner");
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
            return rejectWithValue(error.response?.data || error.message || "Failed to update partner");
        }
    }
);

export const togglePartnerStatus = createAsyncThunk(
    "hierarchy/togglePartnerStatus",
    async (arg, { rejectWithValue }) => {
        try {
            const id = typeof arg === 'object' ? arg.id : arg;
            const response = await api.put(`/cms/partners/${id}/status`);
            return { id, status: response.data.status };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to toggle status");
        }
    }
);

export const approvePartner = createAsyncThunk(
    "hierarchy/approvePartner",
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.put(`/cms/partners/${id}/approve`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message || "Failed to approve partner");
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
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to approve account");
        }
    }
);

export const toggleAccountStatus = createAsyncThunk(
    "hierarchy/toggleAccountStatus",
    async (arg, { rejectWithValue }) => {
        try {
            const id = typeof arg === 'object' ? arg.id : arg;
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
            const response = await api.post(`/cms/shops/${id}`, data);
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
    async (arg, { rejectWithValue }) => {
        try {
            const id = typeof arg === 'object' ? arg.id : arg;
            const response = await api.put(`/cms/shops/${id}/status`);
            return { id, status: response.data.status };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to toggle status");
        }
    }
);

// --- Customers ---

export const fetchShopCustomers = createAsyncThunk(
    "hierarchy/fetchShopCustomers",
    async ({ shopId, page = 1, limit = 10, search = '', status = '' }, { rejectWithValue }) => {
        try {
            const query = new URLSearchParams({ page, limit, search, status }).toString();
            const response = await api.get(`/cms/shops/${shopId}/customers?${query}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch customers");
        }
    }
);

export const bulkDeleteCustomers = createAsyncThunk(
    "hierarchy/bulkDeleteCustomers",
    async ({ shopId, ids }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/cms/shops/${shopId}/customers/bulk-delete`, { ids });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to delete customers");
        }
    }
);

export const bulkUpdateCustomerStatus = createAsyncThunk(
    "hierarchy/bulkUpdateCustomerStatus",
    async ({ shopId, ids, status }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/cms/shops/${shopId}/customers/bulk-status`, { ids, status });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to update customers status");
        }
    }
);

export const createCustomer = createAsyncThunk(
    "hierarchy/createCustomer",
    async ({ shopId, data }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/cms/shops/${shopId}/customers`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to create customer");
        }
    }
);

export const updateCustomer = createAsyncThunk(
    "hierarchy/updateCustomer",
    async ({ shopId, id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/cms/shops/${shopId}/customers/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to update customer");
        }
    }
);

export const toggleCustomerStatus = createAsyncThunk(
    "hierarchy/toggleCustomerStatus",
    async ({ shopId, id, status }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/cms/shops/${shopId}/customers/${id}/status`, { status });
            return { id, status: response.data.status };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to toggle status");
        }
    }
);

// Aliases for backward compatibility or singular actions using bulk
export const deletePartner = bulkDeletePartners;
export const deleteAccount = bulkDeleteAccounts;
export const deleteShop = bulkDeleteShops;
export const deleteCustomer = bulkDeleteCustomers;

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
            .addCase(fetchPartnersList.fulfilled, (state, action) => {
                state.partnersList = action.payload;
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
            .addCase(togglePartnerStatus.fulfilled, (state, action) => {
                const partner = state.partners.find(p => p.id === action.payload.id);
                if (partner && partner.user) {
                    partner.user.status = action.payload.status;
                }
            })
            .addCase(approvePartner.fulfilled, (state, action) => {
                const partner = state.partners.find(p => p.id === action.payload.id);
                if (partner && partner.user) {
                    partner.user.is_approved = 1;
                    partner.user.status = 1; // Usually approved means active
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
            .addCase(toggleAccountStatus.fulfilled, (state, action) => {
                const account = state.currentPartnerAccounts.find(a => a.id === action.payload.id);
                if (account && account.user) {
                    account.user.status = action.payload.status;
                }
            })
            .addCase(approveAccount.fulfilled, (state, action) => {
                const account = state.currentPartnerAccounts.find(a => a.id === action.payload.id);
                if (account && account.user) {
                    account.user.is_approved = 1;
                    account.user.status = 1;
                }
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
            .addCase(toggleShopStatus.fulfilled, (state, action) => {
                const shop = state.currentAccountShops.find(s => s.id === action.payload.id);
                if (shop) {
                    shop.status = action.payload.status;
                }
            })
            .addCase(approveShop.fulfilled, (state, action) => {
                const shop = state.currentAccountShops.find(s => s.id === action.payload.id);
                if (shop) {
                    shop.is_approved = 1;
                    shop.status = 1;
                }
            })
            // Customers
            .addCase(fetchShopCustomers.pending, (state) => { state.isLoading = true; })
            .addCase(fetchShopCustomers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentShopCustomers = action.payload.data;
                state.pagination = {
                    total: action.payload.total,
                    current_page: action.payload.current_page,
                    last_page: action.payload.last_page
                };
            })
            .addCase(createCustomer.fulfilled, (state, action) => {
                state.currentShopCustomers.unshift(action.payload.data);
            })
            .addCase(updateCustomer.fulfilled, (state, action) => {
                const index = state.currentShopCustomers.findIndex(c => c.id === action.payload.data.id);
                if (index !== -1) {
                    state.currentShopCustomers[index] = action.payload.data;
                }
            })
            .addCase(toggleCustomerStatus.fulfilled, (state, action) => {
                const customer = state.currentShopCustomers.find(c => c.id === action.payload.id);
                if (customer) {
                    customer.status = action.payload.status;
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
