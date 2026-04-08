export const getBackendBaseUrl = () => {
  const raw = process.env.BACKEND_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!raw) {
    throw new Error('Missing BACKEND_API_BASE_URL (or NEXT_PUBLIC_API_BASE_URL)');
  }

  return raw.replace(/\/$/, '');
};

export const toBackendUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getBackendBaseUrl()}${normalizedPath}`;
};

export const getBearerTokenFromSession = (session: unknown): string | undefined => {
  if (!session || typeof session !== 'object') return undefined;

  const record = session as Record<string, unknown>;
  const topLevel = record.accessToken;
  if (typeof topLevel === 'string' && topLevel.length > 0) return topLevel;

  const user = record.user;
  if (!user || typeof user !== 'object') return undefined;

  const userToken = (user as Record<string, unknown>).accessToken;
  if (typeof userToken === 'string' && userToken.length > 0) return userToken;

  return undefined;
};

export const backendJsonRequest = async <T = unknown>(
  path: string,
  init?: RequestInit,
  token?: string
): Promise<{ status: number; data: T }> => {
  const headers = new Headers(init?.headers);

  if (!headers.has('Content-Type') && init?.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(toBackendUrl(path), {
    ...init,
    headers,
    cache: 'no-store',
  });

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await response.json() : ((await response.text()) as unknown);

  return { status: response.status, data: data as T };
};
