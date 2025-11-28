import { Env } from '@env';
import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';

import { useAuth } from '@/store/auth';

import {
  HttpNetworkError,
  HttpResponseError,
  HttpTimeoutError,
  HttpUnknownError,
} from './errors';

/**
 * HTTP Client Configuration
 */
const BASE_URL = Env.EXPO_PUBLIC_API_URL;
const API_KEY = Env.EXPO_PUBLIC_API_KEY || '';
const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * Create Axios Instance
 */
const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    ...(API_KEY ? { 'X-API-Key': API_KEY } : {}),
  },
});

/**
 * Request Interceptor - Add Auth Token
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // Get auth token from Zustand store
    const accessToken = useAuth.getState().getAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Log request (optional, only in development)
    if (__DEV__) {
      console.log(`[HTTP] ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error('[HTTP] Request Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor - Handle Errors
 */
axiosInstance.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log(`[HTTP] Response ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    console.error('[HTTP] Response Error:', error);

    // Optional: Handle 401 Unauthorized globally
    if (error.response?.status === 401) {
      // Logout user
      useAuth.getState().signOut();
      // Navigate to login (if using navigation)
      // router.replace('/login');
    }

    return Promise.reject(error);
  }
);

/**
 * HTTP Helper Functions
 */

export async function apiGet<T>(
  path: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const startTime = Date.now();
  const url = path;
  const method = 'GET';

  try {
    const response = await axiosInstance.get<T>(path, config);
    const duration = Date.now() - startTime;
    if (__DEV__) console.log(`[HTTP] GET ${url} completed in ${duration}ms`);
    return response.data;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    throw handleHttpError(error, url, method, duration);
  }
}

export async function apiPost<T>(
  path: string,
  body?: any,
  config?: AxiosRequestConfig
): Promise<T> {
  const startTime = Date.now();
  const url = path;
  const method = 'POST';

  try {
    const response = await axiosInstance.post<T>(path, body, config);
    const duration = Date.now() - startTime;
    if (__DEV__) console.log(`[HTTP] POST ${url} completed in ${duration}ms`);
    return response.data;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    throw handleHttpError(error, url, method, duration);
  }
}

export async function apiPut<T>(
  path: string,
  body?: any,
  config?: AxiosRequestConfig
): Promise<T> {
  const startTime = Date.now();
  const url = path;
  const method = 'PUT';

  try {
    const response = await axiosInstance.put<T>(path, body, config);
    const duration = Date.now() - startTime;
    if (__DEV__) console.log(`[HTTP] PUT ${url} completed in ${duration}ms`);
    return response.data;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    throw handleHttpError(error, url, method, duration);
  }
}

export async function apiPatch<T>(
  path: string,
  body?: any,
  config?: AxiosRequestConfig
): Promise<T> {
  const startTime = Date.now();
  const url = path;
  const method = 'PATCH';

  try {
    const response = await axiosInstance.patch<T>(path, body, config);
    const duration = Date.now() - startTime;
    if (__DEV__) console.log(`[HTTP] PATCH ${url} completed in ${duration}ms`);
    return response.data;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    throw handleHttpError(error, url, method, duration);
  }
}

export async function apiDelete<T>(
  path: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const startTime = Date.now();
  const url = path;
  const method = 'DELETE';

  try {
    const response = await axiosInstance.delete<T>(path, config);
    const duration = Date.now() - startTime;
    if (__DEV__) console.log(`[HTTP] DELETE ${url} completed in ${duration}ms`);
    return response.data;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    throw handleHttpError(error, url, method, duration);
  }
}

/**
 * Error Handler - Converts axios errors to custom error types
 */
// eslint-disable-next-line max-params
function handleHttpError(
  error: any,
  url: string,
  method: string,
  duration: number
): Error {
  // Timeout error
  if (error.code === 'ECONNABORTED') {
    return new HttpTimeoutError(url, method, DEFAULT_TIMEOUT, duration);
  }

  // Network error (no response from server)
  if (!error.response) {
    return new HttpNetworkError(url, method, error, duration);
  }

  // HTTP error response (4xx, 5xx)
  if (error.response) {
    return new HttpResponseError(
      url,
      method,
      error.response.status,
      error.response.statusText,
      error.response.data,
      duration
    );
  }

  // Unknown error
  return new HttpUnknownError(url, method, error, duration);
}

// Export axios instance for advanced usage
export { axiosInstance };
