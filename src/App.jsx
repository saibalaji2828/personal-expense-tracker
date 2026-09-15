import React, { useMemo, useState } from "react";
import "./App.css";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

const CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Education",
  "Health",
  "Entertainment",
  "Other",
];

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const todayString = () => new Date().toISOString().slice(0, 10);
const currentMonth = () => new Date().toISOString().slice(0, 7);

function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("expenseUser");
      const logged = localStorage.getItem("isLoggedIn") === "true";

      return logged && saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [page, setPage] = useState(() =>
    localStorage.getItem("isLoggedIn") === "true"
      ? "dashboard"
      : "login"
  );

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [signupData, setSignupData] = useState({
    name: "",
    gender: "",
    age: "",
    occupation: "",
    email: "",
    number: "",
    password: "",
  });

  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem("transactions");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    try {
      const saved = localStorage.getItem("monthlyBudget");
      return saved ? Number(saved) : 10000;
    } catch {
      return 10000;
    }
  });

  const [selectedMonth, setSelectedMonth] = useState(currentMonth());

  const [form, setForm] = useState({
    description: "",
    amount: "",
    category: "",
    type: "",
    date: todayString(),
  });

  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("expenseTheme") === "dark";
  });

  // ==================================================
  // SAVE TRANSACTIONS
  // ==================================================

  const saveTransactions = (next) => {
    setTransactions(next);
    localStorage.setItem("transactions", JSON.stringify(next));
  };

  // ==================================================
  // LOGIN
  // ==================================================

  const handleLogin = (e) => {
    e.preventDefault();

    let storedUser = null;

    try {
      const saved = localStorage.getItem("expenseUser");

      if (saved) {
        storedUser = JSON.parse(saved);
      }
    } catch {
      storedUser = null;
    }

    if (!storedUser) {
      alert("No account found. Please create an account first.");
      return;
    }

    if (
      loginData.email.trim().toLowerCase() ===
        String(storedUser.email).trim().toLowerCase() &&
      loginData.password === storedUser.password
    ) {
      setUser(storedUser);

      localStorage.setItem("isLoggedIn", "true");

      setPage("dashboard");

      setLoginData({
        email: "",
        password: "",
      });
    } else {
      alert("Invalid email or password.");
    }
  };

  // ==================================================
  // CREATE ACCOUNT
  // ==================================================

  const handleSignup = (e) => {
    e.preventDefault();

    if (!signupData.name.trim()) {
      return alert("Please enter your name.");
    }

    if (!signupData.email.trim()) {
      return alert("Please enter your email.");
    }

    if (!signupData.number.trim()) {
      return alert("Please enter your phone number.");
    }

    if (!signupData.password.trim()) {
      return alert("Please create a password.");
    }

    const newUser = {
      ...signupData,
      name: signupData.name.trim(),
      email: signupData.email.trim(),
      number: signupData.number.trim(),
    };

    localStorage.setItem(
      "expenseUser",
      JSON.stringify(newUser)
    );

    localStorage.setItem("isLoggedIn", "true");

    setUser(newUser);

    setPage("dashboard");

    alert("Account created successfully!");
  };

  // ==================================================
  // LOGOUT
  // ==================================================

  const handleLogout = () => {
    localStorage.setItem("isLoggedIn", "false");

    setUser(null);

    setPage("login");

    setLoginData({
      email: "",
      password: "",
    });
  };

  // ==================================================
  // FORM UPDATE
  // ==================================================

  const updateForm = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // ==================================================
  // ADD / UPDATE TRANSACTION
  // ==================================================

  const handleTransactionSubmit = (e) => {
    e.preventDefault();

    if (!form.description.trim()) {
      return alert("Please enter a description.");
    }

    if (!form.amount || Number(form.amount) <= 0) {
      return alert("Please enter an amount greater than ₹0.");
    }

    if (!form.category) {
      return alert("Please select a category.");
    }

    if (!form.type) {
      return alert("Please select Income or Expense.");
    }

    if (!form.date) {
      return alert("Please select a date.");
    }

    if (editingId !== null) {
      const next = transactions.map((item) =>
        item.id === editingId
          ? {
              ...item,
              ...form,
              amount: Number(form.amount),
            }
          : item
      );

      saveTransactions(next);

      alert("Transaction updated successfully.");
    } else {
      const transaction = {
        id: Date.now(),
        description: form.description.trim(),
        amount: Number(form.amount),
        category: form.category,
        type: form.type,
        date: form.date,
      };

      saveTransactions([
        ...transactions,
        transaction,
      ]);

      alert("Transaction added successfully.");
    }

    setForm({
      description: "",
      amount: "",
      category: "",
      type: "",
      date: todayString(),
    });

    setEditingId(null);
  };

  // ==================================================
  // EDIT TRANSACTION
  // ==================================================

  const editTransaction = (transaction) => {
    setEditingId(transaction.id);

    setForm({
      description: transaction.description,
      amount: String(transaction.amount),
      category: transaction.category,
      type: transaction.type,
      date: transaction.date,
    });

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  };

  // ==================================================
  // DELETE TRANSACTION
  // ==================================================

  const deleteTransaction = (id) => {
    if (!window.confirm("Delete this transaction?")) {
      return;
    }

    saveTransactions(
      transactions.filter((item) => item.id !== id)
    );
  };

  // ==================================================
  // CANCEL EDIT
  // ==================================================

  const cancelEdit = () => {
    setEditingId(null);

    setForm({
      description: "",
      amount: "",
      category: "",
      type: "",
      date: todayString(),
    });
  };

  // ==================================================
  // TOTALS
  // ==================================================

  const totalIncome = useMemo(
    () =>
      transactions
        .filter((item) => item.type === "income")
        .reduce(
          (sum, item) => sum + Number(item.amount),
          0
        ),
    [transactions]
  );

  const totalExpenses = useMemo(
    () =>
      transactions
        .filter((item) => item.type === "expense")
        .reduce(
          (sum, item) => sum + Number(item.amount),
          0
        ),
    [transactions]
  );

  const balance = totalIncome - totalExpenses;

  // ==================================================
  // MONTHLY DATA
  // ==================================================

  const monthlyTransactions = useMemo(
    () =>
      transactions.filter(
        (item) =>
          item.date &&
          item.date.startsWith(selectedMonth)
      ),
    [transactions, selectedMonth]
  );

  const monthlyIncome = monthlyTransactions
    .filter((item) => item.type === "income")
    .reduce(
      (sum, item) => sum + Number(item.amount),
      0
    );

  const monthlyExpenses = monthlyTransactions
    .filter((item) => item.type === "expense")
    .reduce(
      (sum, item) => sum + Number(item.amount),
      0
    );

  const monthlySavings =
    monthlyIncome - monthlyExpenses;

  const expenseCount =
    monthlyTransactions.filter(
      (item) => item.type === "expense"
    ).length;

  const averageExpense =
    expenseCount > 0
      ? monthlyExpenses / expenseCount
      : 0;

  const savingsRate =
    monthlyIncome > 0
      ? (monthlySavings / monthlyIncome) * 100
      : 0;

  // ==================================================
  // CATEGORY TOTALS
  // ==================================================

  const categoryTotals = useMemo(() => {
    const totals = {};

    CATEGORIES.forEach(
      (category) => (totals[category] = 0)
    );

    monthlyTransactions
      .filter((item) => item.type === "expense")
      .forEach((item) => {
        totals[item.category] =
          (totals[item.category] || 0) +
          Number(item.amount);
      });

    return totals;
  }, [monthlyTransactions]);

  // ==================================================
  // HIGHEST CATEGORY
  // ==================================================

  const highestCategory = useMemo(() => {
    let best = "No expenses yet";
    let bestAmount = 0;

    Object.entries(categoryTotals).forEach(
      ([category, amount]) => {
        if (amount > bestAmount) {
          best = category;
          bestAmount = amount;
        }
      }
    );

    return best === "No expenses yet"
      ? best
      : `${best} - ${money(bestAmount)}`;
  }, [categoryTotals]);

  // ==================================================
  // BUDGET
  // ==================================================

  const budgetRemaining =
    monthlyBudget - monthlyExpenses;

  const budgetPercentage =
    monthlyBudget > 0
      ? (monthlyExpenses / monthlyBudget) * 100
      : 0;

  const displayBudgetPercentage = Math.min(
    budgetPercentage,
    100
  );

  // ==================================================
  // FILTERED TRANSACTIONS
  // ==================================================

  const filteredTransactions = useMemo(() => {
    const searchText =
      search.toLowerCase().trim();

    return [...transactions]
      .filter((item) => {
        const matchesSearch =
          !searchText ||
          String(item.description)
            .toLowerCase()
            .includes(searchText);

        const matchesType =
          filterType === "all" ||
          item.type === filterType;

        const matchesCategory =
          filterCategory === "all" ||
          item.category === filterCategory;

        return (
          matchesSearch &&
          matchesType &&
          matchesCategory
        );
      })
      .sort(
        (a, b) =>
          new Date(b.date) -
          new Date(a.date)
      );
  }, [
    transactions,
    search,
    filterType,
    filterCategory,
  ]);

  // ==================================================
  // CHART DATA
  // ==================================================

  const categoryChartData = Object.entries(
    categoryTotals
  )
    .filter(([, amount]) => amount > 0)
    .map(([name, amount]) => ({
      name,
      amount,
    }));

  const incomeExpenseData = [
    {
      name: "Income",
      amount: monthlyIncome,
    },
    {
      name: "Expenses",
      amount: monthlyExpenses,
    },
  ];

  const trendMap = {};

  monthlyTransactions
    .filter((item) => item.type === "expense")
    .forEach((item) => {
      trendMap[item.date] =
        (trendMap[item.date] || 0) +
        Number(item.amount);
    });

  const trendData = Object.entries(trendMap)
    .sort(
      ([a], [b]) =>
        new Date(a) - new Date(b)
    )
    .map(([date, amount]) => ({
      date: date.slice(5),
      amount,
    }));

  // ==================================================
  // THEME
  // ==================================================

  const toggleTheme = () => {
    const next = !darkMode;

    setDarkMode(next);

    localStorage.setItem(
      "expenseTheme",
      next ? "dark" : "light"
    );
  };

  // ==================================================
  // DOWNLOAD BILL
  // ==================================================

  const downloadBill = (transaction) => {
    const typeText =
      transaction.type === "income"
        ? "Income"
        : "Expense";

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Transaction Bill</title>

<style>
body {
  font-family: Arial, sans-serif;
  background: #f4f7fb;
  padding: 40px;
  color: #111827;
}

.bill {
  max-width: 650px;
  margin: auto;
  background: white;
  padding: 35px;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
}

h1 {
  text-align: center;
  margin-bottom: 5px;
}

.sub {
  text-align: center;
  color: #6b7280;
  margin-bottom: 30px;
}

.row {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 16px 0;
  border-bottom: 1px solid #e5e7eb;
}

.footer {
  text-align: center;
  color: #6b7280;
  margin-top: 30px;
  font-size: 13px;
}
</style>

</head>

<body>

<div class="bill">

<h1>Personal Expense Tracker</h1>

<div class="sub">
Transaction Bill
</div>

<div class="row">
<strong>Description</strong>
<span>${escapeHtml(
  transaction.description
)}</span>
</div>

<div class="row">
<strong>Amount</strong>
<span>${money(
  transaction.amount
)}</span>
</div>

<div class="row">
<strong>Category</strong>
<span>${escapeHtml(
  transaction.category
)}</span>
</div>

<div class="row">
<strong>Type</strong>
<span>${typeText}</span>
</div>

<div class="row">
<strong>Date</strong>
<span>${transaction.date}</span>
</div>

<div class="footer">
Generated by Personal Expense Tracker
</div>

</div>

</body>
</html>`;

    const blob = new Blob(
      [html],
      { type: "text/html" }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      `transaction-bill-${transaction.id}.html`;

    link.click();

    URL.revokeObjectURL(url);
  };

  // ==================================================
  // ESCAPE HTML
  // ==================================================

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // ==================================================
  // LOGIN PAGE
  // ==================================================

  if (page === "login") {
    return (
      <div className="auth-page">

        <div className="auth-card">

          <div className="auth-icon">
            🔐
          </div>

          <h1>
            Personal Expense Tracker
          </h1>

          <p className="auth-subtitle">
            Sign in to manage your expenses
          </p>

          <form onSubmit={handleLogin}>

            {/* EMAIL */}

            <div className="form-field">

              <label>
                Email
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                value={loginData.email}
                onChange={(e) =>
                  setLoginData({
                    ...loginData,
                    email: e.target.value,
                  })
                }
                required
              />

            </div>

            {/* PASSWORD */}

            <div className="form-field">

              <label>
                Password
              </label>

              <input
                type="password"
                placeholder="Enter your password"
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({
                    ...loginData,
                    password: e.target.value,
                  })
                }
                required
              />

            </div>

            {/* =====================================
                SIGN IN + CREATE ACCOUNT BOXES
            ====================================== */}

            <div className="auth-options">

              <button
                type="submit"
                className="auth-option-btn signin-option"
              >
                🔐 Sign In
              </button>

              <button
                type="button"
                className="auth-option-btn signup-option"
                onClick={() => {
                  setPage("signup");
                }}
              >
                👤 Create Account
              </button>

            </div>

          </form>

        </div>

      </div>
    );
  }

  // ==================================================
  // SIGNUP PAGE
  // ==================================================

  if (page === "signup") {
    const setSignup = (key, value) =>
      setSignupData((prev) => ({
        ...prev,
        [key]: value,
      }));

    return (
      <div className="auth-page">

        <div className="signup-card">

          <div className="auth-icon">
            👤
          </div>

          <h1>
            Create Your Account
          </h1>

          <p className="auth-subtitle">
            Enter your details to get started
          </p>

          <form onSubmit={handleSignup}>

            <div className="form-grid">

              {/* NAME */}

              <div className="form-field">

                <label>
                  Name *
                </label>

                <input
                  type="text"
                  placeholder="Enter your name"
                  value={signupData.name}
                  onChange={(e) =>
                    setSignup(
                      "name",
                      e.target.value
                    )
                  }
                  required
                />

              </div>

              {/* GENDER */}

              <div className="form-field">

                <label>
                  Gender
                </label>

                <select
                  value={signupData.gender}
                  onChange={(e) =>
                    setSignup(
                      "gender",
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Select gender
                  </option>

                  <option>
                    Male
                  </option>

                  <option>
                    Female
                  </option>

                  <option>
                    Other
                  </option>
                </select>

              </div>

              {/* AGE */}

              <div className="form-field">

                <label>
                  Age
                </label>

                <input
                  type="number"
                  min="1"
                  max="120"
                  placeholder="Enter your age"
                  value={signupData.age}
                  onChange={(e) =>
                    setSignup(
                      "age",
                      e.target.value
                    )
                  }
                />

              </div>

              {/* OCCUPATION */}

              <div className="form-field">

                <label>
                  Occupation
                </label>

                <select
                  value={signupData.occupation}
                  onChange={(e) =>
                    setSignup(
                      "occupation",
                      e.target.value
                    )
                  }
                >

                  <option value="">
                    Select occupation
                  </option>

                  <option>
                    Student
                  </option>

                  <option>
                    Employee
                  </option>

                  <option>
                    Business
                  </option>

                  <option>
                    Freelancer
                  </option>

                  <option>
                    Teacher
                  </option>

                  <option>
                    Doctor
                  </option>

                  <option>
                    Engineer
                  </option>

                  <option>
                    Other
                  </option>

                </select>

              </div>

              {/* EMAIL */}

              <div className="form-field">

                <label>
                  Email *
                </label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={signupData.email}
                  onChange={(e) =>
                    setSignup(
                      "email",
                      e.target.value
                    )
                  }
                  required
                />

              </div>

              {/* PHONE */}

              <div className="form-field">

                <label>
                  Phone Number *
                </label>

                <input
                  type="tel"
                  placeholder="Enter 10-digit phone number"
                  value={signupData.number}
                  onChange={(e) =>
                    setSignup(
                      "number",
                      e.target.value
                    )
                  }
                  required
                />

              </div>

              {/* PASSWORD */}

              <div className="form-field full-width">

                <label>
                  Password *
                </label>

                <input
                  type="password"
                  placeholder="Create a password"
                  value={signupData.password}
                  onChange={(e) =>
                    setSignup(
                      "password",
                      e.target.value
                    )
                  }
                  required
                />

              </div>

            </div>

            {/* CREATE ACCOUNT */}

            <button
              type="submit"
              className="primary-btn"
            >
              👤 Create Account →
            </button>

          </form>

          {/* SIGN IN */}

          <div className="signup-signin-area">

            <div className="signup-signin-text">
              Already have an account?
            </div>

            <button
              type="button"
              className="signup-login-button"
              onClick={() => {
                setPage("login");
              }}
            >
              🔐 Sign In
            </button>

          </div>

        </div>

      </div>
    );
  }

  // ==================================================
  // PROFILE PAGE
  // ==================================================

  if (page === "profile") {
    return (
      <div
        className={`dashboard ${
          darkMode ? "dark-mode" : ""
        }`}
      >

        <header className="top-header">

          <div className="brand-area">

            <h1>
              💰 Personal Expense Tracker
            </h1>

            <p>
              Manage your expenses easily
            </p>

          </div>

          <button
            className="profile-btn"
            onClick={() =>
              setPage("dashboard")
            }
          >
            👤 {user?.name}
          </button>

        </header>

        <main className="profile-container">

          <div className="profile-card">

            <div className="profile-large-icon">
              👤
            </div>

            <h2>
              {user?.name}
            </h2>

            <p className="profile-title">
              Your Profile
            </p>

            <div className="profile-details">

              <div>
                <strong>
                  👤 Name
                </strong>

                <span>
                  {user?.name ||
                    "Not provided"}
                </span>
              </div>

              <div>
                <strong>
                  ⚧ Gender
                </strong>

                <span>
                  {user?.gender ||
                    "Not provided"}
                </span>
              </div>

              <div>
                <strong>
                  🎂 Age
                </strong>

                <span>
                  {user?.age ||
                    "Not provided"}
                </span>
              </div>

              <div>
                <strong>
                  💼 Occupation
                </strong>

                <span>
                  {user?.occupation ||
                    "Not provided"}
                </span>
              </div>

              <div>
                <strong>
                  📧 Email
                </strong>

                <span>
                  {user?.email ||
                    "Not provided"}
                </span>
              </div>

              <div>
                <strong>
                  📱 Phone
                </strong>

                <span>
                  {user?.number ||
                    "Not provided"}
                </span>
              </div>

            </div>

            <button
              className="logout-btn"
              onClick={handleLogout}
            >
              🚪 Logout
            </button>

            <button
              className="back-dashboard-btn"
              onClick={() =>
                setPage("dashboard")
              }
            >
              ← Back to Dashboard
            </button>

          </div>

        </main>

      </div>
    );
  }

  // ==================================================
  // DASHBOARD
  // ==================================================

  return (
    <div
      className={`dashboard ${
        darkMode ? "dark-mode" : ""
      }`}
    >

      <header className="top-header">

        <div className="brand-area">

          <h1>
            💰 Personal Expense Tracker
          </h1>

          <p>
            Manage your money smarter
          </p>

        </div>

        <div className="header-actions">

          <button
            className="theme-toggle"
            onClick={toggleTheme}
          >
            {darkMode
              ? "☀️ Light Mode"
              : "🌙 Dark Mode"}
          </button>

          <button
            className="profile-btn"
            onClick={() =>
              setPage("profile")
            }
          >
            👤 {user?.name || "Profile"}
          </button>

        </div>

      </header>

      <main
        className="expense-area"
        id="reportArea"
      >

        {/* WELCOME */}

        <div className="welcome-card">

          <h2>
            Welcome, {user?.name}! 👋
          </h2>

          <p>
            Your account is ready.
            You can now manage your
            personal expenses.
          </p>

        </div>

        {/* SUMMARY */}

        <section className="summary-grid">

          <div className="summary-card">
            <h3>
              Total Balance
            </h3>

            <p>
              {money(balance)}
            </p>
          </div>

          <div className="summary-card">
            <h3>
              Total Income
            </h3>

            <p>
              {money(totalIncome)}
            </p>
          </div>

          <div className="summary-card">
            <h3>
              Total Expenses
            </h3>

            <p>
              {money(totalExpenses)}
            </p>
          </div>

        </section>

        {/* MONTHLY OVERVIEW */}

        <section className="card">

          <div className="section-header">

            <h2>
              📅 Monthly Overview
            </h2>

            <input
              type="month"
              value={selectedMonth}
              onChange={(e) =>
                setSelectedMonth(
                  e.target.value
                )
              }
            />

          </div>

          <div className="monthly-grid">

            <div>
              <span>
                Monthly Income
              </span>

              <strong>
                {money(monthlyIncome)}
              </strong>
            </div>

            <div>
              <span>
                Monthly Expenses
              </span>

              <strong>
                {money(monthlyExpenses)}
              </strong>
            </div>

            <div>
              <span>
                Monthly Savings
              </span>

              <strong>
                {money(monthlySavings)}
              </strong>
            </div>

            <div>
              <span>
                Average Expense
              </span>

              <strong>
                {money(
                  Math.round(
                    averageExpense
                  )
                )}
              </strong>
            </div>

            <div>
              <span>
                Savings Rate
              </span>

              <strong>
                {Math.round(
                  savingsRate
                )}
                %
              </strong>
            </div>

            <div>
              <span>
                Highest Category
              </span>

              <strong>
                {highestCategory}
              </strong>
            </div>

          </div>

        </section>

        {/* BUDGET */}

        <section className="card">

          <h2>
            💰 Monthly Budget
          </h2>

          <div className="budget-grid">

            <div>
              <span>
                Budget
              </span>

              <strong>
                {money(monthlyBudget)}
              </strong>
            </div>

            <div>
              <span>
                Spent
              </span>

              <strong>
                {money(monthlyExpenses)}
              </strong>
            </div>

            <div>
              <span>
                Remaining
              </span>

              <strong>
                {money(budgetRemaining)}
              </strong>
            </div>

          </div>

          <div className="budget-progress">

            <div
              className="budget-progress-bar"
              style={{
                width: `${displayBudgetPercentage}%`,
              }}
            />

          </div>

          <p className="budget-percentage">
            {Math.round(
              budgetPercentage
            )}
            % used
          </p>

          <p
            className={`budget-message ${
              budgetRemaining < 0
                ? "danger"
                : budgetPercentage >= 80
                ? "warning"
                : "success"
            }`}
          >
            {budgetRemaining < 0
              ? "You have exceeded your budget"
              : budgetPercentage >= 80
              ? "You're close to your budget limit"
              : "You're within your budget"}
          </p>

          <form
            className="budget-form"
            onSubmit={(e) => {
              e.preventDefault();

              const input =
                e.currentTarget.elements.budget.value;

              const value = Number(input);

              if (!value || value <= 0) {
                alert(
                  "Please enter a budget greater than ₹0."
                );

                return;
              }

              setMonthlyBudget(value);

              localStorage.setItem(
                "monthlyBudget",
                String(value)
              );

              e.currentTarget.reset();
            }}
          >

            <input
              name="budget"
              type="number"
              min="1"
              step="1"
              placeholder="Enter monthly budget"
            />

            <button type="submit">
              Set Budget
            </button>

          </form>

        </section>

        {/* ANALYTICS */}

        <section className="card">

          <h2>
            📊 Expense Analytics
          </h2>

          <div className="charts-grid">

            {/* PIE CHART */}

            <div className="chart-card">

              <h3>
                Expenses by Category
              </h3>

              <div className="chart-container">

                {categoryChartData.length ? (

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <PieChart>

                      <Pie
                        data={categoryChartData}
                        dataKey="amount"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius="70%"
                        label
                      >

                        {categoryChartData.map(
                          (entry, index) => (
                            <Cell
                              key={entry.name}
                              fill={`hsl(${
                                index * 42
                              }, 70%, 55%)`}
                            />
                          )
                        )}

                      </Pie>

                      <Tooltip
                        formatter={(value) =>
                          money(value)
                        }
                      />

                      <Legend />

                    </PieChart>

                  </ResponsiveContainer>

                ) : (

                  <div className="empty-chart">
                    Add expenses to see the chart.
                  </div>

                )}

              </div>

            </div>

            {/* BAR CHART */}

            <div className="chart-card">

              <h3>
                Income vs Expenses
              </h3>

              <div className="chart-container">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <BarChart
                    data={incomeExpenseData}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis dataKey="name" />

                    <YAxis />

                    <Tooltip
                      formatter={(value) =>
                        money(value)
                      }
                    />

                    <Bar
                      dataKey="amount"
                      fill="#2563eb"
                      radius={[
                        8,
                        8,
                        0,
                        0,
                      ]}
                    />

                  </BarChart>

                </ResponsiveContainer>

              </div>

            </div>

            {/* LINE CHART */}

            <div className="chart-card full-width">

              <h3>
                Daily Expense Trend
              </h3>

              <div className="chart-container">

                {trendData.length ? (

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <LineChart
                      data={trendData}
                    >

                      <CartesianGrid
                        strokeDasharray="3 3"
                      />

                      <XAxis dataKey="date" />

                      <YAxis />

                      <Tooltip
                        formatter={(value) =>
                          money(value)
                        }
                      />

                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#2563eb"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                      />

                    </LineChart>

                  </ResponsiveContainer>

                ) : (

                  <div className="empty-chart">
                    Add expenses to see your daily trend.
                  </div>

                )}

              </div>

            </div>

          </div>

        </section>

        {/* ADD TRANSACTION */}

        <section className="card">

          <h2>
            {editingId !== null
              ? "✏️ Edit Transaction"
              : "➕ Add Transaction"}
          </h2>

          <form
            onSubmit={handleTransactionSubmit}
          >

            <div className="form-grid">

              <div className="form-field">

                <label>
                  Description
                </label>

                <input
                  type="text"
                  placeholder="Example: Grocery shopping"
                  value={form.description}
                  onChange={(e) =>
                    updateForm(
                      "description",
                      e.target.value
                    )
                  }
                />

              </div>

              <div className="form-field">

                <label>
                  Amount
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter amount"
                  value={form.amount}
                  onChange={(e) =>
                    updateForm(
                      "amount",
                      e.target.value
                    )
                  }
                />

              </div>

              <div className="form-field">

                <label>
                  Category
                </label>

                <select
                  value={form.category}
                  onChange={(e) =>
                    updateForm(
                      "category",
                      e.target.value
                    )
                  }
                >

                  <option value="">
                    Select Category
                  </option>

                  {CATEGORIES.map(
                    (category) => (
                      <option
                        key={category}
                      >
                        {category}
                      </option>
                    )
                  )}

                </select>

              </div>

              <div className="form-field">

                <label>
                  Type
                </label>

                <select
                  value={form.type}
                  onChange={(e) =>
                    updateForm(
                      "type",
                      e.target.value
                    )
                  }
                >

                  <option value="">
                    Select Type
                  </option>

                  <option value="income">
                    Income
                  </option>

                  <option value="expense">
                    Expense
                  </option>

                </select>

              </div>

              <div className="form-field">

                <label>
                  Date
                </label>

                <input
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    updateForm(
                      "date",
                      e.target.value
                    )
                  }
                />

              </div>

            </div>

            <div className="transaction-form-actions">

              <button
                className="primary-button"
                type="submit"
              >
                {editingId !== null
                  ? "Update Transaction"
                  : "Add Transaction"}
              </button>

              {editingId !== null && (
                <button
                  className="cancel-button"
                  type="button"
                  onClick={cancelEdit}
                >
                  Cancel Edit
                </button>
              )}

            </div>

          </form>

        </section>

        {/* TRANSACTION HISTORY */}

        <section className="card">

          <div className="section-header">

            <h2>
              📜 Transaction History
            </h2>

          </div>

          {/* FILTERS */}

          <div className="filters">

            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            <select
              value={filterType}
              onChange={(e) =>
                setFilterType(e.target.value)
              }
            >

              <option value="all">
                All Types
              </option>

              <option value="income">
                Income
              </option>

              <option value="expense">
                Expense
              </option>

            </select>

            <select
              value={filterCategory}
              onChange={(e) =>
                setFilterCategory(
                  e.target.value
                )
              }
            >

              <option value="all">
                All Categories
              </option>

              {CATEGORIES.map(
                (category) => (
                  <option
                    key={category}
                  >
                    {category}
                  </option>
                )
              )}

            </select>

          </div>

          {/* DOWNLOAD */}

          <div className="download-container">

            <select
              className="download-select"
              defaultValue=""
              onChange={(e) => {

                const transaction =
                  transactions.find(
                    (item) =>
                      String(item.id) ===
                      e.target.value
                  );

                if (transaction) {
                  downloadBill(transaction);
                }

                e.target.value = "";

              }}
            >

              <option value="">
                Select transaction to download
              </option>

              {transactions.map(
                (item) => (

                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.date} —{" "}
                    {item.description} —{" "}
                    {money(item.amount)}
                  </option>

                )
              )}

            </select>

            <span className="download-hint">
              Select a transaction above to
              download its bill
            </span>

          </div>

          {/* TRANSACTION LIST */}

          <div className="transaction-list">

            {filteredTransactions.length === 0 ? (

              <p className="empty-message">
                No transactions found.
              </p>

            ) : (

              filteredTransactions.map(
                (transaction) => (

                  <div
                    className="transaction-item"
                    key={transaction.id}
                  >

                    <div className="transaction-main">

                      <h3>
                        {transaction.description}
                      </h3>

                      <p>
                        {transaction.category}
                        {" • "}
                        {transaction.date}
                      </p>

                    </div>

                    <div className="transaction-right">

                      <strong
                        className={
                          transaction.type ===
                          "income"
                            ? "income-text"
                            : "expense-text"
                        }
                      >
                        {transaction.type ===
                        "income"
                          ? "+"
                          : "-"}

                        {money(
                          transaction.amount
                        )}
                      </strong>

                      <div className="transaction-buttons">

                        <button
                          className="edit-btn"
                          onClick={() =>
                            editTransaction(
                              transaction
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() =>
                            deleteTransaction(
                              transaction.id
                            )
                          }
                        >
                          Delete
                        </button>

                        <button
                          className="download-bill-btn"
                          onClick={() =>
                            downloadBill(
                              transaction
                            )
                          }
                        >
                          Download Bill
                        </button>

                      </div>

                    </div>

                  </div>

                )
              )

            )}

          </div>

        </section>

      </main>

    </div>
  );
}

export default App;