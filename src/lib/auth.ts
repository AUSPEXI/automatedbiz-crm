import { supabase } from './supabase';
import { validateEmail, validatePassword } from './validation';

export const auth = {
  async sendVerificationEmail(email: string) {
    if (!validateEmail(email)) throw new Error('Invalid email format');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/verify-email` },
    });
    if (error) throw error;
  },

  async sendPasswordResetEmail(email: string) {
    if (!validateEmail(email)) throw new Error('Invalid email format');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  },

  async updatePassword(newPassword: string) {
    if (!validatePassword(newPassword)) throw new Error('Password does not meet requirements');
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },

  async refreshSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) throw new Error('No active session');
    if (new Date(session.expires_at! * 1000) < new Date()) {
      const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError || !newSession) throw new Error('Failed to refresh session');
    }
    return session;
  }
};