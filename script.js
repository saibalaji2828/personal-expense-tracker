/* =========================================================
   PERSONAL EXPENSE TRACKER
   ACCOUNT + PROFILE + PASSWORD + DASHBOARD
   ========================================================= */


const $ = (id) => document.getElementById(id);


/* =========================================================
   PROFILE ELEMENTS
   ========================================================= */

const profilePage = $("profilePage");
const appContent = $("appContent");
const profileForm = $("profileForm");

const profileButton = $("profileButton");
const profilePopup = $("profilePopup");
const closeProfile = $("closeProfile");

const editProfileButton = $("editProfileButton");
const changePasswordButton = $("changePasswordButton");
const switchAccountButton = $("switchAccountButton");
const createAccountButton = $("createAccountButton");
const logoutButton = $("logoutButton");

const profileName = $("profileName");
const profileGender = $("profileGender");
const profileAge = $("profileAge");
const profileOccupation = $("profileOccupation");
const profileEmail = $("profileEmail");
const profilePhone = $("profilePhone");
const profilePassword = $("profilePassword");

const displayProfileName = $("displayProfileName");
const displayProfileGender = $("displayProfileGender");
const displayProfileAge = $("displayProfileAge");
const displayProfileOccupation = $("displayProfileOccupation");
const displayProfileEmail = $("displayProfileEmail");
const displayProfilePhone = $("displayProfilePhone");


/* =========================================================
   LOGOUT MODAL
   ========================================================= */

const logoutModal = $("logoutModal");
const closeLogoutModal = $("closeLogoutModal");
const cancelLogoutButton = $("cancelLogoutButton");
const confirmLogoutButton = $("confirmLogoutButton");
const logoutPassword = $("logoutPassword");
const forgotPasswordButton = $("forgotPasswordButton");


/* =========================================================
   PASSWORD MODAL
   ========================================================= */

const passwordModal = $("passwordModal");
const closePasswordModal = $("closePasswordModal");
const cancelPasswordButton = $("cancelPasswordButton");

const verifyIdentity = $("verifyIdentity");
const verifyIdentityButton = $("verifyIdentityButton");

const newPasswordFields = $("newPasswordFields");
const newPassword = $("newPassword");
const confirmNewPassword = $("confirmNewPassword");

const saveNewPasswordButton = $("saveNewPasswordButton");

const passwordModalTitle = $("passwordModalTitle");
const passwordModalMessage = $("passwordModalMessage");


/* =========================================================
   ACCOUNT LIST
   ========================================================= */

const accountListModal = $("accountListModal");
const closeAccountListModal = $("closeAccountListModal");
const accountList = $("accountList");
const newAccountFromListButton =
    $("newAccountFromListButton");


/* =========================================================
   TRANSACTION ELEMENTS
   ========================================================= */

const transactionForm = $("transactionForm");

const descriptionInput = $("description");
const amountInput = $("amount");
const categoryInput = $("category");
const typeInput = $("type");
const dateInput = $("date");

const transactionList = $("transactionList");

const balanceElement = $("balance");
const incomeElement = $("income");
const expenseElement = $("expense");

const searchInput = $("search");
const filterType = $("filterType");
const filterCategory = $("filterCategory");


/* =========================================================
   MONTHLY ELEMENTS
   ========================================================= */

const selectedMonthInput =
    $("selectedMonth");

const monthlyIncomeElement =
    $("monthlyIncome");

const monthlyExpensesElement =
    $("monthlyExpenses");

const monthlySavingsElement =
    $("monthlySavings");

const averageExpenseElement =
    $("averageExpense");

const savingsRateElement =
    $("savingsRate");

const highestCategoryElement =
    $("highestCategory");


/* =========================================================
   BUDGET
   ========================================================= */

const monthlyBudgetElement =
    $("monthlyBudget");

const budgetSpentElement =
    $("budgetSpent");

const budgetRemainingElement =
    $("budgetRemaining");

const budgetProgressBar =
    $("budgetProgressBar");

const budgetPercentage =
    $("budgetPercentage");

const budgetMessage =
    $("budgetMessage");

const budgetForm =
    $("budgetForm");

const budgetInput =
    $("budgetInput");


/* =========================================================
   CHARTS
   ========================================================= */

const categoryChartCanvas =
    $("categoryChart");

const incomeExpenseChartCanvas =
    $("incomeExpenseChart");

const expenseTrendChartCanvas =
    $("expenseTrendChart");

let categoryChart = null;
let incomeExpenseChart = null;
let expenseTrendChart = null;


/* =========================================================
   DOWNLOAD
   ========================================================= */

const downloadTransaction =
    $("downloadTransaction");

const downloadImageBtn =
    $("downloadImageBtn");


/* =========================================================
   THEME
   ========================================================= */

