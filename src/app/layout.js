import { Outfit } from 'next/font/google';
import './globals.css';
import { SidebarProvider } from '@/(template)/context/SidebarContext';
import { ThemeProvider } from '@/(template)/context/ThemeContext';
import { Providers } from '@/(template)/redux/provider';

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