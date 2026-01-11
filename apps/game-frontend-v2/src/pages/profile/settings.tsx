import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  CreditCard,
  Key,
  Loader2,
  Moon,
  Shield,
  Sparkles,
  User,
  Zap,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { Separator } from "@/shared/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useAuthStore } from "@/store/auth-store";
import { useUserStore, useUserSettings, useUserSubscription } from "@/store/user-store";
import { toast } from "sonner";

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, profile, updateProfile, isLoading: authLoading } = useAuthStore();
  const { loadSettings, updateSettings, loadSubscription } = useUserStore();
  const settings = useUserSettings();
  const subscription = useUserSubscription();

  const [isSaving, setIsSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [openrouterKey, setOpenrouterKey] = useState("");
  const [selectedModelSmart, setSelectedModelSmart] = useState(
    profile?.default_model_smart ?? "anthropic/claude-sonnet-4-20250514"
  );
  const [selectedModelCheap, setSelectedModelCheap] = useState(
    profile?.default_model_cheap ?? "openai/gpt-4o-mini"
  );

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: settings?.email_notifications ?? true,
    push_notifications: settings?.push_notifications ?? true,
    notification_new_follower: settings?.notification_new_follower ?? true,
    notification_new_content: settings?.notification_new_content ?? true,
    notification_comments: settings?.notification_comments ?? true,
    notification_likes: settings?.notification_likes ?? true,
  });

  useEffect(() => {
    if (user?.id) {
      loadSettings(user.id);
      loadSubscription(user.id);
    }
  }, [user?.id, loadSettings, loadSubscription]);

  useEffect(() => {
    if (settings) {
      setNotificationSettings({
        email_notifications: settings.email_notifications,
        push_notifications: settings.push_notifications,
        notification_new_follower: settings.notification_new_follower,
        notification_new_content: settings.notification_new_content,
        notification_comments: settings.notification_comments,
        notification_likes: settings.notification_likes,
      });
    }
  }, [settings]);

  useEffect(() => {
    if (profile) {
      setOpenrouterKey(profile.openrouter_api_key ?? "");
      setSelectedModelSmart(profile.default_model_smart);
      setSelectedModelCheap(profile.default_model_cheap);
    }
  }, [profile]);

  const handleSaveNotifications = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    const result = await updateSettings(user.id, notificationSettings);
    setIsSaving(false);

    if (result.success) {
      toast.success("Notification settings saved");
    } else {
      toast.error(result.error || "Failed to save settings");
    }
  };

  const handleSaveApiSettings = async () => {
    setIsSaving(true);
    const result = await updateProfile({
      openrouter_api_key: openrouterKey || null,
      default_model_smart: selectedModelSmart,
      default_model_cheap: selectedModelCheap,
    });
    setIsSaving(false);

    if (result.success) {
      toast.success("API settings saved");
    } else {
      toast.error(result.error || "Failed to save settings");
    }
  };

  if (authLoading || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const smartModels = [
    { value: "anthropic/claude-sonnet-4-20250514", label: "Claude Sonnet 4" },
    { value: "anthropic/claude-opus-4-20250514", label: "Claude Opus 4" },
    { value: "openai/gpt-4o", label: "GPT-4o" },
    { value: "google/gemini-2.0-flash", label: "Gemini 2.0 Flash" },
  ];

  const cheapModels = [
    { value: "openai/gpt-4o-mini", label: "GPT-4o Mini" },
    { value: "anthropic/claude-3-5-haiku-20241022", label: "Claude 3.5 Haiku" },
    { value: "google/gemini-2.0-flash-lite", label: "Gemini 2.0 Flash Lite" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/profile")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">AI & Models</span>
            </TabsTrigger>
            <TabsTrigger value="subscription" className="gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Subscription</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose what notifications you want to receive.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email_notifications">
                        Email Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      id="email_notifications"
                      checked={notificationSettings.email_notifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((s) => ({
                          ...s,
                          email_notifications: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="push_notifications">
                        Push Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive browser push notifications
                      </p>
                    </div>
                    <Switch
                      id="push_notifications"
                      checked={notificationSettings.push_notifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((s) => ({
                          ...s,
                          push_notifications: checked,
                        }))
                      }
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Notify me about</h4>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="notification_new_follower">
                      New followers
                    </Label>
                    <Switch
                      id="notification_new_follower"
                      checked={notificationSettings.notification_new_follower}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((s) => ({
                          ...s,
                          notification_new_follower: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="notification_new_content">
                      New content from followed creators
                    </Label>
                    <Switch
                      id="notification_new_content"
                      checked={notificationSettings.notification_new_content}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((s) => ({
                          ...s,
                          notification_new_content: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="notification_comments">
                      Comments on my universes
                    </Label>
                    <Switch
                      id="notification_comments"
                      checked={notificationSettings.notification_comments}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((s) => ({
                          ...s,
                          notification_comments: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="notification_likes">
                      Likes on my content
                    </Label>
                    <Switch
                      id="notification_likes"
                      checked={notificationSettings.notification_likes}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((s) => ({
                          ...s,
                          notification_likes: checked,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveNotifications} disabled={isSaving}>
                    {isSaving && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI & Models Tab */}
          <TabsContent value="ai">
            <div className="space-y-6">
              {/* Credits Display */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    AI Credits
                    <Badge variant="secondary" className="text-lg">
                      <Sparkles className="mr-1 h-4 w-4" />
                      {profile.ai_credits}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Credits are used for AI-powered features like content
                    generation and gap-filling.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Purchase Credits
                  </Button>
                </CardContent>
              </Card>

              {/* OpenRouter API Key */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    OpenRouter API Key
                  </CardTitle>
                  <CardDescription>
                    Use your own OpenRouter API key for unlimited AI usage.
                    Your key is encrypted and stored securely.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="openrouter_key">API Key</Label>
                    <div className="relative">
                      <Input
                        id="openrouter_key"
                        type={showApiKey ? "text" : "password"}
                        value={openrouterKey}
                        onChange={(e) => setOpenrouterKey(e.target.value)}
                        placeholder="sk-or-v1-..."
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Get your API key from{" "}
                      <a
                        href="https://openrouter.ai/keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        OpenRouter
                        <ExternalLink className="ml-1 inline h-3 w-3" />
                      </a>
                    </p>
                  </div>

                  {openrouterKey && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertTitle>API Key Set</AlertTitle>
                      <AlertDescription>
                        AI features will use your OpenRouter key instead of
                        consuming credits.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Model Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Default Models
                  </CardTitle>
                  <CardDescription>
                    Choose which AI models to use for different tasks.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="model_smart">
                      Smart Model (Complex tasks)
                    </Label>
                    <Select
                      value={selectedModelSmart}
                      onValueChange={setSelectedModelSmart}
                    >
                      <SelectTrigger id="model_smart">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {smartModels.map((model) => (
                          <SelectItem key={model.value} value={model.value}>
                            {model.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Used for narrative generation and complex reasoning.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model_cheap">
                      Fast Model (Simple tasks)
                    </Label>
                    <Select
                      value={selectedModelCheap}
                      onValueChange={setSelectedModelCheap}
                    >
                      <SelectTrigger id="model_cheap">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {cheapModels.map((model) => (
                          <SelectItem key={model.value} value={model.value}>
                            {model.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Used for quick completions and suggestions.
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveApiSettings} disabled={isSaving}>
                      {isSaving && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Plan</CardTitle>
                <CardDescription>
                  Manage your subscription and billing.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">
                        {profile.tier === "free"
                          ? "Free Plan"
                          : profile.tier === "creator"
                            ? "Creator Plan"
                            : "Pro Plan"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {profile.tier === "free"
                          ? "Basic features with limited AI credits"
                          : profile.tier === "creator"
                            ? "Extended features for creators"
                            : "Full access to all features"}
                      </p>
                    </div>
                    <Badge
                      variant={profile.tier === "free" ? "outline" : "default"}
                    >
                      {profile.tier.charAt(0).toUpperCase() + profile.tier.slice(1)}
                    </Badge>
                  </div>

                  {subscription && (
                    <div className="mt-4 text-sm text-muted-foreground">
                      <p>
                        Next billing date:{" "}
                        {subscription.current_period_end
                          ? new Date(subscription.current_period_end).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  )}
                </div>

                {profile.tier === "free" && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Upgrade your plan</h4>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Card className="relative">
                        <CardHeader>
                          <CardTitle className="text-lg">Creator</CardTitle>
                          <CardDescription>
                            $9.99/month
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              500 AI credits/month
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              Unlimited published universes
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              Analytics dashboard
                            </li>
                          </ul>
                          <Button className="mt-4 w-full">
                            Upgrade to Creator
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="relative border-primary">
                        <div className="absolute -top-3 left-4">
                          <Badge>Popular</Badge>
                        </div>
                        <CardHeader>
                          <CardTitle className="text-lg">Pro</CardTitle>
                          <CardDescription>
                            $19.99/month
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              2000 AI credits/month
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              Priority AI processing
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              Early access to features
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              Verified creator badge
                            </li>
                          </ul>
                          <Button className="mt-4 w-full">
                            Upgrade to Pro
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {profile.tier !== "free" && (
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Manage Billing
                    </Button>
                    <Button variant="ghost" className="text-destructive">
                      Cancel Subscription
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    Your account details and security settings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      value={user?.email ?? ""}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-sm text-muted-foreground">
                      Contact support to change your email address.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Username</Label>
                    <Input
                      value={profile.username}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-sm text-muted-foreground">
                      Usernames cannot be changed after registration.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                  <CardDescription>
                    Change your account password.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline">
                    <Key className="mr-2 h-4 w-4" />
                    Change Password
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                  <CardDescription>
                    Irreversible actions that affect your account.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Warning</AlertTitle>
                    <AlertDescription>
                      Deleting your account is permanent and cannot be undone.
                      All your universes, saves, and data will be permanently
                      deleted.
                    </AlertDescription>
                  </Alert>

                  <Button variant="destructive">Delete Account</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default SettingsPage;
