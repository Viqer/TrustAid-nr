const BASE_URL = '/trustaid/backend/api';

interface FetchOptions extends RequestInit {
  data?: unknown;
}

export async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const token = localStorage.getItem('trustaid_token');
  const headers = new Headers(options.headers);
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (options.data) {
    options.body = JSON.stringify(options.data);
    headers.set('Content-Type', 'application/json');
  }

  const url = `${BASE_URL}${endpoint}`;
  
  const response = await fetch(url, { ...options, headers });
  
  let result;
  try {
    result = await response.json();
  } catch (e) {
    if (!response.ok) throw new Error(response.statusText);
    return {} as T;
  }

  if (!response.ok) {
    throw new Error(result.message || 'An API error occurred');
  }

  // Handle standard { success: true, data: ... } wrappers or direct returns
  if (result && typeof result === 'object' && 'success' in result && 'data' in result) {
    return result.data;
  }

  return result;
}
