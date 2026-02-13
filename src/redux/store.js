import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth-slice';
import hierarchyReducer from './features/hierarchy-slice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        hierarchy: hierarchyReducer,
    },
});
