import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: { 'Content-Type': 'application/json' },
    },
  }
);

// Add data encryption/decryption methods (mock for now)
export async function encryptData(data: any): Promise<string> {
  // In production, use AES-256 or similar
  return JSON.stringify(data); // Mock encryption
}

export async function decryptData(encrypted: string): Promise<any> {
  // In production, use AES-256 decryption
  return JSON.parse(encrypted); // Mock decryption
}