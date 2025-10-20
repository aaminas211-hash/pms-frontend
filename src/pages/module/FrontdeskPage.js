// src/pages/module/FrontdeskPage.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FrontdeskPage.css";
import { FrontdeskSidebar } from "../../components/sidebar/FrontdeskSidebar";

export default function FrontdeskPage() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="page">
      {/* Sidebar column - UPDATED: Pass collapsed and onToggle props */}
      <aside className={`frontdesk-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <FrontdeskSidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      </aside>

      {/* Main content column */}
      <main className={`frontdesk-wrap ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Topbar */}
        <div className="frontdesk-topbar">
          <div className="topbar-left">
            <h2 className="welcome-text">Welcome: TRUSTIFYEDGE (Jaipur)</h2>
          </div>
          <div className="topbar-right">
            <span className="branch-info">Switch Branch</span>
            <span className="user-info">TRUSTIFYEDGE (Jaipur)</span>
            <span className="date-info">Apr 1 2023-Mar 31 2026</span>
            <span className="session-info">S1341 Buser Today, Sep 19 2025 12:36:54</span>
            <button className="admin-btn">Admin</button>
            <div className="topbar-actions">
              <button className="icon-btn">??</button>
              <button className="icon-btn">??</button>
              <button className="icon-btn">?</button>
              <button className="icon-btn">??</button>
            </div>
          </div>
        </div>

        {/* Dashboard Control Bar */}
        <div className="dashboard-control">
          <button className="change-dashboard-btn">Change Dashboard</button>
          <select className="dashboard-select">
            <option>All</option>
          </select>
        </div>

        {/* Main Dashboard Content */}
        <div className="dashboard-content">
          {/* Top Stats Cards */}
          <div className="stats-grid">
            {/* Arrival Card */}
            <div className="stat-card arrival-card">
              <div className="stat-icon">??</div>
              <div className="stat-info">
                <div className="stat-label">Arrival</div>
                <div className="stat-values">
                  <div className="stat-row"><span>Total 0</span></div>
                  <div className="stat-row"><span>Arrived 0</span></div>
                  <div className="stat-row"><span>Pending 0</span></div>
                </div>
              </div>
            </div>

            {/* Departure Card */}
            <div className="stat-card departure-card">
              <div className="stat-icon">??</div>
              <div className="stat-info">
                <div className="stat-label">Departure</div>
                <div className="stat-values">
                  <div className="stat-row"><span>Total 0</span></div>
                  <div className="stat-row"><span>CheckedOut 0</span></div>
                  <div className="stat-row"><span>Pending 0</span></div>
                </div>
              </div>
            </div>

            {/* Total Booking Card */}
            <div className="stat-card booking-card">
              <div className="stat-icon">??</div>
              <div className="stat-info">
                <div className="stat-label">Total Booking</div>
                <div className="stat-number">0</div>
              </div>
            </div>

            {/* In House Card */}
            <div className="stat-card inhouse-card">
              <div className="stat-icon">??</div>
              <div className="stat-info">
                <div className="stat-label">In House</div>
                <div className="stat-number">0</div>
              </div>
            </div>

            {/* Available Room Card */}
            <div className="stat-card room-card">
              <div className="stat-icon">??</div>
              <div className="stat-info">
                <div className="stat-label">Available Room</div>
                <div className="stat-number">20</div>
                <div className="stat-sublabel">UnAlloted Room</div>
                <div className="stat-number">0</div>
              </div>
            </div>
          </div>

          {/* Financial Stats Row */}
          <div className="financial-grid">
            {/* Sales Card */}
            <div className="financial-card">
              <div className="financial-header">
                <span className="financial-icon">??</span>
                <span className="financial-title">Sales</span>
              </div>
              <div className="financial-content">
                <div className="financial-row">
                  <span className="label">Today</span>
                  <span className="value">?0.00</span>
                </div>
                <div className="financial-row highlight">
                  <span className="label badge-green">Month</span>
                  <span className="value">?46,333.00</span>
                </div>
              </div>
            </div>

            {/* Outstanding Amount Card */}
            <div className="financial-card">
              <div className="financial-header">
                <span className="financial-icon">??</span>
                <span className="financial-title">OutStanding Amount</span>
              </div>
              <div className="financial-content">
                <div className="financial-row">
                  <span className="label">Today</span>
                  <span className="value">?0.00</span>
                </div>
                <div className="financial-row highlight">
                  <span className="label badge-green">Month</span>
                  <span className="value">?0.00</span>
                </div>
              </div>
            </div>

            {/* Total Bill Card */}
            <div className="financial-card">
              <div className="financial-header">
                <span className="financial-icon">??</span>
                <span className="financial-title">Total Bill</span>
              </div>
              <div className="financial-content">
                <div className="financial-row">
                  <span className="label">Today</span>
                  <span className="value">?0.00</span>
                </div>
                <div className="financial-row highlight">
                  <span className="label badge-green">Month</span>
                  <span className="value">?4.00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Inventory & Occupancy Section */}
          <div className="inventory-occupancy-grid">
            {/* Inventory Statistics */}
            <div className="panel inventory-panel">
              <div className="panel-header">
                <span className="panel-icon">??</span>
                <span className="panel-title">Inventory Statistics</span>
                <span className="badge-count">20</span>
              </div>
              <div className="panel-content">
                <table className="inventory-table">
                  <tbody>
                    <tr><td>Sold Room</td><td className="text-right">0</td></tr>
                    <tr><td>Blocked Room</td><td className="text-right">0</td></tr>
                    <tr><td>Available Room</td><td className="text-right">20</td></tr>
                    <tr><td>Complimentary</td><td className="text-right">0</td></tr>
                    <tr><td>House Use</td><td className="text-right">0</td></tr>
                    <tr><td>Same day Check Out</td><td className="text-right">0</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Occupancy Panel */}
            <div className="panel occupancy-panel">
              <div className="panel-header">
                <span className="panel-icon">??</span>
                <span className="panel-title">Occupancy (%)</span>
              </div>
              <div className="panel-content occupancy-content">
                <table className="occupancy-table">
                  <tbody>
                    <tr><td>Today's Checking</td><td className="text-right">0</td></tr>
                    <tr><td>Continue Room</td><td className="text-right">0</td></tr>
                    <tr><td>Complimentary/House Use</td><td className="text-right">0</td></tr>
                    <tr><td>Total Occupancy</td><td className="text-right">0</td></tr>
                    <tr><td>Total CheckOut</td><td className="text-right">0</td></tr>
                    <tr><td>Today Expected Checkout</td><td className="text-right">0</td></tr>
                  </tbody>
                </table>
                <div className="occupancy-gauge">
                  <svg viewBox="0 0 100 100" className="gauge-svg">
                    <circle cx="50" cy="50" r="45" className="gauge-bg" />
                    <circle cx="50" cy="50" r="45" className="gauge-fill" strokeDasharray="0 283" />
                    <text x="50" y="55" className="gauge-text">0</text>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Booking & Collection Section */}
          <div className="booking-collection-grid">
            {/* Booking by Channel */}
            <div className="panel">
              <div className="panel-header">
                <span className="panel-icon">??</span>
                <span className="panel-title">Booking by Channel</span>
                <div className="panel-tabs">
                  <button className="tab-btn active">Today</button>
                  <button className="tab-btn">Month</button>
                </div>
              </div>
              <div className="panel-content chart-placeholder">
                <p className="no-data">No booking data available</p>
              </div>
            </div>

            {/* Collection by Mode */}
            <div className="panel">
              <div className="panel-header">
                <span className="panel-icon">??</span>
                <span className="panel-title">Collection by Mode</span>
                <div className="panel-tabs">
                  <button className="tab-btn active">Today</button>
                  <button className="tab-btn">Month</button>
                </div>
              </div>
              <div className="panel-content chart-placeholder">
                <p className="no-data">No collection data available</p>
              </div>
            </div>
          </div>

          {/* Guest Table Section */}
          <div className="panel guest-table-panel">
            <div className="panel-header">
              <div className="table-tabs">
                <button className="table-tab active">Check In Guest</button>
                <button className="table-tab">More Detail</button>
                <button className="table-tab">Reservation</button>
                <button className="table-tab">More Detail</button>
              </div>
            </div>
            <div className="panel-content">
              <table className="guest-table">
                <thead>
                  <tr>
                    <th>Sr No.</th>
                    <th>Arrival No.</th>
                    <th>Guest Name</th>
                    <th>Room No</th>
                    <th>Room Type</th>
                    <th>Check Out Date</th>
                    <th>Booked By</th>
                    <th>Company</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="9" className="no-data-row">No guests checked in</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}