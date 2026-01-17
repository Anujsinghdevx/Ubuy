import axios, { AxiosError } from 'axios';
import { clientEnv } from '@/config/env.client';

export type ApiError = {
  message: string;
  status?: number;
  cause?: unknown;
};

export const api = axios.create({
  baseURL: clientEnv.NEXT_PUBLIC_API_BASE_URL || '',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token?: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export const toApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    return {
      message: error.response?.data?.message || error.message || 'Request failed',
      status: error.response?.status,
      cause: error,
    };
  }
  if (error instanceof Error) {
    return { message: error.message, cause: error };
  }
  return { message: 'Unknown error', cause: error };
};

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => Promise.reject(toApiError(error))
);
