import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Coins, Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { useEconomyStore, useBalance } from "@/store/economy-store";
import { useAuthStore } from "@/store/auth-store";

interface CreditDisplayProps {
  showBuyButton?: boolean;
  size?: "sm" | "default";
}

export function CreditDisplay({ showBuyButton = true, size = "default" }: CreditDisplayProps) {
  const { loadBalance, isLoadingBalance } = useEconomyStore();
  const balance = useBalance();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user) {
      loadBalance();
    }
  }, [user, loadBalance]);

  if (!user) {
    return null;
  }

  const formatBalance = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
    return amount.toString();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size={size === "sm" ? "sm" : "default"}
          className="gap-1.5"
        >
          <Coins className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} />
          <span className="tabular-nums">
            {isLoadingBalance ? "..." : formatBalance(balance)}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <div className="space-y-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-2xl font-bold">
              <Coins className="h-6 w-6 text-yellow-500" />
              <span className="tabular-nums">{balance}</span>
            </div>
            <p className="text-sm text-muted-foreground">Credits available</p>
          </div>

          {showBuyButton && (
            <div className="space-y-2">
              <Button className="w-full" asChild>
                <Link to="/profile/settings#credits">
                  <Plus className="mr-2 h-4 w-4" />
                  Get more credits
                </Link>
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Use credits for AI features, premium content, and tips
              </p>
            </div>
          )}

          <div className="border-t pt-3">
            <Link
              to="/profile/settings#transactions"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              View transaction history
            </Link>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
