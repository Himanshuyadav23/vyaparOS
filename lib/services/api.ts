// API client utility for making authenticated requests

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

async function getToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  return fetch(url, {
    ...options,
    headers,
  });
}

export async function apiGet<T>(endpoint: string): Promise<T> {
  const response = await apiRequest(endpoint, { method: 'GET' });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  
  return response.json();
}

export async function apiPost<T>(endpoint: string, data: any): Promise<T> {
  const response = await apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  
  return response.json();
}

export async function apiPut<T>(endpoint: string, data: any): Promise<T> {
  const response = await apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  
  return response.json();
}

export async function apiDelete<T>(endpoint: string): Promise<T> {
  const response = await apiRequest(endpoint, { method: 'DELETE' });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  
  return response.json();
}








