import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "@/api/supabaseClient";
import { Tier } from "@/lib/types";

// ============================================================
// Types
// ============================================================

export interface User {
  id: string;
  email: string;
  fullName: string;
  company?: string;
  role?: string;
  avatar?: string;
  vendorTier: Tier;
  vendorId?: string;
  tagline?: string;
  website?: string;
  location?: string;
  phone?: string;
  calendlyLink?: string;
  notifications?: boolean;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<User>;
  signInWithGoogle: () => Promise<void>;
  signup: (
    email: string,
    password: string,
    fullName: string,
    company?: string,
    role?: string,
    phone?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================
// Helper: User data caching in localStorage
// ============================================================

const USER_CACHE_KEY = 'hr-hub-user-cache';

function getCachedUser(): User | null {
  try {
    const cached = localStorage.getItem(USER_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      console.log('[AuthProvider] Found cached user:', parsed.email);
      return parsed;
    }
  } catch (err) {
    console.error('[AuthProvider] Error reading cached user:', err);
  }
  return null;
}

function setCachedUser(user: User): void {
  try {
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
    console.log('[AuthProvider] Cached user data');
  } catch (err) {
    console.error('[AuthProvider] Error caching user:', err);
  }
}

function clearCachedUser(): void {
  try {
    localStorage.removeItem(USER_CACHE_KEY);
    console.log('[AuthProvider] Cleared cached user');
  } catch (err) {
    console.error('[AuthProvider] Error clearing cached user:', err);
  }
}

// ============================================================
// Helper: Build User from Supabase session + vendor data
// ============================================================

async function fetchUserDataFromRPC(supabaseUser: SupabaseUser): Promise<User> {
  console.log('[fetchUserDataFromRPC] Fetching fresh data for user:', supabaseUser.id.slice(0, 8));
  
  // Get user metadata from Supabase auth
  const metadata = supabaseUser.user_metadata || {};
  
  // Check if user is admin
  let isAdmin = false;
  try {
    const { data: isAdminData, error: adminError } = await supabase.rpc('is_admin');
    if (adminError) {
      console.error('[fetchUserDataFromRPC] Error checking admin status:', adminError);
    } else {
      isAdmin = isAdminData === true;
      console.log('[fetchUserDataFromRPC] Admin check result:', isAdminData, '-> isAdmin:', isAdmin);
    }
  } catch (err) {
    console.error('[fetchUserDataFromRPC] Failed to check admin status:', err);
  }

  // Try to get vendor info for this user
  let vendorInfo: {
    vendor_id: string;
    company_name: string;
    subscription: Tier;
    website_link: string;
    company_motto: string;
    headquarters: string;
  } | null = null;

  try {
    const { data: vendorData, error: vendorError } = await supabase.rpc('get_current_user_vendor');
    if (vendorError) {
      console.error('[fetchUserDataFromRPC] Error fetching vendor info:', vendorError);
    } else if (vendorData && vendorData.length > 0) {
      vendorInfo = vendorData[0];
      console.log('[fetchUserDataFromRPC] Vendor info loaded:', vendorInfo);
    } else {
      console.log('[fetchUserDataFromRPC] No vendor record found for this user');
    }
  } catch (err) {
    console.error('[fetchUserDataFromRPC] Failed to fetch vendor info:', err);
  }

  const user: User = {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    fullName: metadata.full_name || metadata.name || supabaseUser.email?.split('@')[0] || '',
    company: vendorInfo?.company_name || metadata.company,
    role: metadata.role,
    avatar: metadata.avatar_url,
    vendorTier: vendorInfo?.subscription || 'freemium',
    vendorId: vendorInfo?.vendor_id,
    tagline: vendorInfo?.company_motto,
    website: vendorInfo?.website_link,
    location: vendorInfo?.headquarters,
    phone: metadata.phone,
    notifications: metadata.notifications !== undefined ? metadata.notifications : true,
    isAdmin,
  };

  console.log('[fetchUserDataFromRPC] Complete:', { email: user.email, isAdmin: user.isAdmin, vendorTier: user.vendorTier });
  return user;
}

// ============================================================
// Provider Component
// ============================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize: check for existing session
  useEffect(() => {
    console.log('[AuthProvider] Initializing...');
    
    let isMounted = true;
    
    // STEP 1: Immediately try to restore from cache for instant UI
    const cachedUser = getCachedUser();
    if (cachedUser) {
      console.log('[AuthProvider] Instantly restoring from cache:', cachedUser.email, 'isAdmin:', cachedUser.isAdmin);
      setUser(cachedUser);
    }
    
    // STEP 2: Check Supabase session
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (!isMounted) return;
      
      console.log('[AuthProvider] getSession result:', { 
        hasSession: !!session, 
        userId: session?.user?.id?.slice(0, 8),
        error 
      });
      
      if (error) {
        console.error('[AuthProvider] getSession error:', error);
        // Clear cache if session is invalid
        clearCachedUser();
        setUser(null);
        setIsLoading(false);
        return;
      }
      
      setSession(session);
      
      if (session?.user) {
        // If we have cached user for this user ID, use it immediately
        if (cachedUser && cachedUser.id === session.user.id) {
          console.log('[AuthProvider] Using cached user - loading complete');
          setIsLoading(false);
          
          // Optionally refresh data in background (don't await, don't block)
          fetchUserDataFromRPC(session.user).then(freshUser => {
            if (isMounted) {
              setUser(freshUser);
              setCachedUser(freshUser);
              console.log('[AuthProvider] Background refresh complete');
            }
          }).catch(err => {
            console.error('[AuthProvider] Background refresh failed:', err);
          });
        } else {
          // No cache or different user - fetch fresh data
          console.log('[AuthProvider] No valid cache, fetching fresh data...');
          try {
            const freshUser = await fetchUserDataFromRPC(session.user);
            if (isMounted) {
              setUser(freshUser);
              setCachedUser(freshUser);
            }
          } catch (err) {
            console.error('[AuthProvider] Error fetching user data:', err);
          }
          if (isMounted) setIsLoading(false);
        }
      } else {
        // No session
        console.log('[AuthProvider] No session found');
        clearCachedUser();
        setUser(null);
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AuthProvider] onAuthStateChange event:', event);
        
        if (event === 'SIGNED_OUT') {
          clearCachedUser();
          setSession(null);
          setUser(null);
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('[AuthProvider] Token refreshed');
          setSession(session);
        }
        // Note: We don't handle SIGNED_IN here because login() handles it directly
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Login with email/password
  // Returns the user object so caller can check isAdmin for redirects
  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (!data.user) {
      throw new Error("Login failed - no user returned");
    }
    
    // Fetch fresh user data (this is a fresh login, so we need to make RPC calls)
    const appUser = await fetchUserDataFromRPC(data.user);
    setUser(appUser);
    setSession(data.session);
    
    // Cache user data for instant restoration on page reload
    setCachedUser(appUser);
    
    return appUser;
  }, []);

  // Login with Google OAuth
  const signInWithGoogle = useCallback(async (): Promise<void> => {
    const options =
      typeof window !== "undefined" ? { redirectTo: window.location.origin } : undefined;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options,
    });

    if (error) {
      throw new Error(error.message);
    }
  }, []);

  // Sign up with email/password
  const signup = useCallback(async (
    email: string, 
    password: string, 
    fullName: string, 
    company?: string, 
    role?: string,
    phone?: string
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          company,
          role,
          phone: phone || undefined,
        },
      },
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (data.user) {
      const appUser = await fetchUserDataFromRPC(data.user);
      setUser(appUser);
      setCachedUser(appUser);
      setSession(data.session);
    }
  }, []);

  // Logout - clears Supabase session and local state
  const logout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
    } catch (err) {
      console.error('Failed to sign out:', err);
    } finally {
      // Always clear local state, even if signOut fails
      setUser(null);
      setSession(null);
      
      // Clear cached user data
      clearCachedUser();
      
      // Clear any Supabase-related localStorage items
      // Supabase stores session with keys like 'sb-<project-ref>-auth-token'
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          localStorage.removeItem(key);
        }
      });
      
      console.log('Session cleared');
    }
  }, []);

  // Update local user state (for UI updates before server sync)
  const updateUser = useCallback((updates: Partial<User>) => {
    if (user) {
      const nextUser = { ...user, ...updates };
      setUser(nextUser);
      setCachedUser(nextUser);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      session,
      isAuthenticated: !!session,
      isLoading,
      isAdmin: user?.isAdmin ?? false,
      login,
      signInWithGoogle,
      signup, 
      logout,
      updateUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================
// Hook
// ============================================================

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
