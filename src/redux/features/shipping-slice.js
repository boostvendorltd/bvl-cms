import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchShippingMethods = createAsyncThunk(
    'shipping/fetchMethods',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/cms/shipping-methods');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const createShippingMethod = createAsyncThunk(
    'shipping/createMethod',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.post('/cms/shipping-methods', data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const updateShippingMethod = createAsyncThunk(
    'shipping/updateMethod',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/cms/shipping-methods/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const deleteShippingMethod = createAsyncThunk(
    'shipping/deleteMethod',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/cms/shipping-methods/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

const initialState = {
    methods: [],
    loading: false,
    error: null,
};

const shippingSlice = createSlice({
    name: 'shipping',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchShippingMethods.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchShippingMethods.fulfilled, (state, action) => {
                state.loading = false;
                state.methods = action.payload.data;
            })
            .addCase(fetchShippingMethods.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createShippingMethod.fulfilled, (state, action) => {
                state.methods.push(action.payload.data);
            })
            .addCase(updateShippingMethod.fulfilled, (state, action) => {
                const index = state.methods.findIndex(m => m.id === action.payload.data.id);
                if (index !== -1) {
                    state.methods[index] = action.payload.data;
                }
            })
            .addCase(deleteShippingMethod.fulfilled, (state, action) => {
                state.methods = state.methods.filter(m => m.id !== action.payload);
            });
    },
});

export default shippingSlice.reducer;
