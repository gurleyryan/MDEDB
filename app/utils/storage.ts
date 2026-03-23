import { createClient } from './supabase/client';

const BUCKET = 'org-assets';

async function assertCanUploadOrgAsset() {
  const supabase = createClient();

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    throw new Error('You must be signed in as an admin to upload organization assets.');
  }

  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', authData.user.id)
    .single();

  if (roleError || roleData?.role !== 'admin') {
    throw new Error('Only admin users can upload organization assets.');
  }
}

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
  await assertCanUploadOrgAsset();

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
    if (uploadError.message.toLowerCase().includes('row-level security policy')) {
      throw new Error('Upload blocked by Supabase storage policy. Confirm your session is authenticated and the org-assets INSERT policy allows authenticated admins.');
    }
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
