const cashflowForm = document.querySelector("#cashflow-form");
const cashflowList = document.querySelector("#cashflow-list");
const savingsForm = document.querySelector("#savings-form");
const savingsList = document.querySelector("#savings-list");
const targetForm = document.querySelector("#target-form");
const targetsSummary = document.querySelector("#targets-summary");
const targetsList = document.querySelector("#targets-list");
const tracker = document.querySelector("#tracker");
const summary = document.querySelector("#summary");

const CASHFLOW_KEY = "finance_cashflow_v2";
const SAVINGS_KEY = "finance_savings_v2";
const TARGETS_KEY = "finance_targets_v2";

const defaultCashflow = [
  {
    id: crypto.randomUUID(),
    type: "income",
    amount: 72000,
    date: todayOffset(-2),
    notes: "Monthly salary",
  },
  {
    id: crypto.randomUUID(),
    type: "expense",
    amount: 18500,
    date: todayOffset(-1),
    notes: "Home rent",
  },
];

const defaultSavings = [
  {
    id: crypto.randomUUID(),
    type: "fd",
    amount: 50000,
    date: todayOffset(-10),
    notes: "Axis Bank FD",
  },
  {
    id: crypto.randomUUID(),
    type: "mutual",
    amount: 12000,
    date: todayOffset(-5),
    notes: "Nifty Index Fund",
  },
  {
    id: crypto.randomUUID(),
    type: "stocks",
    amount: 15000,
    date: todayOffset(-3),
    notes: "Tata Motors",
  },
];

const defaultTargets = [
  {
    id: crypto.randomUUID(),
    name: "Emergency Fund",
    amount: 300000,
    date: todayOffset(240),
    notes: "6 months coverage",
  },
  {
    id: crypto.randomUUID(),
    name: "Dream Vacation",
    amount: 150000,
    date: todayOffset(180),
    notes: "Family trip",
  },
];

function todayOffset(daysFromNow) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split("T")[0];
}

function loadData(key, fallback) {
  const stored = localStorage.getItem(key);
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem(key, JSON.stringify(fallback));
  return fallback;
}

function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateString) {
  if (!dateString) {
    return "No date";
  }
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function monthKey(dateString) {
  const date = new Date(dateString);
  const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
  return month;
}

function monthLabel(key) {
  const [year, month] = key.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

function savingsTypeLabel(type) {
  if (type === "fd") return "Fixed Deposit";
  if (type === "mutual") return "Mutual Fund";
  return "Stocks";
}

function renderSummary(cashflow, savings, targets) {
  const incomeTotal = cashflow
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);
  const expenseTotal = cashflow
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);
  const net = incomeTotal - expenseTotal;
  const savingsTotal = savings.reduce((sum, item) => sum + item.amount, 0);
  const targetsTotal = targets.reduce((sum, item) => sum + item.amount, 0);

  summary.innerHTML = `
    <div>
      <h3>Net cashflow</h3>
      <p>${formatCurrency(net)}</p>
    </div>
    <div>
      <h3>Total savings</h3>
      <p>${formatCurrency(savingsTotal)}</p>
    </div>
    <div>
      <h3>Targets total</h3>
      <p>${formatCurrency(targetsTotal)}</p>
    </div>
    <div>
      <h3>Portfolio (net + savings)</h3>
      <p>${formatCurrency(net + savingsTotal)}</p>
    </div>
  `;
}

function renderCashflow(cashflow) {
  cashflowList.innerHTML = "";
  if (!cashflow.length) {
    cashflowList.innerHTML = '<div class="empty">No entries yet.</div>';
    return;
  }

  const template = document.querySelector("#list-template");
  cashflow
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach((item) => {
      const clone = template.content.cloneNode(true);
      clone.querySelector(".item-title").textContent =
        item.type === "income" ? "Income" : "Expense";
      clone.querySelector(".item-meta").innerHTML = `
        <span class="badge ${item.type === "expense" ? "expense" : ""}">${
        item.type === "income" ? "Income" : "Expense"
      }</span>
        ${formatDate(item.date)} • ${item.notes || "No notes"}
      `;
      const amount = clone.querySelector(".item-amount");
      amount.textContent = formatCurrency(item.amount);
      amount.classList.toggle("negative", item.type === "expense");

      clone.querySelector(".item-action").addEventListener("click", () => {
        const updated = loadData(CASHFLOW_KEY, defaultCashflow).filter(
          (entry) => entry.id !== item.id
        );
        saveData(CASHFLOW_KEY, updated);
        render();
      });

      cashflowList.appendChild(clone);
    });
}

function renderSavings(savings) {
  savingsList.innerHTML = "";
  if (!savings.length) {
    savingsList.innerHTML = '<div class="empty">No savings logged yet.</div>';
    return;
  }

  const template = document.querySelector("#list-template");
  savings
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach((item) => {
      const clone = template.content.cloneNode(true);
      clone.querySelector(".item-title").textContent = savingsTypeLabel(
        item.type
      );
      clone.querySelector(".item-meta").innerHTML = `
        <span class="badge savings">${savingsTypeLabel(item.type)}</span>
        ${formatDate(item.date)} • ${item.notes || "No notes"}
      `;
      clone.querySelector(".item-amount").textContent = formatCurrency(
        item.amount
      );

      clone.querySelector(".item-action").addEventListener("click", () => {
        const updated = loadData(SAVINGS_KEY, defaultSavings).filter(
          (entry) => entry.id !== item.id
        );
        saveData(SAVINGS_KEY, updated);
        render();
      });

      savingsList.appendChild(clone);
    });
}