const themeToggle =
    $("themeToggle");


/* =========================================================
   ACCOUNT VARIABLES
   ========================================================= */

let accounts = [];

let currentAccountId =
    localStorage.getItem(
        "expenseTrackerCurrentAccount"
    );

let currentAccount = null;

let transactions = [];

let monthlyBudget = 10000;

let passwordResetVerified = false;


/* =========================================================
   LOAD ACCOUNTS
   ========================================================= */

function loadAccounts() {

    try {

        accounts = JSON.parse(
            localStorage.getItem(
                "expenseTrackerAccounts"
            ) || "[]"
        );

        if (!Array.isArray(accounts)) {
            accounts = [];
        }

    } catch (error) {

        console.error(
            "Unable to load accounts:",
            error
        );

        accounts = [];

    }

}


/* =========================================================
   SAVE ACCOUNTS
   ========================================================= */

function saveAccounts() {

    localStorage.setItem(
        "expenseTrackerAccounts",
        JSON.stringify(accounts)
    );

}


/* =========================================================
   GET CURRENT ACCOUNT
   ========================================================= */

function getCurrentAccount() {

    return accounts.find(
        function (account) {

            return (
                account.id ===
                currentAccountId
            );

        }
    ) || null;

}


/* =========================================================
   SET CURRENT ACCOUNT
   ========================================================= */

function setCurrentAccount(account) {

    currentAccountId =
        account.id;

    currentAccount =
        account;

    localStorage.setItem(
        "expenseTrackerCurrentAccount",
        account.id
    );

}


/* =========================================================
   ACCOUNT STORAGE KEYS
   ========================================================= */

function transactionStorageKey() {

    return (
        "transactions_" +
        currentAccountId
    );

}


function budgetStorageKey() {

    return (
        "monthlyBudget_" +
        currentAccountId
    );

}


/* =========================================================
   LOAD ACCOUNT DATA
   ========================================================= */

function loadAccountData() {

    if (!currentAccountId) {

        transactions = [];

        monthlyBudget = 10000;

        return;

    }


    try {

        transactions =
            JSON.parse(
                localStorage.getItem(
                    transactionStorageKey()
                ) || "[]"
            );

        if (!Array.isArray(transactions)) {
            transactions = [];
        }

    } catch (error) {

        transactions = [];

    }


    const savedBudget =
        Number(
            localStorage.getItem(
                budgetStorageKey()
            )
        );


    if (
        Number.isFinite(savedBudget) &&
        savedBudget > 0
    ) {

        monthlyBudget =
            savedBudget;

    } else {

        monthlyBudget =
            10000;

    }

}


/* =========================================================
   SAVE TRANSACTIONS
   ========================================================= */

function saveTransactions() {

    if (!currentAccountId) {
        return;
    }

    localStorage.setItem(
        transactionStorageKey(),
        JSON.stringify(transactions)
    );

}


/* =========================================================
   SAVE BUDGET
   ========================================================= */

function saveBudget() {

    if (!currentAccountId) {
        return;
    }

    localStorage.setItem(
        budgetStorageKey(),
        String(monthlyBudget)
    );

}


/* =========================================================
   MONEY FORMAT
   ========================================================= */

function money(value) {

    return (
        "₹" +
        Number(value || 0)
            .toLocaleString(
                "en-IN",
                {
                    maximumFractionDigits: 2
                }
            )
    );

}


/* =========================================================
   PHONE NORMALIZATION
   ========================================================= */

function normalizePhone(value) {

    return String(value || "")
        .replace(/\D/g, "");

}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHtml(value) {

    const div =
        document.createElement("div");

    div.textContent =
        String(value ?? "");

    return div.innerHTML;

}


/* =========================================================
   TOAST
   ========================================================= */

function toast(
    message,
    type = "success"
) {

    const oldToast =
        document.querySelector(".toast");

    if (oldToast) {
        oldToast.remove();
    }


    const toastElement =
        document.createElement("div");

    toastElement.className =
        "toast " + type;

    toastElement.textContent =
        message;


    document.body.appendChild(
        toastElement
    );


    setTimeout(
        function () {

            toastElement.remove();

        },
        2500
    );

}


/* =========================================================
   SHOW PROFILE SETUP
   ========================================================= */

function showProfileSetup() {

    profilePage.style.display =
        "flex";

    appContent.style.display =
        "none";


    profileForm.reset();


    profilePassword.value =
        "";


    profilePassword.required =
        true;

}


/* =========================================================
   SHOW DASHBOARD
   ========================================================= */

function showDashboard() {

    profilePage.style.display =
        "none";

    appContent.style.display =
        "block";

}


/* =========================================================
   FILL PROFILE FORM
   ========================================================= */

