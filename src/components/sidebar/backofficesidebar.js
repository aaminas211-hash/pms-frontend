// src/components/Sidebar.js
import { useState, useMemo, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./Sidebar.css";

// Import Lucide Icons
import {
  Home,
  Building2,
  Settings,
  BookOpen,
  QrCode,
  Users,
  UtensilsCrossed,
  BedDouble,
  CircleDollarSign,
  BarChart3,
  FileText,
  MessageSquare,
  Factory,
  Receipt,
  TicketPercent,
} from "lucide-react";

/* ===========================
   Backoffice Sidebar with Sliding Animation
   =========================== */
export function BackofficeSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [hidden, setHidden] = useState(true); // For mobile
  const [open, setOpen] = useState(new Set(["dashboard", "master"]));
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
     Menus
  =========================== */
  const menus = useMemo(
    () => [
      { key: "dashboard", label: "Dashboard", icon: <Home size={18} />, to: "/dashboard/backoffice" },

      {
        key: "property",
        label: "Property",
        icon: <Building2 size={18} />,
        to: "/dashboard/backoffice",
        children: [
          { label: "Property details", to: "/dashboard/backoffice/masters/property" },
          { label: "Sales Person", to: "/dashboard/backoffice/masters/salesperson" },
        ],
      },

      {
        key: "master",
        label: "Master",
        icon: <BookOpen size={18} />,
        to: "/dashboard/backoffice",
        children: [
          { label: "Designation", to: "/dashboard/backoffice/masters/designation" },
          { label: "Kds Setting", to: "/dashboard/backoffice/masters/kds" },
          { label: "Ledger", to: "/dashboard/backoffice/masters/ledger" },
          { label: "Visit Purpose", to: "/dashboard/backoffice/masters/visit-purpose" },
          { label: "Pick Drop Facility", to: "/dashboard/backoffice/masters/pick-drop" },
          { label: "Billing Instruction Details", to: "/dashboard/backoffice/masters/billing-instruction" },
          { label: "Identity Details", to: "/dashboard/backoffice/masters/identity" },
          { label: "Version", to: "/dashboard/backoffice/masters/version" },
          { label: "State", to: "/dashboard/backoffice/masters/state" },
          { label: "City", to: "/dashboard/backoffice/masters/city" },
          { label: "Area", to: "/dashboard/backoffice/masters/area" },
          { label: "Zone", to: "/dashboard/backoffice/masters/zone" },
          { label: "Tax Rate Name", to: "/dashboard/backoffice/masters/tax-rate-name" },
          { label: "Tax Slab", to: "/dashboard/backoffice/masters/tax-slab" },
          { label: "Tax Process", to: "/dashboard/backoffice/masters/tax-process" },
          { label: "Order Cancel Time", to: "/dashboard/backoffice/masters/order-cancel-time" },
          {label: "Bill No. Setting", to: "/dashboard/backoffice/masters/bill-no-setting"},
          { label: "Reservation Settings", to: "/dashboard/backoffice/masters/reservation-settings" },
          { label: "Pincode", to: "/dashboard/backoffice/masters/pincode" },
          { label: "Property Information", to: "/dashboard/backoffice/masters/property-information" },
          { label: "Property Information App", to: "/dashboard/backoffice/masters/property-information-app" },
          { label: "Image For App", to: "/dashboard/backoffice/masters/image-for-app" },
          { label: "Pick Up Time", to: "/dashboard/backoffice/masters/pickup-time" },
          { label: "Employee Type", to: "/dashboard/backoffice/masters/employee-type" },
          { label: "Employee", to: "/dashboard/backoffice/masters/employee" },
          { label: "Bank Ledger", to: "/dashboard/backoffice/masters/bank-ledger" },
          { label: "Member Card Master", to: "/dashboard/backoffice/masters/member-card" },
          { label: "Topup Bonus Master", to: "/dashboard/backoffice/masters/topup-bonus" },
        ],
      },

      {
        key: "setting",
        label: "Setting",
        icon: <Settings size={18} />,
        to: "/dashboard/backoffice",
        children: [
          { label: "Night Audit Setting", to: "/dashboard/backoffice/setting/Night-audit" },
          { label: "Common Settings", to: "/dashboard/backoffice/setting/Commonsetting" },
          { label: "Booking No Setting", to: "/dashboard/backoffice/setting/Bookingnositting" },
          { label: "Copy Table Coloum CRM", to: "/dashboard/backoffice/setting/Copytablecoloumcrm" },
          { label: "Copy Table Coloum List CRM", to: "/dashboard/backoffice/setting/STableColumnListCRM" },
          { label: "Store Serial No Setting", to: "/dashboard/backoffice/setting/StoreSerialNoSetting" },
        ],
      },

      {
        key: "common-master",
        label: "Common Master",
        icon: <BookOpen size={18} />,
        to: "/dashboard/backoffice",
        children: [
          { label: "Unit", to: "/dashboard/backoffice/CommonMaster/unit" },
          { label: "Sub Unit", to: "/dashboard/backoffice/CommonMaster/Subunit" },
          { label: "Fnb Billing Type", to: "/dashboard/backoffice/CommonMaster/FnbBillingType" },
          { label: "Currency", to: "/dashboard/backoffice/CommonMaster/Currency" },
          { label: "Guest Type", to: "/dashboard/backoffice/CommonMaster/GuestType" },
          { label: "Brand", to: "/dashboard/backoffice/CommonMaster/Brand" },
        ],
      },

      {
        key: "qr",
        label: "QR Master",
        icon: <QrCode size={18} />,
        to: "/dashboard/backoffice",
        children: [{ label: "QR Menu Setting", to: "/dashboard/backoffice/QRMaster/QRMenuSetting" }],
      },

      {
        key: "user-mgmt",
        label: "User Management",
        icon: <Users size={18} />,
        to: "/dashboard/backoffice",
        children: [
          { label: "User Role", to: "/dashboard/backoffice/user-management/user-role" },
          { label: "User Creation", to: "/dashboard/backoffice/masters/user" },
          { label: "User Rights", to: "/dashboard/backoffice/user-management/user-rights" },
          { label: "User Authorization", to: "/dashboard/backoffice/user-management/user-authorization" },
        ],
      },

      {
        key: "fnb",
        label: "FNB",
        icon: <UtensilsCrossed size={18} />,
        to: "/dashboard/backoffice",
        children: [
          { label: "Add Pos Customer Setting", to: "/dashboard/backoffice/fnb/AddPosCustomerSetting" },
          { label: "Coupon Master", to: "/dashboard/backoffice/fnb/CoponMaster" },
          { label: "Outlet", to: "/dashboard/backoffice/fnb/Outlet" },
          { label: "Table", to: "/dashboard/backoffice/fnb/Table" },
          { label: "Parent Category", to: "/dashboard/backoffice/fnb/ParentCategoryPage" },
        ],
      },

      {
        key: "room",
        label: "Room",
        icon: <BedDouble size={18} />,
        to: "/dashboard/backoffice",
        children: [
          { label: "Tax Range", to: "/dashboard/backoffice/room/TaxRange" },
          { label: "Reservation Cancel Setting", to: "/dashboard/backoffice/room/ReservationCancelSetting" },
          { label: "Block Master", to: "/dashboard/backoffice/room/BlockMaster" },
        ],
      },

      {
        key: "currency",
        label: "Currency",
        icon: <CircleDollarSign size={18} />,
        to: "/dashboard/backoffice",
        children: [
          { label: "Set Up", to: "/dashboard/backoffice/currency/Setup" },
          { label: "Exchange", to: "/dashboard/backoffice/currency/Exchange" },
        ],
      },

      {
        key: "nc",
        label: "NC",
        icon: <BarChart3 size={18} />,
        to: "/dashboard/backoffice",
        children: [
          { label: "NC & Costing", to: "/dashboard/backoffice/nc/NcCosting" },
          { label: "Department", to: "/dashboard/backoffice/nc/Department" },
        ],
      },

      {
        key: "report",
        label: "Report",
        icon: <FileText size={18} />,
        to: "/dashboard/backoffice",
        children: [
          { label: "UserList", to: "/dashboard/backoffice/report/UserList" },
          { label: "Feedback List", to: "/dashboard/backoffice/report/FeedbackList" },
        ],
      },

      {
        key: "complain",
        label: "Complain",
        icon: <MessageSquare size={18} />,
        to: "/dashboard/backoffice",
        children: [
          { label: "Complain Type", to: "/dashboard/backoffice/complain/ComplainType" },
          { label: "Complain User List", to: "/dashboard/backoffice/complain/ComplainUserList" },
        ],
      },

      {
        key: "production",
        label: "Production",
        icon: <Factory size={18} />,
        to: "/dashboard/backoffice",
        children: [
          { label: "Production Finish", to: "/dashboard/backoffice/production/ProductionFinish" },
          { label: "Add Production", to: "/dashboard/backoffice/production/AddProduction" },
          { label: "Production Process", to: "/dashboard/backoffice/production/ProductionProcess" },
        ],
      },

      {
        key: "accounts",
        label: "Accounts",
        icon: <Receipt size={18} />,
        to: "/dashboard/backoffice",
        children: [
          { label: "Ledger Export", to: "/dashboard/backoffice/accounts/LedgerExport" },
          { label: "Voucher Export", to: "/dashboard/backoffice/accounts/VoucherExport" },
        ],
      },

      {
        key: "membership",
        label: "Membership",
        icon: <TicketPercent size={18} />,
        to: "/dashboard/backoffice",
        children: [
          { label: "MemberShip Type", to: "/dashboard/backoffice/membership/MemberShipType" },
          { label: "MemberShip Service", to: "/dashboard/backoffice/membership/MemberShipService" },
          { label: "MemberShip Plan", to: "/dashboard/backoffice/membership/MemberShipPlan" },
        ],
      },
    ],
    []
  );

  /* ===========================
     Sidebar Logic
  =========================== */
  const [isOpen, setIsOpen] = useState(open);
  const toggleSection = (k) => {
    const s = new Set(isOpen);
    s.has(k) ? s.delete(k) : s.add(k);
    setIsOpen(s);
  };
  const toggleSidebar = () => {
    const isMobile = window.innerWidth <= 1024;
    isMobile ? setHidden(!hidden) : setCollapsed(!collapsed);
  };
  const closeSidebar = () => {
    if (window.innerWidth <= 1024) setHidden(true);
  };

  const isDashboardActive = pathname === "/dashboard/backoffice" || pathname.startsWith("/dashboard/backoffice/");
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
          <NavLink
            to="/dashboard/backoffice"
            className={({ isActive }) => "rsb-item" + (isActive ? " active" : "")}
            onClick={closeSidebar}
          >
            <span className="rsb-ico">
              <Home size={18} />
            </span>
            {!collapsed && <span className="rsb-lbl">Dashboard</span>}
          </NavLink>

          {menus
            .filter((m) => m.key !== "dashboard")
            .map((m) => {
              const hasChildren = !!m.children?.length;
              const openNow = isOpen.has(m.key);
              return (
                <div key={m.key} className="rsb-sec">
                  <div
                    onClick={() => hasChildren && toggleSection(m.key)}
                    className={`rsb-item rsb-parent ${collapsed ? "no-caret" : ""}`}
                  >
                    <span className="rsb-ico">{m.icon}</span>
                    {!collapsed && <span className="rsb-lbl">{m.label}</span>}
                    {hasChildren && !collapsed && (
                      <span className={`rsb-caret ${openNow ? "open" : ""}`}>?</span>
                    )}
                  </div>

                  {hasChildren && !collapsed && openNow && (
                    <div className="rsb-sub">
                      {m.children.map((c) => (
                        <NavLink
                          key={c.to}
                          to={c.to}
                          className={({ isActive }) => "rsb-subitem" + (isActive ? " active" : "")}
                          onClick={closeSidebar}
                        >
                          {c.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
        </nav>
      </aside>
    </>
  );
}