// src/pages/AccountingPage.js
import { useNavigate } from "react-router-dom";
import { AccountingPage } from "../../components/sidebar/AccountingPage";
import "./ModuleBase.css";

export default function AccountingPage() {
  const navigate = useNavigate();
  
  return (
    <div className="page">
      {/* Left side: Backoffice sidebar */}
      <AccountingPage />
      
      {/* Right side: page content */}
      <div className="res-wrap">
        <div className="res-topbar">
          <div className="res-topbar-left">
            <h2 className="page-title">Accounting — Financial Overview</h2>
          </div>
          <div className="res-actions">
            <button className="btn btn-dark" onClick={() => navigate("/backoffice")}>
              ? Back Office
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon">??</div>
            <div>
              <div className="kpi-title">Total Revenue (MTD)</div>
              <div className="kpi-number">$45,280</div>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon">??</div>
            <div>
              <div className="kpi-title">Pending Invoices</div>
              <div className="kpi-number">12</div>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon">?</div>
            <div>
              <div className="kpi-title">Paid Invoices</div>
              <div className="kpi-number">156</div>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon">??</div>
            <div>
              <div className="kpi-title">Overdue Payments</div>
              <div className="kpi-number">3</div>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon">??</div>
            <div>
              <div className="kpi-title">Pending Refunds</div>
              <div className="kpi-number">7</div>
            </div>
          </div>
        </div>

        {/* Recent Transactions Panel */}
        <div className="panel" style={{ marginTop: 12 }}>
          <div className="panel-h">Recent Transactions</div>
          <div className="panel-b">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e0e0e0" }}>
                  <th style={{ padding: "8px", textAlign: "left" }}>Date</th>
                  <th style={{ padding: "8px", textAlign: "left" }}>Type</th>
                  <th style={{ padding: "8px", textAlign: "left" }}>Description</th>
                  <th style={{ padding: "8px", textAlign: "right" }}>Amount</th>
                  <th style={{ padding: "8px", textAlign: "center" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "8px" }}>Oct 14, 2025</td>
                  <td style={{ padding: "8px" }}>Payment</td>
                  <td style={{ padding: "8px" }}>Booking #1234 - Room 305</td>
                  <td style={{ padding: "8px", textAlign: "right" }}>$450.00</td>
                  <td style={{ padding: "8px", textAlign: "center" }}>
                    <span style={{ background: "#4caf50", color: "white", padding: "2px 8px", borderRadius: "4px", fontSize: "12px" }}>
                      Paid
                    </span>
                  </td>
                </tr>
                <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "8px" }}>Oct 13, 2025</td>
                  <td style={{ padding: "8px" }}>Refund</td>
                  <td style={{ padding: "8px" }}>Booking #1198 - Cancellation</td>
                  <td style={{ padding: "8px", textAlign: "right" }}>-$220.00</td>
                  <td style={{ padding: "8px", textAlign: "center" }}>
                    <span style={{ background: "#ff9800", color: "white", padding: "2px 8px", borderRadius: "4px", fontSize: "12px" }}>
                      Pending
                    </span>
                  </td>
                </tr>
                <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "8px" }}>Oct 12, 2025</td>
                  <td style={{ padding: "8px" }}>Payment</td>
                  <td style={{ padding: "8px" }}>Booking #1205 - Room 112</td>
                  <td style={{ padding: "8px", textAlign: "right" }}>$680.00</td>
                  <td style={{ padding: "8px", textAlign: "center" }}>
                    <span style={{ background: "#4caf50", color: "white", padding: "2px 8px", borderRadius: "4px", fontSize: "12px" }}>
                      Paid
                    </span>
                  </td>
                </tr>
                <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "8px" }}>Oct 11, 2025</td>
                  <td style={{ padding: "8px" }}>Invoice</td>
                  <td style={{ padding: "8px" }}>Corporate Booking #1178</td>
                  <td style={{ padding: "8px", textAlign: "right" }}>$1,250.00</td>
                  <td style={{ padding: "8px", textAlign: "center" }}>
                    <span style={{ background: "#f44336", color: "white", padding: "2px 8px", borderRadius: "4px", fontSize: "12px" }}>
                      Overdue
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "8px" }}>Oct 10, 2025</td>
                  <td style={{ padding: "8px" }}>Payment</td>
                  <td style={{ padding: "8px" }}>Booking #1189 - Room 208</td>
                  <td style={{ padding: "8px", textAlign: "right" }}>$320.00</td>
                  <td style={{ padding: "8px", textAlign: "center" }}>
                    <span style={{ background: "#4caf50", color: "white", padding: "2px 8px", borderRadius: "4px", fontSize: "12px" }}>
                      Paid
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="panel" style={{ marginTop: 12 }}>
          <div className="panel-h">Quick Actions</div>
          <div className="panel-b">
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button className="btn btn-primary">Generate Invoice</button>
              <button className="btn btn-primary">Process Refund</button>
              <button className="btn btn-primary">View Reports</button>
              <button className="btn btn-primary">Export Transactions</button>
              <button className="btn btn-primary">Reconcile Accounts</button>
            </div>
          </div>
        </div>

        {/* Monthly Summary Panel */}
        <div className="panel" style={{ marginTop: 12 }}>
          <div className="panel-h">Monthly Summary (October 2025)</div>
          <div className="panel-b">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
              <div>
                <strong>Total Income:</strong>
                <div style={{ fontSize: "18px", color: "#4caf50", marginTop: "4px" }}>$45,280.00</div>
              </div>
              <div>
                <strong>Total Refunds:</strong>
                <div style={{ fontSize: "18px", color: "#f44336", marginTop: "4px" }}>$2,450.00</div>
              </div>
              <div>
                <strong>Net Revenue:</strong>
                <div style={{ fontSize: "18px", color: "#2196f3", marginTop: "4px" }}>$42,830.00</div>
              </div>
              <div>
                <strong>Outstanding:</strong>
                <div style={{ fontSize: "18px", color: "#ff9800", marginTop: "4px" }}>$3,720.00</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}