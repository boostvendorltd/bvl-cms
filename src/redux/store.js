import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth-slice';
import hierarchyReducer from './features/hierarchy-slice';
import productReducer from './features/product-slice';
import ecommerceReducer from './features/ecommerce-slice';
import orderReducer from './features/order-slice';
import shippingReducer from './features/shipping-slice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        hierarchy: hierarchyReducer,
        product: productReducer,
        ecommerce: ecommerceReducer,
        order: orderReducer,
        shipping: shippingReducer,
    },
});
