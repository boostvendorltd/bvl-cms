import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchOrders = createAsyncThunk(
    'order/fetchOrders',
    async (params, { rejectWithValue }) => {
        try {
            const response = await api.get('/cms/orders', { params });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const fetchOrder = createAsyncThunk(
    'order/fetchOrder',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`/cms/orders/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const updateOrder = createAsyncThunk(
    'order/updateOrder',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/cms/orders/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const updateOrderStatus = createAsyncThunk(
    'order/updateStatus',
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/cms/orders/${id}/status`, { status });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

const initialState = {
    orders: [],
    currentOrder: null,
    pagination: { current_page: 1, last_page: 1, total: 0 },
    loading: false,
    error: null,
};

const orderSlice = createSlice({
    name: 'order',
    initialState,
    reducers: {
        clearCurrentOrder: (state) => {
            state.currentOrder = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload.data.data || [];
                state.pagination = {
                    current_page: action.payload.data.current_page,
                    last_page: action.payload.data.last_page,
                    total: action.payload.data.total,
                };
            })
            .addCase(fetchOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOrder = action.payload.data;
            })
            .addCase(fetchOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                const updatedOrder = action.payload.data;
                const index = state.orders.findIndex(o => o.id === updatedOrder.id);
                if (index !== -1) {
                    state.orders[index] = updatedOrder;
                }
                if (state.currentOrder?.id === updatedOrder.id) {
                    state.currentOrder = updatedOrder;
                }
            })
            .addCase(updateOrder.fulfilled, (state, action) => {
                const updatedOrder = action.payload.data;
                const index = state.orders.findIndex(o => o.id === updatedOrder.id);
                if (index !== -1) {
                    state.orders[index] = updatedOrder;
                }
                if (state.currentOrder?.id === updatedOrder.id) {
                    state.currentOrder = updatedOrder;
                }
            });
    },
});

export const { clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;
