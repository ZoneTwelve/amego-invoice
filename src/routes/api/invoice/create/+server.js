import { json } from '@sveltejs/kit';
import { createHash } from 'crypto';
import fs from 'fs';

const APP_KEY = "sHeq7t8G1wiQvhAuIM27";
const API_URL = "https://invoice-api.amego.tw/json/f0401";

import type { RequestEvent } from '@sveltejs/kit';

const predefinedInvoiceTicket = {
    "OrderId": "A20200817101021",
    "BuyerIdentifier": "0000000000",
    "BuyerName": "客人",
    "NPOBAN": "",
    "ProductItem": [
        // {
        //     "Description": "測試商品1",
        //     "Quantity": "1",
        //     "UnitPrice": "170",
        //     "Amount": "170",
        //     "Remark": "",
        //     "TaxType": "1"
        // },
        // {
        //     "Description": "會員折抵",
        //     "Quantity": "1",
        //     "UnitPrice": "-2",
        //     "Amount": "-2",
        //     "Remark": "",
        //     "TaxType": "1"
        // }
    ],
    "SalesAmount": "168",
    "FreeTaxSalesAmount": "0",
    "ZeroTaxSalesAmount": "0",
    "TaxType": "1",
    "TaxRate": "0.05",
    "TaxAmount": "0",
    "TotalAmount": "168"
}

const exampleTicket = {
	"OrderId": "A20200817105933",
	"BuyerIdentifier": "28080623",
	"BuyerName": "光貿科技有限公司",
	"NPOBAN": "",
	"ProductItem": [
		{
			"Description": "測試商品1",
			"Quantity": "1",
			"UnitPrice": "170",
			"Amount": "170",
			"Remark": "",
			"TaxType": "1"
		},
		{
			"Description": "會員折抵",
			"Quantity": "1",
			"UnitPrice": "-2",
			"Amount": "-2",
			"Remark": "",
			"TaxType": "1"
		}
	],
	"SalesAmount": "160",
	"FreeTaxSalesAmount": "0",
	"ZeroTaxSalesAmount": "0",
	"TaxType": "1",
	"TaxRate": "0.05",
	"TaxAmount": "8",
	"TotalAmount": "168"
}
function formatTicketId(date) {
  // Pad single digits with a leading zero
  const pad = n => n < 10 ? '0' + n : n;
  return date.getFullYear().toString() +
         pad(date.getMonth() + 1) +
         pad(date.getDate()) +
         pad(date.getHours()) +
         pad(date.getMinutes()) +
         pad(date.getSeconds());
}


export async function POST({ request }: RequestEvent) {
  try {
    const data = await request.json();
    const ticketData = Object.assign({}, exampleTicket, data);
    
    const d = new Date('2020-08-17T10:59:33');
    exampleTicket.OrderId = `A${d=new Date(),d.getFullYear()}${(d.getMonth()+1).toString().padStart(2,'0')}${d.getDate().toString().padStart(2,'0')}${d.getHours().toString().padStart(2,'0')}${d.getMinutes().toString().padStart(2,'0')}${d.getSeconds().toString().padStart(2,'0')}`
    // const ticketData = Object.assign({}, predefinedInvoiceTicket);

    // // API必填補全
    // ticketData.BuyerIdentifier = data.BuyerIdentifier || "0000000000";
    // ticketData.BuyerName = data.BuyerName || (data.BuyerIdentifier === "0000000000" ? "客人" : data.BuyerIdentifier);
    // if (!(data.ProductItem?.length > 0)){
    //   // throw error to the frontned
    //   return json({ error: "請至少填寫一筆商品資訊" }, { status: 400 });
    // }
    // ticketData.ProductItem = data.ProductItem; // this should be valid after the check

    // // 確保金額正確
    // ticketData.SalesAmount = data.SalesAmount ?? "0";
    // ticketData.FreeTaxSalesAmount = data.FreeTaxSalesAmount ?? "0";
    // ticketData.ZeroTaxSalesAmount = data.ZeroTaxSalesAmount ?? "0";
    // ticketData.TaxType = data.TaxType ?? "1";
    // ticketData.TaxRate = data.TaxRate ?? "0.05";
    // ticketData.TaxAmount = data.TaxAmount ?? "0";
    // ticketData.TotalAmount = data.TotalAmount ?? "0";

    // // 串接 API
    // const apiData = JSON.stringify(data);
    // const unixTime = ~~(Date.now()/1000)
    // // const unixTime = Math.floor(Date.now() / 1000);

    // // sign 字串組成需正確（API文件定義）
    // const signStr = apiData + unixTime + APP_KEY;
    // const sign = createHash('md5').update(signStr).digest('hex');
    // const payload = {
    //   invoice: data.BuyerIdentifier,
    //   data: apiData,
    //   time: unixTime.toString(),
    //   sign
    // };
    // console.log(`Payload`, payload)
    const postData = new URLSearchParams(payload);

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: postData
    });
    
    console.log(postData)

    const result = await res.json();

    // 偵錯/備查用存檔
    const tempFilePath = `/tmp/invoice_${Date.now()}.json`;
    fs.writeFileSync(tempFilePath, JSON.stringify(result, null, 2));

    // 根據第三方API規格處理錯誤
    if (result.Status !== 1 && result.Status !== "1") {
      // API 失敗（Status != 1）回傳錯誤
      return json({ error: result.Message || "發票API開立失敗", ...result }, { status: 400 });
    }

    return json(result);
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "API error";
    return json({ error: errorMessage }, { status: 500 });
  }
}
