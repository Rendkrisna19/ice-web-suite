import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "react-hot-toast";
import SplashScreen from "@/components/SplashScreen";

import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Delivery App",
  description: "Merchant & Driver App",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        {/* 1. TAILWIND CDN */}
        <script src="https://cdn.tailwindcss.com"></script>
        
        {/* 2. TAILWIND CONFIG (LENGKAP SESUAI PERMINTAAN) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                theme: {
                  extend: {
                    colors: {
                      // PRIMARY: Deep Forest
                      primary: {
                        DEFAULT: '#1A534B', 
                        50:  '#F2F7F6',
                        100: '#E1EBE9',
                        200: '#C2D6D3',
                        300: '#9FBDB8',
                        400: '#7DA39D',
                        500: '#1A534B', 
                        600: '#15423C',
                        700: '#10322D',
                        800: '#0B211E',
                        900: '#05110F',
                        foreground: '#ffffff',
                      },
                      // SECONDARY: Timberwolf
                      secondary: {
                        DEFAULT: '#C7B198',
                        50:  '#FCFAF8',
                        100: '#F9F5F1',
                        200: '#EFE6DE',
                        300: '#E5D8CA',
                        400: '#DBC9B6',
                        500: '#C7B198', 
                        600: '#9F8E7A',
                        700: '#776A5B',
                        800: '#50473D',
                        900: '#28231E',
                        foreground: '#1A534B',
                      },
                      // SURFACE: Alabaster
                      surface: {
                        DEFAULT: '#F0ECE4',
                        50:  '#FFFFFF',
                        100: '#FFFFFF', // Card White
                        200: '#F8F6F2',
                        300: '#F0ECE4', // Background App
                        400: '#DCD6C8',
                        500: '#C8C0B0',
                        600: '#A09680',
                        700: '#787060',
                        800: '#504840',
                        900: '#282420',
                      },
                      // NEUTRAL
                      neutral: {
                        DEFAULT: '#4B5563',
                        50:  '#F9FAFB',
                        100: '#F3F4F6',
                        200: '#E5E7EB',
                        300: '#D1D5DB',
                        400: '#9CA3AF',
                        500: '#6B7280',
                        600: '#4B5563',
                        700: '#374151',
                        800: '#1F2937',
                        900: '#111827',
                      },
                      // FUNCTIONAL
                      success: {
                        DEFAULT: '#22C55E',
                        100: '#DCFCE7',
                        500: '#22C55E',
                        700: '#15803D',
                      },
                      danger: {
                        DEFAULT: '#EF4444',
                        100: '#FEE2E2',
                        500: '#EF4444',
                        700: '#B91C1C',
                      },
                      warning: {
                        DEFAULT: '#F59E0B',
                        100: '#FEF3C7',
                        500: '#F59E0B',
                        700: '#B45309',
                      },
                    },
                    fontFamily: {
                      sans: ['var(--font-poppins)', 'sans-serif'],
                    }
                  }
                }
              }
            `,
          }}
        />
      </head>
      
      <body className={`${poppins.variable} font-sans bg-surface-300 text-neutral-600 antialiased`}>
        {/* 3. SPLASH SCREEN (Muncul diawal) */}
        <SplashScreen />

        {/* 4. Toaster Library (Alert) */}
        <Toaster 
          position="top-center" 
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
              zIndex: 9999,
              borderRadius: '12px',
              padding: '16px',
            },
            success: {
              style: {
                background: '#1A534B', // Primary-500
                color: '#fff',
                boxShadow: '0 4px 12px rgba(26, 83, 75, 0.3)',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#1A534B',
              },
            },
            error: {
              style: {
                background: '#EF4444', // Danger
                color: '#fff',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
              }
            }
          }}
        />
        
        {/* 5. Main Content */}
        {children}
      </body>
    </html>
  );
}
