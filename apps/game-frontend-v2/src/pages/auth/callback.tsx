import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/shared/lib/supabase";

/**
 * OAuth callback page - handles redirects from OAuth providers
 */
export function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Get the hash params (Supabase includes tokens in the URL hash)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");

    if (accessToken && refreshToken) {
      // Set the session with the tokens
      supabase.auth
        .setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        .then(({ error }) => {
          if (error) {
            console.error("Error setting session:", error);
            navigate("/login?error=auth_failed");
          } else {
            // Redirect to home page after successful auth
            navigate("/");
          }
        });
    } else {
      // Check for error in URL
      const queryParams = new URLSearchParams(window.location.search);
      const error = queryParams.get("error");
      const errorDescription = queryParams.get("error_description");

      if (error) {
        console.error("Auth error:", error, errorDescription);
        navigate(`/login?error=${error}`);
      } else {
        // No tokens and no error - something went wrong
        navigate("/login");
      }
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}
