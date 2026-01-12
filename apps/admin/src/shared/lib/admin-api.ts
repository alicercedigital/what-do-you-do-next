import { supabase } from "./supabase";

const API_BASE = "/api";

/**
 * Get auth headers for admin API requests
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Not authenticated");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.access_token}`,
  };
}

/**
 * Make authenticated request to admin API
 */
async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `Request failed (${response.status})`);
  }

  return response.json();
}

// ============================================================
// Dashboard & Analytics
// ============================================================

export interface DashboardOverview {
  totalUsers: number;
  activeUsers7d: number;
  totalUniverses: number;
  publishedUniverses: number;
  totalRevenue: number;
  revenueThisMonth: number;
  aiCreditsUsed: number;
  totalPlays: number;
}

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
}

export interface UserGrowthData {
  data: Array<{ date: string; signups: number; activeUsers: number }>;
}

export interface RevenueData {
  data: Array<{ date: string; credits: number; subscriptions: number }>;
  totals: { credits: number; subscriptions: number };
}

export async function getDashboardOverview(): Promise<DashboardOverview> {
  return request("/admin/dashboard/overview");
}

export async function getUserGrowth(period: string = "30d"): Promise<UserGrowthData> {
  return request(`/admin/dashboard/user-growth?period=${period}`);
}

export async function getRevenue(period: string = "30d"): Promise<RevenueData> {
  return request(`/admin/dashboard/revenue?period=${period}`);
}

// ============================================================
// System Configuration
// ============================================================

export interface SystemConfig {
  credit_costs: Record<string, number>;
  tier_limits: Record<string, { universes: number; ai_per_day: number }>;
  feature_flags: Record<string, boolean>;
  maintenance_mode: boolean;
}

export async function getSystemConfig(): Promise<SystemConfig> {
  return request("/admin/config");
}

export async function updateSystemConfig(
  key: string,
  value: unknown
): Promise<{ success: boolean }> {
  return request("/admin/config", {
    method: "PUT",
    body: JSON.stringify({ key, value }),
  });
}

// ============================================================
// User Management
// ============================================================

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  tier: "free" | "creator" | "pro";
  ai_credits: number;
  is_verified: boolean;
  is_admin: boolean;
  is_banned: boolean;
  created_at: string;
  last_active: string | null;
}

export interface UsersResponse {
  users: AdminUser[];
  total: number;
}

export interface UserFilters {
  search?: string;
  tier?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export async function getUsers(filters: UserFilters = {}): Promise<UsersResponse> {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.tier) params.set("tier", filters.tier);
  if (filters.status) params.set("status", filters.status);
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.offset) params.set("offset", String(filters.offset));

  return request(`/admin/users?${params.toString()}`);
}

export async function getUser(userId: string): Promise<AdminUser> {
  return request(`/admin/users/${userId}`);
}

export async function updateUser(
  userId: string,
  updates: Partial<Pick<AdminUser, "tier" | "is_verified" | "is_admin">>
): Promise<{ success: boolean }> {
  return request(`/admin/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

export async function adjustUserCredits(
  userId: string,
  amount: number,
  reason: string
): Promise<{ success: boolean; newBalance: number }> {
  return request(`/admin/users/${userId}/credits`, {
    method: "POST",
    body: JSON.stringify({ amount, reason }),
  });
}

export async function banUser(
  userId: string,
  reason: string,
  durationDays?: number
): Promise<{ success: boolean }> {
  return request(`/admin/users/${userId}/ban`, {
    method: "POST",
    body: JSON.stringify({ reason, duration_days: durationDays }),
  });
}

export async function unbanUser(userId: string): Promise<{ success: boolean }> {
  return request(`/admin/users/${userId}/unban`, {
    method: "POST",
  });
}

// ============================================================
// Universe Management
// ============================================================

export interface AdminUniverse {
  id: string;
  name: string;
  description: string;
  owner: { id: string; username: string };
  visibility: "public" | "private" | "unlisted";
  is_published: boolean;
  is_featured: boolean;
  play_count: number;
  like_count: number;
  report_count: number;
  created_at: string;
  updated_at: string;
}

export interface UniversesResponse {
  universes: AdminUniverse[];
  total: number;
}

export interface UniverseFilters {
  search?: string;
  visibility?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
}

export async function getUniverses(
  filters: UniverseFilters = {}
): Promise<UniversesResponse> {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.visibility) params.set("visibility", filters.visibility);
  if (filters.featured !== undefined)
    params.set("featured", String(filters.featured));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.offset) params.set("offset", String(filters.offset));

  return request(`/admin/universes?${params.toString()}`);
}

export async function updateUniverse(
  universeId: string,
  updates: Partial<Pick<AdminUniverse, "is_featured" | "is_published" | "visibility">>
): Promise<{ success: boolean }> {
  return request(`/admin/universes/${universeId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

export async function deleteUniverse(
  universeId: string
): Promise<{ success: boolean }> {
  return request(`/admin/universes/${universeId}`, {
    method: "DELETE",
  });
}

// ============================================================
// Economy
// ============================================================

export interface Transaction {
  id: string;
  user_id: string;
  username: string;
  amount: number;
  type: string;
  description: string;
  created_at: string;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  total: number;
}

export async function getTransactions(
  filters: { type?: string; limit?: number; offset?: number } = {}
): Promise<TransactionsResponse> {
  const params = new URLSearchParams();
  if (filters.type) params.set("type", filters.type);
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.offset) params.set("offset", String(filters.offset));

  return request(`/admin/economy/transactions?${params.toString()}`);
}

export interface Subscription {
  id: string;
  user_id: string;
  username: string;
  tier: string;
  status: string;
  current_period_end: string;
  created_at: string;
}

export interface SubscriptionsResponse {
  subscriptions: Subscription[];
  total: number;
}

export async function getSubscriptions(
  filters: { status?: string; limit?: number; offset?: number } = {}
): Promise<SubscriptionsResponse> {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.offset) params.set("offset", String(filters.offset));

  return request(`/admin/economy/subscriptions?${params.toString()}`);
}

// ============================================================
// Moderation
// ============================================================

export interface ContentReport {
  id: string;
  reporter: { id: string; username: string };
  target_type: string;
  target_id: string;
  reason: string;
  description: string | null;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  created_at: string;
}

export interface ReportsResponse {
  reports: ContentReport[];
  total: number;
}

export async function getReports(
  filters: { status?: string; limit?: number; offset?: number } = {}
): Promise<ReportsResponse> {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.offset) params.set("offset", String(filters.offset));

  return request(`/admin/moderation/reports?${params.toString()}`);
}

export async function resolveReport(
  reportId: string,
  resolution: "resolved" | "dismissed",
  notes?: string
): Promise<{ success: boolean }> {
  return request(`/admin/moderation/reports/${reportId}`, {
    method: "PUT",
    body: JSON.stringify({ status: resolution, notes }),
  });
}

// ============================================================
// Audit Logs
// ============================================================

export interface AuditLogEntry {
  id: string;
  admin: { id: string; username: string };
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface AuditLogsResponse {
  logs: AuditLogEntry[];
  total: number;
}

export async function getAuditLogs(
  filters: { action?: string; limit?: number; offset?: number } = {}
): Promise<AuditLogsResponse> {
  const params = new URLSearchParams();
  if (filters.action) params.set("action", filters.action);
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.offset) params.set("offset", String(filters.offset));

  return request(`/admin/audit?${params.toString()}`);
}
