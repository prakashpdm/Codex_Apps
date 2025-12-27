const cashflowForm = document.querySelector("#cashflow-form");
const cashflowList = document.querySelector("#cashflow-list");
const savingsForm = document.querySelector("#savings-form");
const savingsSummary = document.querySelector("#savings-summary");
const portfolioForm = document.querySelector("#portfolio-form");
const portfolioList = document.querySelector("#portfolio-list");
const summary = document.querySelector("#summary");

const CASHFLOW_KEY = "finance_cashflow";
const SAVINGS_KEY = "finance_savings";
const PORTFOLIO_KEY = "finance_portfolio";

const defaultCashflow = [
  {
    id: crypto.randomUUID(),
    type: "income",
    amount: 18000,
    date: todayOffset(2),
    notes: "Monthly salary",
  },
  {
    id: crypto.randomUUID(),
    type: "payment",
    amount: 4200,
    date: todayOffset(6),
    notes: "Visa Platinum",
  },
];

const defaultSavings = {
  targetAmount: 40000,
  targetDate: todayOffset(120),
  currentSaved: 14500,
  monthlyAdd: 1500,
};

const defaultPortfolio = [
  {
    id: crypto.randomUUID(),
    name: "Nifty Index Fund",
    units: 120.5,
    nav: 32.75,
    swp: 2500,
  },
  {
    id: crypto.randomUUID(),
    name: "Balanced Advantage",
    units: 80.2,
    nav: 45.2,
    swp: 1800,
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

function formatCurrency(amount, currency) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateString) {
  if (!dateString) {
    return "No date";
  }
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function renderSummary(cashflow, savings, portfolio) {
  const incomeTotal = cashflow
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);
  const paymentTotal = cashflow
    .filter((item) => item.type === "payment")
    .reduce((sum, item) => sum + item.amount, 0);
  const net = incomeTotal - paymentTotal;
  const portfolioValue = portfolio.reduce(
    (sum, fund) => sum + fund.units * fund.nav,
    0
  );
  const swpTotal = portfolio.reduce((sum, fund) => sum + fund.swp, 0);

  summary.innerHTML = `
    <div>
      <h3>Net monthly cashflow</h3>
      <p>${formatCurrency(net, "AED")}</p>
    </div>
    <div>
      <h3>Target gap</h3>
      <p>${formatCurrency(
        Math.max(savings.targetAmount - savings.currentSaved, 0),
        "AED"
      )}</p>
    </div>
    <div>
      <h3>Portfolio value</h3>
      <p>${formatCurrency(portfolioValue, "INR")}</p>
    </div>
    <div>
      <h3>Total monthly SWP</h3>
      <p>${formatCurrency(swpTotal, "INR")}</p>
    </div>
  `;
}

function renderCashflow(cashflow) {
  cashflowList.innerHTML = "";
  if (!cashflow.length) {
    cashflowList.innerHTML = '<div class="empty">No entries yet.</div>';
    return;
  }

  const template = document.querySelector("#cashflow-template");
  cashflow
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .forEach((item) => {
      const clone = template.content.cloneNode(true);
      clone.querySelector(".item-title").textContent =
        item.type === "income" ? "Income" : "Credit card payment";
      clone.querySelector(".item-meta").textContent = `${formatDate(
        item.date
      )} • ${item.notes || "No notes"}`;
      const amount = clone.querySelector(".item-amount");
      amount.textContent = formatCurrency(item.amount, "AED");
      amount.classList.toggle("negative", item.type === "payment");

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
  const gap = Math.max(savings.targetAmount - savings.currentSaved, 0);
  const targetDate = new Date(savings.targetDate);
  const now = new Date();
  const monthsLeft = Math.max(
    Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24 * 30)),
    0
  );
  const requiredPerMonth = monthsLeft
    ? gap / monthsLeft
    : gap;
  const projected = savings.currentSaved +
    (savings.monthlyAdd || 0) * monthsLeft;

  savingsSummary.innerHTML = `
    <div><strong>${formatCurrency(savings.currentSaved, "AED")}</strong> saved so far</div>
    <div>Target: ${formatCurrency(savings.targetAmount, "AED")} by ${formatDate(
    savings.targetDate
  )}</div>
    <div>Gap to target: ${formatCurrency(gap, "AED")}</div>
    <div>Needed per month: ${formatCurrency(requiredPerMonth, "AED")}</div>
    <div>Projected with add-ons: ${formatCurrency(projected, "AED")}</div>
  `;
}

function renderPortfolio(portfolio) {
  portfolioList.innerHTML = "";
  if (!portfolio.length) {
    portfolioList.innerHTML = '<div class="empty">No funds yet.</div>';
    return;
  }

  const template = document.querySelector("#portfolio-template");
  portfolio.forEach((fund) => {
    const clone = template.content.cloneNode(true);
    const value = fund.units * fund.nav;
    clone.querySelector(".item-title").textContent = fund.name;
    clone.querySelector(".item-meta").textContent = `${fund.units} units • NAV ${formatCurrency(
      fund.nav,
      "INR"
    )} • SWP ${formatCurrency(fund.swp, "INR")}`;
    clone.querySelector(".item-amount").textContent = formatCurrency(
      value,
      "INR"
    );

    clone.querySelector(".item-action").addEventListener("click", () => {
      const updated = loadData(PORTFOLIO_KEY, defaultPortfolio).filter(
        (entry) => entry.id !== fund.id
      );
      saveData(PORTFOLIO_KEY, updated);
      render();
    });

    portfolioList.appendChild(clone);
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
  const targetAmount = Number(document.querySelector("#savings-target").value);
  const targetDate = document.querySelector("#savings-date").value;
  const currentSaved = Number(document.querySelector("#savings-current").value);
  const monthlyAdd = Number(document.querySelector("#savings-monthly").value || 0);

  if (!targetAmount || !targetDate) {
    return;
  }

  const savings = { targetAmount, targetDate, currentSaved, monthlyAdd };
  saveData(SAVINGS_KEY, savings);
  render();
}

function handlePortfolioSubmit(event) {
  event.preventDefault();
  const name = document.querySelector("#portfolio-name").value.trim();
  const units = Number(document.querySelector("#portfolio-units").value);
  const nav = Number(document.querySelector("#portfolio-nav").value);
  const swp = Number(document.querySelector("#portfolio-swp").value);

  if (!name || !units || !nav) {
    return;
  }

  const portfolio = loadData(PORTFOLIO_KEY, defaultPortfolio);
  portfolio.push({
    id: crypto.randomUUID(),
    name,
    units,
    nav,
    swp,
  });
  saveData(PORTFOLIO_KEY, portfolio);
  portfolioForm.reset();
  render();
}

function hydrateForms(savings) {
  document.querySelector("#savings-target").value = savings.targetAmount;
  document.querySelector("#savings-date").value = savings.targetDate;
  document.querySelector("#savings-current").value = savings.currentSaved;
  document.querySelector("#savings-monthly").value = savings.monthlyAdd;
}

function render() {
  const cashflow = loadData(CASHFLOW_KEY, defaultCashflow);
  const savings = loadData(SAVINGS_KEY, defaultSavings);
  const portfolio = loadData(PORTFOLIO_KEY, defaultPortfolio);

  hydrateForms(savings);
  renderSummary(cashflow, savings, portfolio);
  renderCashflow(cashflow);
  renderSavings(savings);
  renderPortfolio(portfolio);
}

cashflowForm.addEventListener("submit", handleCashflowSubmit);
savingsForm.addEventListener("submit", handleSavingsSubmit);
portfolioForm.addEventListener("submit", handlePortfolioSubmit);

render();
