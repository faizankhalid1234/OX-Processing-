const params = new URLSearchParams(location.search);
const id = params.get("id") || params.get("foreign_id");
const payUrl = params.get("pay");

async function go() {
  if (payUrl) {
    window.location.replace(payUrl);
    return;
  }

  if (!id) {
    window.location.replace("/failed.html");
    return;
  }

  const res = await fetch(apiUrl("/api/transactions/approve"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transaction_id: id }),
  });
  const data = await res.json();
  const status = data.status || (data.found ? "Approved" : "Failed");

  if (status === "Approved") {
    window.location.replace("/success.html?foreign_id=" + encodeURIComponent(id));
    return;
  }

  window.location.replace("/failed.html?foreign_id=" + encodeURIComponent(id));
}

go();
