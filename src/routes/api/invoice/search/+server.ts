import { json } from '@sveltejs/kit';
import crypto from 'crypto';
import qs from 'querystring';

const API_URL = 'https://invoice-api.amego.tw/json/invoice_query';
const INVOICE = '12345678';
const APP_KEY = 'sHeq7t8G1wiQvhAuIM27';

// Class for Invoice payload
class Invoice {
  type = 'invoice';
  invoice_number = null;
  constructor(params) {
    if (!params.invoice_number) {
      throw new Error('Missing invoice_number');
    }
    this.invoice_number = params.invoice_number;
  }
}

// Class for Order payload
class Order {
  type = 'order';
  order_id = null;
  constructor(params) {
    if (!params.order_id) {
      throw new Error('Missing order_id');
    }
    this.order_id = params.order_id;
  }
}

// Helper to build correct payload from input
function buildPayload(params) {
  if (params.type === 'invoice') {
    return new Invoice(params);
  } else if (params.type === 'order') {
    return new Order(params);
  } else {
    throw new Error('Invalid type, must be "invoice" or "order"');
  }
}

// Use Node.js crypto to compute md5
function md5(text) {
  return crypto.createHash('md5').update(text).digest('hex');
}

// Build x-www-form-urlencoded payload with correct sign
function buildApiRequest(dataObj) {
  const now = Math.floor(Date.now() / 1000);
  const dataJson = JSON.stringify(dataObj);
  const sign = md5(dataJson + now + APP_KEY);

  return qs.stringify({
    invoice: INVOICE,
    data: dataJson,
    time: now,
    sign
  });
}

/**
 * @param {{ request: Request }} param0
 */
export async function POST({ request }) {
  try {
    const params = await request.json();
    const payloadObj = buildPayload(params);
    const body = buildApiRequest(payloadObj);

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    });

    const result = await res.json();
    return json(result);
  } catch (e) {
    return json({ error: e.message || 'API error' }, { status: 500 });
  }
}
