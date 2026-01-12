import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSystemConfig, updateSystemConfig } from "@/shared/lib/admin-api";
import { toast } from "sonner";
import { Settings, Zap, Users, ToggleLeft, Save, Loader2 } from "lucide-react";

export function ConfigPage() {
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ["admin", "config"],
    queryFn: getSystemConfig,
  });

  const updateMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: unknown }) =>
      updateSystemConfig(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "config"] });
      toast.success("Configuration updated");
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

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">System Configuration</h1>
        <p className="text-sm text-muted-foreground">
          Manage platform settings, credit costs, and feature flags
        </p>
      </div>

      {/* Credit Costs */}
      <CreditCostsSection
        costs={config?.credit_costs ?? {}}
        onSave={(costs) => updateMutation.mutate({ key: "credit_costs", value: costs })}
        isSaving={updateMutation.isPending}
      />

      {/* Tier Limits */}
      <TierLimitsSection
        limits={config?.tier_limits ?? {}}
        onSave={(limits) => updateMutation.mutate({ key: "tier_limits", value: limits })}
        isSaving={updateMutation.isPending}
      />

      {/* Feature Flags */}
      <FeatureFlagsSection
        flags={config?.feature_flags ?? {}}
        onToggle={(key, value) =>
          updateMutation.mutate({
            key: "feature_flags",
            value: { ...config?.feature_flags, [key]: value },
          })
        }
        isSaving={updateMutation.isPending}
      />

      {/* Maintenance Mode */}
      <MaintenanceModeSection
        enabled={config?.maintenance_mode ?? false}
        onToggle={(enabled) =>
          updateMutation.mutate({ key: "maintenance_mode", value: enabled })
        }
        isSaving={updateMutation.isPending}
      />
    </div>
  );
}

interface CreditCostsSectionProps {
  costs: Record<string, number>;
  onSave: (costs: Record<string, number>) => void;
  isSaving: boolean;
}

function CreditCostsSection({ costs, onSave, isSaving }: CreditCostsSectionProps) {
  const [localCosts, setLocalCosts] = useState(costs);

  const handleChange = (key: string, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      setLocalCosts({ ...localCosts, [key]: numValue });
    }
  };

  const hasChanges = JSON.stringify(costs) !== JSON.stringify(localCosts);

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <Zap className="h-5 w-5 text-muted-foreground" />
        <h2 className="font-semibold">AI Credit Costs</h2>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        Set the credit cost for each AI operation
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(localCosts).map(([key, value]) => (
          <div key={key}>
            <label className="block text-sm font-medium capitalize">
              {key.replace(/_/g, " ")}
            </label>
            <input
              type="number"
              min="0"
              value={value}
              onChange={(e) => handleChange(key, e.target.value)}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        ))}
      </div>

      {hasChanges && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => onSave(localCosts)}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}

interface TierLimitsSectionProps {
  limits: Record<string, { universes: number; ai_per_day: number }>;
  onSave: (limits: Record<string, { universes: number; ai_per_day: number }>) => void;
  isSaving: boolean;
}

function TierLimitsSection({ limits, onSave, isSaving }: TierLimitsSectionProps) {
  const [localLimits, setLocalLimits] = useState(limits);

  const handleChange = (
    tier: string,
    field: "universes" | "ai_per_day",
    value: string
  ) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      setLocalLimits({
        ...localLimits,
        [tier]: { ...localLimits[tier], [field]: numValue },
      });
    }
  };

  const hasChanges = JSON.stringify(limits) !== JSON.stringify(localLimits);

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <Users className="h-5 w-5 text-muted-foreground" />
        <h2 className="font-semibold">Tier Limits</h2>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        Set limits for each subscription tier (-1 for unlimited)
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-2 text-left font-medium">Tier</th>
              <th className="pb-2 text-left font-medium">Max Universes</th>
              <th className="pb-2 text-left font-medium">AI Calls/Day</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(localLimits).map(([tier, tierLimits]) => (
              <tr key={tier} className="border-b border-border last:border-0">
                <td className="py-3 capitalize">{tier}</td>
                <td className="py-3">
                  <input
                    type="number"
                    min="-1"
                    value={tierLimits.universes}
                    onChange={(e) => handleChange(tier, "universes", e.target.value)}
                    className="w-24 rounded-md border border-input bg-background px-2 py-1 text-sm"
                  />
                </td>
                <td className="py-3">
                  <input
                    type="number"
                    min="-1"
                    value={tierLimits.ai_per_day}
                    onChange={(e) => handleChange(tier, "ai_per_day", e.target.value)}
                    className="w-24 rounded-md border border-input bg-background px-2 py-1 text-sm"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hasChanges && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => onSave(localLimits)}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}

interface FeatureFlagsSectionProps {
  flags: Record<string, boolean>;
  onToggle: (key: string, value: boolean) => void;
  isSaving: boolean;
}

function FeatureFlagsSection({
  flags,
  onToggle,
  isSaving,
}: FeatureFlagsSectionProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <ToggleLeft className="h-5 w-5 text-muted-foreground" />
        <h2 className="font-semibold">Feature Flags</h2>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        Enable or disable platform features
      </p>

      <div className="space-y-3">
        {Object.entries(flags).map(([key, enabled]) => (
          <div
            key={key}
            className="flex items-center justify-between rounded-md border border-border p-3"
          >
            <div>
              <p className="font-medium capitalize">{key.replace(/_/g, " ")}</p>
              <p className="text-xs text-muted-foreground">
                {enabled ? "Enabled" : "Disabled"}
              </p>
            </div>
            <button
              onClick={() => onToggle(key, !enabled)}
              disabled={isSaving}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                enabled ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  enabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

interface MaintenanceModeSectionProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  isSaving: boolean;
}

function MaintenanceModeSection({
  enabled,
  onToggle,
  isSaving,
}: MaintenanceModeSectionProps) {
  return (
    <div
      className={`rounded-lg border p-6 ${
        enabled
          ? "border-destructive bg-destructive/10"
          : "border-border bg-card"
      }`}
    >
      <div className="mb-4 flex items-center gap-2">
        <Settings className="h-5 w-5 text-muted-foreground" />
        <h2 className="font-semibold">Maintenance Mode</h2>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        When enabled, users will see a maintenance page instead of the application
      </p>

      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">
            {enabled ? "Maintenance mode is ON" : "Maintenance mode is OFF"}
          </p>
          <p className="text-sm text-muted-foreground">
            {enabled
              ? "Users cannot access the platform"
              : "Platform is operating normally"}
          </p>
        </div>
        <button
          onClick={() => onToggle(!enabled)}
          disabled={isSaving}
          className={`rounded-md px-4 py-2 text-sm font-medium ${
            enabled
              ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
          } disabled:opacity-50`}
        >
          {enabled ? "Disable Maintenance" : "Enable Maintenance"}
        </button>
      </div>
    </div>
  );
}
