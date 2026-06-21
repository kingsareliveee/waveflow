-- Supabase Database Fix & RLS Migration

-- 1. Create or Update user_artist_preferences table
CREATE TABLE IF NOT EXISTS public.user_artist_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    artist_name TEXT NOT NULL,
    genre TEXT,
    language TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure genre and language exist if the table was created previously without them
ALTER TABLE public.user_artist_preferences ADD COLUMN IF NOT EXISTS genre TEXT;
ALTER TABLE public.user_artist_preferences ADD COLUMN IF NOT EXISTS language TEXT;

-- 2. Create missing tables requested by the user
CREATE TABLE IF NOT EXISTS public.liked_songs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    video_id TEXT NOT NULL,
    title TEXT,
    artist TEXT,
    thumbnail TEXT,
    duration TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, video_id)
);

CREATE TABLE IF NOT EXISTS public.recently_played (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    video_id TEXT NOT NULL,
    title TEXT,
    artist TEXT,
    thumbnail TEXT,
    duration TEXT,
    played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.playlists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    cover_image TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.playlist_songs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE,
    video_id TEXT NOT NULL,
    title TEXT,
    artist TEXT,
    thumbnail TEXT,
    duration TEXT,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Artists, Albums, Top Tracks usually hold global metadata or cache
CREATE TABLE IF NOT EXISTS public.artists (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    thumbnail TEXT,
    genre TEXT,
    language TEXT
);

CREATE TABLE IF NOT EXISTS public.albums (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    artist TEXT,
    thumbnail TEXT,
    release_date TEXT
);

CREATE TABLE IF NOT EXISTS public.top_tracks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    video_id TEXT NOT NULL,
    title TEXT,
    artist TEXT,
    play_count INTEGER DEFAULT 0
);

-- 3. Fix Row Level Security (RLS) Policies

-- user_artist_preferences
ALTER TABLE public.user_artist_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.user_artist_preferences;
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_artist_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_artist_preferences;
DROP POLICY IF EXISTS "Users can delete their own preferences" ON public.user_artist_preferences;

CREATE POLICY "Users can insert their own preferences" ON public.user_artist_preferences 
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own preferences" ON public.user_artist_preferences 
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own preferences" ON public.user_artist_preferences 
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own preferences" ON public.user_artist_preferences 
    FOR DELETE USING (auth.uid() = user_id);

-- liked_songs
ALTER TABLE public.liked_songs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their liked songs" ON public.liked_songs;
CREATE POLICY "Users can manage their liked songs" ON public.liked_songs
    FOR ALL USING (auth.uid() = user_id);

-- recently_played
ALTER TABLE public.recently_played ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their recently played" ON public.recently_played;
CREATE POLICY "Users can manage their recently played" ON public.recently_played
    FOR ALL USING (auth.uid() = user_id);

-- playlists
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own playlists" ON public.playlists;
DROP POLICY IF EXISTS "Anyone can view public playlists" ON public.playlists;
CREATE POLICY "Users can manage their own playlists" ON public.playlists
    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view public playlists" ON public.playlists
    FOR SELECT USING (is_public = true);

-- playlist_songs
ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;
-- For playlist_songs, users can manage songs if they own the playlist.
DROP POLICY IF EXISTS "Users can manage songs in their playlists" ON public.playlist_songs;
CREATE POLICY "Users can manage songs in their playlists" ON public.playlist_songs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.playlists p 
            WHERE p.id = playlist_songs.playlist_id AND p.user_id = auth.uid()
        )
    );

-- Users Table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.users;
CREATE POLICY "Users can manage their own profile" ON public.users
    FOR ALL USING (auth.uid() = id);

-- Public Tables (Artists, Albums, Top Tracks)
-- Allow anyone to select, but restrict modification to service roles or authenticated users where appropriate
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view artists" ON public.artists;
CREATE POLICY "Anyone can view artists" ON public.artists FOR SELECT USING (true);

ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view albums" ON public.albums;
CREATE POLICY "Anyone can view albums" ON public.albums FOR SELECT USING (true);

ALTER TABLE public.top_tracks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view top tracks" ON public.top_tracks;
CREATE POLICY "Anyone can view top tracks" ON public.top_tracks FOR SELECT USING (true);

-- Done!
