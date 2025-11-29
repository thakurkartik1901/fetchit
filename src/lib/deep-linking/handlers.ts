/**
 * Deep Link Handlers
 *
 * Centralized handlers for all deep link routes in the app.
 * Each handler processes a specific deep link pattern.
 */

import { linkGmail } from '../gmail';
import type { GmailTokenType } from '../gmail/utils';
import { toast } from '../toast';

/**
 * Handle Gmail OAuth callback deep link
 * Pattern: fetchit://auth/callback?accessToken=...&refreshToken=...
 */
export function handleGmailAuthCallback(url: string): boolean {
  if (!url.startsWith('fetchit://auth/callback')) {
    return false;
  }

  try {
    const params = new URL(url).searchParams;
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const expiresIn = params.get('expiresIn');

    if (!accessToken) {
      console.error('❌ No access token in Gmail callback');
      toast.error('Failed to link Gmail: No access token received');
      return true; // Handled but failed
    }

    const token: GmailTokenType = {
      accessToken,
      refreshToken: refreshToken || undefined,
      expiresIn: expiresIn ? parseInt(expiresIn) : undefined,
      issuedAt: Date.now(),
      tokenType: 'Bearer',
      scope: 'https://www.googleapis.com/auth/gmail.readonly',
    };

    console.log('✅ Gmail token received via deep link');
    linkGmail(token);
    toast.success('Gmail account linked successfully!');

    return true; // Successfully handled
  } catch (error) {
    console.error('❌ Error handling Gmail auth callback:', error);
    toast.error('Failed to link Gmail account');
    return true; // Handled but failed
  }
}

/**
 * Add more handlers here for future deep links
 *
 * Examples:
 * - handlePaymentCallback(url: string): boolean
 * - handleShareCallback(url: string): boolean
 * - handleNotificationOpen(url: string): boolean
 * - handleUniversalLink(url: string): boolean
 */

// Example for future payment deep link
export function handlePaymentCallback(url: string): boolean {
  if (!url.startsWith('fetchit://payment/callback')) {
    return false;
  }

  // Handle payment callback
  console.log('Payment callback:', url);

  return true;
}

// Example for future social sharing deep link
export function handleShareCallback(url: string): boolean {
  if (!url.startsWith('fetchit://share/')) {
    return false;
  }

  // Handle share callback
  console.log('Share callback:', url);

  return true;
}
