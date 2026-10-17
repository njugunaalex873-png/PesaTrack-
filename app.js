
const form = document.getElementById("transactionForm");
const typeInput = document.getElementById("type");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const dateInput = document.getElementById("date");
const list = document.getElementById("transactionList");
const emptyState = document.getElementById("emptyState");
const message = document.getElementById("message");

const STORAGE_KEY = "pesatrack.transactions.v1";
const money = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  minimumFractionDigits: 2
});

let transactions = [];

try {
  const saved = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
  );

  if (Array.isArray(saved)) {
    transactions = saved.filter(tx =>
      tx &&
      typeof tx.id === "string" &&
      typeof tx.description === "string" &&
      Number.isFinite(Number(tx.amount)) &&
      Number(tx.amount) > 0 &&
      ["income", "expense"].includes(tx.type) &&
      typeof tx.date === "string"
    );
  }
} catch (error) {
  transactions = [];
}

function saveTransactions() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(transactions)
    );
    return true;
  } catch (error) {
    message.textContent =
      "Could not save data. Check your device storage.";
    return false;
  }
}

function render() {
  let income = 0;
  let expenses = 0;

  transactions.forEach(tx => {
    if (tx.type === "income") {
      income += Number(tx.amount);
    } else {
      expenses += Number(tx.amount);
    }
  });

  document.getElementById("income").textContent =
    money.format(income);

  document.getElementById("expenses").textContent =
    money.format(expenses);

  document.getElementById("balance").textContent =
    money.format(income - expenses);

  list.replaceChildren();

  const sorted = [...transactions].sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  emptyState.hidden = sorted.length > 0;

  sorted.forEach(tx => {
    const row = document.createElement("div");
    row.className = "transaction";

    const details = document.createElement("div");
    details.textContent = tx.description;

    const date = document.createElement("small");
    date.textContent = tx.date;
    details.appendChild(date);

    const right = document.createElement("div");
    right.className = tx.type;

    const amount = document.createElement("strong");
    amount.textContent =
      (tx.type === "income" ? "+" : "−") +
      money.format(Number(tx.amount));

    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", "Delete transaction");

    remove.addEventListener("click", () => {
      if (confirm("Delete this transaction?")) {
        transactions = transactions.filter(
          item => item.id !== tx.id
        );

        if (saveTransactions()) render();
      }
    });

    right.append(amount, document.createElement("br"), remove);
    row.append(details, right);
    list.appendChild(row);
  });
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const description = descriptionInput.value.trim();
  const amount = Number(amountInput.value);
  const date = dateInput.value;

  if (
    !description ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    !date
  ) {
    message.textContent =
      "Enter a description, positive amount and date.";
    return;
  }

  const transaction = {
    id: Date.now().toString() +
      Math.random().toString(16).slice(2),
    description,
    amount: Math.round(amount * 100) / 100,
    type: typeInput.value,
    date
  };

  transactions.push(transaction);

  if (saveTransactions()) {
    form.reset();
    setToday();
    message.textContent = "Transaction saved!";
    render();
  }
});

document.getElementById("clearBtn")
  .addEventListener("click", () => {
    if (
      transactions.length &&
      confirm("Delete ALL transactions on this device?")
    ) {
      const previous = transactions;
      transactions = [];

      if (saveTransactions()) {
        render();
        message.textContent = "Transactions cleared.";
      } else {
        transactions = previous;
        render();
      }
    }
  });

function setToday() {
  const now = new Date();

  dateInput.value =
    now.getFullYear() + "-" +
    String(now.getMonth() + 1).padStart(2, "0") + "-" +
    String(now.getDate()).padStart(2, "0");
}

setToday();
render();

/* PesaTrack splash screen controller */
(function () {
  function hidePesaTrackSplash() {
    const splash = document.getElementById("splash-screen");

    if (splash) {
      splash.classList.add("hide-splash");

      setTimeout(function () {
        splash.remove();
      }, 500);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      function () {
        setTimeout(hidePesaTrackSplash, 1800);
      },
      { once: true }
    );
  } else {
    setTimeout(hidePesaTrackSplash, 1800);
  }
})();

