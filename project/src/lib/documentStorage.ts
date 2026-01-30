import { supabase, isSupabaseAvailable } from './supabase';
import { featureFlags } from './featureFlags';

export interface UploadResult {
  path: string;
  name: string;
  size: number;
  type: string;
}

export async function uploadDocumentFile(
  file: File,
  organizationId: string
): Promise<UploadResult> {
  if (!isSupabaseAvailable() || !featureFlags.enableFileStorage) {
    throw new Error('File storage is currently disabled. Running in local-only mode.');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${organizationId}/${fileName}`;

  try {
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    return {
      path: filePath,
      name: file.name,
      size: file.size,
      type: file.type,
    };
  } catch (error) {
    throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function deleteDocumentFile(filePath: string): Promise<void> {
  if (!isSupabaseAvailable() || !featureFlags.enableFileStorage) {
    throw new Error('File storage is currently disabled. Running in local-only mode.');
  }

  try {
    const { error } = await supabase.storage.from('documents').remove([filePath]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  } catch (error) {
    throw new Error(`Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function getDocumentFileUrl(filePath: string): string {
  if (!isSupabaseAvailable() || !featureFlags.enableFileStorage) {
    return '';
  }

  try {
    const { data } = supabase.storage.from('documents').getPublicUrl(filePath);
    return data.publicUrl;
  } catch (error) {
    console.error('Error getting file URL:', error);
    return '';
  }
}

export async function downloadDocumentFile(
  filePath: string,
  fileName: string
): Promise<void> {
  if (!isSupabaseAvailable() || !featureFlags.enableFileStorage) {
    throw new Error('File storage is currently disabled. Running in local-only mode.');
  }

  try {
    const { data, error } = await supabase.storage
      .from('documents')
      .download(filePath);

    if (error) {
      throw new Error(`Download failed: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned from download');
    }

    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
