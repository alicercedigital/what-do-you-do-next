import { Link } from "react-router-dom";
import { User, Settings, LogOut, Coins, Library, Palette } from "lucide-react";
import { useAuthStore, useIsAuthenticated, useProfile, useCredits } from "@/store/auth-store";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

/**
 * User menu dropdown - shows auth state and user options
 */
export function UserMenu() {
  const isAuthenticated = useIsAuthenticated();
  const profile = useProfile();
  const credits = useCredits();
  const signOut = useAuthStore((state) => state.signOut);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/login">Sign In</Link>
        </Button>
        <Button size="sm" asChild>
          <Link to="/register">Sign Up</Link>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.display_name || profile.username}
              className="h-6 w-6 rounded-full"
            />
          ) : (
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
          )}
          <span className="hidden sm:inline">
            {profile?.display_name || profile?.username || "User"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span>{profile?.display_name || profile?.username}</span>
            {profile?.display_name && (
              <span className="text-xs text-muted-foreground">
                @{profile.username}
              </span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Credits */}
        <DropdownMenuItem disabled className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            <span>Credits</span>
          </div>
          <span className="font-medium">{credits}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Navigation */}
        <DropdownMenuItem asChild>
          <Link to="/profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link to="/library" className="flex items-center gap-2">
            <Library className="h-4 w-4" />
            <span>Library</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link to="/studio" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span>Creator Studio</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link to="/profile/settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => signOut()}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
