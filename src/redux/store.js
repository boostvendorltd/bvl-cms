import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth-slice';
import hierarchyReducer from './features/hierarchy-slice';
import productReducer from './features/product-slice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        hierarchy: hierarchyReducer,
        product: productReducer,
    },
});
