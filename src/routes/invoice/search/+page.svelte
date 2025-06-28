<script lang="ts">
  let queryType = "order";
  let orderId = "";
  let invoiceNumber = "";
  let loading = false;
  let result: any = null;
  let error = "";

  async function submit() {
    loading = true;
    result = null;
    error = "";
    const payload: any = { type: queryType };
    if (queryType === "order") payload.order_id = orderId;
    if (queryType === "invoice") payload.invoice_number = invoiceNumber;
    try {
      const res = await fetch("/api/invoice/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "查詢失敗");
      result = data;
    } catch (e: any) {
      error = e.message;
    } finally {
      loading = false;
    }
  }
</script>

<style>
  main { max-width: 550px; margin: 0 auto; }
  .card { background: #fff; border-radius: 8px; padding: 24px; box-shadow: 0 1px 7px #0001; margin-bottom: 24px;}
  label { font-weight: 500; }
  .input-row { margin-bottom: 16px; }
  .submit-btn { background: #4291d7; color: #fff; border: none; padding: 10px 42px; border-radius: 8px; font-size: 17px; margin-top: 20px; cursor: pointer;}
  .submit-btn:disabled { background: #ccc; cursor: not-allowed;}
  .radio-row { display: flex; gap: 24px; margin-bottom: 20px; }
  .text-danger { color: #ea3a3a; margin-top: 14px;}
</style>

<main>
  <h2 style="font-weight:600;padding:30px 0 16px 0; font-size:1.5rem;">發票 | 發票查詢</h2>
  <div class="card">
    <h3 style="font-size:1.1rem;margin-bottom:18px;">查詢發票內容</h3>
    <form on:submit|preventDefault={submit}>
      <div class="radio-row">
        <label>
          <input type="radio" name="type" value="order" bind:group={queryType}>
          用訂單編號查詢
        </label>
        <label>
          <input type="radio" name="type" value="invoice" bind:group={queryType}>
          用發票號碼查詢
        </label>
      </div>
      {#if queryType === "order"}
        <div class="input-row">
          <label>訂單編號</label>
          <input type="text" bind:value={orderId} maxlength="40" placeholder="請輸入訂單編號" style="width: 100%;padding:6px;margin-top:5px;">
        </div>
      {/if}
      {#if queryType === "invoice"}
        <div class="input-row">
          <label>發票號碼</label>
          <input type="text" bind:value={invoiceNumber} maxlength="10" placeholder="請輸入發票號碼" style="width: 100%;padding:6px;margin-top:5px;">
        </div>
      {/if}
      <button type="submit" class="submit-btn" disabled={loading}>
        {loading ? "查詢中..." : "查詢"}
      </button>
    </form>
    {#if error}
      <div class="text-danger">{error}</div>
    {/if}
    {#if result}
      <div style="margin-top:24px;">
        <h4>查詢結果</h4>
        <pre>{JSON.stringify(result, null, 2)}</pre>
      </div>
    {/if}
  </div>
</main>
