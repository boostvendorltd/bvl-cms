import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
};

export const fetchUserProfile = createAsyncThunk(
    "auth/fetchUserProfile",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/user");
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch user");
        }
    }
);

export const login = createAsyncThunk(
    "auth/login",
    async (credentials, { rejectWithValue, dispatch }) => {
        try {
            const rootUrl = api.defaults.baseURL.replace('/api/v1', '');
            await api.get("/sanctum/csrf-cookie", { baseURL: rootUrl });

            await api.post("/login", credentials);
            return await dispatch(fetchUserProfile()).unwrap();
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Login failed");
        }
    }
);

export const updateProfile = createAsyncThunk(
    "auth/updateProfile",
    async (userData, { rejectWithValue }) => {
        try {
            const response = await api.post("/cms/profile/update", userData);
            return response.data.user;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to update profile");
        }
    }
);

export const logout = createAsyncThunk(
    "auth/logout",
    async (_, { rejectWithValue }) => {
        try {
            await api.post("/logout");
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Logout failed");
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = true;
            state.isLoading = false;
        },
        clearAuth: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.isLoading = false;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserProfile.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.user = action.payload;
                state.isAuthenticated = true;
                state.isLoading = false;
            })
            .addCase(fetchUserProfile.rejected, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.isLoading = false;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.user = action.payload;
                state.isLoading = false;
            })
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.isLoading = false;
                state.error = null;
            });
    }
});

export const { setUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;
