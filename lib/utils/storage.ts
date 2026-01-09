// Utility functions for file uploads
// In production, you might want to use cloud storage like AWS S3, Cloudinary, etc.

export function getImagePath(collection: string, itemId: string, filename: string): string {
  return `${collection}/${itemId}/${filename}`;
}

export async function uploadImage(file: File, path: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  
  // Extract collection and itemId from path
  const parts = path.split('/');
  if (parts.length < 2) {
    throw new Error('Invalid path format');
  }
  
  formData.append('collection', parts[0]);
  formData.append('itemId', parts[1]);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch('/api/upload', {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(error.error || 'Upload failed');
  }

  const data = await response.json();
  return data.url;
}
