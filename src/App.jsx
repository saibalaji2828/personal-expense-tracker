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

const todayString = () =>
  new Date().toISOString().slice(0, 10);

const currentMonth = () =>
  new Date().toISOString().slice(0, 7);

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

function App() {
  /* =========================
     USER
  ========================= */

  const [user, setUser] = useState(() => {
    try {
      const savedUser =
        localStorage.getItem("expenseUser");

      const loggedIn =
        localStorage.getItem("isLoggedIn") === "true";

      return loggedIn && savedUser
        ? JSON.parse(savedUser)
        : null;
    } catch {
      return null;
    }
  });

  const [page, setPage] = useState(() =>
    localStorage.getItem("isLoggedIn") === "true"
      ? "dashboard"
      : "login"
  );

  /* =========================
     LOGIN
  ========================= */

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  /* =========================
     SIGNUP
  ========================= */

  const [signupData, setSignupData] = useState({
    name: "",
    gender: "",
    age: "",
    occupation: "",
    email: "",
    number: "",
    password: "",
  });

  /* =========================
     TRANSACTIONS
  ========================= */

  const [transactions, setTransactions] = useState(() => {
    try {
      const saved =
        localStorage.getItem("transactions");

      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  /* =========================
     BUDGET
     STARTS AT ₹0
  ========================= */

  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    try {
      const saved =
        localStorage.getItem("monthlyBudget");

      if (
        saved === null ||
        saved === "" ||
        Number(saved) <= 0
      ) {
        return 0;
      }

      return Number(saved);
    } catch {
      return 0;
    }
  });

  const [selectedMonth, setSelectedMonth] =
    useState(currentMonth());

  /* =========================
     TRANSACTION FORM
  ========================= */

  const [form, setForm] = useState({
    description: "",
    amount: "",
    category: "",
    type: "",
    date: todayString(),
  });

  const [editingId, setEditingId] =
    useState(null);

  /* =========================
     FILTERS
  ========================= */

  const [search, setSearch] =
    useState("");

  const [filterType, setFilterType] =
    useState("all");

  const [filterCategory, setFilterCategory] =
    useState("all");

  /* =========================
     THEME
  ========================= */

  const [darkMode, setDarkMode] = useState(() => {
    return (
      localStorage.getItem("expenseTheme") ===
      "dark"
    );
  });

  /* =========================
     SAVE TRANSACTIONS
  ========================= */

  const saveTransactions = (next) => {
    setTransactions(next);

    localStorage.setItem(
      "transactions",
      JSON.stringify(next)
    );
  };

  /* =========================
     LOGIN
  ========================= */

  const handleLogin = (e) => {
    e.preventDefault();

    let storedUser = null;

    try {
      const saved =
        localStorage.getItem("expenseUser");

      if (saved) {
        storedUser = JSON.parse(saved);
      }
    } catch {
      storedUser = null;
    }

    if (!storedUser) {
      alert(
        "No account found. Please create an account first."
      );
      return;
    }

    const enteredEmail =
      loginData.email
        .trim()
        .toLowerCase();

    const storedEmail =
      String(storedUser.email)
        .trim()
        .toLowerCase();

    if (
      enteredEmail === storedEmail &&
      loginData.password ===
        storedUser.password
    ) {
      setUser(storedUser);

      localStorage.setItem(
        "isLoggedIn",
        "true"
      );

      setPage("dashboard");

      setLoginData({
        email: "",
        password: "",
      });
    } else {
      alert(
        "Invalid email or password."
      );
    }
  };

  /* =========================
     SIGNUP
  ========================= */

  const handleSignup = (e) => {
    e.preventDefault();

    if (!signupData.name.trim()) {
      alert("Please enter your name.");
      return;
    }

    if (!signupData.email.trim()) {
      alert("Please enter your email.");
      return;
    }

    if (!signupData.number.trim()) {
      alert(
        "Please enter your phone number."
      );
      return;
    }

    if (!signupData.password.trim()) {
      alert(
        "Please create a password."
      );
      return;
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

    localStorage.setItem(
      "isLoggedIn",
      "true"
    );

    setUser(newUser);
    setPage("dashboard");

    alert(
      "Account created successfully!"
    );
  };

  /* =========================
     LOGOUT
  ========================= */

  const handleLogout = () => {
    localStorage.setItem(
      "isLoggedIn",
      "false"
    );

    setUser(null);
    setPage("login");

    setLoginData({
      email: "",
      password: "",
    });
  };

  /* =========================
     FORM
  ========================= */

  const updateForm = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  /* =========================
     ADD / UPDATE TRANSACTION
  ========================= */

  const handleTransactionSubmit = (e) => {
    e.preventDefault();

    if (!form.description.trim()) {
      alert(
        "Please enter a description."
      );
      return;
    }

    if (
      !form.amount ||
      Number(form.amount) <= 0
    ) {
      alert(
        "Please enter an amount greater than ₹0."
      );
      return;
    }

    if (!form.category) {
      alert(
        "Please select a category."
      );
      return;
    }

    if (!form.type) {
      alert(
        "Please select Income or Expense."
      );
      return;
    }

    if (!form.date) {
      alert("Please select a date.");
      return;
    }

    if (editingId !== null) {
      const updated =
        transactions.map((transaction) =>
          transaction.id === editingId
            ? {
                ...transaction,
                ...form,
                amount: Number(
                  form.amount
                ),
              }
            : transaction
        );

      saveTransactions(updated);

      alert(
        "Transaction updated successfully."
      );
    } else {
      const newTransaction = {
        id: Date.now(),
        description:
          form.description.trim(),
        amount: Number(form.amount),
        category: form.category,
        type: form.type,
        date: form.date,
      };

      saveTransactions([
        ...transactions,
        newTransaction,
      ]);

      alert(
        "Transaction added successfully."
      );
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

  /* =========================
     EDIT
  ========================= */

  const editTransaction = (transaction) => {
    setEditingId(transaction.id);

    setForm({
      description:
        transaction.description,
      amount: String(
        transaction.amount
      ),
      category:
        transaction.category,
      type: transaction.type,
      date: transaction.date,
    });

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  };

  /* =========================
     DELETE
  ========================= */

  const deleteTransaction = (id) => {
    if (
      !window.confirm(
        "Delete this transaction?"
      )
    ) {
      return;
    }

    saveTransactions(
      transactions.filter(
        (transaction) =>
          transaction.id !== id
      )
    );
  };

  /* =========================
     CANCEL EDIT
  ========================= */

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

  /* =========================
     TOTALS
  ========================= */

  const totalIncome = useMemo(
    () =>
      transactions
        .filter(
          (item) =>
            item.type === "income"
        )
        .reduce(
          (sum, item) =>
            sum + Number(item.amount),
          0
        ),
    [transactions]
  );

  const totalExpenses = useMemo(
    () =>
      transactions
        .filter(
          (item) =>
            item.type === "expense"
        )
        .reduce(
          (sum, item) =>
            sum + Number(item.amount),
          0
        ),
    [transactions]
  );

  const balance =
    totalIncome - totalExpenses;

  /* =========================
     MONTHLY DATA
  ========================= */

  const monthlyTransactions =
    useMemo(
      () =>
        transactions.filter(
          (item) =>
            item.date &&
            item.date.startsWith(
              selectedMonth
            )
        ),
      [
        transactions,
        selectedMonth,
      ]
    );

  const monthlyIncome =
    monthlyTransactions
      .filter(
        (item) =>
          item.type === "income"
      )
      .reduce(
        (sum, item) =>
          sum + Number(item.amount),
        0
      );

  const monthlyExpenses =
    monthlyTransactions
      .filter(
        (item) =>
          item.type === "expense"
      )
      .reduce(
        (sum, item) =>
          sum + Number(item.amount),
        0
      );

  const monthlySavings =
    monthlyIncome - monthlyExpenses;

  const expenseCount =
    monthlyTransactions.filter(
      (item) =>
        item.type === "expense"
    ).length;

  const averageExpense =
    expenseCount > 0
      ? monthlyExpenses /
        expenseCount
      : 0;

  const savingsRate =
    monthlyIncome > 0
      ? (monthlySavings /
          monthlyIncome) *
        100
      : 0;

  /* =========================
     CATEGORY DATA
  ========================= */

  const categoryTotals =
    useMemo(() => {
      const totals = {};

      CATEGORIES.forEach(
        (category) => {
          totals[category] = 0;
        }
      );

      monthlyTransactions
        .filter(
          (item) =>
            item.type ===
            "expense"
        )
        .forEach((item) => {
          totals[item.category] =
            (totals[item.category] ||
              0) +
            Number(item.amount);
        });

      return totals;
    }, [monthlyTransactions]);

  const highestCategory =
    useMemo(() => {
      let best =
        "No expenses yet";

      let bestAmount = 0;

      Object.entries(
        categoryTotals
      ).forEach(
        ([category, amount]) => {
          if (
            amount > bestAmount
          ) {
            best = category;
            bestAmount = amount;
          }
        }
      );

      return best ===
        "No expenses yet"
        ? best
        : `${best} - ${money(
            bestAmount
          )}`;
    }, [categoryTotals]);

  /* =========================
     BUDGET
  ========================= */

  const budgetRemaining =
    monthlyBudget -
    monthlyExpenses;

  const budgetPercentage =
    monthlyBudget > 0
      ? (monthlyExpenses /
          monthlyBudget) *
        100
      : 0;

  const displayBudgetPercentage =
    Math.min(
      Math.max(
        budgetPercentage,
        0
      ),
      100
    );

  /* =========================
     FILTER
  ========================= */

  const filteredTransactions =
    useMemo(() => {
      const text =
        search
          .toLowerCase()
          .trim();

      return [...transactions]
        .filter((item) => {
          const matchesSearch =
            !text ||
            String(
              item.description
            )
              .toLowerCase()
              .includes(text);

          const matchesType =
            filterType === "all" ||
            item.type ===
              filterType;

          const matchesCategory =
            filterCategory ===
              "all" ||
            item.category ===
              filterCategory;

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

  /* =========================
     CHART DATA
  ========================= */

  const categoryChartData =
    Object.entries(
      categoryTotals
    )
      .filter(
        ([, amount]) =>
          amount > 0
      )
      .map(
        ([name, amount]) => ({
          name,
          amount,
        })
      );

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
    .filter(
      (item) =>
        item.type === "expense"
    )
    .forEach((item) => {
      trendMap[item.date] =
        (trendMap[item.date] ||
          0) +
        Number(item.amount);
    });

  const trendData =
    Object.entries(trendMap)
      .sort(
        ([a], [b]) =>
          new Date(a) -
          new Date(b)
      )
      .map(
        ([date, amount]) => ({
          date: date.slice(5),
          amount,
        })
      );

  /* =========================
     THEME
  ========================= */

  const toggleTheme = () => {
    const next =
      !darkMode;

    setDarkMode(next);

    localStorage.setItem(
      "expenseTheme",
      next ? "dark" : "light"
    );
  };

  /* =========================
     DOWNLOAD BILL
  ========================= */

  const downloadBill = (
    transaction
  ) => {
    const typeText =
      transaction.type ===
      "income"
        ? "Income"
        : "Expense";

    const html = `
<!DOCTYPE html>
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
}
</style>

</head>

<body>

<div class="bill">

<h1>
Personal Expense Tracker
</h1>

<div class="sub">
Transaction Bill
</div>

<div class="row">
<strong>Description</strong>
<span>
${escapeHtml(
  transaction.description
)}
</span>
</div>

<div class="row">
<strong>Amount</strong>
<span>
${money(
  transaction.amount
)}
</span>
</div>

<div class="row">
<strong>Category</strong>
<span>
${escapeHtml(
  transaction.category
)}
</span>
</div>

<div class="row">
<strong>Type</strong>
<span>
${typeText}
</span>
</div>

<div class="row">
<strong>Date</strong>
<span>
${transaction.date}
</span>
</div>

<div class="footer">
Generated by Personal Expense Tracker
</div>

</div>

</body>
</html>
`;

    const blob =
      new Blob(
        [html],
        {
          type: "text/html",
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    link.download =
      `transaction-bill-${transaction.id}.html`;

    link.click();

    URL.revokeObjectURL(
      url
    );
  };

  /* =====================================================
     LOGIN PAGE
  ===================================================== */

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

            <div className="form-field">

              <label>
                Email
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                value={
                  loginData.email
                }
                onChange={(e) =>
                  setLoginData({
                    ...loginData,
                    email:
                      e.target.value,
                  })
                }
                required
              />

            </div>

            <div className="form-field">

              <label>
                Password
              </label>

              <input
                type="password"
                placeholder="Enter your password"
                value={
                  loginData.password
                }
                onChange={(e) =>
                  setLoginData({
                    ...loginData,
                    password:
                      e.target.value,
                  })
                }
                required
              />

            </div>

            <div
              className="auth-options"
              style={{
                display:
                  "flex",
                flexDirection:
                  "row",
                gap: "15px",
                width:
                  "100%",
                marginTop:
                  "25px",
              }}
            >

              <button
                type="submit"
                style={{
                  flex: "1",
                  padding:
                    "14px 10px",
                  borderRadius:
                    "10px",
                  fontSize:
                    "16px",
                  fontWeight:
                    "700",
                  cursor:
                    "pointer",
                  background:
                    "#2563eb",
                  color:
                    "#ffffff",
                  border:
                    "2px solid #2563eb",
                }}
              >
                🔐 Sign In
              </button>

              <button
                type="button"
                style={{
                  flex: "1",
                  padding:
                    "14px 10px",
                  borderRadius:
                    "10px",
                  fontSize:
                    "16px",
                  fontWeight:
                    "700",
                  cursor:
                    "pointer",
                  background:
                    "#eef4ff",
                  color:
                    "#2563eb",
                  border:
                    "2px solid #2563eb",
                }}
                onClick={() =>
                  setPage(
                    "signup"
                  )
                }
              >
                👤 Create Account
              </button>

            </div>

          </form>

        </div>

      </div>
    );
  }

  /* =====================================================
     SIGNUP PAGE
  ===================================================== */

  if (page === "signup") {
    const setSignup = (
      key,
      value
    ) => {
      setSignupData(
        (previous) => ({
          ...previous,
          [key]: value,
        })
      );
    };

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

              <div className="form-field">
                <label>
                  Name *
                </label>

                <input
                  type="text"
                  placeholder="Enter your name"
                  value={
                    signupData.name
                  }
                  onChange={(e) =>
                    setSignup(
                      "name",
                      e.target.value
                    )
                  }
                  required
                />
              </div>

              <div className="form-field">
                <label>
                  Gender
                </label>

                <select
                  value={
                    signupData.gender
                  }
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
                  <option value="Male">
                    Male
                  </option>
                  <option value="Female">
                    Female
                  </option>
                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>

              <div className="form-field">
                <label>
                  Age
                </label>

                <input
                  type="number"
                  min="1"
                  max="120"
                  placeholder="Enter your age"
                  value={
                    signupData.age
                  }
                  onChange={(e) =>
                    setSignup(
                      "age",
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="form-field">
                <label>
                  Occupation
                </label>

                <select
                  value={
                    signupData.occupation
                  }
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
                  <option value="Student">
                    Student
                  </option>
                  <option value="Employee">
                    Employee
                  </option>
                  <option value="Business">
                    Business
                  </option>
                  <option value="Freelancer">
                    Freelancer
                  </option>
                  <option value="Teacher">
                    Teacher
                  </option>
                  <option value="Doctor">
                    Doctor
                  </option>
                  <option value="Engineer">
                    Engineer
                  </option>
                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>

              <div className="form-field">
                <label>
                  Email *
                </label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={
                    signupData.email
                  }
                  onChange={(e) =>
                    setSignup(
                      "email",
                      e.target.value
                    )
                  }
                  required
                />
              </div>

              <div className="form-field">
                <label>
                  Phone Number *
                </label>

                <input
                  type="tel"
                  placeholder="Enter 10-digit phone number"
                  value={
                    signupData.number
                  }
                  onChange={(e) =>
                    setSignup(
                      "number",
                      e.target.value
                    )
                  }
                  required
                />
              </div>

              <div className="form-field full-width">
                <label>
                  Password *
                </label>

                <input
                  type="password"
                  placeholder="Create a password"
                  value={
                    signupData.password
                  }
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

            <div
              style={{
                display:
                  "flex",
                gap:
                  "15px",
                width:
                  "100%",
                marginTop:
                  "25px",
              }}
            >

              <button
                type="submit"
                style={{
                  flex:
                    "1",
                  padding:
                    "14px 10px",
                  borderRadius:
                    "10px",
                  fontSize:
                    "16px",
                  fontWeight:
                    "700",
                  cursor:
                    "pointer",
                  background:
                    "#2563eb",
                  color:
                    "#ffffff",
                  border:
                    "2px solid #2563eb",
                }}
              >
                👤 Create Account
              </button>

              <button
                type="button"
                onClick={() =>
                  setPage(
                    "login"
                  )
                }
                style={{
                  flex:
                    "1",
                  padding:
                    "14px 10px",
                  borderRadius:
                    "10px",
                  fontSize:
                    "16px",
                  fontWeight:
                    "700",
                  cursor:
                    "pointer",
                  background:
                    "#eef4ff",
                  color:
                    "#2563eb",
                  border:
                    "2px solid #2563eb",
                }}
              >
                🔐 Sign In
              </button>

            </div>

          </form>

        </div>

      </div>
    );
  }

  /* =====================================================
     PROFILE
  ===================================================== */

  if (page === "profile") {
    return (
      <div
        className={`dashboard ${
          darkMode
            ? "dark-mode"
            : ""
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
              setPage(
                "dashboard"
              )
            }
          >
            👤{" "}
            {user?.name ||
              "Profile"}
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
              onClick={
                handleLogout
              }
            >
              🚪 Logout
            </button>

            <button
              className="back-dashboard-btn"
              onClick={() =>
                setPage(
                  "dashboard"
                )
              }
            >
              ← Back to Dashboard
            </button>

          </div>

        </main>

      </div>
    );
  }

  /* =====================================================
     DASHBOARD
  ===================================================== */

  return (
    <div
      className={`dashboard ${
        darkMode
          ? "dark-mode"
          : ""
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
            onClick={
              toggleTheme
            }
          >
            {darkMode
              ? "☀️ Light Mode"
              : "🌙 Dark Mode"}
          </button>

          <button
            className="profile-btn"
            onClick={() =>
              setPage(
                "profile"
              )
            }
          >
            👤{" "}
            {user?.name ||
              "Profile"}
          </button>

        </div>

      </header>

      <main
        className="expense-area"
        id="reportArea"
      >

        {/* =========================
            WELCOME
        ========================= */}

        <div className="welcome-card">

          <h2>
            Welcome,{" "}
            {user?.name}! 👋
          </h2>

          <p>
            Your account is ready.
            You can now manage your
            personal expenses.
          </p>

        </div>

        {/* =========================
            TOTAL SUMMARY
            ONE BELOW ANOTHER
        ========================= */}

        <section
          className="summary-grid"
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "1fr",
            gap:
              "20px",
            marginBottom:
              "28px",
          }}
        >

          <div
            style={{
              minHeight:
                "140px",
              padding:
                "28px",
              borderRadius:
                "18px",
              border:
                "2px solid #334155",
              background:
                "#111827",
              boxSizing:
                "border-box",
            }}
          >

            <h3>
              Total Balance
            </h3>

            <p
              style={{
                fontSize:
                  "32px",
                fontWeight:
                  "800",
                margin:
                  "10px 0 0",
                color:
                  "#ffffff",
              }}
            >
              {money(balance)}
            </p>

          </div>

          <div
            style={{
              minHeight:
                "140px",
              padding:
                "28px",
              borderRadius:
                "18px",
              border:
                "2px solid #334155",
              background:
                "#111827",
              boxSizing:
                "border-box",
            }}
          >

            <h3>
              Total Income
            </h3>

            <p
              style={{
                fontSize:
                  "32px",
                fontWeight:
                  "800",
                margin:
                  "10px 0 0",
                color:
                  "#ffffff",
              }}
            >
              {money(
                totalIncome
              )}
            </p>

          </div>

          <div
            style={{
              minHeight:
                "140px",
              padding:
                "28px",
              borderRadius:
                "18px",
              border:
                "2px solid #334155",
              background:
                "#111827",
              boxSizing:
                "border-box",
            }}
          >

            <h3>
              Total Expenses
            </h3>

            <p
              style={{
                fontSize:
                  "32px",
                fontWeight:
                  "800",
                margin:
                  "10px 0 0",
                color:
                  "#ffffff",
              }}
            >
              {money(
                totalExpenses
              )}
            </p>

          </div>

        </section>

        {/* =========================
            MONTHLY OVERVIEW
            2 COLUMNS
        ========================= */}

        <section className="card">

          <div className="section-header">

            <h2>
              📅 Monthly Overview
            </h2>

            <input
              type="month"
              value={
                selectedMonth
              }
              onChange={(e) =>
                setSelectedMonth(
                  e.target.value
                )
              }
            />

          </div>

          <div
            style={{
              display:
                "grid",
              gridTemplateColumns:
                "repeat(2, minmax(0, 1fr))",
              gap:
                "18px",
            }}
          >

            {/* MONTHLY INCOME */}

            <div
              style={{
                minHeight:
                  "145px",
                padding:
                  "24px",
                borderRadius:
                  "18px",
                border:
                  "2px solid #00d084",
                background:
                  "#062e1f",
                display:
                  "flex",
                alignItems:
                  "center",
                gap:
                  "20px",
                boxSizing:
                  "border-box",
              }}
            >

              <div
                style={{
                  width:
                    "64px",
                  height:
                    "64px",
                  minWidth:
                    "64px",
                  borderRadius:
                    "50%",
                  background:
                    "#0b663f",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  fontSize:
                    "30px",
                }}
              >
                📈
              </div>

              <div>
                <span
                  style={{
                    display:
                      "block",
                    color:
                      "#94a3b8",
                    fontSize:
                      "18px",
                    fontWeight:
                      "700",
                    marginBottom:
                      "10px",
                  }}
                >
                  Monthly Income
                </span>

                <strong
                  style={{
                    color:
                      "#ffffff",
                    fontSize:
                      "29px",
                  }}
                >
                  {money(
                    monthlyIncome
                  )}
                </strong>
              </div>

            </div>

            {/* MONTHLY EXPENSES */}

            <div
              style={{
                minHeight:
                  "145px",
                padding:
                  "24px",
                borderRadius:
                  "18px",
                border:
                  "2px solid #ff3038",
                background:
                  "#351217",
                display:
                  "flex",
                alignItems:
                  "center",
                gap:
                  "20px",
                boxSizing:
                  "border-box",
              }}
            >

              <div
                style={{
                  width:
                    "64px",
                  height:
                    "64px",
                  minWidth:
                    "64px",
                  borderRadius:
                    "50%",
                  background:
                    "#8f2028",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  fontSize:
                    "30px",
                }}
              >
                📉
              </div>

              <div>
                <span
                  style={{
                    display:
                      "block",
                    color:
                      "#94a3b8",
                    fontSize:
                      "18px",
                    fontWeight:
                      "700",
                    marginBottom:
                      "10px",
                  }}
                >
                  Monthly Expenses
                </span>

                <strong
                  style={{
                    color:
                      "#ffffff",
                    fontSize:
                      "29px",
                  }}
                >
                  {money(
                    monthlyExpenses
                  )}
                </strong>
              </div>

            </div>

            {/* SAVINGS */}

            <div
              style={{
                minHeight:
                  "145px",
                padding:
                  "24px",
                borderRadius:
                  "18px",
                border:
                  "2px solid #2583ff",
                background:
                  "#10284d",
                display:
                  "flex",
                alignItems:
                  "center",
                gap:
                  "20px",
                boxSizing:
                  "border-box",
              }}
            >

              <div
                style={{
                  width:
                    "64px",
                  height:
                    "64px",
                  minWidth:
                    "64px",
                  borderRadius:
                    "50%",
                  background:
                    "#174ca3",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  fontSize:
                    "30px",
                }}
              >
                🐷
              </div>

              <div>
                <span
                  style={{
                    display:
                      "block",
                    color:
                      "#94a3b8",
                    fontSize:
                      "18px",
                    fontWeight:
                      "700",
                    marginBottom:
                      "10px",
                  }}
                >
                  Monthly Savings
                </span>

                <strong
                  style={{
                    color:
                      "#ffffff",
                    fontSize:
                      "29px",
                  }}
                >
                  {money(
                    monthlySavings
                  )}
                </strong>
              </div>

            </div>

            {/* AVERAGE */}

            <div
              style={{
                minHeight:
                  "145px",
                padding:
                  "24px",
                borderRadius:
                  "18px",
                border:
                  "2px solid #914dff",
                background:
                  "#21183c",
                display:
                  "flex",
                alignItems:
                  "center",
                gap:
                  "20px",
                boxSizing:
                  "border-box",
              }}
            >

              <div
                style={{
                  width:
                    "64px",
                  height:
                    "64px",
                  minWidth:
                    "64px",
                  borderRadius:
                    "50%",
                  background:
                    "#5221a0",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  fontSize:
                    "30px",
                }}
              >
                📊
              </div>

              <div>
                <span
                  style={{
                    display:
                      "block",
                    color:
                      "#94a3b8",
                    fontSize:
                      "18px",
                    fontWeight:
                      "700",
                    marginBottom:
                      "10px",
                  }}
                >
                  Average Expense
                </span>

                <strong
                  style={{
                    color:
                      "#ffffff",
                    fontSize:
                      "29px",
                  }}
                >
                  {money(
                    Math.round(
                      averageExpense
                    )
                  )}
                </strong>
              </div>

            </div>

            {/* SAVINGS RATE */}

            <div
              style={{
                minHeight:
                  "145px",
                padding:
                  "24px",
                borderRadius:
                  "18px",
                border:
                  "2px solid #ffae00",
                background:
                  "#2c260d",
                display:
                  "flex",
                alignItems:
                  "center",
                gap:
                  "20px",
                boxSizing:
                  "border-box",
              }}
            >

              <div
                style={{
                  width:
                    "64px",
                  height:
                    "64px",
                  minWidth:
                    "64px",
                  borderRadius:
                    "50%",
                  background:
                    "#824400",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  fontSize:
                    "30px",
                }}
              >
                💹
              </div>

              <div>
                <span
                  style={{
                    display:
                      "block",
                    color:
                      "#94a3b8",
                    fontSize:
                      "18px",
                    fontWeight:
                      "700",
                    marginBottom:
                      "10px",
                  }}
                >
                  Savings Rate
                </span>

                <strong
                  style={{
                    color:
                      "#ffffff",
                    fontSize:
                      "29px",
                  }}
                >
                  {Math.round(
                    savingsRate
                  )}
                  %
                </strong>
              </div>

            </div>

            {/* HIGHEST CATEGORY */}

            <div
              style={{
                minHeight:
                  "145px",
                padding:
                  "24px",
                borderRadius:
                  "18px",
                border:
                  "2px solid #00d6cc",
                background:
                  "#082e2c",
                display:
                  "flex",
                alignItems:
                  "center",
                gap:
                  "20px",
                boxSizing:
                  "border-box",
                overflow:
                  "hidden",
              }}
            >

              <div
                style={{
                  width:
                    "64px",
                  height:
                    "64px",
                  minWidth:
                    "64px",
                  borderRadius:
                    "50%",
                  background:
                    "#075f59",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  fontSize:
                    "30px",
                }}
              >
                🏆
              </div>

              <div
                style={{
                  minWidth:
                    "0",
                  overflow:
                    "hidden",
                }}
              >

                <span
                  style={{
                    display:
                      "block",
                    color:
                      "#94a3b8",
                    fontSize:
                      "18px",
                    fontWeight:
                      "700",
                    marginBottom:
                      "10px",
                  }}
                >
                  Highest Category
                </span>

                <strong
                  style={{
                    color:
                      "#ffffff",
                    fontSize:
                      "25px",
                    overflowWrap:
                      "anywhere",
                  }}
                >
                  {highestCategory}
                </strong>

              </div>

            </div>

          </div>

        </section>

        {/* =========================
            MONTHLY BUDGET
        ========================= */}

        <section className="card">

          <h2>
            💰 Monthly Budget
          </h2>

          <div
            style={{
              display:
                "grid",
              gridTemplateColumns:
                "repeat(2, minmax(0, 1fr))",
              gap:
                "18px",
            }}
          >

            {/* BUDGET */}

            <div
              style={{
                minHeight:
                  "180px",
                padding:
                  "28px",
                borderRadius:
                  "18px",
                border:
                  "2px solid #2676ff",
                background:
                  "#10284d",
                display:
                  "flex",
                flexDirection:
                  "column",
                justifyContent:
                  "center",
                boxSizing:
                  "border-box",
              }}
            >

              <span
                style={{
                  fontSize:
                    "32px",
                }}
              >
                💳
              </span>

              <span
                style={{
                  color:
                    "#94a3b8",
                  fontSize:
                    "18px",
                  fontWeight:
                    "700",
                  marginTop:
                    "10px",
                }}
              >
                Budget
              </span>

              <strong
                style={{
                  color:
                    "#5aa0ff",
                  fontSize:
                    "34px",
                  marginTop:
                    "8px",
                }}
              >
                {money(
                  monthlyBudget
                )}
              </strong>

            </div>

            {/* SPENT */}

            <div
              style={{
                minHeight:
                  "180px",
                padding:
                  "28px",
                borderRadius:
                  "18px",
                border:
                  "2px solid #e3294d",
                background:
                  "#351217",
                display:
                  "flex",
                flexDirection:
                  "column",
                justifyContent:
                  "center",
                boxSizing:
                  "border-box",
              }}
            >

              <span
                style={{
                  fontSize:
                    "32px",
                }}
              >
                💸
              </span>

              <span
                style={{
                  color:
                    "#94a3b8",
                  fontSize:
                    "18px",
                  fontWeight:
                    "700",
                  marginTop:
                    "10px",
                }}
              >
                Spent
              </span>

              <strong
                style={{
                  color:
                    "#ff7189",
                  fontSize:
                    "34px",
                  marginTop:
                    "8px",
                }}
              >
                {money(
                  monthlyExpenses
                )}
              </strong>

            </div>

            {/* REMAINING */}

            <div
              style={{
                gridColumn:
                  "1 / -1",
                minHeight:
                  "180px",
                padding:
                  "28px",
                borderRadius:
                  "18px",
                border:
                  "2px solid #00a978",
                background:
                  "#073329",
                display:
                  "flex",
                flexDirection:
                  "column",
                justifyContent:
                  "center",
                boxSizing:
                  "border-box",
              }}
            >

              <span
                style={{
                  fontSize:
                    "32px",
                }}
              >
                💰
              </span>

              <span
                style={{
                  color:
                    "#94a3b8",
                  fontSize:
                    "18px",
                  fontWeight:
                    "700",
                  marginTop:
                    "10px",
                }}
              >
                Remaining
              </span>

              <strong
                style={{
                  color:
                    "#35e58b",
                  fontSize:
                    "34px",
                  marginTop:
                    "8px",
                }}
              >
                {money(
                  budgetRemaining
                )}
              </strong>

            </div>

          </div>

          {/* PROGRESS */}

          <div
            style={{
              height:
                "18px",
              marginTop:
                "24px",
              borderRadius:
                "999px",
              background:
                "#334155",
              overflow:
                "hidden",
            }}
          >

            <div
              style={{
                width: `${displayBudgetPercentage}%`,
                height:
                  "100%",
                borderRadius:
                  "999px",
                background:
                  "#3b82f6",
              }}
            />

          </div>

          <p
            style={{
              fontSize:
                "18px",
              fontWeight:
                "700",
            }}
          >
            {Math.round(
              budgetPercentage
            )}
            % used
          </p>

          <p
            style={{
              padding:
                "20px",
              borderRadius:
                "16px",
              border:
                "1px solid #00a978",
              background:
                "#073329",
              color:
                "#35e58b",
              fontSize:
                "18px",
              fontWeight:
                "700",
            }}
          >
            {monthlyBudget <= 0
              ? "Set a monthly budget to start tracking"
              : budgetRemaining < 0
              ? "You have exceeded your budget"
              : budgetPercentage >=
                80
              ? "You're close to your budget limit"
              : "You're within your budget"}
          </p>

          {/* SET BUDGET */}

          <form
            onSubmit={(e) => {
              e.preventDefault();

              const value =
                Number(
                  e.currentTarget
                    .elements
                    .budget.value
                );

              if (
                !value ||
                value <= 0
              ) {
                alert(
                  "Please enter a budget greater than ₹0."
                );
                return;
              }

              setMonthlyBudget(
                value
              );

              localStorage.setItem(
                "monthlyBudget",
                String(value)
              );

              e.currentTarget.reset();
            }}
            style={{
              display:
                "flex",
              gap:
                "14px",
              marginTop:
                "20px",
            }}
          >

            <input
              name="budget"
              type="number"
              min="1"
              step="1"
              placeholder="Enter monthly budget"
              style={{
                flex:
                  "1",
              }}
            />

            <button
              type="submit"
              style={{
                minHeight:
                  "52px",
                padding:
                  "14px 24px",
                background:
                  "#2563eb",
                color:
                  "#ffffff",
                border:
                  "2px solid #2563eb",
                borderRadius:
                  "10px",
                fontSize:
                  "16px",
                fontWeight:
                  "700",
                cursor:
                  "pointer",
              }}
            >
              Set Budget
            </button>

          </form>

        </section>

        {/* =========================
            ANALYTICS
        ========================= */}

        <section className="card">

          <h2>
            📊 Expense Analytics
          </h2>

          <div className="charts-grid">

            <div className="chart-card">

              <h3>
                Expenses by Category
              </h3>

              <div className="chart-container">

                {categoryChartData.length >
                0 ? (
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <PieChart>

                      <Pie
                        data={
                          categoryChartData
                        }
                        dataKey="amount"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius="70%"
                        label
                      >

                        {categoryChartData.map(
                          (
                            entry,
                            index
                          ) => (
                            <Cell
                              key={
                                entry.name
                              }
                              fill={`hsl(${
                                index *
                                42
                              }, 70%, 55%)`}
                            />
                          )
                        )}

                      </Pie>

                      <Tooltip
                        formatter={(
                          value
                        ) =>
                          money(
                            value
                          )
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
                    data={
                      incomeExpenseData
                    }
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="name"
                    />

                    <YAxis />

                    <Tooltip
                      formatter={(
                        value
                      ) =>
                        money(
                          value
                        )
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

            <div className="chart-card full-width">

              <h3>
                Daily Expense Trend
              </h3>

              <div className="chart-container">

                {trendData.length >
                0 ? (
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <LineChart
                      data={
                        trendData
                      }
                    >

                      <CartesianGrid
                        strokeDasharray="3 3"
                      />

                      <XAxis
                        dataKey="date"
                      />

                      <YAxis />

                      <Tooltip
                        formatter={(
                          value
                        ) =>
                          money(
                            value
                          )
                        }
                      />

                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#2563eb"
                        strokeWidth={3}
                        dot={{
                          r: 4,
                        }}
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

        {/* =========================
            ADD TRANSACTION
        ========================= */}

        <section className="card">

          <h2>
            {editingId !== null
              ? "✏️ Edit Transaction"
              : "➕ Add Transaction"}
          </h2>

          <form
            onSubmit={
              handleTransactionSubmit
            }
          >

            <div className="form-grid">

              <div className="form-field">

                <label>
                  Description
                </label>

                <input
                  type="text"
                  placeholder="Example: Grocery shopping"
                  value={
                    form.description
                  }
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
                  value={
                    form.amount
                  }
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
                  value={
                    form.category
                  }
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
                        key={
                          category
                        }
                        value={
                          category
                        }
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
                  value={
                    form.type
                  }
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
                  value={
                    form.date
                  }
                  onChange={(e) =>
                    updateForm(
                      "date",
                      e.target.value
                    )
                  }
                />

              </div>

            </div>

            {/* BIG BLUE ADD BUTTON */}

            <div
              style={{
                display:
                  "flex",
                width:
                  "100%",
                gap:
                  "14px",
                marginTop:
                  "24px",
              }}
            >

              <button
                type="submit"
                style={{
                  flex:
                    "1",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  minHeight:
                    "56px",
                  padding:
                    "14px 24px",
                  background:
                    "#2563eb",
                  color:
                    "#ffffff",
                  border:
                    "2px solid #2563eb",
                  borderRadius:
                    "10px",
                  fontSize:
                    "17px",
                  fontWeight:
                    "700",
                  cursor:
                    "pointer",
                  boxSizing:
                    "border-box",
                  appearance:
                    "none",
                  WebkitAppearance:
                    "none",
                }}
              >
                {editingId !== null
                  ? "✏️ Update Transaction"
                  : "➕ Add Transaction"}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  onClick={
                    cancelEdit
                  }
                  style={{
                    flex:
                      "1",
                    minHeight:
                      "56px",
                    padding:
                      "14px 24px",
                    background:
                      "#e2e8f0",
                    color:
                      "#334155",
                    border:
                      "2px solid #cbd5e1",
                    borderRadius:
                      "10px",
                    fontSize:
                      "17px",
                    fontWeight:
                      "700",
                    cursor:
                      "pointer",
                  }}
                >
                  Cancel Edit
                </button>
              )}

            </div>

          </form>

        </section>

        {/* =========================
            TRANSACTION HISTORY
        ========================= */}

        <section className="card">

          <div className="section-header">

            <h2>
              📜 Transaction History
            </h2>

          </div>

          <div className="filters">

            <input
              type="text"
              placeholder="Search transactions..."
              value={
                search
              }
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

            <select
              value={
                filterType
              }
              onChange={(e) =>
                setFilterType(
                  e.target.value
                )
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
              value={
                filterCategory
              }
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
                    key={
                      category
                    }
                    value={
                      category
                    }
                  >
                    {category}
                  </option>
                )
              )}

            </select>

          </div>

          <div className="download-container">

            <select
              className="download-select"
              defaultValue=""
              onChange={(e) => {

                const transaction =
                  transactions.find(
                    (item) =>
                      String(
                        item.id
                      ) ===
                      e.target.value
                  );

                if (
                  transaction
                ) {
                  downloadBill(
                    transaction
                  );
                }

                e.target.value =
                  "";

              }}
            >

              <option value="">
                Select transaction to download
              </option>

              {transactions.map(
                (transaction) => (
                  <option
                    key={
                      transaction.id
                    }
                    value={
                      transaction.id
                    }
                  >
                    {transaction.date}
                    {" — "}
                    {
                      transaction.description
                    }
                    {" — "}
                    {money(
                      transaction.amount
                    )}
                  </option>
                )
              )}

            </select>

            <span className="download-hint">
              Select a transaction above to download its bill
            </span>

          </div>

          <div className="transaction-list">

            {filteredTransactions.length ===
            0 ? (
              <p className="empty-message">
                No transactions found.
              </p>
            ) : (
              filteredTransactions.map(
                (transaction) => (

                  <div
                    className="transaction-item"
                    key={
                      transaction.id
                    }
                  >

                    <div className="transaction-main">

                      <h3>
                        {
                          transaction.description
                        }
                      </h3>

                      <p>
                        {
                          transaction.category
                        }
                        {" • "}
                        {
                          transaction.date
                        }
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