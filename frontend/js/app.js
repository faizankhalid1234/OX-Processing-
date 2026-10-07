const form = document.getElementById("payForm");
const submitBtn = document.getElementById("submitBtn");
const testPayBox = document.getElementById("testPayBox");
const formError = document.getElementById("formError");

let paying = false;
let testPayOn = true;

function showError(message) {
  if (!message) {
    formError.classList.add("hidden");
    formError.textContent = "";
    return;
  }

  formError.classList.remove("hidden");
  formError.textContent = message;
}

function apiMessage(data) {
  if (!data) {
    return "Request failed.";
  }
  if (typeof data.error === "string") {
    return data.error;
  }
  if (typeof data.Message === "string") {
    return data.Message;
  }
  if (typeof data.message === "string") {
    return data.message;
  }
  return "Request failed.";
}

function setTestPay(on) {
  testPayOn = on;
  testPayBox.classList.toggle("is-checked", on);
  testPayBox.setAttribute("aria-pressed", on ? "true" : "false");
}

async function createPayment() {
  if (paying) {
    return;
  }

  if (!form.reportValidity()) {
    return;
  }

  if (!window.API_BASE) {
    showError("API_BASE is not set in env.js");
    return;
  }

  paying = true;
  submitBtn.disabled = true;
  testPayBox.disabled = true;
  showError("");

  try {
    const payload = {
      amount: form.amount.value,
      currency_iso: form.currency_iso.value,
      end_user_email: form.end_user_email.value,
      first_name: form.first_name.value || undefined,
      last_name: form.last_name.value || undefined,
      end_user_reference: form.end_user_reference.value || undefined,
      test: true,
    };

    const res = await fetch(apiUrl("/api/payments/hosted"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data && data.data && data.data.payment_link) {
      window.location.href = data.data.payment_link;
      return;
    }

    showError(apiMessage(data));
  } catch (error) {
    showError(error.message);
  } finally {
    paying = false;
    submitBtn.disabled = false;
    testPayBox.disabled = false;
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  createPayment();
});

setTestPay(true);

testPayBox.addEventListener("click", (event) => {
  event.preventDefault();
  setTestPay(true);
});
