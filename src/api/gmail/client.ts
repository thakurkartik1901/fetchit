import axios from 'axios';

import type { GmailTokenType } from '@/lib/gmail/utils';

import type { GmailListResponse, GmailMessage } from './types';

const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1';

/**
 * Gmail API client class
 */
export class GmailClient {
  private accessToken: string;

  constructor(token: GmailTokenType) {
    this.accessToken = token.accessToken;
  }

  /**
   * Fetch messages matching a search query
   */
  async fetchMessages(
    query: string,
    maxResults: number = 10,
    pageToken?: string
  ): Promise<GmailListResponse> {
    const response = await axios.get<GmailListResponse>(
      `${GMAIL_API_BASE}/users/me/messages`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
        params: {
          q: query,
          maxResults,
          pageToken,
        },
      }
    );

    return response.data;
  }

  /**
   * Fetch details of a specific message
   */
  async fetchMessageDetail(messageId: string): Promise<GmailMessage> {
    const response = await axios.get<GmailMessage>(
      `${GMAIL_API_BASE}/users/me/messages/${messageId}`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
        params: {
          format: 'full',
        },
      }
    );

    return response.data;
  }

  /**
   * Update access token (for token refresh)
   */
  updateAccessToken(newToken: string): void {
    this.accessToken = newToken;
  }
}

/**
 * Factory function to create Gmail client
 */
export function createGmailClient(token: GmailTokenType): GmailClient {
  return new GmailClient(token);
}

// Standalone API functions for React Query

export async function listMessages({
  accessToken,
  q,
  maxResults = 100,
  pageToken,
}: {
  accessToken: string;
  q: string;
  maxResults?: number;
  pageToken?: string;
}): Promise<GmailListResponse> {
  const response = await axios.get<GmailListResponse>(
    `${GMAIL_API_BASE}/users/me/messages`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        q,
        maxResults,
        pageToken,
      },
    }
  );

  return response.data;
}

export async function getMessage({
  accessToken,
  id,
}: {
  accessToken: string;
  id: string;
}): Promise<GmailMessage> {
  const response = await axios.get<GmailMessage>(
    `${GMAIL_API_BASE}/users/me/messages/${id}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        format: 'full',
      },
    }
  );

  return response.data;
}

/**
 * Build Gmail search query for purchase emails
 */
export function buildPurchasesQuery(): string {
  return 'category:purchases';
}
