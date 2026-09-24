const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const getAccessToken = (): string | null => {
  return localStorage.getItem('careertrack_access_token');
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem('careertrack_refresh_token');
};

export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('careertrack_access_token', accessToken);
  localStorage.setItem('careertrack_refresh_token', refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem('careertrack_access_token');
  localStorage.removeItem('careertrack_refresh_token');
};

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  const token = getAccessToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  let response: Response;
  try {
    response = await fetch(url, config);
  } catch (networkError) {
    throw new Error('Network error. Please check your internet connection.');
  }

  // Handle 401 Unauthorized for token refresh
  if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh') && !endpoint.includes('/auth/register')) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });

          if (refreshRes.ok) {
            const data = await refreshRes.json();
            setTokens(data.access_token, data.refresh_token);
            processQueue(null, data.access_token);
            headers.set('Authorization', `Bearer ${data.access_token}`);
            return apiRequest<T>(endpoint, { ...options, headers });
          } else {
            clearTokens();
            processQueue(new Error('Session expired'));
            window.location.href = '/login?expired=true';
            throw new Error('Session expired. Please log in again.');
          }
        } catch (err) {
          clearTokens();
          processQueue(err);
          window.location.href = '/login?expired=true';
          throw err;
        } finally {
          isRefreshing = false;
        }
      } else {
        return new Promise<T>((resolve, reject) => {
          failedQueue.push({
            resolve: (newToken: string) => {
              headers.set('Authorization', `Bearer ${newToken}`);
              resolve(apiRequest<T>(endpoint, { ...options, headers }));
            },
            reject: (err: any) => reject(err),
          });
        });
      }
    }
  }

  if (!response.ok) {
    let errorDetail = 'Something went wrong';
    try {
      const errorJson = await response.json();
      if (typeof errorJson.detail === 'string') {
        errorDetail = errorJson.detail;
      } else if (Array.isArray(errorJson.detail)) {
        errorDetail = errorJson.detail.map((e: any) => e.msg).join(', ');
      }
    } catch {
      errorDetail = response.statusText || 'Request failed';
    }
    throw new Error(errorDetail);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  get: <T = any>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),
  post: <T = any>(endpoint: string, data?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
  put: <T = any>(endpoint: string, data?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
  delete: <T = any>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};
