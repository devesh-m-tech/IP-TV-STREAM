import React, { useEffect, useState } from "react";
import API from "../../utils/api";
import "../../index.css";

export default function RevenueManagement() {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    mrr: 0,
    activeSubscriptions: 0,
    arpu: 0,
    salesCount: 0,
  });
  const [loading, setLoading] = useState(false);

  // Form for simulated transaction
  const [simEmail, setSimEmail] = useState("");
  const [simPlan, setSimPlan] = useState("Standard HD Plan");
  const [simAmount, setSimAmount] = useState("299");
  const [simMethod, setSimMethod] = useState("Stripe");
  const [simStatus, setSimStatus] = useState("Success");

  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [txRes, statsRes] = await Promise.all([
        API.get("/revenue/transactions"),
        API.get("/revenue/stats"),
      ]);
      setTransactions(txRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error("Failed to load revenue metrics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSimulatePayment = async (e) => {
    e.preventDefault();
    try {
      await API.post("/revenue/transactions", {
        userEmail: simEmail,
        planName: simPlan,
        amount: parseFloat(simAmount),
        paymentMethod: simMethod,
        status: simStatus,
      });
      setSimEmail("");
      fetchData();
      alert("💸 Payment transaction successfully logged!");
    } catch (err) {
      alert("Failed to simulate payment transaction");
    }
  };

  const filteredTxs = transactions.filter((tx) =>
    tx.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pro-module">
      <h2 className="card-title">Revenue & Billing</h2>

      {/* 4 Stat Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#e0f2fe", color: "#0284c7" }}>💰</div>
          <div className="stat-info">
            <b>₹{stats.totalRevenue.toLocaleString("en-IN")}</b>
            <span>Total Sales</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#dcfce7", color: "#16a34a" }}>📈</div>
          <div className="stat-info">
            <b>₹{stats.mrr.toLocaleString("en-IN")}</b>
            <span>Monthly Revenue (MRR)</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#fef3c7", color: "#d97706" }}>💎</div>
          <div className="stat-info">
            <b>{stats.activeSubscriptions}</b>
            <span>Active Subscribers</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#f3e8ff", color: "#7c3aed" }}>📊</div>
          <div className="stat-info">
            <b>₹{stats.arpu.toLocaleString("en-IN")}</b>
            <span>ARPU (Avg per User)</span>
          </div>
        </div>
      </div>

      {/* Simulate Transaction / Log Manual Payment */}
      <div className="pro-card">
        <h3 style={{ fontSize: "16px", marginBottom: "16px", color: "var(--text)" }}>Log/Simulate Manual Payment</h3>
        <form className="pro-form-grid" onSubmit={handleSimulatePayment}>
          <div className="form-group">
            <label>User Email Address</label>
            <input
              className="pro-input"
              type="email"
              placeholder="e.g. client@domain.com"
              value={simEmail}
              onChange={(e) => setSimEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Plan Subscribed</label>
            <select
              className="pro-select"
              value={simPlan}
              onChange={(e) => setSimPlan(e.target.value)}
            >
              <option value="Basic SD Plan">Basic SD Plan</option>
              <option value="Standard HD Plan">Standard HD Plan</option>
              <option value="Premium 4K Plan">Premium 4K Plan</option>
            </select>
          </div>
          <div className="form-group">
            <label>Amount paid (₹ INR)</label>
            <input
              className="pro-input"
              type="number"
              step="1"
              value={simAmount}
              onChange={(e) => setSimAmount(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Payment Gateway</label>
            <select
              className="pro-select"
              value={simMethod}
              onChange={(e) => setSimMethod(e.target.value)}
            >
              <option value="Stripe">Stripe</option>
              <option value="PayPal">PayPal</option>
              <option value="Razorpay">Razorpay</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              className="pro-select"
              value={simStatus}
              onChange={(e) => setSimStatus(e.target.value)}
            >
              <option value="Success">Success</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
          <button className="pro-btn btn-primary" type="submit" style={{ background: "#16a34a" }}>
            Record Payment
          </button>
        </form>
      </div>

      {/* Transaction Log Filter */}
      <div className="search-container">
        <span className="search-icon">🔍</span>
        <input
          className="search-input"
          placeholder="Search by email, plan, or gateway..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Transactions Table */}
      <div className="pro-table-container">
        <h3 style={{ fontSize: "14px", padding: "16px 18px 0", color: "var(--text)" }}>Transaction Ledger</h3>
        <table style={{ marginTop: "12px" }}>
          <thead>
            <tr>
              <th>USER EMAIL</th>
              <th>PLAN tier</th>
              <th>AMOUNT</th>
              <th>METHOD</th>
              <th>STATUS</th>
              <th>DATE</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "40px" }}>
                  Synchronizing billing ledger...
                </td>
              </tr>
            ) : filteredTxs.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "var(--text3)" }}>
                  No transaction records found.
                </td>
              </tr>
            ) : (
              filteredTxs.map((tx) => (
                <tr key={tx.id}>
                  <td>
                    <span style={{ fontWeight: "600", fontFamily: "monospace" }}>{tx.userEmail}</span>
                  </td>
                  <td>
                    <span className="pro-badge blue">{tx.planName}</span>
                  </td>
                  <td>
                    <b style={{ color: tx.status === "Success" ? "#16a34a" : "var(--text)" }}>
                      ₹{tx.amount.toLocaleString("en-IN")}
                    </b>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "var(--text2)", fontWeight: "500" }}>{tx.paymentMethod}</span>
                  </td>
                  <td>
                    <span
                      className={`pro-badge ${
                        tx.status === "Success"
                          ? "active"
                          : tx.status === "Pending"
                          ? "blue"
                          : ""
                      }`}
                      style={
                        tx.status === "Failed"
                          ? { background: "#ffe4e6", color: "#e11d48" }
                          : undefined
                      }
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td style={{ fontSize: "12px", color: "var(--text3)" }}>
                    {new Date(tx.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
