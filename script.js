const STORAGE_KEY = "spendwise-expenses-v1";

const form = document.getElementById("expenseForm");
const expenseIdInput = document.getElementById("expenseId");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const expenseList = document.getElementById("expenseList");
const formMessage = document.getElementById("formMessage");

const categoryIcons = {
  Food: "🍽️", Transport: "🚌", Shopping: "🛍️", Bills: "🧾",
  Health: "💊", Education: "📚", Entertainment: "🎬", Other: "📌"
};

let expenses = loadExpenses();

function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function loadExpenses() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Could not load saved expenses:", error);
    return [];
  }
}

function saveExpenses() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    return true;
  } catch (error) {
    console.error("Could not save expenses:", error);
    showMessage("Unable to save data in this browser.", true);
    return false;
  }
}

function currency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 2
  }).format(value);
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(`${dateString}T00:00:00`);
  return Number.isNaN(date.getTime()) ? dateString : date.toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric"
  });
}

function showMessage(message, isError = false) {
  formMessage.textContent = message;
  formMessage.style.color = isError ? "#c24141" : "#24845f";
}

function getFilteredExpenses() {
  const search = document.getElementById("searchInput").value.trim().toLowerCase();
  const category = document.getElementById("categoryFilter").value;
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;

  return expenses
    .filter(expense => {
      const matchesSearch = expense.title.toLowerCase().includes(search) ||
        expense.category.toLowerCase().includes(search);
      const matchesCategory = category === "All" || expense.category === category;
      const matchesStart = !startDate || expense.date >= startDate;
      const matchesEnd = !endDate || expense.date <= endDate;
      return matchesSearch && matchesCategory && matchesStart && matchesEnd;
    })
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
}

function renderSummary(filtered) {
  const total = filtered.reduce((sum, expense) => sum + expense.amount, 0);
  document.getElementById("totalAmount").textContent = currency(total);
  document.getElementById("transactionCount").textContent = filtered.length;
  document.getElementById("averageAmount").textContent = currency(filtered.length ? total / filtered.length : 0);
}

function renderExpenses(filtered) {
  expenseList.replaceChildren();
  document.getElementById("resultCount").textContent =
    `${filtered.length} expense${filtered.length === 1 ? "" : "s"}`;

  if (!filtered.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = '<div class="empty-icon">🧾</div><strong>No expenses found</strong><p>Add an expense or adjust your filters to see records here.</p>';
    expenseList.appendChild(empty);
    return;
  }

  filtered.forEach(expense => {
    const item = document.createElement("article");
    item.className = "expense-item";

    const icon = document.createElement("div");
    icon.className = "category-icon";
    icon.textContent = categoryIcons[expense.category] || categoryIcons.Other;

    const info = document.createElement("div");
    const name = document.createElement("div");
    name.className = "expense-name";
    name.textContent = expense.title;
    const meta = document.createElement("div");
    meta.className = "expense-meta";
    meta.textContent = `${expense.category} · ${formatDate(expense.date)}`;
    info.append(name, meta);

    const right = document.createElement("div");
    right.className = "expense-right";
    const amount = document.createElement("div");
    amount.className = "expense-amount";
    amount.textContent = currency(expense.amount);
    const actions = document.createElement("div");
    actions.className = "item-actions";
    const edit = document.createElement("button");
    edit.type = "button";
    edit.textContent = "Edit";
    edit.setAttribute("aria-label", `Edit ${expense.title}`);
    edit.addEventListener("click", () => startEdit(expense.id));
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "delete-button";
    remove.textContent = "Delete";
    remove.setAttribute("aria-label", `Delete ${expense.title}`);
    remove.addEventListener("click", () => deleteExpense(expense.id));
    actions.append(edit, remove);
    right.append(amount, actions);
    item.append(icon, info, right);
    expenseList.appendChild(item);
  });
}

