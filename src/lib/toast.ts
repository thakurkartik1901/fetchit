import { toast as sonnerToast } from 'sonner-native';

import {
  HttpError,
  HttpNetworkError,
  HttpResponseError,
  HttpTimeoutError,
} from '../api/common/errors';

export const toast = {
  success: (message: string, description?: string) => {
    sonnerToast.success(message, { description, duration: 3000 });
  },

  error: (message: string, description?: string) => {
    sonnerToast.error(message, { description, duration: 4000 });
  },

  info: (message: string, description?: string) => {
    sonnerToast.info(message, { description, duration: 3000 });
  },

  warning: (message: string, description?: string) => {
    sonnerToast.warning(message, { description, duration: 3500 });
  },

  fromHttpError: (error: unknown) => {
    if (error instanceof HttpTimeoutError) {
      sonnerToast.error('Request Timeout', {
        description: 'The request took too long. Please try again.',
        duration: 4000,
      });
    } else if (error instanceof HttpNetworkError) {
      sonnerToast.error('Network Error', {
        description: 'Please check your internet connection and try again.',
        duration: 4000,
      });
    } else if (error instanceof HttpResponseError) {
      const description = error.data?.message || error.statusText;
      sonnerToast.error(`Error ${error.status}`, {
        description,
        duration: 4000,
      });
    } else if (error instanceof HttpError) {
      sonnerToast.error('Request Failed', {
        description: error.message,
        duration: 4000,
      });
    } else if (error instanceof Error) {
      sonnerToast.error('Error', {
        description: error.message,
        duration: 4000,
      });
    } else {
      sonnerToast.error('Unknown Error', {
        description: 'An unexpected error occurred.',
        duration: 4000,
      });
    }
  },
};

export { toast as sonnerToast } from 'sonner-native';
