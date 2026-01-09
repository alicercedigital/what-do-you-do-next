import { useState } from "react";
import { Heart, Coins, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Textarea } from "@/shared/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { useEconomyStore, useBalance } from "@/store/economy-store";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/shared/lib/utils";

interface TipDialogProps {
  receiverId: string;
  receiverName: string;
  receiverUsername: string;
  receiverAvatar?: string | null;
  universeId?: string;
  universeName?: string;
  trigger?: React.ReactNode;
}

const TIP_AMOUNTS = [10, 25, 50, 100, 250, 500];

export function TipDialog({
  receiverId,
  receiverName,
  receiverUsername,
  receiverAvatar,
  universeId,
  universeName,
  trigger,
}: TipDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<number>(25);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { sendTip } = useEconomyStore();
  const balance = useBalance();
  const user = useAuthStore((state) => state.user);

  const selectedAmount = customAmount ? parseInt(customAmount) || 0 : amount;
  const insufficientFunds = selectedAmount > balance;
  const canSubmit = selectedAmount > 0 && !insufficientFunds && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);

    const success = await sendTip(receiverId, selectedAmount, universeId, message || undefined);

    if (success) {
      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        setAmount(25);
        setCustomAmount("");
        setMessage("");
      }, 2000);
    } else {
      setError("Failed to send tip. Please try again.");
    }

    setIsSubmitting(false);
  };

  if (!user) {
    return null;
  }

  // Can't tip yourself
  if (user.id === receiverId) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-1.5">
            <Heart className="h-4 w-4" />
            Tip
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send a Tip</DialogTitle>
          <DialogDescription>
            Show your appreciation for {receiverName}'s work
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold">Tip Sent!</h3>
            <p className="text-muted-foreground">
              You sent {selectedAmount} credits to {receiverName}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Receiver info */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Avatar className="h-12 w-12">
                <AvatarImage src={receiverAvatar || undefined} />
                <AvatarFallback>{receiverName[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{receiverName}</div>
                <div className="text-sm text-muted-foreground">@{receiverUsername}</div>
              </div>
            </div>

            {/* Universe info */}
            {universeName && (
              <div className="text-sm text-muted-foreground">
                For: <span className="font-medium text-foreground">{universeName}</span>
              </div>
            )}

            {/* Amount selection */}
            <div>
              <label className="text-sm font-medium">Select amount</label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {TIP_AMOUNTS.map((tipAmount) => (
                  <Button
                    key={tipAmount}
                    variant={amount === tipAmount && !customAmount ? "default" : "outline"}
                    className="gap-1"
                    onClick={() => {
                      setAmount(tipAmount);
                      setCustomAmount("");
                    }}
                  >
                    <Coins className="h-3.5 w-3.5" />
                    {tipAmount}
                  </Button>
                ))}
              </div>

              <div className="mt-3">
                <label className="text-sm text-muted-foreground">Or enter custom amount</label>
                <div className="mt-1 relative">
                  <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="number"
                    min="1"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Custom amount"
                    className={cn(
                      "w-full rounded-md border bg-background px-10 py-2 text-sm",
                      "focus:outline-none focus:ring-2 focus:ring-ring"
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Balance check */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Your balance:</span>
              <span className={cn("font-medium", insufficientFunds && "text-red-500")}>
                {balance} credits
              </span>
            </div>

            {insufficientFunds && (
              <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                Insufficient credits. You need {selectedAmount - balance} more.
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {/* Message */}
            <div>
              <label className="text-sm font-medium">Add a message (optional)</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Say something nice..."
                className="mt-2"
                rows={2}
              />
            </div>

            {/* Submit */}
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Heart className="h-4 w-4 mr-2" />
              )}
              Send {selectedAmount > 0 ? `${selectedAmount} credits` : "Tip"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
