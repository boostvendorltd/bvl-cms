'use client';

import { Provider } from 'react-redux';
import { store } from './store';
import '@/i18n/config';


export function Providers({ children }) {
    return <Provider store={store}>{children}</Provider>;
}
