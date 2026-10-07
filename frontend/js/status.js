function startStatusPoll(options) {
  const params = new URLSearchParams(location.search);
  const id = params.get("foreign_id");
  const msg = document.getElementById("msg");

  async function poll() {
    if (!id) {
      return;
    }

    const res = await fetch(apiUrl("/api/transactions/" + encodeURIComponent(id)));
    const data = await res.json();
    const status = data && data.status ? data.status : null;

    if (status && msg) {
      msg.textContent = status;
    }

    if (options.onStatus) {
      options.onStatus(status, id);
    }
  }

  poll();
  setInterval(poll, 3000);
}
