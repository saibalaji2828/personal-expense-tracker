import React, { useEffect, useMemo, useState } from "react";
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

/* =========================================================
   CONSTANTS
========================================================= */

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

const CATEGORY_COLORS = [
  "#22C55E",
  "#3B82F6",
  "#F59E0B",
  "#A855F7",
  "#EF4444",
  "#06B6D4",
  "#EC4899",
  "#14B8A6",
];

/* =========================================================
   HELPERS
========================================================= */

const normalizeEmail = (email) =>
  String(email || "")
    .trim()
    .toLowerCase();

const transactionStorageKey = (email) =>
  `transactions_${normalizeEmail(email)}`;

const budgetStorageKey = (email) =>
  `monthlyBudget_${normalizeEmail(email)}`;

const budgetSetStorageKey = (email) =>
  `monthlyBudgetSet_${normalizeEmail(email)}`;

const getToday = () => {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getCurrentMonth = () => {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  return `${year}-${month}`;
};

const formatMoney = (value) => {
  return `₹${Number(value || 0).toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 2,
    }
  )}`;
};

/* =========================================================
   APP
========================================================= */

function App() {
  /* =======================================================
     USER / AUTH
  ======================================================= */

  const [user, setUser] = useState(() => {
    try {
      const savedUser =
        localStorage.getItem("expenseUser");

      const loggedIn =
        localStorage.getItem("isLoggedIn") ===
        "true";

      if (
        loggedIn &&
        savedUser
      ) {
        return JSON.parse(savedUser);
      }

      return null;
    } catch {
      return null;
    }
  });

  const [page, setPage] = useState(() => {
    return (
      localStorage.getItem(
        "isLoggedIn"
      ) === "true"
        ? "dashboard"
        : "login"
    );
  });

  /* =======================================================
     LOGIN
  ======================================================= */

  const [loginData, setLoginData] =
    useState({
      email: "",
      password: "",
    });

  const [showLoginPassword, setShowLoginPassword] =
    useState(false);

  /* =======================================================
     SIGNUP
  ======================================================= */

  const [signupData, setSignupData] =
    useState({
      name: "",
      gender: "",
      age: "",
      occupation: "",
      email: "",
      number: "",
      password: "",
    });

  const [showSignupPassword, setShowSignupPassword] =
    useState(false);

  /* =======================================================
     TRANSACTIONS
  ======================================================= */

  const [transactions, setTransactions] =
    useState([]);

  /* =======================================================
     BUDGET

     NEW USER = 0
  ======================================================= */

  const [monthlyBudget, setMonthlyBudget] =
    useState(0);

  /* =======================================================
     MONTH
  ======================================================= */

  const [selectedMonth, setSelectedMonth] =
    useState(
      getCurrentMonth()
    );

  /* =======================================================
     TRANSACTION FORM
  ======================================================= */

  const [form, setForm] = useState({
    description: "",
    amount: "",
    category: "",
    type: "",
    date: getToday(),
  });

  const [editingId, setEditingId] =
    useState(null);

  /* =======================================================
     FILTERS
  ======================================================= */

  const [search, setSearch] =
    useState("");

  const [filterType, setFilterType] =
    useState("all");

  const [filterCategory, setFilterCategory] =
    useState("all");

  const [historyMonth, setHistoryMonth] =
    useState("all");

  const [sortOption, setSortOption] =
    useState("newest");

  /* =======================================================
     DARK / LIGHT MODE
  ======================================================= */

  const [darkMode, setDarkMode] =
    useState(() => {
      return (
        localStorage.getItem(
          "expenseTheme"
        ) === "dark"
      );
    });

  /* =======================================================
     RESPONSIVE MOBILE LAYOUT

     Monthly Overview uses 2 columns on desktop/tablet and
     automatically switches to 1 column on phones.
  ======================================================= */

  const [isMobile, setIsMobile] = useState(() => {
    return typeof window !== "undefined" && window.innerWidth <= 600;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  /* =======================================================
     LOAD USER TRANSACTIONS
  ======================================================= */

  useEffect(() => {
    if (!user?.email) {
      setTransactions([]);
      return;
    }

    const key =
      transactionStorageKey(
        user.email
      );

    try {
      const saved =
        localStorage.getItem(key);

      if (!saved) {
        setTransactions([]);
        return;
      }

      const parsed =
        JSON.parse(saved);

      if (
        Array.isArray(parsed)
      ) {
        setTransactions(parsed);
      } else {
        setTransactions([]);
      }
    } catch {
      setTransactions([]);
    }
  }, [user]);

  /* =======================================================
     LOAD USER BUDGET

     IMPORTANT:

     The old application stored ₹10,000
     directly.

     We now check whether the USER
     actually set the budget.

     If not:
       Budget = ₹0
  ======================================================= */

  useEffect(() => {
    if (!user?.email) {
      setMonthlyBudget(0);
      return;
    }

    const budgetKey =
      budgetStorageKey(
        user.email
      );

    const budgetSetKey =
      budgetSetStorageKey(
        user.email
      );

    const budgetWasSet =
      localStorage.getItem(
        budgetSetKey
      ) === "true";

    /*
      If the user has NOT explicitly
      set a budget, force it to ZERO.

      This automatically handles old
      ₹10,000 values from previous
      versions.
    */

    if (!budgetWasSet) {
      setMonthlyBudget(0);

      localStorage.setItem(
        budgetKey,
        "0"
      );

      return;
    }

    /*
      User has explicitly set a budget.
      Load it.
    */

    const savedBudget =
      localStorage.getItem(
        budgetKey
      );

    const value =
      Number(savedBudget);

    if (
      Number.isFinite(value) &&
      value > 0
    ) {
      setMonthlyBudget(value);
    } else {
      setMonthlyBudget(0);

      localStorage.setItem(
        budgetKey,
        "0"
      );

      localStorage.setItem(
        budgetSetKey,
        "false"
      );
    }
  }, [user]);

  /* =======================================================
     SAVE TRANSACTIONS
  ======================================================= */

  const saveTransactions = (
    newTransactions
  ) => {
    setTransactions(
      newTransactions
    );

    if (!user?.email) {
      return;
    }

    localStorage.setItem(
      transactionStorageKey(
        user.email
      ),
      JSON.stringify(
        newTransactions
      )
    );
  };

  /* =======================================================
     LOGIN
  ======================================================= */

  const handleLogin = (e) => {
    e.preventDefault();

    const email =
      normalizeEmail(
        loginData.email
      );

    const password =
      loginData.password;

    let users = [];

    try {
      const savedUsers =
        localStorage.getItem(
          "expenseUsers"
        );

      if (savedUsers) {
        const parsed =
          JSON.parse(savedUsers);

        if (
          Array.isArray(parsed)
        ) {
          users = parsed;
        }
      }
    } catch {
      users = [];
    }

    /*
      Compatibility with old version
    */

    if (
      users.length === 0
    ) {
      const oldUser =
        localStorage.getItem(
          "expenseUser"
        );

      if (oldUser) {
        try {
          const parsedOldUser =
            JSON.parse(oldUser);

          if (parsedOldUser?.email) {
            const oldEmail = normalizeEmail(parsedOldUser.email);
            const alreadyExists = users.some(
              (item) => normalizeEmail(item.email) === oldEmail
            );

            if (!alreadyExists) {
              users.push(parsedOldUser);
              localStorage.setItem(
                "expenseUsers",
                JSON.stringify(users)
              );
            }
          }
        } catch {
          // Ignore invalid legacy user data.
        }
      }
    }

    const foundUser =
      users.find(
        (item) =>
          normalizeEmail(
            item.email
          ) === email &&
          item.password ===
            password
      );

    if (!foundUser) {
      alert(
        "Invalid email or password."
      );

      return;
    }

    /*
      Make sure user transaction
      storage exists.
    */

    const transactionKey =
      transactionStorageKey(
        foundUser.email
      );

    if (
      localStorage.getItem(
        transactionKey
      ) === null
    ) {
      localStorage.setItem(
        transactionKey,
        JSON.stringify([])
      );
    }

    /*
      IMPORTANT:

      Do NOT automatically consider
      an old ₹10,000 budget as a
      user-selected budget.

      Only create the new flag if
      it doesn't exist.

      Old accounts therefore become
      ₹0 until they set a budget.
    */

    const budgetSetKey =
      budgetSetStorageKey(
        foundUser.email
      );

    if (
      localStorage.getItem(
        budgetSetKey
      ) === null
    ) {
      localStorage.setItem(
        budgetSetKey,
        "false"
      );
    }

    setUser(foundUser);

    localStorage.setItem(
      "expenseUser",
      JSON.stringify(
        foundUser
      )
    );

    localStorage.setItem(
      "isLoggedIn",
      "true"
    );

    setPage("dashboard");

    setLoginData({
      email: "",
      password: "",
    });
  };

  /* =======================================================
     SIGN UP

     BRAND NEW ACCOUNT:
       Transactions = []
       Budget = 0
       BudgetSet = false
  ======================================================= */

  const handleSignup = (e) => {
    e.preventDefault();

    if (
      !signupData.name.trim()
    ) {
      alert(
        "Please enter your name."
      );
      return;
    }

    if (
      !signupData.email.trim()
    ) {
      alert(
        "Please enter your email."
      );
      return;
    }

    if (
      !signupData.number.trim()
    ) {
      alert(
        "Please enter your phone number."
      );
      return;
    }

    if (
      !signupData.password.trim()
    ) {
      alert(
        "Please create a password."
      );
      return;
    }

    const email =
      normalizeEmail(
        signupData.email
      );

    let users = [];

    try {
      const savedUsers =
        localStorage.getItem(
          "expenseUsers"
        );

      if (savedUsers) {
        const parsed =
          JSON.parse(savedUsers);

        if (
          Array.isArray(parsed)
        ) {
          users = parsed;
        }
      }
    } catch {
      users = [];
    }

    /*
      Check whether email already
      exists.
    */

    const existingUser =
      users.find(
        (item) =>
          normalizeEmail(
            item.email
          ) === email
      );

    if (existingUser) {
      alert(
        "An account with this email already exists. Please sign in."
      );

      setLoginData({
        email,
        password: "",
      });

      setPage("login");

      return;
    }

    const newUser = {
      ...signupData,
      name:
        signupData.name.trim(),
      email,
      number:
        signupData.number.trim(),
    };

    /*
      Save user.
    */

    users.push(newUser);

    localStorage.setItem(
      "expenseUsers",
      JSON.stringify(users)
    );

    /*
      ============================================
      BRAND NEW USER
      ============================================
    */

    localStorage.setItem(
      transactionStorageKey(
        email
      ),
      JSON.stringify([])
    );

    /*
      Budget starts at ZERO.
    */

    localStorage.setItem(
      budgetStorageKey(
        email
      ),
      "0"
    );

    /*
      VERY IMPORTANT:
      The user has NOT set a budget.
    */

    localStorage.setItem(
      budgetSetStorageKey(
        email
      ),
      "false"
    );

    /*
      Clear React state.
    */

    setTransactions([]);

    setMonthlyBudget(0);

    /*
      Login the new user.
    */

    setUser(newUser);

    localStorage.setItem(
      "expenseUser",
      JSON.stringify(
        newUser
      )
    );

    localStorage.setItem(
      "isLoggedIn",
      "true"
    );

    setPage("dashboard");

    /*
      Clear signup form.
    */

    setSignupData({
      name: "",
      gender: "",
      age: "",
      occupation: "",
      email: "",
      number: "",
      password: "",
    });
  };

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = () => {
    setUser(null);

    setTransactions([]);

    setMonthlyBudget(0);

    localStorage.setItem(
      "isLoggedIn",
      "false"
    );

    /*
      IMPORTANT:
      Do NOT delete "expenseUser" here.

      It stores the last active account and is also used
      to support accounts created by older versions of the app.
      The real account list is stored in "expenseUsers".

      Logging out must only end the session. It must NOT delete
      the account, so the same email and password can be used
      to sign in again later.
    */

    setPage("login");
  };

  /* =======================================================
     DARK / LIGHT MODE
  ======================================================= */

  const toggleTheme = () => {
    setDarkMode(
      (previous) => {
        const next =
          !previous;

        localStorage.setItem(
          "expenseTheme",
          next
            ? "dark"
            : "light"
        );

        return next;
      }
    );
  };

  /* =======================================================
     FORM UPDATE
  ======================================================= */

  const updateForm = (
    field,
    value
  ) => {
    setForm(
      (previous) => ({
        ...previous,
        [field]: value,
      })
    );

    /*
      Keep Monthly Overview synchronized with the
      transaction date. This works for both new
      transactions and existing transactions being edited.
    */
    if (field === "date" && value) {
      const month = value.slice(0, 7);

      if (month) {
        setSelectedMonth(month);
      }
    }
  };

  /* =======================================================
     ADD / UPDATE TRANSACTION
  ======================================================= */

  const handleTransactionSubmit =
    (e) => {
      e.preventDefault();

      if (
        !form.description.trim()
      ) {
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
        alert(
          "Please select a date."
        );
        return;
      }

      /*
        UPDATE
      */

      if (
        editingId !== null
      ) {
        const updated =
          transactions.map(
            (item) =>
              item.id ===
              editingId
                ? {
                    ...item,
                    description:
                      form.description.trim(),
                    amount:
                      Number(
                        form.amount
                      ),
                    category:
                      form.category,
                    type:
                      form.type,
                    date:
                      form.date,
                  }
                : item
          );

        saveTransactions(
          updated
        );

        alert(
          "Transaction updated successfully."
        );
      }

      /*
        ADD
      */

      else {
        const newTransaction = {
          id: Date.now(),
          description:
            form.description.trim(),
          amount:
            Number(
              form.amount
            ),
          category:
            form.category,
          type:
            form.type,
          date:
            form.date,
        };

        saveTransactions([
          ...transactions,
          newTransaction,
        ]);

        alert(
          "Transaction added successfully."
        );
      }

      /*
        After saving, keep the new transaction form inside
        the month currently selected in Monthly Overview.
      */
      setForm({
        description: "",
        amount: "",
        category: "",
        type: "",
        date: selectedMonth
          ? `${selectedMonth}-01`
          : getToday(),
      });

      setEditingId(null);
    };

  /* =======================================================
     EDIT TRANSACTION
  ======================================================= */

  const editTransaction = (
    transaction
  ) => {
    setEditingId(
      transaction.id
    );

    setForm({
      description:
        transaction.description,
      amount:
        String(
          transaction.amount
        ),
      category:
        transaction.category,
      type:
        transaction.type,
      date:
        transaction.date,
    });

    window.scrollTo({
      top:
        document.body
          .scrollHeight,
      behavior: "smooth",
    });
  };

  /* =======================================================
     DELETE TRANSACTION
  ======================================================= */

  const deleteTransaction = (
    id
  ) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this transaction?"
      )
    ) {
      return;
    }

    const updated =
      transactions.filter(
        (item) =>
          item.id !== id
      );

    saveTransactions(
      updated
    );
  };

  /* =======================================================
     CANCEL EDIT
  ======================================================= */

  const cancelEdit = () => {
    setEditingId(null);

    setForm({
      description: "",
      amount: "",
      category: "",
      type: "",
      date: getToday(),
    });
  };

  /* =======================================================
     TOTAL INCOME
  ======================================================= */

  const totalIncome =
    transactions
      .filter(
        (item) =>
          item.type ===
            "income" &&
          item.date &&
          item.date.startsWith(
            selectedMonth
          )
      )
      .reduce(
        (total, item) =>
          total +
          Number(
            item.amount
          ),
        0
      );

  /* =======================================================
     TOTAL EXPENSES
  ======================================================= */

  const totalExpenses =
    transactions
      .filter(
        (item) =>
          item.type ===
            "expense" &&
          item.date &&
          item.date.startsWith(
            selectedMonth
          )
      )
      .reduce(
        (total, item) =>
          total +
          Number(
            item.amount
          ),
        0
      );

  /* =======================================================
     TOTAL BALANCE
  ======================================================= */

  const totalBalance =
    totalIncome -
    totalExpenses;

  /* =======================================================
     MONTHLY TRANSACTIONS
  ======================================================= */

  const monthlyTransactions =
    useMemo(() => {
      return transactions.filter(
        (item) =>
          item.date &&
          item.date.startsWith(
            selectedMonth
          )
      );
    }, [
      transactions,
      selectedMonth,
    ]);

  /* =======================================================
     MONTHLY INCOME
  ======================================================= */

  const monthlyIncome =
    monthlyTransactions
      .filter(
        (item) =>
          item.type ===
          "income"
      )
      .reduce(
        (total, item) =>
          total +
          Number(
            item.amount
          ),
        0
      );

  /* =======================================================
     MONTHLY EXPENSES
  ======================================================= */

  const monthlyExpenses =
    monthlyTransactions
      .filter(
        (item) =>
          item.type ===
          "expense"
      )
      .reduce(
        (total, item) =>
          total +
          Number(
            item.amount
          ),
        0
      );

  /* =======================================================
     MONTHLY SAVINGS
  ======================================================= */

  const monthlySavings =
    monthlyIncome -
    monthlyExpenses;

  /* =======================================================
     AVERAGE EXPENSE
  ======================================================= */

  const expenseCount =
    monthlyTransactions.filter(
      (item) =>
        item.type ===
        "expense"
    ).length;

  const averageExpense =
    expenseCount > 0
      ? monthlyExpenses /
        expenseCount
      : 0;

  /* =======================================================
     SAVINGS RATE
  ======================================================= */

  const savingsRate =
    monthlyIncome > 0
      ? (monthlySavings /
          monthlyIncome) *
        100
      : 0;

  /* =======================================================
     CATEGORY TOTALS
  ======================================================= */

  const categoryTotals =
    useMemo(() => {
      const totals = {};

      CATEGORIES.forEach(
        (category) => {
          totals[category] =
            0;
        }
      );

      monthlyTransactions
        .filter(
          (item) =>
            item.type ===
            "expense"
        )
        .forEach(
          (item) => {
            totals[
              item.category
            ] =
              (totals[
                item.category
              ] || 0) +
              Number(
                item.amount
              );
          }
        );

      return totals;
    }, [
      monthlyTransactions,
    ]);

  /* =======================================================
     HIGHEST SPENDING CATEGORY
  ======================================================= */

  const highestCategory =
    useMemo(() => {
      let highestCategoryName =
        "";

      let highestAmount =
        0;

      Object.entries(
        categoryTotals
      ).forEach(
        ([category, amount]) => {
          if (
            amount >
            highestAmount
          ) {
            highestAmount =
              amount;

            highestCategoryName =
              category;
          }
        }
      );

      if (
        !highestCategoryName
      ) {
        return "No expenses yet";
      }

      return `${highestCategoryName} - ${formatMoney(
        highestAmount
      )}`;
    }, [
      categoryTotals,
    ]);

  /* =======================================================
     BUDGET CALCULATIONS
  ======================================================= */

  const budgetSpent =
    monthlyExpenses;

  const budgetRemaining =
    monthlyBudget -
    budgetSpent;

  const budgetPercentage =
    monthlyBudget > 0
      ? (budgetSpent /
          monthlyBudget) *
        100
      : 0;

  const progressWidth =
    Math.min(
      Math.max(
        budgetPercentage,
        0
      ),
      100
    );

  /* =======================================================
     FILTERED TRANSACTIONS
  ======================================================= */

  /* =======================================================
     DUPLICATE TRANSACTION DETECTION

     Transactions are considered possible duplicates when they
     have the same description, amount, category, type and date.
     The first matching transaction is kept as the original and
     every matching entry is highlighted in Transaction History.
  ======================================================= */

  const duplicateIds = useMemo(() => {
    const groups = new Map();

    transactions.forEach((item) => {
      const key = [
        String(item.description || "")
          .trim()
          .toLowerCase(),
        Number(item.amount || 0),
        String(item.category || "")
          .trim()
          .toLowerCase(),
        String(item.type || "")
          .trim()
          .toLowerCase(),
        String(item.date || ""),
      ].join("|");

      if (!groups.has(key)) {
        groups.set(key, []);
      }

      groups.get(key).push(item.id);
    });

    const ids = new Set();

    groups.forEach((idsInGroup) => {
      if (idsInGroup.length > 1) {
        idsInGroup.forEach((id) => ids.add(id));
      }
    });

    return ids;
  }, [transactions]);

  /* =======================================================
     FILTERED + SORTED TRANSACTIONS
  ======================================================= */

  const filteredTransactions =
    useMemo(() => {
      const searchText =
        search
          .trim()
          .toLowerCase();

      const filtered = transactions.filter(
        (item) => {
          const matchesSearch =
            !searchText ||
            String(item.description || "")
              .toLowerCase()
              .includes(searchText) ||
            String(item.category || "")
              .toLowerCase()
              .includes(searchText) ||
            String(item.type || "")
              .toLowerCase()
              .includes(searchText) ||
            String(item.date || "")
              .includes(searchText);

          const matchesType =
            filterType === "all" ||
            item.type === filterType;

          const matchesCategory =
            filterCategory === "all" ||
            item.category === filterCategory;

          const matchesMonth =
            historyMonth === "all" ||
            String(item.date || "").startsWith(
              historyMonth === "selected"
                ? selectedMonth
                : historyMonth
            );

          return (
            matchesSearch &&
            matchesType &&
            matchesCategory &&
            matchesMonth
          );
        }
      );

      return filtered.sort((a, b) => {
        if (sortOption === "oldest") {
          return (
            new Date(a.date) -
            new Date(b.date)
          );
        }

        if (sortOption === "amountHigh") {
          return (
            Number(b.amount) -
            Number(a.amount)
          );
        }

        if (sortOption === "amountLow") {
          return (
            Number(a.amount) -
            Number(b.amount)
          );
        }

        if (sortOption === "description") {
          return String(a.description || "")
            .localeCompare(
              String(b.description || "")
            );
        }

        // Newest first by default.
        return (
          new Date(b.date) -
          new Date(a.date)
        );
      });
    }, [
      transactions,
      search,
      filterType,
      filterCategory,
      historyMonth,
      selectedMonth,
      sortOption,
    ]);

  /* =======================================================
     CATEGORY CHART DATA
  ======================================================= */

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

  /* =======================================================
     INCOME VS EXPENSE DATA
  ======================================================= */

  const incomeExpenseData = [
    {
      name: "Income",
      amount:
        monthlyIncome,
    },
    {
      name: "Expenses",
      amount:
        monthlyExpenses,
    },
  ];

  /* =======================================================
     DAILY EXPENSE DATA

     ALL DAYS OF MONTH ARE INCLUDED.
  ======================================================= */

  const dailyExpenseData =
    useMemo(() => {
      const [
        year,
        month,
      ] =
        selectedMonth
          .split("-")
          .map(Number);

      const daysInMonth =
        new Date(
          year,
          month,
          0
        ).getDate();

      const dailyExpenses =
        Array(
          daysInMonth
        ).fill(0);

      monthlyTransactions
        .filter(
          (item) =>
            item.type ===
            "expense"
        )
        .forEach(
          (item) => {
            const day =
              Number(
                item.date
                  .split("-")[2]
              );

            if (
              day >= 1 &&
              day <=
                daysInMonth
            ) {
              dailyExpenses[
                day - 1
              ] += Number(
                item.amount
              );
            }
          }
        );

      return dailyExpenses.map(
        (
          amount,
          index
        ) => ({
          day:
            String(
              index + 1
            ),
          amount,
        })
      );
    }, [
      monthlyTransactions,
      selectedMonth,
    ]);

  /* =======================================================
     SET BUDGET
  ======================================================= */

  const handleBudgetSubmit = (
    e
  ) => {
    e.preventDefault();

    const value =
      Number(
        e.currentTarget.elements
          .budget.value
      );

    if (
      !Number.isFinite(
        value
      ) ||
      value <= 0
    ) {
      alert(
        "Please enter a budget greater than ₹0."
      );

      return;
    }

    /*
      Save chosen budget.
    */

    setMonthlyBudget(
      value
    );

    if (user?.email) {
      localStorage.setItem(
        budgetStorageKey(
          user.email
        ),
        String(value)
      );

      /*
        VERY IMPORTANT:

        User has now explicitly
        set a budget.
      */

      localStorage.setItem(
        budgetSetStorageKey(
          user.email
        ),
        "true"
      );
    }

    e.currentTarget.reset();
  };

  /* =======================================================
     DOWNLOAD BILL
  ======================================================= */

  const downloadBill = (
    transaction
  ) => {
    const type =
      transaction.type ===
      "income"
        ? "Income"
        : "Expense";

    const html = `
<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>
Transaction Bill
</title>

<style>

body {
  font-family:
    Arial,
    sans-serif;

  background:
    #f4f7fb;

  padding:
    40px;

  color:
    #111827;
}

.bill {
  max-width:
    650px;

  margin:
    auto;

  background:
    white;

  padding:
    35px;

  border-radius:
    16px;

  border:
    1px solid #e5e7eb;
}

h1 {
  text-align:
    center;
}

.subtitle {
  text-align:
    center;

  color:
    #64748b;

  margin-bottom:
    30px;
}

.row {
  display:
    flex;

  justify-content:
    space-between;

  padding:
    16px 0;

  border-bottom:
    1px solid #e5e7eb;
}

.footer {
  text-align:
    center;

  margin-top:
    30px;

  color:
    #64748b;

  font-size:
    13px;
}

</style>

</head>

<body>

<div class="bill">

<h1>
💰 Personal Expense Tracker
</h1>

<div class="subtitle">
Transaction Bill
</div>

<div class="row">
<strong>
Description
</strong>

<span>
${transaction.description}
</span>

</div>

<div class="row">

<strong>
Amount
</strong>

<span>
${formatMoney(
  transaction.amount
)}
</span>

</div>

<div class="row">

<strong>
Category
</strong>

<span>
${transaction.category}
</span>

</div>

<div class="row">

<strong>
Type
</strong>

<span>
${type}
</span>

</div>

<div class="row">

<strong>
Date
</strong>

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
          type:
            "text/html",
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
      `transaction-${transaction.id}.html`;

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

    URL.revokeObjectURL(
      url
    );
  };

  /* =======================================================
     LOGIN PAGE
  ======================================================= */

  if (page === "login") {
    return (
      <div className="auth-page">

        <div className="auth-card">

          <div className="auth-icon">
            💰
          </div>

          <h1>
            Personal Expense Tracker
          </h1>

          <p className="auth-subtitle">
            Sign in to manage your
            personal finances
          </p>

          <form
            onSubmit={
              handleLogin
            }
          >

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
                  setLoginData(
                    {
                      ...loginData,
                      email:
                        e.target.value,
                    }
                  )
                }
                required
              />

            </div>

            <div className="form-field">

              <label>
                Password
              </label>

              <div className="password-input-wrapper">
                <input
                  type={
                    showLoginPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={
                    loginData.password
                  }
                  onChange={(e) =>
                    setLoginData(
                      {
                        ...loginData,
                        password:
                          e.target.value,
                      }
                    )
                  }
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowLoginPassword(
                      (previous) => !previous
                    )
                  }
                  aria-label={
                    showLoginPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  title={
                    showLoginPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showLoginPassword
                    ? "🙈"
                    : "👁️"}
                </button>
              </div>

            </div>

            <button
              className="primary-auth-button"
              type="submit"
            >
              🔐 Sign In
            </button>

          </form>

          <div className="auth-divider">
            Don't have an account?
          </div>

          <button
            className="secondary-auth-button"
            type="button"
            onClick={() =>
              setPage("signup")
            }
          >
            👤 Create Account
          </button>

        </div>

      </div>
    );
  }

  /* =======================================================
     SIGNUP PAGE
  ======================================================= */

  if (page === "signup") {
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
            Enter your details to
            get started
          </p>

          <form
            onSubmit={
              handleSignup
            }
          >

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
                    setSignupData(
                      {
                        ...signupData,
                        name:
                          e.target.value,
                      }
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
                    setSignupData(
                      {
                        ...signupData,
                        gender:
                          e.target.value,
                      }
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
                    setSignupData(
                      {
                        ...signupData,
                        age:
                          e.target.value,
                      }
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
                    setSignupData(
                      {
                        ...signupData,
                        occupation:
                          e.target.value,
                      }
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
                    setSignupData(
                      {
                        ...signupData,
                        email:
                          e.target.value,
                      }
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
                  placeholder="Enter phone number"
                  value={
                    signupData.number
                  }
                  onChange={(e) =>
                    setSignupData(
                      {
                        ...signupData,
                        number:
                          e.target.value,
                      }
                    )
                  }
                  required
                />

              </div>

              <div className="form-field full-width">

                <label>
                  Password *
                </label>

                <div className="password-input-wrapper">
                  <input
                    type={
                      showSignupPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Create a password"
                    value={
                      signupData.password
                    }
                    onChange={(e) =>
                      setSignupData(
                        {
                          ...signupData,
                          password:
                            e.target.value,
                        }
                      )
                    }
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowSignupPassword(
                        (previous) => !previous
                      )
                    }
                    aria-label={
                      showSignupPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    title={
                      showSignupPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showSignupPassword
                      ? "🙈"
                      : "👁️"}
                  </button>
                </div>

              </div>

            </div>

            <button
              className="primary-auth-button"
              type="submit"
            >
              👤 Create Account
            </button>

          </form>

          <button
            className="secondary-auth-button"
            type="button"
            onClick={() =>
              setPage("login")
            }
          >
            🔐 Sign In
          </button>

        </div>

      </div>
    );
  }

  /* =======================================================
     PROFILE
  ======================================================= */

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
              Manage your money smarter
            </p>

          </div>

          <div className="header-actions">

            <button
              className="theme-toggle"
              onClick={
                toggleTheme
              }
              type="button"
            >
              {darkMode
                ? "☀️ Light Mode"
                : "🌙 Dark Mode"}
            </button>

            <button
              className="profile-btn"
              onClick={() =>
                setPage(
                  "dashboard"
                )
              }
              type="button"
            >
              ← Dashboard
            </button>

          </div>

        </header>

        <main className="expense-area">

          <section className="card profile-card">

            <div className="profile-large-icon">
              👤
            </div>

            <h2>
              {user?.name}
            </h2>

            <p>
              Your Profile
            </p>

            <div className="profile-details">

              <div>
                <strong>
                  Name
                </strong>

                <span>
                  {user?.name ||
                    "Not provided"}
                </span>
              </div>

              <div>
                <strong>
                  Gender
                </strong>

                <span>
                  {user?.gender ||
                    "Not provided"}
                </span>
              </div>

              <div>
                <strong>
                  Age
                </strong>

                <span>
                  {user?.age ||
                    "Not provided"}
                </span>
              </div>

              <div>
                <strong>
                  Occupation
                </strong>

                <span>
                  {user?.occupation ||
                    "Not provided"}
                </span>
              </div>

              <div>
                <strong>
                  Email
                </strong>

                <span>
                  {user?.email ||
                    "Not provided"}
                </span>
              </div>

              <div>
                <strong>
                  Phone
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

          </section>

        </main>

      </div>
    );
  }

  /* =======================================================
     DASHBOARD
  ======================================================= */

  return (
    <div
      className={`dashboard ${
        darkMode
          ? "dark-mode"
          : ""
      }`}
    >

      {/* =================================================
          HEADER
      ================================================= */}

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
            type="button"
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
            type="button"
          >
            👤{" "}
            {user?.name ||
              "Profile"}
          </button>

        </div>

      </header>

      <main className="expense-area">

        {/* =================================================
            WELCOME
        ================================================= */}

        <section className="welcome-card">

          <h2>
            Welcome,{" "}
            {user?.name}! 👋
          </h2>

          <p>
            Your account is ready.
            You can now manage your
            personal expenses.
          </p>

        </section>

        {/* =================================================
            SUMMARY
        ================================================= */}

        <section className="summary-grid">

          <div className="summary-card balance-card">

            <div className="summary-icon">
              💰
            </div>

            <div className="summary-content">

              <span>
                Total Balance
              </span>

              <strong>
                {formatMoney(
                  totalBalance
                )}
              </strong>

            </div>

          </div>

          <div className="summary-card income-card">

            <div className="summary-icon">
              📈
            </div>

            <div className="summary-content">

              <span>
                Total Income
              </span>

              <strong>
                {formatMoney(
                  totalIncome
                )}
              </strong>

            </div>

          </div>

          <div className="summary-card expense-card">

            <div className="summary-icon">
              📉
            </div>

            <div className="summary-content">

              <span>
                Total Expenses
              </span>

              <strong>
                {formatMoney(
                  totalExpenses
                )}
              </strong>

            </div>

          </div>

        </section>

        {/* =================================================
            MONTHLY OVERVIEW
        ================================================= */}

        <section className="card monthly-overview-card">

          <div className="section-heading">

            <h2>
              📅 Monthly Overview
            </h2>

            <p>
              Analyze your finances
              for a specific month
            </p>

          </div>

          <div className="month-selector">

            <label>
              Select Month
            </label>

            <input
              type="month"
              value={
                selectedMonth
              }
              onChange={(e) => {
                const month = e.target.value;

                setSelectedMonth(month);

                /*
                  When adding a NEW transaction, changing the
                  Monthly Overview month also changes the default
                  transaction date to the first day of that month.

                  While editing, keep the existing transaction date
                  until the user deliberately changes it.
                */
                if (
                  editingId === null &&
                  month
                ) {
                  setForm((previous) => ({
                    ...previous,
                    date: `${month}-01`,
                  }));
                }
              }}
            />

          </div>

          <div
            className="monthly-grid"
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "1fr"
                : "repeat(2, minmax(0, 1fr))",
              gap: isMobile ? "14px" : "18px",
              width: "100%",
              minWidth: 0,
            }}
          >

            <div className="monthly-card monthly-income" style={{ minWidth: 0, width: "100%", boxSizing: "border-box", overflow: "hidden" }}>

              <div className="monthly-icon">
                📈
              </div>

              <div className="monthly-content" style={{ minWidth: 0, flex: 1, width: "100%" }}>

                <span>
                  Monthly Income
                </span>

                <strong>
                  {formatMoney(
                    monthlyIncome
                  )}
                </strong>

              </div>

            </div>

            <div className="monthly-card monthly-expenses" style={{ minWidth: 0, width: "100%", boxSizing: "border-box", overflow: "hidden" }}>

              <div className="monthly-icon">
                📉
              </div>

              <div className="monthly-content" style={{ minWidth: 0, flex: 1, width: "100%" }}>

                <span>
                  Monthly Expenses
                </span>

                <strong>
                  {formatMoney(
                    monthlyExpenses
                  )}
                </strong>

              </div>

            </div>

            <div className="monthly-card monthly-savings" style={{ minWidth: 0, width: "100%", boxSizing: "border-box", overflow: "hidden" }}>

              <div className="monthly-icon">
                🐷
              </div>

              <div className="monthly-content" style={{ minWidth: 0, flex: 1, width: "100%" }}>

                <span>
                  Monthly Savings
                </span>

                <strong>
                  {formatMoney(
                    monthlySavings
                  )}
                </strong>

              </div>

            </div>

            <div className="monthly-card monthly-average" style={{ minWidth: 0, width: "100%", boxSizing: "border-box", overflow: "hidden" }}>

              <div className="monthly-icon">
                📊
              </div>

              <div className="monthly-content" style={{ minWidth: 0, flex: 1, width: "100%" }}>

                <span>
                  Average Expense
                </span>

                <strong>
                  {formatMoney(
                    Math.round(
                      averageExpense
                    )
                  )}
                </strong>

              </div>

            </div>

            <div className="monthly-card monthly-rate" style={{ minWidth: 0, width: "100%", boxSizing: "border-box", overflow: "hidden" }}>

              <div className="monthly-icon">
                %
              </div>

              <div className="monthly-content" style={{ minWidth: 0, flex: 1, width: "100%" }}>

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

            </div>

            <div className="monthly-card monthly-category" style={{ minWidth: 0, width: "100%", boxSizing: "border-box", overflow: "hidden" }}>

              <div className="monthly-icon">
                🏆
              </div>

              <div className="monthly-content" style={{ minWidth: 0, flex: 1, width: "100%" }}>

                <span>
                  Highest Spending Category
                </span>

                <strong>
                  {highestCategory}
                </strong>

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            MONTHLY BUDGET
        ================================================= */}

        <section className="card budget-card">

          <div className="section-heading">

            <h2>
              💰 Monthly Budget
            </h2>

          </div>

          <div className="budget-grid">

            <div className="budget-box budget-box-blue">

              <div className="budget-icon">
                💳
              </div>

              <span>
                Budget
              </span>

              <strong>
                {formatMoney(
                  monthlyBudget
                )}
              </strong>

            </div>

            <div className="budget-box budget-box-red">

              <div className="budget-icon">
                💸
              </div>

              <span>
                Spent
              </span>

              <strong>
                {formatMoney(
                  budgetSpent
                )}
              </strong>

            </div>

            <div className="budget-box budget-box-green">

              <div className="budget-icon">
                💰
              </div>

              <span>
                Remaining
              </span>

              <strong>
                {formatMoney(
                  budgetRemaining
                )}
              </strong>

            </div>

          </div>

          <div className="budget-progress">

            <div
              className="budget-progress-fill"
              style={{
                width: `${progressWidth}%`,
              }}
            />

          </div>

          <div className="budget-percentage">

            {monthlyBudget === 0
              ? "0% used"
              : `${Math.round(
                  budgetPercentage
                )}% used`}

          </div>

          <div
            className={`budget-status ${
              monthlyBudget ===
              0
                ? "budget-neutral"
                : budgetRemaining <
                  0
                ? "budget-danger"
                : budgetPercentage >=
                  80
                ? "budget-warning"
                : "budget-success"
            }`}
          >

            {monthlyBudget ===
            0
              ? "Set your monthly budget to start tracking your budget."
              : budgetRemaining <
                0
              ? "You have exceeded your budget."
              : budgetPercentage >=
                80
              ? "You're close to your budget limit."
              : "You're within your budget."}

          </div>

          <form
            className="budget-form"
            onSubmit={
              handleBudgetSubmit
            }
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

        {/* =================================================
            EXPENSE ANALYTICS
        ================================================= */}

        <section className="card analytics-card">

          <div className="section-heading">

            <h2>
              📊 Expense Analytics
            </h2>

          </div>

          <div className="charts-grid">

            {/* ===========================================
                CATEGORY CHART
            =========================================== */}

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
                        innerRadius="35%"
                        outerRadius="68%"
                      >

                        {categoryChartData.map(
                          (
                            item,
                            index
                          ) => (
                            <Cell
                              key={
                                item.name
                              }
                              fill={
                                CATEGORY_COLORS[
                                  index %
                                    CATEGORY_COLORS.length
                                ]
                              }
                            />
                          )
                        )}

                      </Pie>

                      <Tooltip
                        formatter={(
                          value
                        ) =>
                          formatMoney(
                            value
                          )
                        }
                      />

                      <Legend />

                    </PieChart>

                  </ResponsiveContainer>

                ) : (

                  <div className="empty-chart">

                    <div>
                      📊
                    </div>

                    <p>
                      Add expenses to
                      see your category
                      chart.
                    </p>

                  </div>

                )}

              </div>

            </div>

            {/* ===========================================
                INCOME VS EXPENSE
            =========================================== */}

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

                    <YAxis
                      domain={[
                        0,
                        "auto",
                      ]}
                    />

                    <Tooltip
                      formatter={(
                        value
                      ) =>
                        formatMoney(
                          value
                        )
                      }
                    />

                    <Bar
                      dataKey="amount"
                      radius={[
                        8,
                        8,
                        0,
                        0,
                      ]}
                    >

                      <Cell
                        fill="#22C55E"
                      />

                      <Cell
                        fill="#EF4444"
                      />

                    </Bar>

                  </BarChart>

                </ResponsiveContainer>

              </div>

            </div>

            {/* ===========================================
                DAILY EXPENSE TREND
            =========================================== */}

            <div className="chart-card chart-full-width">

              <h3>
                Daily Expense Trend
              </h3>

              <div className="chart-container">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <LineChart
                    data={
                      dailyExpenseData
                    }
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="day"
                    />

                    <YAxis
                      domain={[
                        0,
                        "auto",
                      ]}
                    />

                    <Tooltip
                      formatter={(
                        value
                      ) =>
                        formatMoney(
                          value
                        )
                      }
                    />

                    <Line
                      type="monotone"
                      dataKey="amount"
                      name="Daily Expenses (₹)"
                      stroke="#EF4444"
                      strokeWidth={3}
                      dot={{
                        r: 3,
                      }}
                      activeDot={{
                        r: 6,
                      }}
                    />

                  </LineChart>

                </ResponsiveContainer>

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            ADD TRANSACTION
        ================================================= */}

        <section className="card">

          <div className="section-heading">

            <h2>
              {editingId !== null
                ? "✏️ Edit Transaction"
                : "➕ Add Transaction"}
            </h2>

          </div>

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
                    (
                      category
                    ) => (
                      <option
                        key={
                          category
                        }
                        value={
                          category
                        }
                      >
                        {
                          category
                        }
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

            <div className="transaction-actions">

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
                  onClick={
                    cancelEdit
                  }
                >
                  Cancel
                </button>
              )}

            </div>

          </form>

        </section>

        {/* =================================================
            TRANSACTION HISTORY
        ================================================= */}

        <section className="card">

          <div className="section-heading">

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
                (
                  category
                ) => (
                  <option
                    key={
                      category
                    }
                    value={
                      category
                    }
                  >
                    {
                      category
                    }
                  </option>
                )
              )}

            </select>

            <select
              className="history-month-filter"
              value={historyMonth}
              onChange={(e) =>
                setHistoryMonth(e.target.value)
              }
            >
              <option value="all">
                All Months
              </option>
              <option value="selected">
                Selected Month ({selectedMonth})
              </option>
            </select>

            <select
              className="history-sort"
              value={sortOption}
              onChange={(e) =>
                setSortOption(e.target.value)
              }
            >
              <option value="newest">
                Newest First
              </option>
              <option value="oldest">
                Oldest First
              </option>
              <option value="amountHigh">
                Amount: High to Low
              </option>
              <option value="amountLow">
                Amount: Low to High
              </option>
              <option value="description">
                Description: A to Z
              </option>
            </select>

          </div>

          <div className="history-summary">
            <span>
              Showing <strong>{filteredTransactions.length}</strong> of <strong>{transactions.length}</strong> transactions
            </span>

            {duplicateIds.size > 0 && (
              <span className="duplicate-summary">
                ⚠️ {duplicateIds.size} possible duplicate {duplicateIds.size === 1 ? "entry" : "entries"} detected
              </span>
            )}
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
                      e.target
                        .value
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
                Select transaction
                to download
              </option>

              {transactions.map(
                (
                  transaction
                ) => (
                  <option
                    key={
                      transaction.id
                    }
                    value={
                      transaction.id
                    }
                  >
                    {
                      transaction.date
                    }
                    {" — "}
                    {
                      transaction.description
                    }
                    {" — "}
                    {formatMoney(
                      transaction.amount
                    )}
                  </option>
                )
              )}

            </select>

          </div>

          <div className="transaction-list">

            {filteredTransactions.length ===
            0 ? (

              <div className="empty-message">
                No transactions found.
              </div>

            ) : (

              filteredTransactions.map(
                (
                  transaction
                ) => (

                  <div
                    className={`transaction-item ${
                      duplicateIds.has(transaction.id)
                        ? "possible-duplicate"
                        : ""
                    }`}
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

                      {duplicateIds.has(
                        transaction.id
                      ) && (
                        <span className="duplicate-badge">
                          ⚠️ Possible duplicate
                        </span>
                      )}

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

                        {formatMoney(
                          transaction.amount
                        )}

                      </strong>

                      <div className="transaction-buttons">

                        <button
                          className="edit-btn"
                          type="button"
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
                          type="button"
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
                          type="button"
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