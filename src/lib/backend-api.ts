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

const isConnRefusedError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') return false;

  const record = error as Record<string, unknown>;
  const cause = record.cause;

  if (cause && typeof cause === 'object') {
    const causeRecord = cause as Record<string, unknown>;
    if (causeRecord.code === 'ECONNREFUSED') return true;

    const nestedErrors = causeRecord.errors;
    if (Array.isArray(nestedErrors)) {
      return nestedErrors.some((item) => {
        if (!item || typeof item !== 'object') return false;
        return (item as Record<string, unknown>).code === 'ECONNREFUSED';
      });
    }
  }

  return record.code === 'ECONNREFUSED';
};

const getRetryUrlForLocalhost = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'localhost') {
      parsed.hostname = '127.0.0.1';
      return parsed.toString();
    }

    if (parsed.hostname === '127.0.0.1') {
      parsed.hostname = 'localhost';
      return parsed.toString();
    }

    return null;
  } catch {
    return null;
  }
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

  const requestInit: RequestInit = {
    ...init,
    headers,
    cache: 'no-store',
  };

  const primaryUrl = toBackendUrl(path);

  let response: Response;
  try {
    response = await fetch(primaryUrl, requestInit);
  } catch (error) {
    const retryUrl = getRetryUrlForLocalhost(primaryUrl);
    if (!retryUrl || !isConnRefusedError(error)) {
      throw error;
    }

    response = await fetch(retryUrl, requestInit);
  }

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await response.json() : ((await response.text()) as unknown);

  return { status: response.status, data: data as T };
};
