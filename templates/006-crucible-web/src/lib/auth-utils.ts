import { getSupabase } from './supabase';

export async function signInWithEmail(email: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { data, error };
}

export async function signOut() {
  const supabase = getSupabase();
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getSession() {
  const supabase = getSupabase();
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
}

export function onAuthStateChange(callback: (event: string, session: any) => void) {
  const supabase = getSupabase();
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
  return subscription;
}
