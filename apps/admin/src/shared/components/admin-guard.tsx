import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAdminAuthStore } from "@/store/admin-auth-store";
import { Loader2 } from "lucide-react";

/**
 * Route guard that requires admin authentication
 */
export function AdminGuard() {
  const location = useLocation();
  const { session, profile, isLoading, isInitialized } = useAdminAuthStore();

  // Show loading while initializing
  if (!isInitialized || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to login if not admin
  if (!profile?.is_admin) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <svg
              className="h-8 w-8 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold">Access Denied</h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            You don't have permission to access the admin panel. Please contact
            an administrator if you believe this is an error.
          </p>
          <a
            href="/"
            className="mt-4 text-sm text-primary hover:underline"
          >
            Return to main site
          </a>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
