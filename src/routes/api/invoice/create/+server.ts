import { json } from '@sveltejs/kit';
import { createHash } from 'crypto';
// import fs
import fs from 'fs';

const APP_KEY = "sHeq7t8G1wiQvhAuIM27";
const API_URL = "https://invoice-api.amego.tw/json/f0401";

/**
 * @param {{ request: import('@sveltejs/kit').RequestEvent['request'] }} param0
 */
import type { RequestEvent } from '@sveltejs/kit';

export async function POST({ request }: RequestEvent) {
  try {
    const data = await request.json();

    const apiData = JSON.stringify(data);
    const unixTime = Math.floor(Date.now() / 1000);

    const signStr = apiData + unixTime + APP_KEY;
    const sign = createHash('md5').update(signStr).digest('hex');

    const postData = new URLSearchParams({
      invoice: data.BuyerIdentifier || "00000000",
      data: apiData,
      time: unixTime.toString(),
      sign
    });

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: postData
    });

    const result = await res.json();

    // write the result into a mktemp file
    const tempFilePath = `/tmp/invoice_${Date.now()}.json`;
    fs.writeFileSync(tempFilePath, JSON.stringify(result, null, 2));
    return json(result);
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "API error";
    return json({ error: errorMessage }, { status: 500 });
  }
  
}
