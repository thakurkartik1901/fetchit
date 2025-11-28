import { create } from 'zustand';

import { createSelectors } from '../utils';
import type { GmailTokenType } from './utils';
import { getGmailToken, removeGmailToken, setGmailToken } from './utils';

type GmailState = {
  gmailToken: GmailTokenType | null;
  isGmailLinked: boolean;
  linkGmail: (token: GmailTokenType) => void;
  unlinkGmail: () => void;
  hydrate: () => void;
};

const _useGmail = create<GmailState>((set) => ({
  gmailToken: null,
  isGmailLinked: false,

  linkGmail: (token) => {
    setGmailToken(token);
    set({ gmailToken: token, isGmailLinked: true });
  },

  unlinkGmail: () => {
    removeGmailToken();
    set({ gmailToken: null, isGmailLinked: false });
  },

  hydrate: () => {
    try {
      const token = getGmailToken();
      if (token !== null) {
        set({ gmailToken: token, isGmailLinked: true });
      } else {
        set({ gmailToken: null, isGmailLinked: false });
      }
    } catch (e) {
      console.error('Error hydrating Gmail token:', e);
    }
  },
}));

// Create selectors for better performance
export const useGmail = createSelectors(_useGmail);

// Export standalone functions for use outside components
export const linkGmail = (token: GmailTokenType) =>
  _useGmail.getState().linkGmail(token);
export const unlinkGmail = () => _useGmail.getState().unlinkGmail();
export const hydrateGmail = () => _useGmail.getState().hydrate();
