import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useLibraryStore } from '../store/useLibraryStore';
import toast from 'react-hot-toast';

// Module-level state for single subscription
let globalUser: any = null;
let globalLoading = true;
let lastProcessedUserId = "";
const listeners = new Set<(user: any, loading: boolean, event?: string) => void>();
let globalSubscription: { unsubscribe: () => void } | null = null;

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

const initGlobalAuthListener = (setUser: (user: any) => void, clearStore: () => void) => {
  if (globalSubscription) return;

  // 1. Get initial session
  supabase.auth.getSession().then(({ data: { session } }) => {
    globalUser = session?.user ?? null;
    globalLoading = false;
    setUser(globalUser);
    
    // Notify all active hook instances
    listeners.forEach(l => l(globalUser, globalLoading, 'INITIAL_SESSION'));
  });

  // 2. Subscribe to auth events
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    console.log("[DEBUG] Auth state changed event:", event);
    globalUser = session?.user ?? null;
    globalLoading = false;
    setUser(globalUser);

    if (!globalUser) {
      clearStore();
      if (event === 'SIGNED_OUT') {
        lastProcessedUserId = "";
      }
    }

    listeners.forEach(l => l(globalUser, globalLoading, event));
  });

  globalSubscription = subscription;
};

export const useAuth = () => {
  const storeUser = useLibraryStore(state => state.user);
  const setUser = useLibraryStore(state => state.setUser);
  const clearStore = useLibraryStore(state => state.clearStore);
  const [loading, setLoading] = useState(globalLoading);
  const lastProcessedRef = useRef(lastProcessedUserId);

  useEffect(() => {
    // Sync local ref with module variable
    lastProcessedRef.current = lastProcessedUserId;

    // Register listener
    const listener = (u: any, l: boolean, event?: string) => {
      setLoading(l);
      if (u) {
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          if (lastProcessedRef.current !== u.id) {
            lastProcessedRef.current = u.id;
            lastProcessedUserId = u.id;
            handleProfileUpsert(u);
          }
        }
      } else {
        lastProcessedRef.current = "";
      }
    };
    listeners.add(listener);

    // Initialize global subscription if not done already
    initGlobalAuthListener(setUser, clearStore);

    return () => {
      listeners.delete(listener);
      if (listeners.size === 0 && globalSubscription) {
        globalSubscription.unsubscribe();
        globalSubscription = null;
        globalLoading = true;
      }
    };
  }, [setUser, clearStore]);

  const loginWithGoogle = async () => {
    try {
      const redirectTo = import.meta.env.VITE_APP_URL || window.location.origin;
      console.log("Origin:", window.location.origin, "Redirecting to:", redirectTo);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
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

  return { user: storeUser, loading, loginWithGoogle, logout };
};
