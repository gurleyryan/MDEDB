import { createClient } from './supabase/client';

const BUCKET = 'org-assets';

function guessExt(file: File): string {
  const nameExt = file.name.split('.').pop()?.toLowerCase();
  if (nameExt && ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(nameExt)) return nameExt;
  const mime = file.type.toLowerCase();
  if (mime.includes('jpeg')) return 'jpg';
  if (mime.includes('png')) return 'png';
  if (mime.includes('gif')) return 'gif';
  if (mime.includes('webp')) return 'webp';
  return 'png';
}

export async function uploadOrgAsset(file: File, orgId: string, kind: 'logo' | 'banner'): Promise<string> {
  const supabase = createClient();
  const ext = guessExt(file);
  const path = `${orgId}/${kind}.${ext}`;

  const { error: uploadError } = await supabase
    .storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type || `image/${ext}`,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
