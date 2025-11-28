import type { GmailMessage, OrderStatus, ParsedOrder } from './types';

function getHeader(message: GmailMessage, name: string): string | undefined {
  const headers = message?.payload?.headers;
  return headers?.find((h) => h.name.toLowerCase() === name.toLowerCase())
    ?.value;
}

/**
 * Parse order information from a Gmail message
 * Customize this based on the vendors/stores you want to support
 */
export function parseOrderFromMessage(
  message: GmailMessage
): ParsedOrder | null {
  const subject = getHeader(message, 'Subject') || '';
  const from = getHeader(message, 'From') || '';
  const snippet = message.snippet || '';
  const content = subject + ' ' + snippet;

  // Determine vendor from email sender
  let vendor = '';

  // Add your vendor detection logic here
  if (/amazon/i.test(from)) vendor = 'Amazon';
  else if (/flipkart/i.test(from)) vendor = 'Flipkart';
  else if (/myntra/i.test(from)) vendor = 'Myntra';
  else if (/ajio/i.test(from)) vendor = 'Ajio';
  else if (/meesho/i.test(from)) vendor = 'Meesho';
  else if (/nykaa/i.test(from)) vendor = 'Nykaa';
  else if (/ebay/i.test(from)) vendor = 'eBay';
  else if (/walmart/i.test(from)) vendor = 'Walmart';
  else if (/target/i.test(from)) vendor = 'Target';
  // Add more vendors as needed
  else {
    // Skip unknown vendors
    return null;
  }

  // Determine order status from content
  let status: OrderStatus = 'order_placed';

  if (/refund/i.test(content)) {
    status = 'refund';
  } else if (/cancelled?/i.test(content)) {
    status = 'cancelled';
  } else if (/shipped|dispatched/i.test(content)) {
    status = 'shipped';
  } else if (/delivered/i.test(content)) {
    status = 'delivered';
  } else if (/order\s+(confirmation|confirmed|placed)/i.test(content)) {
    status = 'order_placed';
  } else if (/payment\s+failed/i.test(content)) {
    status = 'payment_failed';
  } else if (/return/i.test(content)) {
    status = 'return';
  } else if (/exchange/i.test(content)) {
    status = 'exchange';
  }

  // Extract amount (supports multiple currency formats)
  const amountMatch = snippet.match(
    /(\$|€|£|₹|INR|USD|EUR|GBP)\s*([0-9,]+\.?[0-9]*)/i
  );
  const totalAmount = amountMatch ? amountMatch[0] : undefined;

  // Extract order ID (customize for different vendors)
  const orderIdMatch = snippet.match(/order[\s#:]*([A-Z0-9-]+)/i);
  const orderId = orderIdMatch ? orderIdMatch[1] : undefined;

  if (!orderId && !totalAmount) {
    return null;
  }

  return {
    id: message.id,
    vendor,
    status,
    orderId,
    totalAmount,
    orderDate: new Date(
      Number(message.internalDate || Date.now())
    ).toISOString(),
  };
}
