import { Outfit } from 'next/font/google';
import './globals.css';
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Providers } from '@/redux/provider';
import { Toaster } from 'react-hot-toast';

const outfit = Outfit({
  subsets: ["latin"]
});
export default function RootLayout({
  children
}) {
  return <html lang="en">
    <body className={`${outfit.className} dark:bg-gray-900`} suppressHydrationWarning={true}>
      <Providers>
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
      </Providers>
    </body>
  </html>;
}