import type { Metadata } from "next";
import "./globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

export const metadata = {
  title: {
    template: '%s | tookdeal',
    default: 'tookdeal - Best Online Shop',
  },
  description: "Best Online Shop",
  icons: [
    { rel: "icon", url: "/images/logo.png", type: "image/png" },
    { rel: "apple-touch-icon", url: "/images/logo.png" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="flex h-full bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100">
        <GoogleOAuthProvider clientId="1095070458596-asas5uaojdujd3712lcqq8ngjcv328ri.apps.googleusercontent.com">
          <div className="flex-1 flex flex-col min-h-screen">
            <main className="flex-1 bg-white dark:bg-zinc-950 md:p-6">{children}</main>
          </div>
        </GoogleOAuthProvider>
        <script
          src="https://accounts.google.com/gsi/client"
          async
          defer
        ></script>
      </body>
    </html>
  );
}