function renderTargets(targets) {
  targetsList.innerHTML = "";
  if (!targets.length) {
    targetsSummary.innerHTML =
      "<strong>No targets yet.</strong> Add a target to start tracking.";
    targetsList.innerHTML = '<div class="empty">No targets added.</div>';
    return;
  }

  const total = targets.reduce((sum, item) => sum + item.amount, 0);
  const nearest = targets
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  targetsSummary.innerHTML = `
    <div><strong>${formatCurrency(total)}</strong> total across all targets</div>
    <div>Next target: ${nearest.name} by ${formatDate(nearest.date)}</div>
  `;

  const template = document.querySelector("#list-template");
  targets
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .forEach((item) => {
      const clone = template.content.cloneNode(true);
      clone.querySelector(".item-title").textContent = item.name;
      clone.querySelector(".item-meta").textContent = `${formatDate(
        item.date
      )} • ${item.notes || "No notes"}`;
      clone.querySelector(".item-amount").textContent = formatCurrency(
        item.amount
      );

      clone.querySelector(".item-action").addEventListener("click", () => {
        const updated = loadData(TARGETS_KEY, defaultTargets).filter(
          (entry) => entry.id !== item.id
        );
        saveData(TARGETS_KEY, updated);
        render();
      });

      targetsList.appendChild(clone);
    });
}

function buildMonthlyTracker(cashflow, savings) {
  const months = new Set();

  cashflow.forEach((item) => months.add(monthKey(item.date)));
  savings.forEach((item) => months.add(monthKey(item.date)));

  const sortedMonths = Array.from(months).sort((a, b) =>
    a < b ? 1 : -1
  );

  return sortedMonths.map((month) => {
    const monthCashflow = cashflow.filter(
      (item) => monthKey(item.date) === month
    );
    const income = monthCashflow
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + item.amount, 0);
    const expense = monthCashflow
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + item.amount, 0);
    const monthSavings = savings
      .filter((item) => monthKey(item.date) === month)
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      month,
      income,
      expense,
      savings: monthSavings,
      portfolio: income - expense + monthSavings,
    };
  });
}

function renderTracker(cashflow, savings) {
  tracker.innerHTML = "";
  const rows = buildMonthlyTracker(cashflow, savings);
  if (!rows.length) {
    tracker.innerHTML = '<div class="empty">No monthly data yet.</div>';
    return;
  }

  const header = document.createElement("div");
  header.className = "tracker-row header";
  header.innerHTML = `
    <div>Month</div>
    <div>Income</div>
    <div>Expenses</div>
    <div>Savings</div>
    <div>Portfolio</div>
  `;
  tracker.appendChild(header);

  rows.forEach((row) => {
    const entry = document.createElement("div");
    entry.className = "tracker-row";
    entry.innerHTML = `
      <div data-label="Month">${monthLabel(row.month)}</div>
      <div data-label="Income">${formatCurrency(row.income)}</div>
      <div data-label="Expenses" class="tracker-cell ${
        row.expense > 0 ? "negative" : ""
      }">${formatCurrency(row.expense)}</div>
      <div data-label="Savings">${formatCurrency(row.savings)}</div>
      <div data-label="Portfolio" class="tracker-cell ${
        row.portfolio >= 0 ? "positive" : "negative"
      }">${formatCurrency(row.portfolio)}</div>
    `;
    tracker.appendChild(entry);
  });
}

function handleCashflowSubmit(event) {
  event.preventDefault();
  const type = document.querySelector("#cashflow-type").value;
  const amount = Number(document.querySelector("#cashflow-amount").value);
  const date = document.querySelector("#cashflow-date").value;
  const notes = document.querySelector("#cashflow-notes").value.trim();

  if (!amount || !date) {
    return;
  }

  const cashflow = loadData(CASHFLOW_KEY, defaultCashflow);
  cashflow.push({
    id: crypto.randomUUID(),
    type,
    amount,
    date,
    notes,
  });
  saveData(CASHFLOW_KEY, cashflow);
  cashflowForm.reset();
  render();
}

function handleSavingsSubmit(event) {
  event.preventDefault();
  const type = document.querySelector("#savings-type").value;
  const amount = Number(document.querySelector("#savings-amount").value);
  const date = document.querySelector("#savings-date").value;
  const notes = document.querySelector("#savings-notes").value.trim();

  if (!amount || !date) {
    return;
  }

  const savings = loadData(SAVINGS_KEY, defaultSavings);
  savings.push({
    id: crypto.randomUUID(),
    type,
    amount,
    date,
    notes,
  });
  saveData(SAVINGS_KEY, savings);
  savingsForm.reset();
  render();
}

function handleTargetSubmit(event) {
  event.preventDefault();
  const name = document.querySelector("#target-name").value.trim();
  const amount = Number(document.querySelector("#target-amount").value);
  const date = document.querySelector("#target-date").value;
  const notes = document.querySelector("#target-notes").value.trim();

  if (!name || !amount || !date) {
    return;
  }

  const targets = loadData(TARGETS_KEY, defaultTargets);
  targets.push({
    id: crypto.randomUUID(),
    name,
    amount,
    date,
    notes,
  });
  saveData(TARGETS_KEY, targets);
  targetForm.reset();
  render();
}

function render() {
  const cashflow = loadData(CASHFLOW_KEY, defaultCashflow);
  const savings = loadData(SAVINGS_KEY, defaultSavings);
  const targets = loadData(TARGETS_KEY, defaultTargets);

  renderSummary(cashflow, savings, targets);
  renderCashflow(cashflow);
  renderSavings(savings);
  renderTargets(targets);
  renderTracker(cashflow, savings);
}

cashflowForm.addEventListener("submit", handleCashflowSubmit);
savingsForm.addEventListener("submit", handleSavingsSubmit);
targetForm.addEventListener("submit", handleTargetSubmit);

render();
