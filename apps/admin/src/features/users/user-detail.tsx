import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUser,
  updateUser,
  adjustUserCredits,
  banUser,
  unbanUser,
} from "@/shared/lib/admin-api";
import { formatRelativeTime, formatNumber } from "@/shared/lib/utils";
import { toast } from "sonner";
import {
  ArrowLeft,
  User,
  Loader2,
  Save,
  Shield,
  Ban,
  Coins,
  CheckCircle,
} from "lucide-react";

export function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["admin", "users", userId],
    queryFn: () => getUser(userId!),
    enabled: !!userId,
  });

  const updateMutation = useMutation({
    mutationFn: (updates: Parameters<typeof updateUser>[1]) =>
      updateUser(userId!, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User updated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const creditsMutation = useMutation({
    mutationFn: ({ amount, reason }: { amount: number; reason: string }) =>
      adjustUserCredits(userId!, amount, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users", userId] });
      toast.success("Credits adjusted");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const banMutation = useMutation({
    mutationFn: ({ reason, duration }: { reason: string; duration?: number }) =>
      banUser(userId!, reason, duration),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User banned");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const unbanMutation = useMutation({
    mutationFn: () => unbanUser(userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User unbanned");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">User not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate("/users")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Users
      </button>

      {/* User header */}
      <div className="flex items-start gap-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-medium uppercase">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.username}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            user.username.slice(0, 2)
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{user.username}</h1>
          <p className="text-muted-foreground">{user.email}</p>
          <div className="mt-2 flex items-center gap-2">
            {user.is_banned && (
              <span className="inline-flex rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                Banned
              </span>
            )}
            {user.is_admin && (
              <span className="inline-flex rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-500">
                Admin
              </span>
            )}
            {user.is_verified && (
              <span className="inline-flex rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-500">
                Verified
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* User info */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 font-semibold">User Information</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">User ID</dt>
              <dd className="font-mono text-xs">{user.id}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Tier</dt>
              <dd className="capitalize">{user.tier}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">AI Credits</dt>
              <dd>{formatNumber(user.ai_credits)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Joined</dt>
              <dd>{formatRelativeTime(user.created_at)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Last Active</dt>
              <dd>
                {user.last_active
                  ? formatRelativeTime(user.last_active)
                  : "Never"}
              </dd>
            </div>
          </dl>
        </div>

        {/* Quick actions */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 font-semibold">Quick Actions</h2>
          <div className="space-y-3">
            {/* Toggle verified */}
            <button
              onClick={() => updateMutation.mutate({ is_verified: !user.is_verified })}
              disabled={updateMutation.isPending}
              className="flex w-full items-center gap-3 rounded-md border border-border p-3 text-left hover:bg-muted/50"
            >
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div className="flex-1">
                <p className="font-medium">
                  {user.is_verified ? "Remove Verification" : "Verify User"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Toggle verified status
                </p>
              </div>
            </button>

            {/* Toggle admin */}
            <button
              onClick={() => updateMutation.mutate({ is_admin: !user.is_admin })}
              disabled={updateMutation.isPending}
              className="flex w-full items-center gap-3 rounded-md border border-border p-3 text-left hover:bg-muted/50"
            >
              <Shield className="h-5 w-5 text-amber-500" />
              <div className="flex-1">
                <p className="font-medium">
                  {user.is_admin ? "Remove Admin" : "Make Admin"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Toggle admin privileges
                </p>
              </div>
            </button>

            {/* Ban/Unban */}
            {user.is_banned ? (
              <button
                onClick={() => unbanMutation.mutate()}
                disabled={unbanMutation.isPending}
                className="flex w-full items-center gap-3 rounded-md border border-border p-3 text-left hover:bg-muted/50"
              >
                <Ban className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium">Unban User</p>
                  <p className="text-xs text-muted-foreground">
                    Restore platform access
                  </p>
                </div>
              </button>
            ) : (
              <BanUserButton onBan={(reason, duration) => banMutation.mutate({ reason, duration })} />
            )}
          </div>
        </div>

        {/* Credit adjustment */}
        <CreditAdjustmentSection
          currentCredits={user.ai_credits}
          onAdjust={(amount, reason) => creditsMutation.mutate({ amount, reason })}
          isSaving={creditsMutation.isPending}
        />

        {/* Tier change */}
        <TierChangeSection
          currentTier={user.tier}
          onChangeTier={(tier) => updateMutation.mutate({ tier })}
          isSaving={updateMutation.isPending}
        />
      </div>
    </div>
  );
}

function BanUserButton({
  onBan,
}: {
  onBan: (reason: string, duration?: number) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState("");

  const handleSubmit = () => {
    if (!reason.trim()) return;
    onBan(reason, duration ? parseInt(duration, 10) : undefined);
    setIsOpen(false);
    setReason("");
    setDuration("");
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center gap-3 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-left hover:bg-destructive/20"
      >
        <Ban className="h-5 w-5 text-destructive" />
        <div className="flex-1">
          <p className="font-medium text-destructive">Ban User</p>
          <p className="text-xs text-muted-foreground">
            Revoke platform access
          </p>
        </div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-semibold">Ban User</h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium">Reason</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter ban reason..."
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Duration (days, leave empty for permanent)
                </label>
                <input
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="7"
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!reason.trim()}
                className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
              >
                Ban User
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CreditAdjustmentSection({
  currentCredits,
  onAdjust,
  isSaving,
}: {
  currentCredits: number;
  onAdjust: (amount: number, reason: string) => void;
  isSaving: boolean;
}) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    const numAmount = parseInt(amount, 10);
    if (isNaN(numAmount) || numAmount === 0 || !reason.trim()) return;
    onAdjust(numAmount, reason);
    setAmount("");
    setReason("");
  };

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <Coins className="h-5 w-5 text-muted-foreground" />
        <h2 className="font-semibold">Adjust Credits</h2>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        Current balance: {formatNumber(currentCredits)} credits
      </p>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium">
            Amount (positive to add, negative to remove)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="100 or -50"
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Reason</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Compensation for bug"
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSaving || !amount || !reason.trim()}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Apply Adjustment
        </button>
      </div>
    </div>
  );
}

function TierChangeSection({
  currentTier,
  onChangeTier,
  isSaving,
}: {
  currentTier: string;
  onChangeTier: (tier: "free" | "creator" | "pro") => void;
  isSaving: boolean;
}) {
  const [tier, setTier] = useState(currentTier);

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <User className="h-5 w-5 text-muted-foreground" />
        <h2 className="font-semibold">Change Tier</h2>
      </div>
      <div className="space-y-3">
        <select
          value={tier}
          onChange={(e) => setTier(e.target.value)}
          className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="free">Free</option>
          <option value="creator">Creator</option>
          <option value="pro">Pro</option>
        </select>
        <button
          onClick={() => onChangeTier(tier as "free" | "creator" | "pro")}
          disabled={isSaving || tier === currentTier}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Update Tier
        </button>
      </div>
    </div>
  );
}
