import { Outfit } from 'next/font/google';
import './globals.css';
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Providers } from '@/redux/provider';

const outfit = Outfit({
  subsets: ["latin"]
});
export default function RootLayout({
  children
}) {
  return <html lang="en">
    <body className={`${outfit.className} dark:bg-gray-900`} suppressHydrationWarning={true}>
      <Providers>
        <ThemeProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </ThemeProvider>
      </Providers>
    </body>
  </html>;
}