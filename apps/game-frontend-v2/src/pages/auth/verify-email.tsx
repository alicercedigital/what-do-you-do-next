import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Loader2, X, CheckCircle2, Mail, ArrowRight } from "lucide-react";
import { supabase } from "@/shared/lib/supabase";

type VerificationStatus = "loading" | "success" | "error";

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Check URL hash for tokens (Supabase puts them there after email verification)
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");

        // Check for error in URL
        const errorDescription = hashParams.get("error_description");
        if (errorDescription) {
          setErrorMessage(errorDescription);
          setStatus("error");
          return;
        }

        // If we have tokens, set the session
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            setErrorMessage(error.message);
            setStatus("error");
            return;
          }

          // Clear the hash from URL for cleaner appearance
          window.history.replaceState(null, "", window.location.pathname);

          // Determine success based on type
          if (type === "signup" || type === "email_change" || type === "recovery") {
            setStatus("success");
          } else {
            setStatus("success");
          }
        } else {
          // No tokens in URL - check if user is already authenticated
          const { data: { session } } = await supabase.auth.getSession();

          if (session) {
            // User is already authenticated
            setStatus("success");
          } else {
            // No session and no tokens - invalid link
            setErrorMessage("Invalid or expired verification link");
            setStatus("error");
          }
        }
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : "Verification failed"
        );
        setStatus("error");
      }
    };

    verifyEmail();
  }, []);

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">
              Verifying your email...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <X className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Verification failed</CardTitle>
            <CardDescription className="mt-2">
              We couldn't verify your email address
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {errorMessage && (
              <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {errorMessage}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              The verification link may have expired or already been used.
              Please try signing up again or contact support if the problem
              persists.
            </p>
            <div className="flex flex-col gap-2">
              <Button asChild className="w-full">
                <Link to="/register">Sign Up Again</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/login">Go to Sign In</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">Email verified!</CardTitle>
          <CardDescription className="mt-2">
            Your email has been successfully verified
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Welcome to WDYDN! Your account is now fully activated. You can start
            exploring universes and creating your own stories.
          </p>
          <Button onClick={() => navigate("/")} className="w-full">
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
        <CardFooter className="justify-center pt-0">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Mail className="h-3.5 w-3.5" />
            Check your inbox for a welcome email
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
