import { supabase } from '@/lib/supabase';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';

export async function uploadScanImage(userId: string, localUri: string): Promise<string> {
  const filePath = `${userId}/${Date.now()}.jpg`;
  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const { error } = await supabase.storage
    .from('scan-images')
    .upload(filePath, decode(base64), { contentType: 'image/jpeg' });

  if (error) throw error;
  return filePath;
}

export async function getScanImageUrl(filePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('scan-images')
    .createSignedUrl(filePath, 3600);

  if (error) throw error;
  return data.signedUrl;
}

export async function uploadAvatar(userId: string, localUri: string): Promise<string> {
  const filePath = `${userId}/avatar.jpg`;
  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const { error } = await supabase.storage
    .from('avatars')
    .upload(filePath, decode(base64), { contentType: 'image/jpeg', upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
  return data.publicUrl;
}
