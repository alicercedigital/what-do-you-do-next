import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAdminAuthStore } from "@/store/admin-auth-store";

export function RootLayout() {
  const initialize = useAdminAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <Outlet />;
}