function renderBreakdown(filtered) {
  const breakdown = document.getElementById("categoryBreakdown");
  breakdown.replaceChildren();
  const totals = {};
  filtered.forEach(expense => {
    totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
  });
  const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  const grandTotal = filtered.reduce((sum, expense) => sum + expense.amount, 0);

  if (!sorted.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "Category summaries will appear after you add expenses.";
    breakdown.appendChild(empty);
    return;
  }

  sorted.forEach(([category, total]) => {
    const card = document.createElement("div");
    card.className = "breakdown-item";
    const top = document.createElement("div");
    top.className = "breakdown-top";
    const label = document.createElement("span");
    label.textContent = `${categoryIcons[category] || "📌"} ${category}`;
    const percent = document.createElement("span");
    percent.textContent = `${grandTotal ? Math.round(total / grandTotal * 100) : 0}%`;
    top.append(label, percent);
    const value = document.createElement("div");
    value.className = "breakdown-value";
    value.textContent = currency(total);
    const track = document.createElement("div");
    track.className = "progress-track";
    const fill = document.createElement("div");
    fill.className = "progress-fill";
    fill.style.width = `${grandTotal ? total / grandTotal * 100 : 0}%`;
    track.appendChild(fill);
    card.append(top, value, track);
    breakdown.appendChild(card);
  });
}

function render() {
  const filtered = getFilteredExpenses();
  renderSummary(filtered);
  renderExpenses(filtered);
  renderBreakdown(filtered);
}

function resetForm() {
  form.reset();
  expenseIdInput.value = "";
  dateInput.value = localDateString();
  document.getElementById("formTitle").textContent = "Add an expense";
  document.getElementById("saveButton").textContent = "Save expense";
  document.getElementById("cancelEditButton").classList.add("hidden");
  showMessage("");
}

function startEdit(id) {
  const expense = expenses.find(item => item.id === id);
  if (!expense) return;
  expenseIdInput.value = expense.id;
  titleInput.value = expense.title;
  amountInput.value = expense.amount;
  categoryInput.value = expense.category;
  dateInput.value = expense.date;
  document.getElementById("formTitle").textContent = "Edit expense";
  document.getElementById("saveButton").textContent = "Update expense";
  document.getElementById("cancelEditButton").classList.remove("hidden");
  showMessage("Editing selected expense.");
  document.getElementById("formPanel").scrollIntoView({ behavior: "smooth", block: "start" });
  titleInput.focus({ preventScroll: true });
}

function deleteExpense(id) {
  const expense = expenses.find(item => item.id === id);
  if (!expense) return;
  if (!window.confirm(`Delete "${expense.title}"? This cannot be undone.`)) return;
  expenses = expenses.filter(item => item.id !== id);
  saveExpenses();
  if (expenseIdInput.value === id) resetForm();
  render();
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const title = titleInput.value.trim();
  const amount = Number(amountInput.value);
  const category = categoryInput.value;
  const date = dateInput.value;

  if (!title) return showMessage("Please enter an expense name.", true);
  if (!Number.isFinite(amount) || amount <= 0) return showMessage("Amount must be greater than zero.", true);
  if (!date) return showMessage("Please select a date.", true);

  const editingId = expenseIdInput.value;
  if (editingId) {
    expenses = expenses.map(expense => expense.id === editingId
      ? { ...expense, title, amount, category, date }
      : expense);
    showMessage("Expense updated successfully.");
  } else {
    expenses.push({
      id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title, amount, category, date, createdAt: Date.now()
    });
    showMessage("Expense added successfully.");
  }

  if (saveExpenses()) {
    render();
    resetForm();
    showMessage(editingId ? "Expense updated successfully." : "Expense added successfully.");
  }
});

document.getElementById("cancelEditButton").addEventListener("click", resetForm);
document.getElementById("addTopButton").addEventListener("click", () => {
  document.getElementById("formPanel").scrollIntoView({ behavior: "smooth", block: "start" });
  titleInput.focus({ preventScroll: true });
});
["searchInput", "categoryFilter", "startDate", "endDate"].forEach(id => {
  document.getElementById(id).addEventListener("input", render);
  document.getElementById(id).addEventListener("change", render);
});

document.getElementById("clearFiltersButton").addEventListener("click", () => {
  document.getElementById("searchInput").value = "";
  document.getElementById("categoryFilter").value = "All";
  document.getElementById("startDate").value = "";
  document.getElementById("endDate").value = "";
  render();
});

document.getElementById("exportButton").addEventListener("click", () => {
  const filtered = getFilteredExpenses();
  if (!filtered.length) {
    window.alert("There are no expenses to export.");
    return;
  }
  const escapeCsv = value => `"${String(value).replace(/"/g, '""')}"`;
  const rows = [
    ["Expense", "Amount (INR)", "Category", "Date"],
    ...filtered.map(expense => [expense.title, expense.amount, expense.category, expense.date])
  ];
  const csv = rows.map(row => row.map(escapeCsv).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "spendwise-expenses.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
});

dateInput.value = localDateString();
render();
