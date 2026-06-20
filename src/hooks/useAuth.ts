import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useLibraryStore } from '../store/useLibraryStore';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const { user, setUser, clearStore } = useLibraryStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        handleProfileUpsert(session.user);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        handleProfileUpsert(session.user);
      } else {
        clearStore();
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, clearStore]);

  const handleProfileUpsert = async (authUser: any) => {
    try {
      console.log("[DEBUG] users upsert — attempting with:", JSON.stringify({
        id: authUser.id,
        email: authUser.email,
        full_name: authUser.user_metadata?.full_name,
        avatar_url: authUser.user_metadata?.avatar_url,
      }, null, 2));

      const { data, error, status, statusText } = await supabase
        .from('users')
        .upsert({
          id: authUser.id,
          email: authUser.email,
          full_name: authUser.user_metadata?.full_name,
          avatar_url: authUser.user_metadata?.avatar_url,
        }, { onConflict: 'id' });

      if (error) {
        console.error("[DEBUG] users upsert FAILED:", JSON.stringify({
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          status,
          statusText,
        }, null, 2));
      } else {
        console.log("[DEBUG] users upsert SUCCESS — status:", status, "data:", data);
      }
    } catch (err) {
      console.error('[DEBUG] users upsert EXCEPTION:', JSON.stringify(err, Object.getOwnPropertyNames(err as object), 2));
    }
  };

  const loginWithGoogle = async () => {
    try {
      console.log("Origin:", window.location.origin);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });
      console.log("OAuth initiated");
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'Failed to login');
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Logged out successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to logout');
    }
  };

  return { user, loading, loginWithGoogle, logout };
};
