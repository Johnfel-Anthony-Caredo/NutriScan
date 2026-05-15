import { supabase } from '@/lib/supabase';
import { decode } from 'base64-arraybuffer';
import { EncodingType, readAsStringAsync } from 'expo-file-system/legacy';

/** Required: Make the 'scan-images' bucket public in Supabase Dashboard → Storage. */
const STORAGE_BUCKET = 'scan-images';

export async function uploadScanImage(userId: string, localUri: string): Promise<string> {
  const filePath = `${userId}/${Date.now()}.jpg`;
  const base64 = await readAsStringAsync(localUri, {
    encoding: EncodingType.Base64,
  });

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, decode(base64), { contentType: 'image/jpeg' });

  if (error) throw error;

  // Return the public URL — works after making the bucket public
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

export async function getScanImageUrl(filePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(filePath, 3600);

  if (error) throw error;
  return data.signedUrl;
}

/**
 * Convert a stored image value to a displayable URL.
 * Handles both public URLs (new) and file paths (legacy).
 */
export function getResolvedImageUrl(stored: string | undefined | null): string | undefined {
  if (!stored) return undefined;
  // If already a full URL, use it directly
  if (stored.startsWith('http://') || stored.startsWith('https://')) return stored;
  // Otherwise, construct a public URL from the file path
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
  return `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${stored}`;
}

export async function uploadAvatar(userId: string, localUri: string): Promise<string> {
  const filePath = `${userId}/avatar.jpg`;
  const base64 = await readAsStringAsync(localUri, {
    encoding: EncodingType.Base64,
  });

  const { error } = await supabase.storage
    .from('avatars')
    .upload(filePath, decode(base64), { contentType: 'image/jpeg', upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
  return data.publicUrl;
}