function fillProfileForm() {

    if (!currentAccount) {
        return;
    }


    profileName.value =
        currentAccount.profile.name || "";


    profileGender.value =
        currentAccount.profile.gender || "";


    profileAge.value =
        currentAccount.profile.age || "";


    profileOccupation.value =
        currentAccount.profile.occupation || "";


    profileEmail.value =
        currentAccount.profile.email || "";


    profilePhone.value =
        currentAccount.profile.phone || "";


    /*
       Password is never automatically
       shown when editing the profile.
    */

    profilePassword.value =
        "";

}


/* =========================================================
   DISPLAY PROFILE
   ========================================================= */

function displayProfile() {

    if (!currentAccount) {
        return;
    }


    displayProfileName.textContent =
        currentAccount.profile.name ||
        "—";


    displayProfileGender.textContent =
        currentAccount.profile.gender ||
        "—";


    displayProfileAge.textContent =
        currentAccount.profile.age
            ? currentAccount.profile.age +
              " years"
            : "—";


    displayProfileOccupation.textContent =
        currentAccount.profile.occupation ||
        "—";


    displayProfileEmail.textContent =
        currentAccount.profile.email ||
        "—";


    displayProfilePhone.textContent =
        currentAccount.profile.phone ||
        "—";

}


/* =========================================================
   INITIAL ACCOUNT LOAD
   ========================================================= */

function loadApplication() {

    loadAccounts();

    currentAccount =
        getCurrentAccount();


    if (currentAccount) {

        showDashboard();

        loadAccountData();

        displayProfile();

        updateAll();

    } else {

        showProfileSetup();

    }

}


/* =========================================================
   CREATE ACCOUNT / EDIT PROFILE
   ========================================================= */

profileForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const name =
            profileName.value.trim();

        const gender =
            profileGender.value;

        const age =
            profileAge.value;

        const occupation =
            profileOccupation.value;

        const email =
            profileEmail.value
                .trim()
                .toLowerCase();

        const phone =
            normalizePhone(
                profilePhone.value
            );

        const password =
            profilePassword.value;


        /* VALIDATION */

        if (!name) {

            toast(
                "Please enter your name.",
                "error"
            );

            profileName.focus();

            return;

        }


        if (!gender) {

            toast(
                "Please select your gender.",
                "error"
            );

            profileGender.focus();

            return;

        }


        if (
            !age ||
            Number(age) < 1 ||
            Number(age) > 120
        ) {

            toast(
                "Please enter a valid age.",
                "error"
            );

            profileAge.focus();

            return;

        }


        if (!occupation) {

            toast(
                "Please select your occupation.",
                "error"
            );

            profileOccupation.focus();

            return;

        }


        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
                .test(email)
        ) {

            toast(
                "Please enter a valid email.",
                "error"
            );

            profileEmail.focus();

            return;

        }


        if (
            !/^\d{10}$/.test(phone)
        ) {

            toast(
                "Please enter a valid 10-digit phone number.",
                "error"
            );

            profilePhone.focus();

            return;

        }


        /*
           Password is required only when
           creating a new account.
        */

        if (
            !currentAccount &&
            password.length < 6
        ) {

            toast(
                "Password must be at least 6 characters.",
                "error"
            );

            profilePassword.focus();

            return;

        }


        /*
           Check duplicate email / phone.
        */

        const duplicate =
            accounts.find(
                function (account) {

                    return (
                        account.id !==
                        currentAccountId &&
                        (
                            account.profile.email ===
                                email ||

                            account.profile.phone ===
                                phone
                        )
                    );

                }
            );


        if (duplicate) {

            toast(
                "That email or phone number is already registered.",
                "error"
            );

            return;

        }


        /* =================================================
           EDIT EXISTING PROFILE
           ================================================= */

        if (currentAccount) {

            currentAccount.profile.name =
                name;

            currentAccount.profile.gender =
                gender;

            currentAccount.profile.age =
                age;

            currentAccount.profile.occupation =
                occupation;

            currentAccount.profile.email =
                email;

            currentAccount.profile.phone =
                phone;


            /*
               If a new password was entered
               while editing, update it.
            */

            if (password) {

                if (password.length < 6) {

                    toast(
                        "Password must be at least 6 characters.",
                        "error"
                    );

                    return;

                }

                currentAccount.profile.password =
                    password;

            }


            saveAccounts();

            displayProfile();

            showDashboard();

            toast(
                "Profile updated successfully.",
                "success"
            );

            return;

        }


        /* =================================================
           CREATE NEW ACCOUNT
           ================================================= */

        const newAccount = {

            id:
                "account_" +
                Date.now() +
                "_" +
                Math.random()
                    .toString(36)
                    .substring(2, 8),

            profile: {

                name:
                    name,

                gender:
                    gender,

                age:
                    age,

                occupation:
                    occupation,

                email:
                    email,

                phone:
                    phone,

                password:
                    password

            }

        };


        accounts.push(
            newAccount
        );


        saveAccounts();


        setCurrentAccount(
            newAccount
        );


        /*
           Every new account gets
           completely separate data.
        */

        transactions = [];

        monthlyBudget = 10000;

        saveTransactions();

        saveBudget();


        showDashboard();

        displayProfile();

        updateAll();


        toast(
            "Account created successfully.",
            "success"
        );

    }
);


