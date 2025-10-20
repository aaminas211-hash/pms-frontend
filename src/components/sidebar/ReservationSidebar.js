import { useState, useMemo, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./Sidebar.css"; // reuse the same styles

// Import Lucide Icons
import {
  Home,
  FolderOpen,
  Briefcase,
  Users,
  DollarSign,
  Calculator,
  Hotel,
  Ticket,
} from "lucide-react";

export default function ReservationSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [hidden, setHidden] = useState(true); // For mobile
  const [open, setOpen] = useState(new Set(["reservation", "frontoffice"]));
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

  const menus = useMemo(
    () => [
      {
        key: "dashboard",
        label: "Dashboard",
        icon: <Home size={18} />,
        to: "/reservation",
      },
      {
        key: "reservation",
        label: "Reservation",
        icon: <FolderOpen size={18} />,
        to: "/dashboard/reservation",
        children: [
          { label: "New Reservation", to: "/reservation/new" },
          { label: "Reservation Booking Details", to: "/reservation/booking-details" },
          { label: "Reservation Status View", to: "/reservation/StatusView" },
          { label: "Cancel Reservation List", to: "/reservation/CancelReservationList" },
          { label: "Reservation Calendar", to: "/reservation/ReservationCalendar" },
          { label: "Advanced Deposit", to: "/reservation/AdvanceDeposit" },
          { label: "Return / Paidup", to: "/reservation/ReturnPaidup" },
          { label: "No Show Room Report", to: "/reservation/NoShowRoomReport" },
          { label: "Booking Sheet Accounts", to: "/reservation/BookingSheetAccounts" },
        ],
      },
      {
        key: "frontoffice",
        label: "Front Office",
        icon: <Briefcase size={18} />,
        to: "/dashboard/reservation",
        children: [
          { label: "Pre Reg Card", to: "/Reservation/frontoffice/PreRegCard" },
          { label: "Check In Guest", to: "/Reservation/frontoffice/CheckInGuest" },
          { label: "Direct Check In Guest", to: "/Reservation/frontoffice/DirectCheckInGuest" },
          { label: "Check In Guest Details", to: "/Reservation/frontoffice/CheckInGuestDetails" },
          { label: "Pax Checkin", to: "/Reservation/frontoffice/PaxCheckin" },
          { label: "Cancel Booking Details", to: "/Reservation/frontoffice/CancelBookingDetails" },
          { label: "Room Calendar", to: "/Reservation/frontoffice/RoomCalendar" },
          { label: "Linked/UnLinked Report", to: "/Reservation/frontoffice/LinkedUnlinkedReport" },
          { label: "Check Out Guest", to: "/Reservation/frontoffice/CheckOutGuest" },
          { label: "Calendar", to: "/Reservation/frontoffice/Calendar" },
          { label: "Guest Checkout Date Extend", to: "/Reservation/frontoffice/GuestCheckoutExtend" },
          { label: "Paidup (Refund) Amount", to: "/frontdesk/paidup-refund" },
          { label: "Post Room/Mic Charges", to: "/frontdesk/post-charges" },
          { label: "Check Out Details", to: "/frontdesk/checkout-details" },
          { label: "Booking Linked/Unlinked", to: "/frontdesk/booking-linked-unlinked" },
          { label: "Settlement", to: "/frontdesk/settlement" },
        ],
      },
      // Uncomment to add more sections
      // { key: "housekeeping", label: "House Keeping", icon: <Sparkles size={18} />, to: "/housekeeping" },
      // { key: "petty", label: "Petty Cash", icon: <DollarSign size={18} />, to: "/petty-cash" },
      // { key: "accounting", label: "Accounting", icon: <Calculator size={18} />, to: "/accounting" },
      // { key: "other", label: "Other Hotel", icon: <Hotel size={18} />, to: "/other-hotel" },
      // { key: "club", label: "Club", icon: <Ticket size={18} />, to: "/club" },
    ],
    []
  );

  const isSectionOpen = (k) => open.has(k);
  const toggleSection = (k) => {
    const s = new Set(open);
    s.has(k) ? s.delete(k) : s.add(k);
    setOpen(s);
  };

  const toggleSidebar = () => {
    const isMobile = window.innerWidth <= 1024;
    isMobile ? setHidden(!hidden) : setCollapsed(!collapsed);
  };

  const closeSidebar = () => {
    if (window.innerWidth <= 1024) setHidden(true);
  };

  // Active for both /reservation and /reservation/*
  const isDashboardActive = pathname === "/reservation" || pathname.startsWith("/reservation/");
  const sidebarClasses = `rsb ${collapsed ? "rsb--mini" : ""} ${hidden ? "rsb--hidden" : ""}`;

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
          {/* Dashboard (Reservation overview) */}
          <NavLink
            to="/reservation"
            className={"rsb-item" + (isDashboardActive ? " active" : "")}
            onClick={closeSidebar}
          >
            <span className="rsb-ico">
              <Home size={18} />
            </span>
            {!collapsed && <span className="rsb-lbl">Dashboard</span>}
          </NavLink>

          {/* Sections */}
          {menus
            .filter((m) => m.key !== "dashboard")
            .map((m) => {
              const hasChildren = !!m.children?.length;
              const openNow = isSectionOpen(m.key);

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