-- =============================================================================
-- WDYDN Marketplace Database Schema
-- Run this in Supabase SQL Editor to set up the database
-- =============================================================================

-- =============================================================================
-- 1. CORE USER TABLES
-- =============================================================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,

  -- AI Configuration
  openrouter_api_key TEXT,
  default_model_smart TEXT DEFAULT 'google/gemini-3-flash-preview',
  default_model_cheap TEXT DEFAULT 'xiaomi/mimo-v2-flash',

  -- Creator tier
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'creator', 'pro')),
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,

  -- Credits system
  ai_credits INTEGER DEFAULT 100,
  total_tips_received INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User settings
CREATE TABLE public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  notification_new_follower BOOLEAN DEFAULT true,
  notification_new_content BOOLEAN DEFAULT true,
  notification_comments BOOLEAN DEFAULT true,
  notification_likes BOOLEAN DEFAULT true,
  theme TEXT DEFAULT 'dark',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User follows
CREATE TABLE public.follows (
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX idx_follows_follower ON public.follows(follower_id);
CREATE INDEX idx_follows_following ON public.follows(following_id);

-- =============================================================================
-- 2. CONTENT TABLES
-- =============================================================================

-- Universes (main content type)
CREATE TABLE public.universes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Core fields
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  theme TEXT NOT NULL,

  -- Visibility & Publishing
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'unlisted', 'public')),
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,

  -- Full universe data as JSONB
  data JSONB NOT NULL,

  -- Versioning
  version INTEGER DEFAULT 1,

  -- Marketplace metadata
  is_premium BOOLEAN DEFAULT false,
  price_credits INTEGER DEFAULT 0,

  -- Categorization
  tags TEXT[] DEFAULT '{}',
  genre TEXT,
  difficulty TEXT CHECK (difficulty IS NULL OR difficulty IN ('easy', 'medium', 'hard', 'expert')),
  estimated_playtime_minutes INTEGER,

  -- Stats (denormalized for performance)
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  play_count INTEGER DEFAULT 0,
  bookmark_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_universes_owner ON public.universes(owner_id);
CREATE INDEX idx_universes_visibility ON public.universes(visibility) WHERE is_published = true;
CREATE INDEX idx_universes_tags ON public.universes USING GIN(tags);
CREATE INDEX idx_universes_published ON public.universes(published_at DESC) WHERE is_published = true;
CREATE INDEX idx_universes_trending ON public.universes(like_count DESC, play_count DESC) WHERE is_published = true;
CREATE INDEX idx_universes_name_search ON public.universes USING GIN(to_tsvector('english', name || ' ' || description));

-- Universe versions (for versioning without breaking saves)
CREATE TABLE public.universe_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  universe_id UUID NOT NULL REFERENCES public.universes(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  data JSONB NOT NULL,
  changelog TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (universe_id, version)
);

CREATE INDEX idx_universe_versions_universe ON public.universe_versions(universe_id);

-- Shared content (characters, locations, items that can be shared independently)
CREATE TABLE public.shared_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  content_type TEXT NOT NULL CHECK (content_type IN ('character', 'location', 'item', 'challenge', 'moment')),
  name TEXT NOT NULL,
  description TEXT,

  -- The actual content data
  data JSONB NOT NULL,

  -- Visibility
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'unlisted', 'public')),
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,

  -- Categorization
  tags TEXT[] DEFAULT '{}',

  -- Stats
  like_count INTEGER DEFAULT 0,
  use_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shared_content_owner ON public.shared_content(owner_id);
CREATE INDEX idx_shared_content_type ON public.shared_content(content_type) WHERE is_published = true;
CREATE INDEX idx_shared_content_tags ON public.shared_content USING GIN(tags);

-- =============================================================================
-- 3. SOCIAL & ENGAGEMENT TABLES
-- =============================================================================

-- Likes (polymorphic)
CREATE TABLE public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('universe', 'shared_content', 'comment')),
  target_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, target_type, target_id)
);

CREATE INDEX idx_likes_user ON public.likes(user_id);
CREATE INDEX idx_likes_target ON public.likes(target_type, target_id);

-- Comments
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('universe', 'shared_content')),
  target_id UUID NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT false,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_target ON public.comments(target_type, target_id);
CREATE INDEX idx_comments_user ON public.comments(user_id);
CREATE INDEX idx_comments_parent ON public.comments(parent_id);

