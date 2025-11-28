import {
  HttpError,
  HttpNetworkError,
  HttpResponseError,
  HttpTimeoutError,
} from './errors';

export function isHttpError(error: unknown): error is HttpError {
  return error instanceof HttpError;
}

export function isTimeoutError(error: unknown): error is HttpTimeoutError {
  return error instanceof HttpTimeoutError;
}

export function isNetworkError(error: unknown): error is HttpNetworkError {
  return error instanceof HttpNetworkError;
}

export function isResponseError(error: unknown): error is HttpResponseError {
  return error instanceof HttpResponseError;
}

export function getErrorMessage(error: unknown): string {
  if (isTimeoutError(error)) {
    return 'Request timed out. Please try again.';
  }
  if (isNetworkError(error)) {
    return 'Network error. Please check your connection.';
  }
  if (isResponseError(error)) {
    return error.data?.message || error.statusText || `Error ${error.status}`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred.';
}
