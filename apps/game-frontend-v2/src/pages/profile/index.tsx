import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Settings,
  Globe,
  Calendar,
  Users,
  Loader2,
  CheckCircle,
  Edit2,
  Camera,
  BookOpen,
  Heart,
  Play,
  Sparkles,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useAuthStore } from "@/store/auth-store";
import { useUserStore, useUserStats } from "@/store/user-store";
import { supabase } from "@/shared/lib/supabase";
import type { Database } from "@/shared/lib/database.types";

type UniverseRow = Database["public"]["Tables"]["universes"]["Row"];

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile, isLoading: authLoading, updateProfile } = useAuthStore();
  const { loadStats } = useUserStore();
  const stats = useUserStats();

  const [universes, setUniverses] = useState<UniverseRow[]>([]);
  const [isLoadingUniverses, setIsLoadingUniverses] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    display_name: "",
    bio: "",
    website: "",
  });

  useEffect(() => {
    if (user?.id) {
      loadStats(user.id);
      loadUniverses();
    }
  }, [user?.id, loadStats]);

  useEffect(() => {
    if (profile) {
      setEditForm({
        display_name: profile.display_name || "",
        bio: profile.bio || "",
        website: profile.website || "",
      });
    }
  }, [profile]);

  const loadUniverses = async () => {
    if (!user?.id) return;

    setIsLoadingUniverses(true);
    try {
      const { data, error } = await supabase
        .from("universes")
        .select("*")
        .eq("owner_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setUniverses(data ?? []);
    } catch (error) {
      console.error("Failed to load universes:", error);
    } finally {
      setIsLoadingUniverses(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    const result = await updateProfile({
      display_name: editForm.display_name || null,
      bio: editForm.bio || null,
      website: editForm.website || null,
    });

    setIsSaving(false);
    if (result.success) {
      setIsEditDialogOpen(false);
    }
  };

  if (authLoading || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const publishedUniverses = universes.filter((u) => u.is_published);
  const draftUniverses = universes.filter((u) => !u.is_published);

  return (
    <div className="min-h-screen bg-background">
      {/* Profile Header */}
      <div className="border-b bg-card">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-2xl">
                  <User className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                title="Change avatar"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col items-center gap-2 sm:flex-row">
                <h1 className="text-2xl font-bold">
                  {profile.display_name || profile.username}
                </h1>
                {profile.is_verified && (
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
                {profile.tier !== "free" && (
                  <Badge className="gap-1">
                    <Sparkles className="h-3 w-3" />
                    {profile.tier === "pro" ? "Pro" : "Creator"}
                  </Badge>
                )}
              </div>

              <p className="mt-1 text-muted-foreground">@{profile.username}</p>

              {profile.bio && (
                <p className="mt-3 max-w-lg text-sm">{profile.bio}</p>
              )}

              {/* Stats & Links */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground sm:justify-start">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {stats?.followerCount ?? 0} followers
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {stats?.followingCount ?? 0} following
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {new Date(profile.created_at).toLocaleDateString()}
                </span>
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                  </a>
                )}
              </div>

              {/* Action buttons */}
              <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                      <DialogDescription>
                        Update your public profile information.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="display_name">Display Name</Label>
                        <Input
                          id="display_name"
                          value={editForm.display_name}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              display_name: e.target.value,
                            }))
                          }
                          placeholder="Your display name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={editForm.bio}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, bio: e.target.value }))
                          }
                          placeholder="Tell others about yourself..."
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          value={editForm.website}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              website: e.target.value,
                            }))
                          }
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleSaveProfile} disabled={isSaving}>
                        {isSaving && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Save Changes
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" onClick={() => navigate("/profile/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">AI Credits</CardTitle>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile.ai_credits}</div>
              <p className="text-xs text-muted-foreground">Available credits</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Universes</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.universeCount ?? 0}</div>
              <p className="text-xs text-muted-foreground">
                {publishedUniverses.length} published
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Plays</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalPlays ?? 0}</div>
              <p className="text-xs text-muted-foreground">Across all universes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalLikes ?? 0}</div>
              <p className="text-xs text-muted-foreground">Across all universes</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="mx-auto max-w-5xl px-4 pb-8 sm:px-6 lg:px-8">
        <Tabs defaultValue="published">
          <TabsList>
            <TabsTrigger value="published">
              Published ({publishedUniverses.length})
            </TabsTrigger>
            <TabsTrigger value="drafts">
              Drafts ({draftUniverses.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="published" className="mt-6">
            {isLoadingUniverses ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : publishedUniverses.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {publishedUniverses.map((universe) => (
                  <UniverseCard key={universe.id} universe={universe} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-12 text-center">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 font-medium">No published universes</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Publish a universe to share it with others.
                </p>
                <Button className="mt-4" onClick={() => navigate("/universes")}>
                  Go to Universes
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="drafts" className="mt-6">
            {isLoadingUniverses ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : draftUniverses.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {draftUniverses.map((universe) => (
                  <UniverseCard key={universe.id} universe={universe} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-12 text-center">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 font-medium">No drafts</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Create a new universe to get started.
                </p>
                <Button className="mt-4" onClick={() => navigate("/universes")}>
                  Create Universe
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function UniverseCard({ universe }: { universe: UniverseRow }) {
  const navigate = useNavigate();

  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-accent/50"
      onClick={() => navigate(`/universes/${universe.id}`)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="line-clamp-1">{universe.name}</CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              {universe.description}
            </CardDescription>
          </div>
          {universe.is_premium && (
            <Badge variant="secondary">Premium</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Play className="h-3 w-3" />
            {universe.play_count}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            {universe.like_count}
          </span>
          <span className="ml-auto">
            {universe.visibility === "private" && (
              <Badge variant="outline">Private</Badge>
            )}
            {universe.visibility === "unlisted" && (
              <Badge variant="outline">Unlisted</Badge>
            )}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProfilePage;
