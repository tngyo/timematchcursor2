import { writable } from 'svelte/store';
import { supabase } from './supabase.js';

// Create auth store
export const authStore = writable({
  user: null,
  loading: true,
  initialized: false,
  session: null,
  error: null
});

// Initialize auth state
export async function initAuth() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      authStore.set({
        user: null,
        session: null,
        loading: false,
        initialized: true,
        error: error.message
      });
      return;
    }
    
    authStore.set({
      user: session?.user || null,
      session: session,
      loading: false,
      initialized: true,
      error: null
    });

    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      authStore.set({
        user: session?.user || null,
        session: session,
        loading: false,
        initialized: true,
        error: null
      });
      
      // Handle specific auth events
      if (event === 'SIGNED_IN') {
        console.log('User signed in successfully');
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed');
      }
    });
  } catch (error) {
    console.error('Error initializing auth:', error);
    authStore.set({
      user: null,
      session: null,
      loading: false,
      initialized: true,
      error: error.message
    });
  }
}

// Sign out
export async function signOut() {
  try {
    authStore.update(state => ({ ...state, loading: true, error: null }));
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Error signing out:', error);
      authStore.update(state => ({
        ...state,
        loading: false,
        error: error.message
      }));
      throw error;
    }
    
    // Clear local state immediately
    authStore.set({
      user: null,
      session: null,
      loading: false,
      initialized: true,
      error: null
    });
    
  } catch (error) {
    authStore.update(state => ({
      ...state,
      loading: false,
      error: error.message
    }));
    throw error;
  }
}

// Sign in with email and password
export async function signInWithEmail(email, password) {
  try {
    authStore.update(state => ({ ...state, loading: true, error: null }));
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      authStore.update(state => ({
        ...state,
        loading: false,
        error: error.message
      }));
      throw error;
    }
    
    return data;
  } catch (error) {
    authStore.update(state => ({
      ...state,
      loading: false,
      error: error.message
    }));
    throw error;
  }
}

// Sign up with email and password
export async function signUpWithEmail(email, password) {
  try {
    authStore.update(state => ({ ...state, loading: true, error: null }));
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
    
    if (error) {
      authStore.update(state => ({
        ...state,
        loading: false,
        error: error.message
      }));
      throw error;
    }
    
    return data;
  } catch (error) {
    authStore.update(state => ({
      ...state,
      loading: false,
      error: error.message
    }));
    throw error;
  }
}

// Reset password
export async function resetPassword(email) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
}

// Clear auth error
export function clearAuthError() {
  authStore.update(state => ({ ...state, error: null }));
}

// Helper function to check if user is authenticated
export function isAuthenticated() {
  let currentUser = null;
  authStore.subscribe(user => currentUser = user.user)();
  return !!currentUser;
}

// Helper function to get current user
export function getCurrentUser() {
  let currentUser = null;
  authStore.subscribe(user => currentUser = user.user)();
  return currentUser;
}

// Helper function to get current session
export function getCurrentSession() {
  let currentSession = null;
  authStore.subscribe(state => currentSession = state.session)();
  return currentSession;
}

// Helper function to check if session is valid
export function isSessionValid() {
  const session = getCurrentSession();
  return session && session.expires_at && session.expires_at > Date.now() / 1000;
}