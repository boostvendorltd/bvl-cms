import { Outfit } from 'next/font/google';
import './globals.css';
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Providers } from '@/redux/provider';
import { Toaster } from 'react-hot-toast';

import { I18nProvider } from '@/components/providers/I18nProvider';

const outfit = Outfit({
  subsets: ["latin"]
});
export default function RootLayout({
  children
}) {
  return <html lang="en">
    <body className={`${outfit.className} dark:bg-gray-900`} suppressHydrationWarning={true}>
      <Providers>
        <I18nProvider>
          <Toaster
            position="top-right"
            containerStyle={{
              zIndex: 100000,
            }}
            toastOptions={{
              className: 'dark:bg-gray-800 dark:text-white',
            }}
          />
          <ThemeProvider>
            <SidebarProvider>{children}</SidebarProvider>
          </ThemeProvider>
        </I18nProvider>
      </Providers>
    </body>
  </html>;
}