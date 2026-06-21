import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useLibraryStore } from '../store/useLibraryStore';
import type { Song } from '../store/usePlayerStore';
import toast from 'react-hot-toast';

export const useLikedSongs = () => {
  const { user, likedSongs, setLikedSongs, addLikedSong, removeLikedSong } = useLibraryStore();

  useEffect(() => {
    if (!user) {
      setLikedSongs({});
      return;
    }

    const fetchLikedSongs = async () => {
      try {
        const { data, error } = await supabase
          .from('liked_songs')
          .select('*')
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        const likedMap: Record<string, Song> = {};
        data.forEach(row => {
          likedMap[row.video_id] = {
            videoId: row.video_id,
            title: row.title,
            artist: row.artist,
            thumbnail: row.thumbnail,
            duration: '', // liked_songs table has no duration column
          };
        });
        setLikedSongs(likedMap);
      } catch (err) {
        console.error('Failed to fetch liked songs:', err);
      }
    };

    fetchLikedSongs();
  }, [user, setLikedSongs]);

  const isLiked = (videoId: string) => {
    return !!likedSongs[videoId];
  };

  const toggleLike = async (song: Song) => {
    if (!user) {
      toast.error('Please login to like songs');
      return;
    }

    const currentlyLiked = isLiked(song.videoId);

    // Optimistic UI update
    if (currentlyLiked) {
      removeLikedSong(song.videoId);
    } else {
      addLikedSong(song);
    }

    try {
      if (currentlyLiked) {
        const { error } = await supabase
          .from('liked_songs')
          .delete()
          .eq('user_id', user.id)
          .eq('video_id', song.videoId);
          
        if (error) throw error;
        toast.success('Removed from Liked Songs');
      } else {
        const { error } = await supabase
          .from('liked_songs')
          .insert({
            user_id: user.id,
            video_id: song.videoId,
            title: song.title,
            artist: song.artist,
            thumbnail: song.thumbnail,
            // NOTE: liked_songs table has no duration column — don't include it
          });
          
        if (error) throw error;
        toast.success('Added to Liked Songs');
      }
    } catch (err: any) {
      // Revert optimistic update on failure
      if (currentlyLiked) {
        addLikedSong(song);
      } else {
        removeLikedSong(song.videoId);
      }
      toast.error(err.message || 'Failed to update liked songs');
      console.error(err);
    }
  };

  return { likedSongs, isLiked, toggleLike };
};
