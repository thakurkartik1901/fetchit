/* eslint-disable max-params */
/**
 * Custom HTTP Error Classes
 * These provide detailed error information for debugging and user feedback
 */

export class HttpError extends Error {
  public readonly url: string;
  public readonly method: string;
  public readonly timestamp: Date;
  public readonly duration?: number;

  constructor(message: string, url: string, method: string, duration?: number) {
    super(message);
    this.name = 'HttpError';
    this.url = url;
    this.method = method;
    this.timestamp = new Date();
    this.duration = duration;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      url: this.url,
      method: this.method,
      timestamp: this.timestamp.toISOString(),
      duration: this.duration,
    };
  }
}

export class HttpTimeoutError extends HttpError {
  public readonly timeout: number;

  constructor(url: string, method: string, timeout: number, duration?: number) {
    super(`Request timeout after ${timeout}ms`, url, method, duration);
    this.name = 'HttpTimeoutError';
    this.timeout = timeout;
  }
}

export class HttpNetworkError extends HttpError {
  constructor(
    url: string,
    method: string,
    originalError: any,
    duration?: number
  ) {
    super(
      `Network error: ${originalError?.message || 'Unknown network error'}`,
      url,
      method,
      duration
    );
    this.name = 'HttpNetworkError';
  }
}

export class HttpResponseError extends HttpError {
  public readonly status: number;
  public readonly statusText: string;
  public readonly data: any;

  constructor(
    url: string,
    method: string,
    status: number,
    statusText: string,
    data: any,
    duration?: number
  ) {
    super(`HTTP ${status}: ${statusText}`, url, method, duration);
    this.name = 'HttpResponseError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

export class HttpUnknownError extends HttpError {
  public readonly originalError: any;

  constructor(
    url: string,
    method: string,
    originalError: any,
    duration?: number
  ) {
    super(
      `Unknown error: ${originalError?.message || 'An unexpected error occurred'}`,
      url,
      method,
      duration
    );
    this.name = 'HttpUnknownError';
    this.originalError = originalError;
  }
}