-- Bookmarks
CREATE TABLE public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  universe_id UUID NOT NULL REFERENCES public.universes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, universe_id)
);

CREATE INDEX idx_bookmarks_user ON public.bookmarks(user_id);

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'new_follower', 'new_like', 'new_comment', 'new_reply',
    'new_content', 'tip_received', 'universe_update'
  )),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_type TEXT,
  target_id UUID,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read, created_at DESC);

-- =============================================================================
-- 4. PLAYER & GAME SESSION TABLES
-- =============================================================================

-- Game saves
CREATE TABLE public.game_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  universe_id UUID NOT NULL REFERENCES public.universes(id) ON DELETE CASCADE,
  universe_version INTEGER NOT NULL,

  -- Save metadata
  name TEXT DEFAULT 'Autosave',
  slot INTEGER DEFAULT 0,

  -- Game state
  state JSONB NOT NULL,

  -- Progress info
  play_time_seconds INTEGER DEFAULT 0,
  moments_lived INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_game_saves_user ON public.game_saves(user_id);
CREATE INDEX idx_game_saves_universe ON public.game_saves(universe_id);
CREATE UNIQUE INDEX idx_game_saves_slot ON public.game_saves(user_id, universe_id, slot);

-- Play history
CREATE TABLE public.play_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  universe_id UUID NOT NULL REFERENCES public.universes(id) ON DELETE CASCADE,
  last_save_id UUID REFERENCES public.game_saves(id) ON DELETE SET NULL,
  play_time_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  last_played_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, universe_id)
);

CREATE INDEX idx_play_history_user ON public.play_history(user_id, last_played_at DESC);

-- =============================================================================
-- 5. ECONOMY TABLES
-- =============================================================================

-- Credit transactions
CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'purchase', 'subscription', 'tip_sent', 'tip_received',
    'ai_usage', 'content_purchase', 'content_sale', 'bonus'
  )),
  reference_type TEXT,
  reference_id UUID,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_credit_transactions_user ON public.credit_transactions(user_id, created_at DESC);

-- Tips
CREATE TABLE public.tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  universe_id UUID REFERENCES public.universes(id) ON DELETE SET NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tips_receiver ON public.tips(receiver_id, created_at DESC);

-- Content purchases
CREATE TABLE public.content_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  universe_id UUID NOT NULL REFERENCES public.universes(id) ON DELETE CASCADE,
  price_paid INTEGER NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, universe_id)
);

CREATE INDEX idx_content_purchases_user ON public.content_purchases(user_id);

-- Subscriptions
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('creator', 'pro')),
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired')),
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON public.subscriptions(user_id);

-- =============================================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.universes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.universe_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.play_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles: public read, own write
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- User settings: own only
CREATE POLICY "Users can manage own settings"
  ON public.user_settings FOR ALL
  USING (auth.uid() = user_id);

-- Follows: anyone can read, own write
CREATE POLICY "Follows are viewable by everyone"
  ON public.follows FOR SELECT USING (true);

CREATE POLICY "Users can manage own follows"
  ON public.follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete own follows"
  ON public.follows FOR DELETE
  USING (auth.uid() = follower_id);

-- Universes: owner full access, public read for published
CREATE POLICY "Users can view own universes"
  ON public.universes FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Users can view public universes"
  ON public.universes FOR SELECT
  USING (visibility = 'public' AND is_published = true);

CREATE POLICY "Users can view unlisted universes"
  ON public.universes FOR SELECT
  USING (visibility = 'unlisted');

CREATE POLICY "Users can insert own universes"
  ON public.universes FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own universes"
  ON public.universes FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Users can delete own universes"
  ON public.universes FOR DELETE
  USING (owner_id = auth.uid());

-- Universe versions: same as universes
CREATE POLICY "Users can view own universe versions"
  ON public.universe_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.universes
      WHERE id = universe_versions.universe_id
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view public universe versions"
  ON public.universe_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.universes
      WHERE id = universe_versions.universe_id
      AND visibility = 'public' AND is_published = true
    )
  );

CREATE POLICY "Users can insert own universe versions"
  ON public.universe_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.universes
      WHERE id = universe_versions.universe_id
      AND owner_id = auth.uid()
    )
  );

-- Shared content: similar to universes
CREATE POLICY "Users can view own shared content"
  ON public.shared_content FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Users can view public shared content"
  ON public.shared_content FOR SELECT
  USING (visibility = 'public' AND is_published = true);

