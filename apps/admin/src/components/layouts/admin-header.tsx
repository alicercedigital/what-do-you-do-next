import { useAdminAuthStore, useAdminProfile } from "@/store/admin-auth-store";
import { LogOut, User } from "lucide-react";

export function AdminHeader() {
  const profile = useAdminProfile();
  const signOut = useAdminAuthStore((state) => state.signOut);

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
      <div>
        <h1 className="text-sm font-medium text-muted-foreground">
          Administration Panel
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* User info */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.username}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <User className="h-4 w-4 text-primary" />
            )}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium">
              {profile?.display_name || profile?.username || "Admin"}
            </p>
            <p className="text-xs text-muted-foreground">Administrator</p>
          </div>
        </div>

        {/* Sign out button */}
        <button
          onClick={() => signOut()}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
