import * as React from "react";
import { useState, useMemo } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  requirements: {
    met: boolean;
    label: string;
  }[];
}

function calculatePasswordStrength(password: string): PasswordStrength {
  const requirements = [
    { met: password.length >= 8, label: "At least 8 characters" },
    { met: /[a-z]/.test(password), label: "One lowercase letter" },
    { met: /[A-Z]/.test(password), label: "One uppercase letter" },
    { met: /[0-9]/.test(password), label: "One number" },
    { met: /[^a-zA-Z0-9]/.test(password), label: "One special character" },
  ];

  const metCount = requirements.filter((r) => r.met).length;

  const strengthMap: Record<number, { label: string; color: string }> = {
    0: { label: "Very weak", color: "bg-red-500" },
    1: { label: "Weak", color: "bg-orange-500" },
    2: { label: "Fair", color: "bg-yellow-500" },
    3: { label: "Good", color: "bg-lime-500" },
    4: { label: "Strong", color: "bg-green-500" },
    5: { label: "Very strong", color: "bg-emerald-500" },
  };

  const { label, color } = strengthMap[metCount];

  return {
    score: metCount,
    label,
    color,
    requirements,
  };
}

interface PasswordInputProps
  extends Omit<React.ComponentProps<"input">, "type"> {
  showStrength?: boolean;
  showRequirements?: boolean;
  confirmValue?: string;
  showMatchIndicator?: boolean;
  label?: string;
}

function PasswordInput({
  className,
  showStrength = false,
  showRequirements = false,
  confirmValue,
  showMatchIndicator = false,
  value,
  onChange,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const passwordValue = typeof value === "string" ? value : "";
  const strength = useMemo(
    () => calculatePasswordStrength(passwordValue),
    [passwordValue]
  );

  const passwordsMatch =
    confirmValue !== undefined &&
    passwordValue.length > 0 &&
    confirmValue.length > 0 &&
    passwordValue === confirmValue;

  const passwordsMismatch =
    confirmValue !== undefined &&
    passwordValue.length > 0 &&
    confirmValue.length > 0 &&
    passwordValue !== confirmValue;

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          data-slot="input"
          className={cn(
            "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 pr-10 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            showMatchIndicator && passwordsMatch && "border-green-500 focus-visible:border-green-500",
            showMatchIndicator && passwordsMismatch && "border-destructive focus-visible:border-destructive",
            className
          )}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          tabIndex={-1}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Password match indicator */}
      {showMatchIndicator && confirmValue !== undefined && passwordValue.length > 0 && (
        <div
          className={cn(
            "flex items-center gap-1.5 text-xs transition-all",
            confirmValue.length === 0 && "opacity-0",
            passwordsMatch && "text-green-600 dark:text-green-400",
            passwordsMismatch && "text-destructive"
          )}
        >
          {passwordsMatch ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>Passwords match</span>
            </>
          ) : (
            <>
              <X className="h-3.5 w-3.5" />
              <span>Passwords do not match</span>
            </>
          )}
        </div>
      )}

      {/* Password strength meter */}
      {showStrength && passwordValue.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className={cn(
                  "h-1 flex-1 rounded-full transition-all duration-300",
                  index < strength.score
                    ? strength.color
                    : "bg-muted"
                )}
              />
            ))}
          </div>
          <p
            className={cn(
              "text-xs font-medium transition-colors",
              strength.score <= 1 && "text-red-500",
              strength.score === 2 && "text-yellow-600 dark:text-yellow-400",
              strength.score >= 3 && "text-green-600 dark:text-green-400"
            )}
          >
            {strength.label}
          </p>
        </div>
      )}

      {/* Password requirements */}
      {showRequirements && (isFocused || passwordValue.length > 0) && (
        <div className="space-y-1 pt-1">
          {strength.requirements.map((req, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center gap-1.5 text-xs transition-all",
                req.met
                  ? "text-green-600 dark:text-green-400"
                  : "text-muted-foreground"
              )}
            >
              {req.met ? (
                <Check className="h-3 w-3" />
              ) : (
                <div className="h-3 w-3 rounded-full border border-current" />
              )}
              <span>{req.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export { PasswordInput, calculatePasswordStrength };
export type { PasswordStrength };
