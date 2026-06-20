import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mjabfvmvxhuipcdqpqqz.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Tzstas3YwEagp1Oe1BqDkQ_Fkyi_FkM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
      }
      liked_songs: {
        Row: {
          id: string
          user_id: string
          video_id: string
          title: string
          artist: string
          thumbnail: string
          duration: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          video_id: string
          title: string
          artist: string
          thumbnail: string
          duration: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          video_id?: string
          title?: string
          artist?: string
          thumbnail?: string
          duration?: string
          created_at?: string
        }
      }
      playlists: {
        Row: {
          id: string
          user_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          created_at?: string
        }
      }
      playlist_songs: {
        Row: {
          id: string
          playlist_id: string
          video_id: string
          title: string
          artist: string
          thumbnail: string
          duration: string
          position: number
          added_at: string
        }
        Insert: {
          id?: string
          playlist_id: string
          video_id: string
          title: string
          artist: string
          thumbnail: string
          duration: string
          position?: number
          added_at?: string
        }
        Update: {
          id?: string
          playlist_id?: string
          video_id?: string
          title?: string
          artist?: string
          thumbnail?: string
          duration?: string
          position?: number
          added_at?: string
        }
      }
      recently_played: {
        Row: {
          id: string
          user_id: string
          video_id: string
          title: string
          artist: string
          thumbnail: string
          duration: string
          played_at: string
        }
        Insert: {
          id?: string
          user_id: string
          video_id: string
          title: string
          artist: string
          thumbnail: string
          duration: string
          played_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          video_id?: string
          title?: string
          artist?: string
          thumbnail?: string
          duration?: string
          played_at?: string
        }
      }
    }
  }
}
