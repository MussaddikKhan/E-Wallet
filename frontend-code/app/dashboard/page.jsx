"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  FiRefreshCw,
  FiLogOut,
  FiArrowUp,
  FiArrowDown,
  FiSend,
  FiUser,
  FiCreditCard,
  FiDollarSign,
  FiList,
  FiHome,
  FiPieChart,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { useApi } from "@/context/AppContext";

export default function DashboardPage() {
  const router = useRouter();
  const {
    token,
    getUserByPhone,
    getWalletBalance,
    getBankBalance,
    initiateTransaction,
    logout,
    clearError,
    isAuthenticated,
    loading: apiLoading,
  } = useApi();

  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(0);
  const [bankAccount, setBankAccount] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactionType, setTransactionType] = useState("");
  const [formData, setFormData] = useState({
    receiver: "",
    amount: "",
    transactionMethod: "",
  });

  const phoneNumber =
    typeof window !== "undefined" ? localStorage.getItem("phone") : null;

  // Fetch all dashboard data
  const fetchDashboardData = async (showToast = false) => {
    if (!isAuthenticated || !phoneNumber) return;

    try {
      setLoading(true);
      clearError();

      const [userData, walletBalance, bankBalance] = await Promise.all([
        getUserByPhone(phoneNumber),
        getWalletBalance(),
        getBankBalance(),
      ]);
      console.log(userData, walletBalance, bankBalance);

      setUser(userData);
      setWallet(walletBalance);
      setBankAccount(bankBalance);

      if (showToast) toast.success("Dashboard refreshed");
    } catch (error) {
      toast.error(error.message || "Failed to load dashboard");
      if (error.message.includes("401")) {
        logout();
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    try {
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        transactionMethod: transactionType,
      };

      const txnId = await initiateTransaction(transactionData);

      if (!txnId) {
        throw new Error("Transaction ID not returned from backend.");
      }

      // Optional: Wait before fetching message
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const txnResponse = await fetch(
        `http://localhost:8081/transaction/get/msg?txnId=${txnId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );
      const data = await txnResponse.json();
      const message = data.msg;
      const status = data.status;
      if (status == "FAILED") {
        toast.error(message);
      } else toast.success(message);

      await getTransactionData();
      await fetchDashboardData();
      setShowTransactionForm(false);
      setFormData({ receiver: "", amount: "", transactionMethod: "" });
    } catch (error) {
      toast.error(error.message || "Transaction failed");
    }
  };

  const getTransactionData = async () => {
    try {
      const token = localStorage.getItem("token"); // or get it from context/state

      const res = await fetch("http://localhost:8081/transaction/get", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Pass token here
        },
      });

      if (!res.ok) throw new Error("Failed to fetch transactions");
      const rawData = await res.json();

      // Optional: transform if needed
      const transformed = rawData.map((txn) => ({
        method: txn.transactionMethod,
        type: txn.transactionType.toLowerCase(),
        amount: txn.amount,
        sender: txn.sender,
        receiver: txn.receiver,
        fromCurrency: txn.fromCurrency,
        toCurrency: txn.toCurrency,
        txnStatus: txn.txnStatus,
        message: txn.message,
        date: new Date(txn.createdOn),
      }));
      console.log("Raw transactions:", transformed);
      setTransactions(transformed);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout(); // clears localStorage + state
    router.push("/login"); // redirects to login
  };

  // Initialize dashboard
  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
      getTransactionData();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-white text-gray-900">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center"
        >
          <motion.svg
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="h-12 w-12 text-indigo-600 mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.372 0 0 5.372 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </motion.svg>
          <p className="text-gray-600 font-medium">
            Loading your financial data...
          </p>
        </motion.div>
      </div>
    );
  }

  // Generate avatar based on phone number
  const generateAvatar = (phone) => {
    const seed = phone || "default";
    return `https://api.dicebear.com/7.x/identicon/svg?seed=${seed}`;
  };

  return (
    <div className="flex min-h-screen bg-gray-50 pt-16">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-800 text-white p-4 hidden md:block">
        <div className="flex items-center space-x-4 p-4 border-b border-indigo-700">
          <img
            src={generateAvatar(user?.username)}
            alt="User Avatar"
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="font-semibold">{user?.fullName || "User"}</p>
            <p className="text-xs text-indigo-200">{user?.username || ""}</p>
          </div>
        </div>

        <nav className="mt-6">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center w-full p-3 rounded-lg mb-2 ${
              activeTab === "dashboard"
                ? "bg-indigo-700"
                : "hover:bg-indigo-700"
            }`}
          >
            <FiHome className="mr-3" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab("wallet")}
            className={`flex items-center w-full p-3 rounded-lg mb-2 ${
              activeTab === "wallet" ? "bg-indigo-700" : "hover:bg-indigo-700"
            }`}
          >
            <FiDollarSign className="mr-3" />
            <span>Wallet</span>
          </button>

          <button
            onClick={() => setActiveTab("bank")}
            className={`flex items-center w-full p-3 rounded-lg mb-2 ${
              activeTab === "bank" ? "bg-indigo-700" : "hover:bg-indigo-700"
            }`}
          >
            <FiCreditCard className="mr-3" />
            <span>Bank Account</span>
          </button>

          <button
            onClick={() => setActiveTab("transactions")}
            className={`flex items-center w-full p-3 rounded-lg mb-2 ${
              activeTab === "transactions"
                ? "bg-indigo-700"
                : "hover:bg-indigo-700"
            }`}
          >
            <FiList className="mr-3" />
            <span>Transactions</span>
          </button>

          <button
            onClick={() => setActiveTab("reports")}
            className={`flex items-center w-full p-3 rounded-lg ${
              activeTab === "reports" ? "bg-indigo-700" : "hover:bg-indigo-700"
            }`}
          >
            <FiPieChart className="mr-3" />
            <span>Financial Reports</span>
          </button>
        </nav>

        <div className="mt-auto pt-4 border-t border-indigo-700">
          <button
            onClick={handleLogout}
            className="flex items-center w-full p-3 rounded-lg hover:bg-indigo-700 text-red-300 hover:text-red-200"
          >
            <FiLogOut className="mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {/* Mobile Header */}
          <div className="md:hidden flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold text-indigo-700">
              {activeTab === "dashboard" && "Dashboard"}
              {activeTab === "wallet" && "Wallet"}
              {activeTab === "bank" && "Bank Account"}
              {activeTab === "transactions" && "Transactions"}
              {activeTab === "reports" && "Financial Reports"}
            </h1>
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={apiLoading}
              className="text-indigo-600 disabled:opacity-50"
            >
              <FiRefreshCw className={apiLoading ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex justify-around bg-white shadow-md rounded-lg p-2 mb-6">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`p-2 rounded-md ${
                activeTab === "dashboard" ? "bg-indigo-100 text-indigo-700" : ""
              }`}
            >
              <FiHome className="mx-auto" />
            </button>
            <button
              onClick={() => setActiveTab("wallet")}
              className={`p-2 rounded-md ${
                activeTab === "wallet" ? "bg-indigo-100 text-indigo-700" : ""
              }`}
            >
              <FiDollarSign className="mx-auto" />
            </button>
            <button
              onClick={() => setActiveTab("bank")}
              className={`p-2 rounded-md ${
                activeTab === "bank" ? "bg-indigo-100 text-indigo-700" : ""
              }`}
            >
              <FiCreditCard className="mx-auto" />
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              className={`p-2 rounded-md ${
                activeTab === "transactions"
                  ? "bg-indigo-100 text-indigo-700"
                  : ""
              }`}
            >
              <FiList className="mx-auto" />
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`p-2 rounded-md ${
                activeTab === "reports" ? "bg-indigo-100 text-indigo-700" : ""
              }`}
            >
              <FiPieChart className="mx-auto" />
            </button>
          </div>

          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Wallet Card */}
                <div className="bg-white shadow-md rounded-xl p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-700 mb-1">
                        Wallet Balance
                      </h2>
                      <p className="text-3xl font-bold text-green-600">
                        {wallet.toFixed(2)}
                      </p>
                    </div>
                    {/* <FiDollarSign className="text-2xl text-green-500" /> */}
                  </div>
                  {/* <button 
                    onClick={() => {
                      setActiveTab('wallet');
                      setTransactionType('BANK_TO_WALLET');
                      setShowTransactionForm(true);
                    }}
                    className="mt-4 w-full bg-green-100 text-green-700 py-2 rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center"
                  >
                    <FiArrowDown className="mr-2" /> Add Funds
                  </button> */}
                </div>

                {/* Bank Card */}
                <div className="bg-white shadow-md rounded-xl p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-700 mb-1">
                        Bank Balance
                      </h2>
                      <p className="text-3xl font-bold text-blue-600">
                        {bankAccount.toFixed(2)}
                      </p>
                    </div>
                    <FiCreditCard className="text-2xl text-blue-500" />
                  </div>
                  {/* <button 
                    onClick={() => {
                      setActiveTab('bank');
                      setTransactionType('WALLET_TO_BANK');
                      setShowTransactionForm(true);
                    }}
                    className="mt-4 w-full bg-blue-100 text-blue-700 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center"
                  >
                    <FiArrowUp className="mr-2" /> Transfer to Bank
                  </button> */}
                </div>

                {/* Quick Actions Card */}
                <div className="bg-white shadow-md rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    Quick Actions
                  </h2>
                  <div className="space-y-3">
                    <button className="w-full bg-indigo-100 text-indigo-700 py-2 px-4 rounded-lg hover:bg-indigo-200 transition-colors flex items-center">
                      <FiSend className="mr-2" /> Send to Person
                      <span> It will be implemented</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("reports")}
                      className="w-full bg-purple-100 text-purple-700 py-2 px-4 rounded-lg hover:bg-purple-200 transition-colors flex items-center"
                    >
                      <FiPieChart className="mr-2" /> View Reports
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Transactions */}

              <div className="bg-white shadow-md rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    Recent Transactions
                  </h2>
                  <button
                    onClick={() => setActiveTab("transactions")}
                    className="text-indigo-600 hover:underline"
                  >
                    View All
                  </button>
                </div>

                {transactions.length > 0 ? (
                  <div className="space-y-4">
                    {transactions.map((txn, index) => (
                      <div
                        key={index}
                        className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg shadow-sm bg-gray-50"
                      >
                        <div className="flex items-center gap-3 mb-2 md:mb-0">
                          <div
                            className={`p-2 rounded-full text-xl ${
                              txn.type === "credit"
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {txn.type === "credit" ? (
                              <FiArrowDown />
                            ) : (
                              <FiArrowUp />
                            )}
                          </div>

                          <div>
                            <div className="text-sm text-gray-800 font-medium capitalize">
                              {txn.description ||
                                txn.method?.toLowerCase().replace(/_/g, " ")}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(txn.date).toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              Status:{" "}
                              <span
                                className={`font-semibold ${
                                  txn.txnStatus === "SUCCESSFUL"
                                    ? "text-green-600"
                                    : txn.txnStatus === "PENDING"
                                    ? "text-yellow-600"
                                    : "text-red-600"
                                }`}
                              >
                                {txn.txnStatus}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {txn.message}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-6 text-sm text-gray-700 w-full md:w-auto justify-between md:justify-start items-center">
                          <div>
                            <span className="block text-gray-500 text-xs">
                              Sender
                            </span>
                            <span className="font-medium">{txn.sender}</span>
                          </div>
                          <div>
                            <span className="block text-gray-500 text-xs">
                              Receiver
                            </span>
                            <span className="font-medium">{txn.receiver}</span>
                          </div>
                          <div>
                            <span className="block text-gray-500 text-xs">
                              Currency
                            </span>
                            <span className="font-medium">
                              {txn.fromCurrency} → {txn.toCurrency}
                            </span>
                          </div>
                          <div>
                            <span className="block text-gray-500 text-xs">
                              Amount
                            </span>
                            <span
                              className={`font-semibold ${
                                txn.type === "credit"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {txn.type === "credit" ? "+" : "-"}
                              {txn.amount.toFixed(2)} {""}
                              {txn.toCurrency}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No transactions yet</p>
                    <button
                      onClick={() => {
                        setActiveTab("transactions");
                        setTransactionType("BANK_TO_PERSON");
                        setShowTransactionForm(true);
                      }}
                      className="mt-2 text-indigo-600 hover:underline"
                    >
                      Make your first transaction
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Wallet Tab */}
          {activeTab === "wallet" && (
            <div className="bg-white shadow-md rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Your Wallet
                </h2>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setTransactionType("BANK_TO_WALLET");
                      setShowTransactionForm(true);
                    }}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center"
                  >
                    <FiArrowDown className="mr-2" /> Add Funds
                  </button>
                  <button
                    onClick={() => {
                      setTransactionType("WALLET_TO_BANK");
                      setShowTransactionForm(true);
                    }}
                    className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-200 flex items-center"
                  >
                    <FiArrowUp className="mr-2" /> To Bank
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm opacity-80">Available Balance</p>
                    <p className="text-4xl font-bold mt-2">
                      {wallet.toFixed(2)}
                    </p>
                  </div>
                  {/* <FiDollarSign className="text-3xl opacity-70" /> */}
                  <div className="text-3xl opacity-70">
                    {transactions[0]?.fromCurrency || "N/A"}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white border-opacity-20">
                  <p className="text-sm opacity-80">
                    Linked to: {user?.username || "Your account"}
                  </p>
                </div>
              </div>

              {/* Transaction History */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Wallet Transactions
                </h3>
                {transactions.filter((t) => t.method.includes("WALLET"))
                  .length > 0 ? (
                  <div className="space-y-3">
                    {transactions
                      .filter((t) => t.method.includes("WALLET"))
                      .map((txn, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium capitalize">
                              {txn.method.toLowerCase().replace(/_/g, " ")}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(txn.date).toLocaleString()}
                            </p>
                          </div>
                          <p
                            className={`font-semibold ${
                              txn.type === "credit"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {txn.type === "credit" ? "+" : "-"}
                            {txn.amount.toFixed(2)} {txn.toCurrency}
                          </p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No wallet transactions yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bank Tab */}
          {activeTab === "bank" && (
            <div className="bg-white shadow-md rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Bank Account
                </h2>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setTransactionType("WALLET_TO_BANK");
                      setShowTransactionForm(true);
                    }}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center"
                  >
                    <FiArrowUp className="mr-2" /> Transfer to Bank
                  </button>
                  <button
                    onClick={() => {
                      setTransactionType("BANK_TO_WALLET");
                      setShowTransactionForm(true);
                    }}
                    className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-200 flex items-center"
                  >
                    <FiArrowDown className="mr-2" /> To Wallet
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm opacity-80">Account Balance</p>
                    <p className="text-4xl font-bold mt-2">
                      {bankAccount.toFixed(2)}
                    </p>
                  </div>
                  <FiCreditCard className="text-3xl opacity-70" />
                </div>

                <div className="mt-6 pt-4 border-t border-white border-opacity-20">
                  <p className="text-sm opacity-80">
                    Linked to: {user?.fullName || "Your account"}
                  </p>
                </div>
              </div>

              {/* Transaction History */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Bank Transactions
                </h3>
                {transactions.filter((t) => t.method.includes("BANK")).length >
                0 ? (
                  <div className="space-y-3">
                    {transactions
                      .filter((t) => t.method.includes("BANK"))
                      .map((txn, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium capitalize">
                              {txn.method.toLowerCase().replace(/_/g, " ")}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(txn.date).toLocaleString()}
                            </p>
                          </div>
                          <p
                            className={`font-semibold ${
                              txn.type === "credit"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {txn.type === "credit" ? "+" : "-"}
                            {txn.amount.toFixed(2)} {txn.toCurrency}
                          </p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No bank transactions yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === "transactions" && (
            <div className="bg-white shadow-md rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Transaction History
                </h2>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setTransactionType("BANK_TO_PERSON");
                      setShowTransactionForm(true);
                    }}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center"
                  >
                    <FiSend className="mr-2" /> New Transaction
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <button
                  onClick={() => {
                    setTransactionType("BANK_TO_WALLET");
                    setShowTransactionForm(true);
                  }}
                  className="bg-indigo-100 text-indigo-700 p-4 rounded-lg hover:bg-indigo-200 transition-colors"
                >
                  <div className="flex items-center">
                    <FiArrowDown className="text-xl mr-3" />
                    <div>
                      <h3 className="font-semibold">Bank to Wallet</h3>
                      <p className="text-sm text-gray-600">
                        Transfer from bank to wallet
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setTransactionType("BANK_TO_PERSON");
                    setShowTransactionForm(true);
                  }}
                  className="bg-indigo-100 text-indigo-700 p-4 rounded-lg hover:bg-indigo-200 transition-colors"
                >
                  <div className="flex items-center">
                    <FiSend className="text-xl mr-3" />
                    <div>
                      <h3 className="font-semibold">Bank to Person</h3>
                      <p className="text-sm text-gray-600">
                        Send money from bank
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setTransactionType("WALLET_TO_PERSON");
                    setShowTransactionForm(true);
                  }}
                  className="bg-indigo-100 text-indigo-700 p-4 rounded-lg hover:bg-indigo-200 transition-colors"
                >
                  <div className="flex items-center">
                    <FiSend className="text-xl mr-3" />
                    <div>
                      <h3 className="font-semibold">Wallet to Person</h3>
                      <p className="text-sm text-gray-600">
                        Send money from wallet
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              <div className="bg-white shadow-md rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    Recent Transactions
                  </h2>
                  <button
                    onClick={() => setActiveTab("transactions")}
                    className="text-indigo-600 hover:underline"
                  >
                    View All
                  </button>
                </div>

                {transactions.length > 0 ? (
                  <div className="space-y-4">
                    {transactions.map((txn, index) => (
                      <div
                        key={index}
                        className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg shadow-sm bg-gray-50"
                      >
                        <div className="flex items-center gap-3 mb-2 md:mb-0">
                          <div
                            className={`p-2 rounded-full text-xl ${
                              txn.type === "credit"
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {txn.type === "credit" ? (
                              <FiArrowDown />
                            ) : (
                              <FiArrowUp />
                            )}
                          </div>

                          <div>
                            <div className="text-sm text-gray-800 font-medium capitalize">
                              {txn.description ||
                                txn.method?.toLowerCase().replace(/_/g, " ")}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(txn.date).toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              Status:{" "}
                              <span
                                className={`font-semibold ${
                                  txn.txnStatus === "SUCCESS"
                                    ? "text-green-600"
                                    : txn.txnStatus === "PENDING"
                                    ? "text-yellow-600"
                                    : "text-red-600"
                                }`}
                              >
                                {txn.txnStatus}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-6 text-sm text-gray-700 w-full md:w-auto justify-between md:justify-start items-center">
                          <div>
                            <span className="block text-gray-500 text-xs">
                              Sender
                            </span>
                            <span className="font-medium">{txn.sender}</span>
                          </div>
                          <div>
                            <span className="block text-gray-500 text-xs">
                              Receiver
                            </span>
                            <span className="font-medium">{txn.receiver}</span>
                          </div>
                          <div>
                            <span className="block text-gray-500 text-xs">
                              Currency
                            </span>
                            <span className="font-medium">
                              {txn.fromCurrency} → {txn.toCurrency}
                            </span>
                          </div>
                          <div>
                            <span className="block text-gray-500 text-xs">
                              Amount
                            </span>
                            <span
                              className={`font-semibold ${
                                txn.type === "credit"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {txn.type === "credit" ? "+" : "-"}
                              {txn.amount.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No transactions yet</p>
                    <button
                      onClick={() => {
                        setActiveTab("transactions");
                        setTransactionType("BANK_TO_PERSON");
                        setShowTransactionForm(true);
                      }}
                      className="mt-2 text-indigo-600 hover:underline"
                    >
                      Make your first transaction
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === "reports" && (
            <div className="bg-white shadow-md rounded-xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Financial Reports
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    Balance Summary
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Wallet Balance:</span>
                      <span className="font-semibold">{wallet.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bank Balance:</span>
                      <span className="font-semibold">
                        {bankAccount.toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <div className="flex justify-between font-bold">
                        <span>Total Balance:</span>
                        <span>{(wallet + bankAccount).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    Transaction Summary
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Transactions:</span>
                      <span className="font-semibold">
                        {transactions.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Credits:</span>
                      <span className="font-semibold text-green-600">
                        {transactions
                          .filter(
                            (t) =>
                              t.type === "credit" && t.txnStatus == "SUCCESSFUL"
                          )
                          .reduce((sum, t) => sum + t.amount, 0)
                          .toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Debits:</span>
                      <span className="font-semibold text-red-600">
                        {transactions
                          .filter(
                            (t) =>
                              t.type === "debit" && t.txnStatus == "SUCCESSFUL"
                          )
                          .reduce((sum, t) => sum + t.amount, 0)
                          .toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Transaction Types
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    {
                      type: "BANK_TO_WALLET",
                      label: "Bank to Wallet",
                      icon: <FiArrowDown className="text-blue-500" />,
                    },
                    {
                      type: "WALLET_TO_BANK",
                      label: "Wallet to Bank",
                      icon: <FiArrowUp className="text-blue-500" />,
                    },
                    {
                      type: "BANK_TO_PERSON",
                      label: "Bank to Person",
                      icon: <FiSend className="text-blue-500" />,
                    },
                    {
                      type: "WALLET_TO_PERSON",
                      label: "Wallet to Person",
                      icon: <FiSend className="text-blue-500" />,
                    },
                  ].map((item, index) => {
                    const count = transactions.filter(
                      (t) => t.method === item.type
                    ).length;
                    return (
                      <div
                        key={index}
                        className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-50 rounded-full">
                            {item.icon}
                          </div>
                          <div>
                            <p className="font-medium">{item.label}</p>
                            <p className="text-sm text-gray-500">
                              {count} transactions
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Transaction Form Modal */}
          {showTransactionForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    {transactionType === "BANK_TO_WALLET" && "Bank to Wallet"}
                    {transactionType === "WALLET_TO_BANK" && "Wallet to Bank"}
                    {transactionType === "BANK_TO_PERSON" && "Bank to Person"}
                    {transactionType === "WALLET_TO_PERSON" &&
                      "Wallet to Person"}
                  </h3>
                  <button
                    onClick={() => {
                      setShowTransactionForm(false);
                      setFormData({
                        receiver: "",
                        amount: "",
                        transactionMethod: "",
                      });
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleTransactionSubmit}>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">
                      {transactionType.includes("PERSON")
                        ? "Receiver Phone Number"
                        : "Destination"}
                    </label>
                    <input
                      type="text"
                      name="receiver"
                      value={formData.receiver}
                      onChange={(e) =>
                        setFormData({ ...formData, receiver: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder={
                        transactionType.includes("PERSON")
                          ? "+1-9876543213"
                          : transactionType === "BANK_TO_WALLET"
                          ? "Your Wallet"
                          : "Your Bank Account"
                      }
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">
                      Amount ()
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="10.00"
                      step="0.01"
                      min="0.01"
                      required
                    />
                  </div>

                  <input
                    type="hidden"
                    name="transactionMethod"
                    value={transactionType}
                  />

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowTransactionForm(false);
                        setFormData({
                          receiver: "",
                          amount: "",
                          transactionMethod: "",
                        });
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                      disabled={apiLoading}
                    >
                      {apiLoading ? "Processing..." : "Submit"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
