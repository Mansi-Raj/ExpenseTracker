const transactions = JSON.parse(localStorage.getItem("transactions")) || [];

const formatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  signDisplay: "always",
});

const list = document.getElementById("transactionList");
const form = document.getElementById("transactionForm");
const status = document.getElementById("status");
const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");

form.addEventListener("submit", addTransaction);

function updateTotal() {
  const incomeTotal = transactions
    .filter((trx) => trx.type === "income")
    .reduce((total, trx) => total + trx.amount, 0);

  const expenseTotal = transactions
    .filter((trx) => trx.type === "expense")
    .reduce((total, trx) => total - trx.amount, 0);

  const balanceTotal = incomeTotal - expenseTotal;

  balance.textContent = formatter.format(balanceTotal);
  income.textContent = formatter.format(incomeTotal);
  expense.textContent = formatter.format(expenseTotal * -1);
}

function renderList() {
  list.innerHTML = "";
  status.textContent = "";

  if (transactions.length === 0) {
    status.textContent = "No transactions.";
    return;
  }

  transactions.forEach(({ id, name, reason, amount, date, type }) => {
    const li = document.createElement("li");
    li.dataset.id = id; // Set data-id for event delegation

    li.innerHTML = `
      <div class="name">
        <h4>${name}</h4>
        <p>${reason}</p>
        <p>${new Date(date).toLocaleDateString()}</p>
      </div>
      <div class="amount ${type}">
        <span>${formatter.format(amount)}</span>
      </div>
      <div class="action">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    `;

    list.appendChild(li);
  });
}

// Initial rendering and total update
renderList();
updateTotal();

function deleteTransaction(id) {
  const index = transactions.findIndex((trx) => trx.id === id);
  if (index > -1) {
    transactions.splice(index, 1);
    updateTotal();
    saveTransactions();
    renderList();
  }
}

function addTransaction(e) {
  e.preventDefault();

  const formData = new FormData(this);
  const transactionType = document.getElementById("type").checked ? "income" : "expense";
  const transactionAmount = parseFloat(formData.get("amount")) * (transactionType === "income" ? 1 : -1);

  transactions.push({
    id: Date.now(), // Unique ID based on timestamp
    name: formData.get("name"),
    reason: formData.get("Reason"), // Include reason
    amount: transactionAmount,
    date: new Date(formData.get("date")),
    type: transactionType,
  });

  this.reset();

  updateTotal();
  saveTransactions();
  renderList();
}

function saveTransactions() {
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// Event delegation for deleting transactions
list.addEventListener("click", function (e) {
  if (e.target.closest("svg")) {
    const id = e.target.closest("li").dataset.id;
    deleteTransaction(parseInt(id));
  }
});
