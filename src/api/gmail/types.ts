// Gmail API response types

export type GmailMessageHeader = {
  name: string;
  value: string;
};

export type GmailMessageBody = {
  data?: string;
  size?: number;
};

export type GmailMessagePayload = {
  partId?: string;
  mimeType?: string;
  filename?: string;
  headers: GmailMessageHeader[];
  body: GmailMessageBody;
  parts?: GmailMessagePayload[];
};

export type GmailMessage = {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload: GmailMessagePayload;
  sizeEstimate?: number;
  historyId?: string;
  internalDate: string;
  raw?: string;
};

export type GmailListResponse = {
  messages?: Array<{ id: string; threadId: string }>;
  nextPageToken?: string;
  resultSizeEstimate?: number;
};

// Domain types for the app

export type OrderStatus =
  | 'order_placed'
  | 'shipped'
  | 'delivered'
  | 'refund'
  | 'cancelled'
  | 'exchange'
  | 'payment_failed'
  | 'return';

export type ParsedOrder = {
  id: string;
  vendor: string;
  status: OrderStatus;
  orderId?: string;
  totalAmount?: string;
  orderDate?: string;
  items?: Array<{ name: string; quantity?: number; price?: string }>;
};

// DTO types for internal use

export type GmailMessageDTO = GmailMessage;
export type GmailListDTO = GmailListResponse;
