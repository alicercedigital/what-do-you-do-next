import { StrictMode, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { Toaster, toast } from "sonner";

import "./globals.css";
import { api } from "./shared/lib/api";
import { ThemeProvider } from "./shared/components/theme-provider";
import { HomePage } from "./pages/home";
import { PlayPage } from "./pages/play";
import { UniverseListPage, UniverseEditorPage } from "./universe-manager";
import { LoginPage } from "./pages/auth/login";
import { RegisterPage } from "./pages/auth/register";
import { AuthCallbackPage } from "./pages/auth/callback";
import { ForgotPasswordPage } from "./pages/auth/forgot-password";
import { ResetPasswordPage } from "./pages/auth/reset-password";
import { VerifyEmailPage } from "./pages/auth/verify-email";
import { MarketplacePage } from "./pages/marketplace";
import { SearchPage } from "./pages/marketplace/search";
import { UniverseDetailPage } from "./pages/marketplace/universe-detail";
import { CreatorProfilePage } from "./pages/marketplace/creator-profile";
import { NotificationsPage } from "./pages/notifications";
import { LibraryPage } from "./pages/library";
import { StudioPage } from "./pages/studio";
import { AnalyticsPage } from "./pages/studio/analytics";
import { EarningsPage } from "./pages/studio/earnings";
import { ProfilePage } from "./pages/profile";
import { SettingsPage } from "./pages/profile/settings";
import { AuthGuard, GuestGuard } from "./shared/components/auth";
import { useAuthStore } from "./store/auth-store";
import { AppLayout } from "./shared/components/layouts";
import { SidebarLayout } from "./shared/components/layouts";
import { StudioSidebar } from "./shared/components/navigation";

// Root layout that initializes auth and checks API connectivity
function RootLayout() {
  const initialize = useAuthStore((state) => state.initialize);
  const toastIdRef = useRef<string | number | null>(null);
  const wasConnectedRef = useRef(true);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Check API connectivity on mount and periodically
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    const checkApiHealth = async () => {
      const result = await api.checkHealth();

      if (!result.ok) {
        wasConnectedRef.current = false;
        // Show persistent error toast if not already showing
        if (!toastIdRef.current) {
          toastIdRef.current = toast.error("Connection issue", {
            description: result.error,
            duration: Infinity,
            action: {
              label: "Retry",
              onClick: () => checkApiHealth(),
            },
          });
        }
      } else if (toastIdRef.current) {
        // API is back, dismiss error toast
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
        // Only show success if we were previously disconnected
        if (!wasConnectedRef.current) {
          toast.success("Connected");
          wasConnectedRef.current = true;
        }
      }
    };

    checkApiHealth();
    intervalId = setInterval(checkApiHealth, 10000);

    return () => clearInterval(intervalId);
  }, []);

  return <Outlet />;
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // Auth routes (guest only) - NO navigation
      {
        element: <GuestGuard />,
        children: [
          { path: "/login", element: <LoginPage /> },
          { path: "/register", element: <RegisterPage /> },
          { path: "/forgot-password", element: <ForgotPasswordPage /> },
        ],
      },
      // Auth routes (public) - NO navigation
      { path: "/auth/callback", element: <AuthCallbackPage /> },
      { path: "/reset-password", element: <ResetPasswordPage /> },
      { path: "/verify-email", element: <VerifyEmailPage /> },

      // Play page - uses GameHeader (unchanged)
      { path: "/play", element: <PlayPage /> },

      // Routes with AppLayout (TopBar only)
      {
        element: <AppLayout />,
        children: [
          // Public routes
          { path: "/", element: <HomePage /> },
          { path: "/marketplace", element: <MarketplacePage /> },
          { path: "/marketplace/search", element: <SearchPage /> },
          { path: "/marketplace/universe/:id", element: <UniverseDetailPage /> },
          { path: "/marketplace/creator/:username", element: <CreatorProfilePage /> },

          // Protected routes with TopBar only
          {
            element: <AuthGuard />,
            children: [
              { path: "/library", element: <LibraryPage /> },
              { path: "/notifications", element: <NotificationsPage /> },
              { path: "/profile", element: <ProfilePage /> },
              { path: "/profile/settings", element: <SettingsPage /> },
              { path: "/universes", element: <UniverseListPage /> },
              { path: "/universes/:id", element: <UniverseEditorPage /> },
            ],
          },
        ],
      },

      // Studio routes (TopBar + Sidebar)
      {
        element: <AuthGuard />,
        children: [
          {
            element: <SidebarLayout sidebar={<StudioSidebar />} />,
            children: [
              { path: "/studio", element: <StudioPage /> },
              { path: "/studio/analytics", element: <AnalyticsPage /> },
              { path: "/studio/earnings", element: <EarningsPage /> },
            ],
          },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="dark">
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  </StrictMode>
);
