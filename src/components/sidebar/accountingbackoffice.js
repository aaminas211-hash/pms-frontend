// src/components/AccountingSidebar.js
import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./Sidebar.css";

// Import Lucide Icons
import {
  Home,
  BookOpen,
  Users,
  CreditCard,
  Wallet,
  BookMarked,
  Landmark,
  Receipt,
  FileText,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowRightLeft,
  FileBarChart,
  ScrollText,
} from "lucide-react";

/* ===========================
   Accounting Sidebar with Sliding Animation
   =========================== */
export function AccountingSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [hidden, setHidden] = useState(true); // For mobile
  const { pathname } = useLocation();

  // Update body classes for content adjustment
  useEffect(() => {
    const body = document.body;

    // Remove all sidebar classes first
    body.classList.remove("sidebar-open", "sidebar-mini", "sidebar-closed");

    const isMobile = window.innerWidth <= 1024;

    if (isMobile) {
      if (!hidden) body.classList.add("sidebar-open");
    } else {
      body.classList.add(collapsed ? "sidebar-mini" : "sidebar-open");
    }

    return () => {
      body.classList.remove("sidebar-open", "sidebar-mini", "sidebar-closed");
    };
  }, [collapsed, hidden]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 1024;
      setHidden(isMobile);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ===========================
     Menu Items (Flat - No Dropdowns)
  =========================== */
  const menus = [
    { label: "Dashboard", icon: <Home size={18} />, to: "/dashboard/accounting" },
    { label: "Ledger", icon: <BookOpen size={18} />, to: "/dashboard/accounting/ledger" },
    { label: "Group", icon: <Users size={18} />, to: "/dashboard/accounting/group" },
    { label: "Vendor Payment", icon: <ArrowUpFromLine size={18} />, to: "/dashboard/accounting/vendor-payment" },
    { label: "Customer Receipt", icon: <ArrowDownToLine size={18} />, to: "/dashboard/accounting/customer-receipt" },
    { label: "Day Book", icon: <BookMarked size={18} />, to: "/dashboard/accounting/day-book" },
    { label: "Cash Book", icon: <Wallet size={18} />, to: "/dashboard/accounting/cash-book" },
    { label: "Bank Book", icon: <Landmark size={18} />, to: "/dashboard/accounting/bank-book" },
    { label: "Payment Voucher", icon: <Receipt size={18} />, to: "/dashboard/accounting/payment-voucher" },
    { label: "Receipt Voucher", icon: <FileText size={18} />, to: "/dashboard/accounting/receipt-voucher" },
    { label: "Contra Voucher", icon: <ArrowRightLeft size={18} />, to: "/dashboard/accounting/contra-voucher" },
    { label: "Ledger Statement", icon: <FileBarChart size={18} />, to: "/dashboard/accounting/ledger-statement" },
    { label: "Journal", icon: <ScrollText size={18} />, to: "/dashboard/accounting/journal" },
  ];

  /* ===========================
     Sidebar Logic
  =========================== */
  const toggleSidebar = () => {
    const isMobile = window.innerWidth <= 1024;
    isMobile ? setHidden(!hidden) : setCollapsed(!collapsed);
  };

  const closeSidebar = () => {
    if (window.innerWidth <= 1024) setHidden(true);
  };

  const sidebarClasses = `rsb ${collapsed ? "rsb--mini" : ""} ${hidden ? "rsb--hidden" : ""}`;

  /* ===========================
     Render
  =========================== */
  return (
    <>
      {!hidden && window.innerWidth <= 1024 && (
        <div className={`sidebar-overlay ${!hidden ? "active" : ""}`} onClick={closeSidebar} />
      )}

      <aside className={sidebarClasses}>
        <div className="rsb-top">
          <button className="rsb-burger" onClick={toggleSidebar} aria-label="Toggle sidebar">
            <span />
            <span />
            <span />
          </button>
          {!collapsed && (
            <button className="rsb-close" onClick={closeSidebar} aria-label="Close sidebar">
              ×
            </button>
          )}
        </div>

        <nav className="rsb-nav">
          {menus.map((menu) => (
            <NavLink
              key={menu.to}
              to={menu.to}
              className={({ isActive }) => "rsb-item" + (isActive ? " active" : "")}
              onClick={closeSidebar}
            >
              <span className="rsb-ico">{menu.icon}</span>
              {!collapsed && <span className="rsb-lbl">{menu.label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}