import { getItem, removeItem, setItem } from '@/lib/storage';

const GMAIL_TOKEN = 'gmail_token';

export type GmailTokenType = {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  issuedAt?: number;
  tokenType?: string;
  scope?: string;
};

export function getGmailToken(): GmailTokenType | null {
  return getItem<GmailTokenType>(GMAIL_TOKEN);
}

export function removeGmailToken(): void {
  removeItem(GMAIL_TOKEN);
}

export async function setGmailToken(value: GmailTokenType): Promise<void> {
  await setItem<GmailTokenType>(GMAIL_TOKEN, value);
}

export function isGmailTokenValid(token: GmailTokenType | null): boolean {
  if (!token || !token.accessToken) return false;

  // Check if token is expired
  if (token.expiresIn && token.issuedAt) {
    const now = Date.now();
    const expiresAt = token.issuedAt + token.expiresIn * 1000;
    return now < expiresAt;
  }

  // If no expiry info, assume token is valid
  return true;
}
