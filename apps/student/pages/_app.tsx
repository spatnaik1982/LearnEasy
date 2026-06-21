import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import { AuthProvider, useAuth } from "../lib/auth";
import { SensoryProfileProvider } from "../lib/SensoryProfileContext";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

const PUBLIC_ROUTES = ["/login", "/signup", "/calm-zone", "/playground"];

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const redirected = useRef(false);

  const isPublic = PUBLIC_ROUTES.includes(router.pathname);

  useEffect(() => {
    if (isLoading) return;
    if (redirected.current) return;

    if (!isPublic && !isAuthenticated) {
      redirected.current = true;
      router.replace("/login");
    } else if (isPublic && isAuthenticated && router.pathname !== "/calm-zone" && router.pathname !== "/playground") {
      redirected.current = true;
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, isPublic, router, router.pathname]);

  if (isLoading || (!isAuthenticated && !isPublic)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-warm-off-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-soft-blue border-t-transparent" />
          <p className="text-sm text-on-surface-variant">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={inter.variable}>
      <AuthProvider>
        <SensoryProfileProvider>
          <AuthGuard>
            <Component {...pageProps} />
          </AuthGuard>
        </SensoryProfileProvider>
      </AuthProvider>
    </div>
  );
}
