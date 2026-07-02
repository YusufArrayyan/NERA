export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';
  const baseUrl = envUrl.endsWith('/api/v1') ? envUrl : `${envUrl}/api/v1`;
  
  // Add auth header if token exists in localStorage
  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('accessToken');
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      // Basic unauthorized handling - in a full app we'd refresh token here
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'API Request Failed');
  }

  // Handle empty responses
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};