/* =========================================================
   PROFILE POPUP
   ========================================================= */

profileButton.addEventListener(
    "click",
    function () {

        displayProfile();

        profilePopup.classList.add(
            "show"
        );

    }
);


closeProfile.addEventListener(
    "click",
    function () {

        profilePopup.classList.remove(
            "show"
        );

    }
);


profilePopup.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            profilePopup
        ) {

            profilePopup.classList.remove(
                "show"
            );

        }

    }
);


/* =========================================================
   EDIT PROFILE
   ========================================================= */

editProfileButton.addEventListener(
    "click",
    function () {

        profilePopup.classList.remove(
            "show"
        );


        appContent.style.display =
            "none";


        profilePage.style.display =
            "flex";


        fillProfileForm();


        /*
           Password is optional while editing.
        */

        profilePassword.required =
            false;


        profileName.focus();

    }
);


/* =========================================================
   CREATE ANOTHER ACCOUNT
   ========================================================= */

createAccountButton.addEventListener(
    "click",
    function () {

        profilePopup.classList.remove(
            "show"
        );


        currentAccountId =
            null;

        currentAccount =
            null;


        localStorage.removeItem(
            "expenseTrackerCurrentAccount"
        );


        showProfileSetup();


        profilePassword.required =
            true;


        profileName.focus();

    }
);


/* =========================================================
   SWITCH ACCOUNT
   ========================================================= */

function openAccountList() {

    accountList.innerHTML = "";


    if (!accounts.length) {

        accountList.innerHTML =
            "<p>No accounts found.</p>";

    }


    accounts.forEach(
        function (account) {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "account-list-item";


            button.innerHTML =

                "<strong>" +
                escapeHtml(
                    account.profile.name
                ) +
                "</strong>" +

                "<span>" +
                escapeHtml(
                    account.profile.email
                ) +
                "</span>";


            button.addEventListener(
                "click",
                function () {

                    setCurrentAccount(
                        account
                    );


                    loadAccountData();


                    accountListModal.classList.remove(
                        "show"
                    );


                    showDashboard();

                    displayProfile();

                    updateAll();


                    toast(
                        "Switched to " +
                        account.profile.name +
                        ".",
                        "success"
                    );

                }
            );


            accountList.appendChild(
                button
            );

        }
    );


    accountListModal.classList.add(
        "show"
    );

}


switchAccountButton.addEventListener(
    "click",
    function () {

        profilePopup.classList.remove(
            "show"
        );

        openAccountList();

    }
);


closeAccountListModal.addEventListener(
    "click",
    function () {

        accountListModal.classList.remove(
            "show"
        );

    }
);


accountListModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            accountListModal
        ) {

            accountListModal.classList.remove(
                "show"
            );

        }

    }
);


newAccountFromListButton.addEventListener(
    "click",
    function () {

        accountListModal.classList.remove(
            "show"
        );


        currentAccountId =
            null;

        currentAccount =
            null;


        localStorage.removeItem(
            "expenseTrackerCurrentAccount"
        );


        showProfileSetup();

        profilePassword.required =
            true;

        profileName.focus();

    }
);


/* =========================================================
   LOGOUT
   ========================================================= */

function openLogoutModal() {

    logoutPassword.value =
        "";


    logoutModal.classList.add(
        "show"
    );


    setTimeout(
        function () {

            logoutPassword.focus();

        },
        50
    );

}


function closeLogout() {

    logoutModal.classList.remove(
        "show"
    );

}


logoutButton.addEventListener(
    "click",
    openLogoutModal
);


closeLogoutModal.addEventListener(
    "click",
    closeLogout
);


cancelLogoutButton.addEventListener(
    "click",
    closeLogout
);


/* =========================================================
   CONFIRM LOGOUT
   ========================================================= */

confirmLogoutButton.addEventListener(
    "click",
    function () {

        if (!currentAccount) {
            return;
        }


        if (
            logoutPassword.value !==
            currentAccount.profile.password
        ) {

            toast(
                "Incorrect password.",
                "error"
            );

            logoutPassword.focus();

            return;

        }


        closeLogout();


        profilePopup.classList.remove(
            "show"
        );


        currentAccountId =
            null;

        currentAccount =
            null;


        localStorage.removeItem(
            "expenseTrackerCurrentAccount"
        );


        showProfileSetup();


        toast(
            "Logged out successfully.",
            "success"
        );

    }
);