CREATE POLICY "Users can manage own shared content"
  ON public.shared_content FOR ALL
  USING (owner_id = auth.uid());

-- Likes: public read, own write
CREATE POLICY "Likes are viewable by everyone"
  ON public.likes FOR SELECT USING (true);

CREATE POLICY "Users can manage own likes"
  ON public.likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
  ON public.likes FOR DELETE
  USING (auth.uid() = user_id);

-- Comments: public read, own write
CREATE POLICY "Comments are viewable by everyone"
  ON public.comments FOR SELECT USING (true);

CREATE POLICY "Users can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

-- Bookmarks: own only
CREATE POLICY "Users can manage own bookmarks"
  ON public.bookmarks FOR ALL
  USING (auth.uid() = user_id);

-- Notifications: own only
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- System can create notifications (via service role)
CREATE POLICY "Service can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Game saves: own only
CREATE POLICY "Users can manage own saves"
  ON public.game_saves FOR ALL
  USING (auth.uid() = user_id);

-- Play history: own only
CREATE POLICY "Users can manage own play history"
  ON public.play_history FOR ALL
  USING (auth.uid() = user_id);

-- Credit transactions: own only (read)
CREATE POLICY "Users can view own transactions"
  ON public.credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Service can create transactions
CREATE POLICY "Service can create transactions"
  ON public.credit_transactions FOR INSERT
  WITH CHECK (true);

-- Tips: own read
CREATE POLICY "Users can view own tips"
  ON public.tips FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Service can create tips"
  ON public.tips FOR INSERT
  WITH CHECK (true);

-- Content purchases: own only
CREATE POLICY "Users can view own purchases"
  ON public.content_purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can create purchases"
  ON public.content_purchases FOR INSERT
  WITH CHECK (true);

-- Subscriptions: own only
CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can manage subscriptions"
  ON public.subscriptions FOR ALL
  WITH CHECK (true);

-- =============================================================================
-- 7. FUNCTIONS & TRIGGERS
-- =============================================================================

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_universes_updated_at
  BEFORE UPDATE ON public.universes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_shared_content_updated_at
  BEFORE UPDATE ON public.shared_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_game_saves_updated_at
  BEFORE UPDATE ON public.game_saves
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Function to increment/decrement like counts
CREATE OR REPLACE FUNCTION public.update_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.target_type = 'universe' THEN
      UPDATE public.universes SET like_count = like_count + 1 WHERE id = NEW.target_id;
    ELSIF NEW.target_type = 'shared_content' THEN
      UPDATE public.shared_content SET like_count = like_count + 1 WHERE id = NEW.target_id;
    ELSIF NEW.target_type = 'comment' THEN
      UPDATE public.comments SET like_count = like_count + 1 WHERE id = NEW.target_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.target_type = 'universe' THEN
      UPDATE public.universes SET like_count = like_count - 1 WHERE id = OLD.target_id;
    ELSIF OLD.target_type = 'shared_content' THEN
      UPDATE public.shared_content SET like_count = like_count - 1 WHERE id = OLD.target_id;
    ELSIF OLD.target_type = 'comment' THEN
      UPDATE public.comments SET like_count = like_count - 1 WHERE id = OLD.target_id;
    END IF;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_like_change
  AFTER INSERT OR DELETE ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.update_like_count();

-- Function to update comment counts
CREATE OR REPLACE FUNCTION public.update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.target_type = 'universe' AND NEW.parent_id IS NULL THEN
      UPDATE public.universes SET comment_count = comment_count + 1 WHERE id = NEW.target_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.target_type = 'universe' AND OLD.parent_id IS NULL THEN
      UPDATE public.universes SET comment_count = comment_count - 1 WHERE id = OLD.target_id;
    END IF;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_comment_change
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_comment_count();

-- Function to update bookmark counts
CREATE OR REPLACE FUNCTION public.update_bookmark_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.universes SET bookmark_count = bookmark_count + 1 WHERE id = NEW.universe_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.universes SET bookmark_count = bookmark_count - 1 WHERE id = OLD.universe_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_bookmark_change
  AFTER INSERT OR DELETE ON public.bookmarks
  FOR EACH ROW EXECUTE FUNCTION public.update_bookmark_count();

-- =============================================================================
-- 8. STORAGE BUCKETS
-- =============================================================================

-- Create storage buckets (run these separately in Supabase Dashboard or use the Storage API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('universes', 'universes', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('shared-content', 'shared-content', false);
