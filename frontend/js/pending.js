const params = new URLSearchParams(location.search);
const id = params.get("id") || params.get("foreign_id");
const payUrl = params.get("pay");
const msg = document.getElementById("msg");
const ids = document.getElementById("ids");
const title = document.getElementById("title");
const eyebrow = document.getElementById("eyebrow");
const approveBtn = document.getElementById("approveBtn");

let timer = null;
let tries = 0;

if (payUrl) {
  window.open(payUrl, "_blank");
}

function setState(text, kind) {
  msg.textContent = text;
  eyebrow.classList.remove("ok", "bad");
  if (kind) {
    eyebrow.classList.add(kind);
  }
}

async function loadTransaction() {
  if (!id) {
    setState("No transaction id on this page.", "bad");
    return null;
  }

  const res = await fetch(apiUrl("/api/transactions/" + encodeURIComponent(id)));
  const data = await res.json();
  return data;
}

async function poll() {
  tries += 1;
  ids.textContent = "ID: " + id;

  try {
    const data = await loadTransaction();

    if (!data || !data.found) {
      setState("Transaction not in database yet. Waiting for webhook…");
      return;
    }

    const row = data.data;
    const extra = row.payment_id ? " · PaymentId " + row.payment_id : "";
    ids.textContent = "Billing " + row.billing_id + extra;

    if (row.status === "approved") {
      stopPoll();
      eyebrow.textContent = "Approved";
      title.textContent = "Transaction approved";
      setState("This payment is approved in PostgreSQL.", "ok");
      approveBtn.classList.add("hidden");
      return;
    }

    if (row.status === "failed") {
      stopPoll();
      eyebrow.textContent = "Failed";
      title.textContent = "Payment failed";
      setState("Webhook marked this payment as failed. It cannot be approved.", "bad");
      approveBtn.classList.add("hidden");
      return;
    }

    if (row.status === "paid") {
      stopPoll();
      eyebrow.textContent = "Paid";
      title.textContent = "Payment received";
      setState("Found in database. Click approve to confirm it.", "ok");
      approveBtn.classList.remove("hidden");
      return;
    }

    setState("Found in database. Status: " + row.status + ". Waiting for paid webhook…");
  } catch (error) {
    setState(error.message, "bad");
  }

  if (tries >= 40) {
    stopPoll();
    setState("Still waiting. You can stay on this page or try approve later.");
  }
}

function stopPoll() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

approveBtn.addEventListener("click", async () => {
  approveBtn.disabled = true;

  try {
    const res = await fetch(apiUrl("/api/transactions/approve"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transaction_id: id }),
    });
    const data = await res.json();

    if (data.approved) {
      eyebrow.textContent = "Approved";
      title.textContent = "Transaction approved";
      setState("Approved. This ID was in PostgreSQL.", "ok");
      approveBtn.classList.add("hidden");
      return;
    }

    setState(data.error || "Not approved.", "bad");
    approveBtn.disabled = false;
  } catch (error) {
    setState(error.message, "bad");
    approveBtn.disabled = false;
  }
});

poll();
timer = setInterval(poll, 3000);