/* =========================================================
   PASSWORD RESET
   ========================================================= */

function openPasswordModal(
    mode = "change"
) {

    passwordResetVerified =
        false;


    verifyIdentity.value =
        "";

    newPassword.value =
        "";

    confirmNewPassword.value =
        "";


    newPasswordFields.style.display =
        "none";


    verifyIdentityButton.style.display =
        "block";


    saveNewPasswordButton.style.display =
        "none";


    if (mode === "forgot") {

        passwordModalTitle.textContent =
            "Forgot Password";

    } else {

        passwordModalTitle.textContent =
            "Change Password";

    }


    passwordModalMessage.textContent =
        "Enter your registered email or phone number.";


    passwordModal.classList.add(
        "show"
    );


    setTimeout(
        function () {

            verifyIdentity.focus();

        },
        50
    );

}


function closePasswordModalFunction() {

    passwordModal.classList.remove(
        "show"
    );

}


/* =========================================================
   CHANGE PASSWORD
   ========================================================= */

changePasswordButton.addEventListener(
    "click",
    function () {

        profilePopup.classList.remove(
            "show"
        );

        openPasswordModal(
            "change"
        );

    }
);


/* =========================================================
   FORGOT PASSWORD
   ========================================================= */

forgotPasswordButton.addEventListener(
    "click",
    function () {

        closeLogout();

        openPasswordModal(
            "forgot"
        );

    }
);


closePasswordModal.addEventListener(
    "click",
    closePasswordModalFunction
);


cancelPasswordButton.addEventListener(
    "click",
    closePasswordModalFunction
);


/* =========================================================
   VERIFY EMAIL / PHONE
   ========================================================= */

verifyIdentityButton.addEventListener(
    "click",
    function () {

        if (!currentAccount) {

            toast(
                "No active account found.",
                "error"
            );

            return;

        }


        const entered =
            verifyIdentity.value
                .trim()
                .toLowerCase();


        const enteredPhone =
            normalizePhone(
                entered
            );


        const registeredEmail =
            String(
                currentAccount.profile.email
            ).toLowerCase();


        const registeredPhone =
            normalizePhone(
                currentAccount.profile.phone
            );


        const emailMatches =
            entered ===
            registeredEmail;


        const phoneMatches =
            enteredPhone ===
            registeredPhone;


        if (
            !emailMatches &&
            !phoneMatches
        ) {

            toast(
                "Email or phone number does not match this account.",
                "error"
            );

            verifyIdentity.focus();

            return;

        }


        passwordResetVerified =
            true;


        newPasswordFields.style.display =
            "block";


        verifyIdentityButton.style.display =
            "none";


        saveNewPasswordButton.style.display =
            "block";


        newPassword.focus();


        toast(
            "Identity verified. Create your new password.",
            "success"
        );

    }
);


/* =========================================================
   SAVE NEW PASSWORD
   ========================================================= */

saveNewPasswordButton.addEventListener(
    "click",
    function () {

        if (
            !passwordResetVerified ||
            !currentAccount
        ) {

            return;

        }


        const password =
            newPassword.value;


        const confirmPassword =
            confirmNewPassword.value;


        if (
            password.length < 6
        ) {

            toast(
                "Password must be at least 6 characters.",
                "error"
            );

            newPassword.focus();

            return;

        }


        if (
            password !==
            confirmPassword
        ) {

            toast(
                "Passwords do not match.",
                "error"
            );

            confirmNewPassword.focus();

            return;

        }


        currentAccount.profile.password =
            password;


        saveAccounts();


        closePasswordModalFunction();


        toast(
            "Password changed successfully.",
            "success"
        );

    }
);


/* =========================================================
   DATE
   ========================================================= */

function setCurrentDate() {

    dateInput.value =
        new Date()
            .toISOString()
            .slice(0, 10);

}


function setCurrentMonth() {

    selectedMonthInput.value =
        new Date()
            .toISOString()
            .slice(0, 7);

}


/* =========================================================
   SUMMARY
   ========================================================= */

function updateSummary() {

    let income = 0;

    let expenses = 0;


    transactions.forEach(
        function (transaction) {

            if (
                transaction.type ===
                "income"
            ) {

                income +=
                    Number(
                        transaction.amount
                    );

            } else {

                expenses +=
                    Number(
                        transaction.amount
                    );

            }

        }
    );


    incomeElement.textContent =
        money(income);


    expenseElement.textContent =
        money(expenses);


    balanceElement.textContent =
        money(
            income - expenses
        );

}


/* =========================================================
   MONTHLY DATA
   ========================================================= */

