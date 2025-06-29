<script lang="ts">
  let date = new Date().toISOString().slice(0, 10);
  let time = `${String(new Date().getHours()).padStart(2, "0")}:${String(new Date().getMinutes()).padStart(2, "0")}`;
  let printType = "";
  let openTypes = [
    { label: "紙本(消費者)", value: 1, CarrierType: "", CarrierId1: "", CarrierId2: "", NPOBAN: "" },
    { label: "會員載具", value: 2, CarrierType: "amego", CarrierId1: "", CarrierId2: "", NPOBAN: "" },
    { label: "手機載具", value: 3, CarrierType: "3J0002", CarrierId1: "", CarrierId2: "", NPOBAN: "" },
    { label: "自然人憑證", value: 4, CarrierType: "", CarrierId1: "", CarrierId2: "", NPOBAN: "" },
    { label: "打統編", value: 5, CarrierType: "", CarrierId1: "", CarrierId2: "", NPOBAN: "" },
    { label: "交換", value: 6, CarrierType: "", CarrierId1: "", CarrierId2: "", NPOBAN: "" },
    { label: "捐贈", value: 7, CarrierType: "", CarrierId1: "", CarrierId2: "", NPOBAN: "" },
    { label: "出口用", value: 8, CarrierType: "", CarrierId1: "", CarrierId2: "", NPOBAN: "" }
  ];
  let selectedType = 1;
  let orderAuto = true;
  let orderId = `A${Date.now()}`;
  let BuyerIdentifier = "";
  let BuyerName = "";
  let BuyerAddress = "";
  let BuyerTelephoneNumber = "";
  let BuyerEmailAddress = "";
  let MainRemark = "";
  let CarrierType = "";
  let CarrierId1 = "";
  let CarrierId2 = "";
  let NPOBAN = "";

  function defaultProduct() {
    return {
      Description: "",
      Quantity: "1",
      UnitPrice: "0",
      Amount: "0",
      Remark: "",
      TaxType: "1"
    };
  }
  let ProductItem = [defaultProduct()];
  let SalesAmount = "0";
  let FreeTaxSalesAmount = "0";
  let ZeroTaxSalesAmount = "0";
  let TaxType = "1";
  let TaxRate = "0.05";
  let TaxAmount = "0";
  let TotalAmount = "0";

  function addProduct() {
    if (ProductItem.length < 50) ProductItem = [...ProductItem, defaultProduct()];
  }
  function removeProduct(i: number) {
    if (ProductItem.length > 1) ProductItem = ProductItem.filter((_, idx) => idx !== i);
  }
  function updateProductAmounts() {
    let sales = 0, zero = 0, free = 0;
    ProductItem.forEach(item => {
      const qty = parseFloat(item.Quantity) || 0;
      const price = parseFloat(item.UnitPrice) || 0;
      const amount = qty * price;
      item.Amount = amount.toString();
      if (item.TaxType === "1") sales += amount;
      else if (item.TaxType === "2") zero += amount;
      else if (item.TaxType === "3") free += amount;
    });
    SalesAmount = sales.toString();
    ZeroTaxSalesAmount = zero.toString();
    FreeTaxSalesAmount = free.toString();
    TaxAmount = "0";
    TotalAmount = (sales + zero + free + parseInt(TaxAmount)).toString();
  }
  $: updateProductAmounts();

  function setType(type: number) {
    selectedType = type;
    const t = openTypes.find(x => x.value === +type);
    CarrierType = t?.CarrierType ?? "";
    CarrierId1 = t?.CarrierId1 ?? "";
    CarrierId2 = t?.CarrierId2 ?? "";
    NPOBAN = t?.NPOBAN ?? "";
  }

  let loading = false;
  let result: any = null;
  let error = "";

  async function submit() {
    loading = true;
    result = null;
    error = "";
    let payload = {
      OrderId: orderId,
      BuyerIdentifier,
      BuyerName,
      BuyerAddress,
      BuyerTelephoneNumber,
      BuyerEmailAddress,
      MainRemark,
      CarrierType,
      CarrierId1,
      CarrierId2,
      NPOBAN,
      ProductItem: JSON.parse(JSON.stringify(ProductItem)),
      SalesAmount,
      FreeTaxSalesAmount,
      ZeroTaxSalesAmount,
      TaxType,
      TaxRate,
      TaxAmount,
      TotalAmount
    };
    try {
      const res = await fetch("/api/invoice/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "開立失敗");
      result = data;
    } catch (e: any) {
      error = e.message;
    } finally {
      loading = false;
    }
  }
</script>

<style>
  main { max-width: 1100px; margin: 0 auto; }
  .card { background: #fff; border-radius: 8px; padding: 22px; box-shadow: 0 1px 7px #0001; margin-bottom: 16px;}
  .open-type-btns { display: flex; gap: 11px; flex-wrap: wrap; margin: 10px 0 14px 0; }
  .open-type-btns button { border: 1px solid #4291d7; color: #4291d7; background: #fff; border-radius: 8px; padding: 8px 18px; cursor: pointer; }
  .open-type-btns button.active, .open-type-btns button:hover { background: #4291d7; color: #fff; }
  .product-table { width: 100%; border-collapse: collapse; }
  .product-table th, .product-table td { border: 1px solid #eaeaea; padding: 7px 6px; }
  .product-table th { background: #f7f8fa; }
  .add-btn { background: #3db7b7; color: #fff; border: none; border-radius: 100px; font-size: 20px; width: 36px; height: 36px; margin: 8px 0 0 8px; cursor: pointer; }
  .del-btn { background: #ee6464; color: #fff; border: none; border-radius: 100px; font-size: 16px; width: 30px; height: 30px; cursor: pointer; }
  .summary { background: #fff; border-radius: 8px; padding: 12px; display: flex; justify-content: space-between; align-items: start; margin-top: 16px;}
  .summary-box { flex: 1; }
  .total-box { flex: 1; text-align: right;}
  .submit-btn { background: #4291d7; color: #fff; border: none; padding: 13px 44px; border-radius: 8px; font-size: 18px; margin: 32px 0 16px 0; cursor: pointer;}
  .submit-btn:disabled { background: #ccc; cursor: not-allowed;}
  label { font-weight: 500; }
  .text-danger { color: #ea3a3a;}
  .flex { display: flex; align-items: center; gap: 14px; }
</style>

<main>
  <h2 style="font-weight:600;padding:30px 0 18px 0; font-size:1.5rem;">開立發票</h2>
  <div class="card">
    <h3 style="font-size:1.1rem;margin-bottom:14px;">發票基本資料</h3>
    <div style="background:#ffeebd;border-radius:6px;padding:9px 16px 7px 16px;color:#333;font-size:1em;margin-bottom:16px;">
      目前設定為不列印無感應載具發票，若需列印請調整下方印表機設定。
    </div>
    <div class="flex" style="margin-bottom:14px;">
      <label style="min-width:100px;">* 印表機</label>
      <select bind:value={printType} style="min-width:220px;">
        <option value="">不列印自動無感發票</option>
        <option value="1">列印發票</option>
      </select>
    </div>
    <div class="flex" style="margin-bottom:10px;">
      <label style="min-width:100px;">發票日期</label>
      <input type="radio" checked>當下日期
      <input type="radio">自訂日期
      <input type="date" bind:value={date} style="margin-left:10px;">
      <input type="time" bind:value={time} style="margin-left:6px;width:110px;">
    </div>
    <div class="flex" style="margin-bottom:10px;">
      <label style="min-width:100px;">* 訂單編號</label>
      <input type="radio" bind:group={orderAuto} value={true} checked on:change={() => { orderId = `A${Date.now()}`; }}>自動產生訂單編號
      <input type="radio" bind:group={orderAuto} value={false}>自訂訂單編號
      {#if !orderAuto}
        <input type="text" bind:value={orderId} style="width:210px;" placeholder="自訂訂單編號">
      {/if}
    </div>
    <div>
      <label style="min-width:100px;">開立型態</label>
      <div class="open-type-btns">
        {#each openTypes as t}
          <button
            class:active={selectedType === t.value}
            type="button"
            on:click={() => setType(t.value)}
          >{t.label}</button>
        {/each}
      </div>
    </div>
    <button style="margin-top:8px; border:1px solid #aaa; background:#fafafa; color:#444; border-radius:6px; padding:4px 12px; font-size:.93rem; cursor:pointer;">展開更多細項</button>
  </div>

  <div class="card">
    <h3 style="font-size:1.05rem;">商品明細資料 <span style="font-size:.9em;color:#aaa;">(上限50筆)</span></h3>
    <table class="product-table">
      <thead>
        <tr>
          <th>序號</th>
          <th>品名</th>
          <th>課稅別</th>
          <th>數量</th>
          <th>單位</th>
          <th>單價(含稅)</th>
          <th>金額(含稅)</th>
          <th>備註</th>
          <th>刪除</th>
        </tr>
      </thead>
      <tbody>
        {#each ProductItem as item, i}
          <tr>
            <td>{i + 1}</td>
            <td>
              <input type="text" bind:value={item.Description} placeholder="請輸入商品名稱" style="width:120px;">
            </td>
            <td>
              <label><input type="radio" bind:group={item.TaxType} value="1">應稅</label>
              <label><input type="radio" bind:group={item.TaxType} value="2">零稅率</label>
              <label><input type="radio" bind:group={item.TaxType} value="3">免稅</label>
            </td>
            <td>
              <input type="number" min="1" bind:value={item.Quantity} on:input={updateProductAmounts} style="width:52px;">
            </td>
            <td>
              <input type="text" bind:value={item.UnitText} placeholder="" style="width:54px;">
            </td>
            <td>
              <input type="number" step="0.01" bind:value={item.UnitPrice} on:input={updateProductAmounts} style="width:74px;">
            </td>
            <td>
              <input type="number" value={item.Amount} readonly style="width:74px;">
            </td>
            <td>
              <input type="text" bind:value={item.Remark} style="width:100px;">
            </td>
            <td>
              <button class="del-btn" on:click={() => removeProduct(i)} disabled={ProductItem.length===1}>🗑️</button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
    <button class="add-btn" on:click={addProduct}>+</button>
  </div>

  <div class="card summary">
    <div class="summary-box">
      <div style="font-weight:500;margin-bottom:4px;">
        發票總備註 <span title="總長不得超過200字" style="color:#4291d7;cursor:pointer;">?</span>
      </div>
      <textarea bind:value={MainRemark} maxlength="200" style="width:100%;height:70px;resize:none;"></textarea>
      <div class="text-danger" style="font-size:.95em;">注意：總長不得超過200字</div>
    </div>
    <div class="total-box">
      <div>應稅銷售額合計：{SalesAmount}</div>
      <div>零稅率銷售額合計：{ZeroTaxSalesAmount}</div>
      <div>營業稅額：{TaxAmount}</div>
      <div style="margin-top:8px;">
        <span style="font-size:1.2em;font-weight:700;">總計</span>：
        <span style="font-size:1.35em;font-weight:600;">{TotalAmount}</span>
      </div>
      <button class="submit-btn" on:click={submit} disabled={loading}>
        {loading ? "送出中..." : "送出"}
      </button>
    </div>
  </div>
  {#if result}
    <div class="card">
      <h3>API 回傳</h3>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  {/if}
  {#if error}
    <div class="card text-danger">{error}</div>
  {/if}
</main>
