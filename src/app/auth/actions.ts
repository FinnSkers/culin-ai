'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceRoleClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: 'Could not authenticate user. Please check your credentials.' };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const inviteCode = formData.get('inviteCode') as string; // Can be empty string

  const supabase = await createClient();

  // --- Invite Code Validation (if provided) ---
  if (inviteCode) {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Supabase service role key is not configured.');
      return { error: 'Server configuration error. Please contact support.' };
    }
    
    const supabaseService = createServiceRoleClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: codeData, error: codeError } = await supabaseService
      .from('invite_codes')
      .select('code')
      .eq('code', inviteCode)
      .eq('is_used', false)
      .single();

    if (codeError || !codeData) {
      return { error: 'Invalid or already used invite code.' };
    }
  }
  // --- End Validation ---

  // For OTP, we don't need emailRedirectTo. Supabase handles sending the OTP.
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) {
    return { error: signUpError.message || 'Could not sign up user. This email might already be in use.' };
  }

  if (!signUpData.user) {
    return { error: 'Sign up attempt failed. Please try again.' };
  }

  // --- Mark code as used (if provided) ---
  if (inviteCode) {
    const supabaseService = createServiceRoleClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { error: updateCodeError } = await supabaseService
      .from('invite_codes')
      .update({ is_used: true, used_by: signUpData.user.id, used_at: new Date().toISOString() })
      .eq('code', inviteCode);
    
    if (updateCodeError) {
      // This is a non-critical error for the user; their sign-up still worked.
      console.error(`Failed to mark invite code ${inviteCode} as used for user ${signUpData.user.id}:`, updateCodeError);
    }
  }
  // --- End Mark ---
  
  return { success: true, message: 'Sign-up initiated! Please check your email for your one-time password.' };
}


export async function verifyOtp(formData: FormData) {
    const email = formData.get('email') as string;
    const otp = formData.get('otp') as string;
    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup',
    });

    if (error) {
        return { error: 'Invalid OTP or it may have expired. Please try again.' };
    }

    if (!data.session) {
        return { error: 'Could not create a session after verification. Please try signing in.' };
    }

    revalidatePath('/', 'layout');
    return { success: true };
}


export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath('/', 'layout');
    return redirect('/');
}