function getMonthlyData() {

    const month =
        selectedMonthInput.value;


    const list =
        transactions.filter(
            function (transaction) {

                return String(
                    transaction.date
                ).startsWith(month);

            }
        );


    let income = 0;

    let expenses = 0;

    const categories = {};


    list.forEach(
        function (transaction) {

            const amount =
                Number(
                    transaction.amount
                );


            if (
                transaction.type ===
                "income"
            ) {

                income += amount;

            } else {

                expenses += amount;


                categories[
                    transaction.category
                ] =
                    (
                        categories[
                            transaction.category
                        ] || 0
                    ) + amount;

            }

        }
    );


    return {
        list,
        income,
        expenses,
        categories
    };

}


/* =========================================================
   MONTHLY ANALYTICS
   ========================================================= */

function updateMonthlyAnalytics() {

    const data =
        getMonthlyData();


    const expenseTransactions =
        data.list.filter(
            function (transaction) {

                return (
                    transaction.type ===
                    "expense"
                );

            }
        );


    const savings =
        data.income -
        data.expenses;


    const average =
        expenseTransactions.length
            ? data.expenses /
              expenseTransactions.length
            : 0;


    const savingsRate =
        data.income
            ? (
                savings /
                data.income
            ) * 100
            : 0;


    let highestCategory =
        "No expenses yet";


    let highestAmount =
        0;


    Object.entries(
        data.categories
    ).forEach(
        function ([category, amount]) {

            if (
                amount >
                highestAmount
            ) {

                highestAmount =
                    amount;

                highestCategory =
                    category;

            }

        }
    );


    monthlyIncomeElement.textContent =
        money(data.income);


    monthlyExpensesElement.textContent =
        money(data.expenses);


    monthlySavingsElement.textContent =
        money(savings);


    averageExpenseElement.textContent =
        money(average);


    savingsRateElement.textContent =
        savingsRate.toFixed(1) +
        "%";


    highestCategoryElement.textContent =
        highestCategory;

}


/* =========================================================
   BUDGET
   ========================================================= */

function updateBudget() {

    const data =
        getMonthlyData();


    const spent =
        data.expenses;


    const remaining =
        monthlyBudget -
        spent;


    const percentage =
        monthlyBudget
            ? Math.min(
                (
                    spent /
                    monthlyBudget
                ) * 100,
                100
            )
            : 0;


    monthlyBudgetElement.textContent =
        money(monthlyBudget);


    budgetSpentElement.textContent =
        money(spent);


    budgetRemainingElement.textContent =
        money(remaining);


    budgetProgressBar.style.width =
        percentage + "%";


    budgetPercentage.textContent =
        percentage.toFixed(1) +
        "% used";


    if (
        spent >
        monthlyBudget
    ) {

        budgetMessage.className =
            "budget-message danger";

        budgetMessage.textContent =
            "Budget exceeded";

    } else if (
        spent >
        monthlyBudget * 0.8
    ) {

        budgetMessage.className =
            "budget-message warning";

        budgetMessage.textContent =
            "You're close to your budget limit";

    } else {

        budgetMessage.className =
            "budget-message success";

        budgetMessage.textContent =
            "You're within your budget";

    }

}


/* =========================================================
   TRANSACTION FILTER
   ========================================================= */

function getFilteredTransactions() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    const selectedType =
        filterType.value;


    const selectedCategory =
        filterCategory.value;


    return transactions
        .filter(
            function (transaction) {

                const text =
                    (
                        transaction.description +
                        " " +
                        transaction.category +
                        " " +
                        transaction.type +
                        " " +
                        transaction.date
                    ).toLowerCase();


                const matchesSearch =
                    !search ||
                    text.includes(search);


                const matchesType =
                    selectedType ===
                    "all" ||
                    transaction.type ===
                    selectedType;


                const matchesCategory =
                    selectedCategory ===
                    "all" ||
                    transaction.category ===
                    selectedCategory;


                return (
                    matchesSearch &&
                    matchesType &&
                    matchesCategory
                );

            }
        )
        .sort(
            function (a, b) {

                return (
                    String(b.date)
                        .localeCompare(
                            String(a.date)
                        )
                );

            }
        );

}


/* =========================================================
   DISPLAY TRANSACTIONS
   ========================================================= */

