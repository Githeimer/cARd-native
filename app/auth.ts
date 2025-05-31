import { supabase } from './supabaseClient';
export * from './auth/useAuth';
export * from './auth/AuthProvider';

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(
  email: string,
  password: string,
  profile: { firstName: string; lastName: string; phone?: string }
) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { data, error };

  const userId = data.user?.id || data.session?.user?.id;
  if (!userId) {
    return {
      data,
      error: new Error("Email confirmation is required. Cannot create profile yet."),
    };
  }

  const { firstName, lastName, phone } = profile;
  const { error: profileError } = await supabase.from('card_profiles').upsert([
    {
      id: userId,
      full_name: `${firstName} ${lastName}`,
      phone: phone || null,
      email: email,
    },
  ]);

  if (profileError) {
    console.log('Profile insert error:', profileError);
  }

  return { data, error: profileError || error };
}

export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({ provider: 'google' });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export function getCurrentUser() {
  return supabase.auth.getUser();
}

export async function resetPasswordWithEmail(email: string) {
  return supabase.auth.resetPasswordForEmail(email, {
    // Optionally set a redirect URL after password reset
    // redirectTo: 'https://your-app-url.com/reset',
  });
}

export async function updatePasswordWithOobCode(oobCode: string, newPassword: string) {
  // Supabase v2: use updateUser with the access_token (oobCode)
  return supabase.auth.updateUser(
    { password: newPassword },
    { accessToken: oobCode } // pass the access token as an object
  );
}

export * from './auth/useAuth';
export * from './auth/AuthProvider';
