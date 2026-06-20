import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useLibraryStore } from '../store/useLibraryStore';
import type { Song } from '../store/usePlayerStore';

export const useRecentlyPlayed = () => {
  const { user, recentlyPlayed, setRecentlyPlayed, addRecentlyPlayed } = useLibraryStore();
  const lastLoggedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user) {
      setRecentlyPlayed([]);
      return;
    }

    const fetchHistory = async () => {
      try {
        const { data, error } = await supabase
          .from('recently_played')
          .select('*')
          .eq('user_id', user.id)
          .order('played_at', { ascending: false })
          .limit(20);
          
        if (error) throw error;
        
        const history: Song[] = data.map((row: any) => ({
          videoId: row.video_id,
          title: row.title,
          artist: row.artist,
          thumbnail: row.thumbnail,
          duration: row.duration,
        }));
        setRecentlyPlayed(history);
        
        if (history.length > 0) {
          lastLoggedRef.current = history[0].videoId;
        }
      } catch (err) {
        console.error('Failed to fetch recently played:', err);
      }
    };

    fetchHistory();
  }, [user, setRecentlyPlayed]);

  const logPlay = async (song: Song) => {
    if (!user) return;
    
    // Spam prevention: don't log if it's exactly the same song we just logged
    if (lastLoggedRef.current === song.videoId) return;

    // Optimistic UI update
    addRecentlyPlayed(song);
    lastLoggedRef.current = song.videoId;

    try {
      const { error } = await supabase
        .from('recently_played')
        .insert({
          user_id: user.id,
          video_id: song.videoId,
          title: song.title,
          artist: song.artist,
          thumbnail: song.thumbnail,
          duration: song.duration
        });
        
      if (error) throw error;
    } catch (err) {
      console.error('Failed to log recently played song:', err);
    }
  };

  return { recentlyPlayed, logPlay };
};
