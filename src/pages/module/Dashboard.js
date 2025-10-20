// src/pages/Dashboard.js
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSession, logout } from "../../auth";
import ChangePasswordModal from "../../components/ChangePasswordModal";

import Logo from "../../assets/logo/Logo.png";
import icBooking from "../../assets/icons/booking.png";
import icReservation from "../../assets/icons/reservation.png";
import icBackoffice from "../../assets/icons/backoffice.png";
import icFrontdesk from "../../assets/icons/frontdesk.png";
import icPos from "../../assets/icons/pos.png";
import icHousekeeping from "../../assets/icons/housekeeping.png";
import icKds from "../../assets/icons/kds.png";
import icReport from "../../assets/icons/report.png";
import icInventory from "../../assets/icons/inventory.png";
import icAccounting from "../../assets/icons/accounting.png"; // Added proper icon

/* ---------- Catalog (what the app can show) ---------- */
const CATALOG = [
  { id: "bookingEngine", title: "BOOKING ENGINE", icon: icBooking },
  { id: "reservation", title: "RESERVATION", icon: icReservation },
  { id: "backoffice", title: "BACK OFFICE", icon: icBackoffice },
  { id: "frontdesk", title: "FRONT DESK", icon: icFrontdesk },
  { id: "pos", title: "POS", icon: icPos },
  { id: "housekeeping", title: "HOUSE KEEPING", icon: icHousekeeping },
  { id: "kds", title: "KDS", icon: icKds },
  { id: "report", title: "REPORT", icon: icReport },
  { id: "inventory", title: "BOOKING INVENTORY", icon: icInventory },
  { id: "accounting", title: "ACCOUNTING", icon: icAccounting }, // Fixed: lowercase id for consistency
];

/* ---------- Routes for modules ---------- */
const ROUTE_BY_ID = {
  bookingEngine: "/dashboard/booking-engine",
  reservation: "/dashboard/reservation",
  backoffice: "/dashboard/backoffice",
  frontdesk: "/dashboard/frontdesk",
  pos: "/dashboard/pos",
  housekeeping: "/dashboard/housekeeping",
  kds: "/dashboard/kds",
  report: "/dashboard/report",
  inventory: "/dashboard/inventory",
  accounting: "/dashboard/accounting", // Fixed: lowercase for consistency
};

/* ---------- Grants resolver ---------- */
function getGrantedModules(session) {
  if (!session) return [];

  // 1) Prefer active property's membership.modules
  const activeCode = session.propertyCode;
  const mem = session.memberships?.find((m) => m.propertyCode === activeCode);
  const membershipGrants =
    Array.isArray(mem?.modules) && mem.modules.length ? mem.modules : null;
  if (membershipGrants) return membershipGrants;

  // 2) Fallback to top-level session.modules
  const topGrants =
    Array.isArray(session.modules) && session.modules.length
      ? session.modules
      : null;
  if (topGrants) return topGrants;

  // 3) Nothing granted
  return [];
}

/* ---------- Access check (Backoffice = superadmin-only) ---------- */
function canAccessModule(session, id) {
  if (!session) return false;
  
  // Special rule: backoffice requires superadmin role
  if (id === "backoffice" && session.role !== "superadmin") {
    return false;
  }

  // Check if module is in granted list
  const grants = getGrantedModules(session);
  return grants.includes(id);
}

/* ===================================================== */

export default function Dashboard() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      navigate("/login");
      return;
    }
    setSession(s);
  }, [navigate]);

  // Build tiles from granted modules
  const modules = useMemo(() => {
    if (!session) return [];
    
    return CATALOG.filter((m) => canAccessModule(session, m.id));
  }, [session]);

  if (!session) return null;

  const openModule = (id) => {
    if (!canAccessModule(session, id)) {
      alert("You don't have access to this module.");
      return;
    }
    const path = ROUTE_BY_ID[id] || `/module/${id}`;
    navigate(path);
  };

  const closeMenus = () => setMenuOpen(false);

  return (
    <div className="board" onClick={closeMenus}>
      {/* Top bar */}
      <header className="topbar" onClick={(e) => e.stopPropagation()}>
        <div className="brandbar">
          <img src={Logo} alt="Trustify" className="logo" />
        </div>
        <div className="usercluster">
          <span className="prop">
            {session.propertyCode}_{session.name?.replace(/\s+/g, "").toUpperCase()}
          </span>
          <div className="avatarWrap">
            <button
              className="avatarBtn"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((v) => !v);
              }}
            >
              <span className="avatarIcon">??</span>
            </button>
            {menuOpen && (
              <div className="menu" role="menu">
                <button
                  className="menuItem"
                  onClick={() => {
                    setPwOpen(true);
                    setMenuOpen(false);
                  }}
                >
                  Change Password
                </button>
                <button
                  className="menuItem danger"
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Tiles */}
      <div className="dashwrap" onClick={(e) => e.stopPropagation()}>
        <section className="tilesCol">
          <div className="tilesGrid">
            {modules.map((m) => (
              <button
                key={m.id}
                className="tile"
                onClick={() => openModule(m.id)}
                title={m.title}
              >
                <div className="tileIconWrap">
                  <img src={m.icon} alt="" className="tileIcon" />
                </div>
                <div className="tileTitle">{m.title}</div>
              </button>
            ))}
            {modules.length === 0 && (
              <div style={{ padding: 24, color: "#6b7280", fontWeight: 700 }}>
                No modules granted for this property. Contact your administrator.
              </div>
            )}
          </div>
        </section>
      </div>

      <ChangePasswordModal open={pwOpen} onClose={() => setPwOpen(false)} />
    </div>
  );
}