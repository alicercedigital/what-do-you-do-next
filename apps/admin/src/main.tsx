import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import "./globals.css";

import { RootLayout } from "./components/layouts/root-layout";
import { AdminGuard } from "./shared/components/admin-guard";
import { AdminLayout } from "./components/layouts/admin-layout";
import { LoginPage } from "./features/auth/login-page";
import { DashboardPage } from "./features/dashboard";
import { ConfigPage } from "./features/config";
import { UsersPage } from "./features/users";
import { UserDetailPage } from "./features/users/user-detail";
import { UniversesPage } from "./features/universes";
import { EconomyPage } from "./features/economy";
import { ModerationPage } from "./features/moderation";
import { AuditPage } from "./features/audit";

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // 30 seconds
      retry: 1,
    },
  },
});

// Create router
const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // Login page (public)
      {
        path: "/login",
        element: <LoginPage />,
      },

      // Protected admin routes
      {
        element: <AdminGuard />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { index: true, element: <DashboardPage /> },
              { path: "config", element: <ConfigPage /> },
              { path: "users", element: <UsersPage /> },
              { path: "users/:userId", element: <UserDetailPage /> },
              { path: "universes", element: <UniversesPage /> },
              { path: "economy", element: <EconomyPage /> },
              { path: "moderation", element: <ModerationPage /> },
              { path: "audit", element: <AuditPage /> },
            ],
          },
        ],
      },

      // Catch-all redirect
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  </React.StrictMode>
);