function displayTransactions() {

    transactionList.innerHTML =
        "";


    const list =
        getFilteredTransactions();


    if (!list.length) {

        transactionList.innerHTML =
            `
            <p style="
                text-align:center;
                padding:20px;
                color:#888;
            ">
                No transactions found.
            </p>
            `;

        return;

    }


    list.forEach(
        function (transaction) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "transaction-item";


            item.innerHTML =

                `
                <div class="transaction-details">

                    <h4>
                        ${escapeHtml(
                            transaction.description
                        )}
                    </h4>

                    <p>
                        ${escapeHtml(
                            transaction.category
                        )}
                        •
                        ${escapeHtml(
                            transaction.date
                        )}
                        •
                        ${
                            transaction.type ===
                            "income"
                                ? "Income"
                                : "Expense"
                        }
                    </p>

                </div>


                <div class="
                    transaction-amount
                    ${transaction.type}
                ">

                    ${
                        transaction.type ===
                        "income"
                            ? "+"
                            : "-"
                    }

                    ${money(
                        transaction.amount
                    )}

                </div>


                <button
                    type="button"
                    class="delete-transaction"
                    title="Delete"
                >
                    🗑️
                </button>
                `;


            item
                .querySelector(
                    ".delete-transaction"
                )
                .addEventListener(
                    "click",
                    function () {

                        transactions =
                            transactions.filter(
                                function (t) {

                                    return (
                                        String(t.id) !==
                                        String(
                                            transaction.id
                                        )
                                    );

                                }
                            );


                        saveTransactions();

                        updateAll();


                        toast(
                            "Transaction deleted.",
                            "success"
                        );

                    }
                );


            transactionList.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   DOWNLOAD TRANSACTION LIST
   ========================================================= */

function updateDownloadTransactions() {

    const oldValue =
        downloadTransaction.value;


    downloadTransaction.innerHTML =
        `
        <option value="">
            Select transaction to download
        </option>
        `;


    getFilteredTransactions()
        .forEach(
            function (transaction) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    transaction.id;


                option.textContent =
                    `${transaction.description}
                     - ${money(transaction.amount)}
                     - ${transaction.date}`;


                downloadTransaction.appendChild(
                    option
                );

            }
        );


    if (
        [
            ...downloadTransaction.options
        ].some(
            function (option) {

                return (
                    option.value ===
                    oldValue
                );

            }
        )
    ) {

        downloadTransaction.value =
            oldValue;

    }

}


/* =========================================================
   ADD TRANSACTION
   ========================================================= */

transactionForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const description =
            descriptionInput.value.trim();

        const amount =
            Number(
                amountInput.value
            );

        const category =
            categoryInput.value;

        const type =
            typeInput.value;

        const date =
            dateInput.value;


        if (!description) {

            toast(
                "Please enter a description.",
                "error"
            );

            return;

        }


        if (
            !amount ||
            amount < 0
        ) {

            toast(
                "Please enter a valid amount.",
                "error"
            );

            return;

        }


        if (!category) {

            toast(
                "Please select a category.",
                "error"
            );

            return;

        }


        if (!type) {

            toast(
                "Please select a type.",
                "error"
            );

            return;

        }


        if (!date) {

            toast(
                "Please select a date.",
                "error"
            );

            return;

        }


        transactions.push({

            id:
                Date.now(),

            description:
                description,

            amount:
                amount,

            category:
                category,

            type:
                type,

            date:
                date

        });


        saveTransactions();


        transactionForm.reset();


        setCurrentDate();


        updateAll();


        toast(
            "Transaction added successfully.",
            "success"
        );

    }
);


/* =========================================================
   BUDGET FORM
   ========================================================= */

budgetForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const budget =
            Number(
                budgetInput.value
            );


        if (
            !budget ||
            budget <= 0
        ) {

            toast(
                "Enter a valid budget.",
                "error"
            );

            return;

        }


        monthlyBudget =
            budget;


        saveBudget();


        budgetInput.value =
            "";


        updateBudget();


        toast(
            "Budget updated successfully.",
            "success"
        );

    }
);


/* =========================================================
   FILTER EVENTS
   ========================================================= */

searchInput.addEventListener(
    "input",
    function () {

        displayTransactions();

        updateDownloadTransactions();

    }
);


filterType.addEventListener(
    "change",
    function () {

        displayTransactions();

        updateDownloadTransactions();

    }
);


filterCategory.addEventListener(
    "change",
    function () {

        displayTransactions();

        updateDownloadTransactions();

    }
);


/* =========================================================
   MONTH CHANGE
   ========================================================= */

selectedMonthInput.addEventListener(
    "change",
    function () {

        updateMonthlyAnalytics();

        updateBudget();

        updateCharts();

    }
);


/* =========================================================
   CHARTS
   ========================================================= */

function updateCharts() {

    if (
        typeof Chart ===
        "undefined"
    ) {

        return;

    }


    const data =
        getMonthlyData();


    /* CATEGORY CHART */

    const labels =
        Object.keys(
            data.categories
        );


    const values =
        Object.values(
            data.categories
        );


    if (categoryChart) {

        categoryChart.destroy();

    }


    categoryChart =
        new Chart(
            categoryChartCanvas,
            {

                type:
                    "doughnut",

                data: {

                    labels:
                        labels,

                    datasets: [

                        {
                            data:
                                values
                        }

                    ]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false

                }

            }
        );


    /* INCOME VS EXPENSE */

    if (incomeExpenseChart) {

        incomeExpenseChart.destroy();

    }


    incomeExpenseChart =
        new Chart(
            incomeExpenseChartCanvas,
            {

                type:
                    "bar",

                data: {

                    labels:
                        [
                            "Income",
                            "Expenses"
                        ],

                    datasets: [

                        {
                            label:
                                "Amount",

                            data:
                                [
                                    data.income,
                                    data.expenses
                                ]
                        }

                    ]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false

                }

            }
        );


    /* DAILY EXPENSE */

    const dailyExpenses =
        {};


    data.list
        .filter(
            function (transaction) {

                return (
                    transaction.type ===
                    "expense"
                );

            }
        )
        .forEach(
            function (transaction) {

                dailyExpenses[
                    transaction.date
                ] =
                    (
                        dailyExpenses[
                            transaction.date
                        ] || 0
                    ) +
                    Number(
                        transaction.amount
                    );

            }
        );


    const days =
        Object.keys(
            dailyExpenses
        ).sort();


    if (expenseTrendChart) {

        expenseTrendChart.destroy();

    }


    expenseTrendChart =
        new Chart(
            expenseTrendChartCanvas,
            {

                type:
                    "line",

                data: {

                    labels:
                        days,

                    datasets: [

                        {
                            label:
                                "Daily Expense",

                            data:
                                days.map(
                                    function (day) {

                                        return (
                                            dailyExpenses[
                                                day
                                            ]
                                        );

                                    }
                                ),

                            tension:
                                0.3,

                            fill:
                                false

                        }

                    ]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false

                }

            }
        );

}


/* =========================================================
   UPDATE EVERYTHING
   ========================================================= */

function updateAll() {

    displayTransactions();

    updateDownloadTransactions();

    updateSummary();

    updateMonthlyAnalytics();

    updateBudget();

    updateCharts();

}


/* =========================================================
   DOWNLOAD BILL
   ========================================================= */

downloadImageBtn.addEventListener(
    "click",
    async function () {

        const selectedId =
            downloadTransaction.value;


        const transaction =
            transactions.find(
                function (item) {

                    return (
                        String(item.id) ===
                        String(selectedId)
                    );

                }
            );


        if (!transaction) {

            toast(
                "Please select a transaction.",
                "error"
            );

            return;

        }


        if (
            typeof html2canvas ===
            "undefined"
        ) {

            toast(
                "Bill download library is not loaded.",
                "error"
            );

            return;

        }


        const bill =
            document.createElement(
                "div"
            );


        bill.style.cssText =

            `
            position:fixed;
            left:-10000px;
            top:0;
            width:420px;
            padding:30px;
            background:white;
            color:#111;
            font-family:Arial;
            border:1px solid #ddd;
            border-radius:12px;
            `;


        bill.innerHTML =

            `
            <h2>
                Personal Expense Tracker
            </h2>

            <hr>

            <p>
                <b>Description:</b>
                ${escapeHtml(
                    transaction.description
                )}
            </p>

            <p>
                <b>Category:</b>
                ${escapeHtml(
                    transaction.category
                )}
            </p>

            <p>
                <b>Type:</b>
                ${escapeHtml(
                    transaction.type
                )}
            </p>

            <p>
                <b>Date:</b>
                ${escapeHtml(
                    transaction.date
                )}
            </p>

            <p>
                <b>Amount:</b>
                ${money(
                    transaction.amount
                )}
            </p>

            `;


        document.body.appendChild(
            bill
        );


        try {

            const canvas =
                await html2canvas(
                    bill,
                    {
                        scale: 2
                    }
                );


            const link =
                document.createElement(
                    "a"
                );


            link.download =
                "expense-bill-" +
                transaction.id +
                ".png";


            link.href =
                canvas.toDataURL(
                    "image/png"
                );


            link.click();

        } finally {

            bill.remove();

        }

    }
);


/* =========================================================
   DARK / LIGHT MODE
   ========================================================= */

themeToggle.addEventListener(
    "click",
    function () {

        document.body.classList.toggle(
            "dark-mode"
        );


        const darkMode =
            document.body.classList.contains(
                "dark-mode"
            );


        localStorage.setItem(
            "expenseTrackerTheme",
            darkMode
                ? "dark"
                : "light"
        );


        themeToggle.textContent =
            darkMode
                ? "Light Mode"
                : "Dark Mode";

    }
);


/* =========================================================
   LOAD THEME
   ========================================================= */

if (
    localStorage.getItem(
        "expenseTrackerTheme"
    ) === "dark"
) {

    document.body.classList.add(
        "dark-mode"
    );

    themeToggle.textContent =
        "Light Mode";

}


/* =========================================================
   START APPLICATION
   ========================================================= */

setCurrentDate();

setCurrentMonth();

loadApplication();