import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../lib/api";
import "../../assets/css/commanPage.css";
import ReservationSidebar from "../../components/sidebar/ReservationSidebar";

/**
 * Expected API (adjust URL/fields to your backend):
 * GET /api/reservations?start=YYYY-MM-DD&end=YYYY-MM-DD&q=&status=
 * Returns: { items: Reservation[], total?: number } OR just Reservation[]
 *
 * Updated Reservation fields:
 *  - id / _id
 *  - bookingNo / confirmNo (Booking/Confirmation Number)
 *  - guestName (Guest Name)
 *  - mobileNo (Mobile Number)
 *  - emailId (Email)
 *  - roomNo (Room Number)
 *  - noOfRooms (Number of Rooms)
 *  - noOfDays (Number of Days)
 *  - roomInfo (Room Information)
 *  - status (ALL / BOOKED / CHECKED_IN / CANCELLED / NO_SHOW / CHECKED_OUT)
 *  - advBookingStatus (Advance Booking Status)
 *  - arrivalDate (Arrival Date / Check-in)
 *  - departureDate (Departure Date / Check-out)
 *  - roomCharges (Room Charges)
 *  - serviceAmount (Service Amount)
 *  - totalAmount (Total Amount)
 *  - advanceAmount (Advance Amount)
 *  - paidupAmt (Paidup Amount)
 *  - debitBalance (Debit Balance)
 *  - creditBalance (Credit Balance)
 *  - retentionCharge (Retention Charge)
 *  - billNo (Bill Number)
 *  - guestType (Guest Type)
 *  - salesRepBy (Sales Representative By)
 *  - company (Company)
 *  - bookedBy (Booked By)
 *  - confirmVoucherNo (Confirmation Voucher No.)
 *  - businessMarket (Business Market)
 *  - userName (User Name)
 *  - createdAt (Created Date)
 */

const STAT_OPTS = ["ALL", "BOOKED", "CHECKED_IN", "CANCELLED", "NO_SHOW", "CHECKED_OUT"];

export default function ReservationCalendar() {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("ALL");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [rows, setRows] = useState([]);

  const [openDay, setOpenDay] = useState(null);

  // Calendar boundaries
  const cal = useMemo(() => makeCalendar(cursor), [cursor]);
  const rangeStart = cal.startYMD;
  const rangeEnd = cal.endYMD;

  // Fetch reservations
  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const params = new URLSearchParams({ start: rangeStart, end: rangeEnd });
        if (q.trim()) params.set("q", q.trim());
        if (status && status !== "ALL") params.set("status", status);

        const res = await apiFetch(`/api/reservations?${params.toString()}`, { auth: true });
        const items = res?.data?.items || res?.items || res?.data || res || [];
        if (!ignore) setRows(Array.isArray(items) ? items : []);
      } catch (e) {
        if (!ignore) { 
          setErr(e?.message || "Failed to load reservations."); 
          setRows([]); 
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [rangeStart, rangeEnd, q, status]);

  // Build day map
  const dayMap = useMemo(() => buildDayMap(rows, rangeStart, rangeEnd), [rows, rangeStart, rangeEnd]);

  // Month label
  const monthTitle = cursor.toLocaleString(undefined, { month: "long", year: "numeric" });

  return (
    <div className="page">
      <div className="res-wrap">
        <ReservationSidebar />
        
        {/* Topbar */}
        <div className="res-topbar">
          <h2 style={{ margin: 0 }}>Reservation Calendar</h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="btn" onClick={() => setCursor(addMonths(cursor, -1))}>
              ‹ Prev
            </button>
            <button 
              className="btn" 
              onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))}
            >
              Today
            </button>
            <button className="btn" onClick={() => setCursor(addMonths(cursor, 1))}>
              Next ›
            </button>
            <div
              className="res-select"
              style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                gap: 8, 
                paddingInline: 10, 
                fontWeight: 800 
              }}
              aria-label="Month"
              title="Current month"
            >
              {monthTitle}
            </div>

            <select 
              className="res-select" 
              value={status} 
              onChange={(e) => setStatus(e.target.value)} 
              title="Filter status"
            >
              {STAT_OPTS.map(s => (
                <option key={s} value={s}>{labelize(s)}</option>
              ))}
            </select>

            <input
              className="res-select"
              placeholder="Search (guest / booking no / room)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ minWidth: 240 }}
              title="Search"
            />
          </div>
        </div>

        {/* KPIs */}
        <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
          <KPI label="Reservations" value={rows.length} icon="🧾" />
          <KPI 
            label="Total Rooms" 
            value={sumBy(rows, r => Number(r.noOfRooms) || 0)} 
            icon="🏨" 
          />
          <KPI 
            label="Check-ins (visible)" 
            value={sumBy(Object.values(dayMap), d => d.checkInCount)} 
            icon="✅" 
          />
          <KPI 
            label="Check-outs (visible)" 
            value={sumBy(Object.values(dayMap), d => d.checkOutCount)} 
            icon="🚪" 
          />
        </div>

        {/* Calendar grid */}
        <div className="panel" style={{ marginTop: 12 }}>
          <div className="panel-h">
            <span>{monthTitle}</span>
            <span className="small" style={{ color: "var(--text-muted)" }}>
              {loading ? "Loading…" : `Showing ${cal.weeks.length} weeks`}
            </span>
          </div>

          <div className="panel-b">
            {err && <Banner type="err">{err}</Banner>}

            <div className="table-wrap" style={{ overflow: "hidden" }}>
              {/* Weekday header */}
              <table className="table" style={{ tableLayout: "fixed" }}>
                <thead>
                  <tr>
                    {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(w => (
                      <th key={w} style={{ textAlign: "center" }}>{w}</th>
                    ))}
                  </tr>
                </thead>
              </table>

              {/* Weeks */}
              <div style={{ 
                display: "grid", 
                gridTemplateRows: `repeat(${cal.weeks.length}, 1fr)`, 
                gap: 6 
              }}>
                {cal.weeks.map((week, wi) => (
                  <div 
                    key={wi} 
                    style={{ 
                      display: "grid", 
                      gridTemplateColumns: "repeat(7, 1fr)", 
                      gap: 6 
                    }}
                  >
                    {week.map(d => {
                      const ymd = toYMD(d);
                      const info = dayMap[ymd] || emptyDay();
                      const isOtherMonth = d.getMonth() !== cursor.getMonth();
                      const isToday = sameYMD(d, new Date());
                      
                      return (
                        <button
                          key={ymd}
                          className="btn"
                          onClick={() => setOpenDay({ date: ymd, items: info.items })}
                          style={{
                            textAlign: "left",
                            borderRadius: 12,
                            padding: 8,
                            background: isToday ? "#ecfeff" : "#fff",
                            border: `1px solid ${isToday ? "#a5f3fc" : "#e5e7eb"}`,
                            opacity: isOtherMonth ? 0.6 : 1,
                            minHeight: 110,
                            overflow: "hidden",
                          }}
                          title={`Click to view ${info.items.length} reservation(s)`}
                        >
                          <div style={{ 
                            display: "flex", 
                            justifyContent: "space-between", 
                            alignItems: "baseline" 
                          }}>
                            <div style={{ fontWeight: 800 }}>
                              {d.getDate()}
                            </div>
                            <div className="small" style={{ color: "var(--text-muted)" }}>
                              {info.items.length} res
                            </div>
                          </div>

                          {/* Badges */}
                          <div style={{ 
                            display: "flex", 
                            gap: 6, 
                            marginTop: 6, 
                            flexWrap: "wrap" 
                          }}>
                            <Pill label={`CI ${info.checkInCount}`} tone="green" />
                            <Pill label={`Stay ${info.stayCount}`} tone="blue" />
                            <Pill label={`CO ${info.checkOutCount}`} tone="slate" />
                          </div>

                          {/* Top few reservations */}
                          <div style={{ marginTop: 8, display: "grid", gap: 4 }}>
                            {info.items.slice(0, 3).map(it => (
                              <div 
                                key={it._id || it.id || it.bookingNo} 
                                className="small" 
                                style={{ 
                                  whiteSpace: "nowrap", 
                                  overflow: "hidden", 
                                  textOverflow: "ellipsis" 
                                }}
                              >
                                <strong>{it.roomNo || "-"}</strong> • {it.guestName || "Guest"} 
                                <span style={{ color: "var(--text-muted)" }}>
                                  ({shortStatus(it.status)})
                                </span>
                              </div>
                            ))}
                            {info.items.length > 3 && (
                              <div className="small" style={{ color: "var(--text-muted)" }}>
                                + {info.items.length - 3} more…
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Day drawer / modal */}
        {openDay && (
          <Modal 
            title={`Reservations — ${fmtYMD(openDay.date)}`} 
            onClose={() => setOpenDay(null)}
          >
            <DayList date={openDay.date} items={openDay.items} />
          </Modal>
        )}
      </div>
    </div>
  );
}

/* ---------- Day details listing ---------- */
function DayList({ date, items }) {
  const [q, setQ] = useState("");
  
  const filtered = useMemo(() => {
    if (!q.trim()) return items;
    const term = q.trim().toLowerCase();
    return items.filter(r =>
      [
        r.bookingNo, 
        r.confirmNo, 
        r.guestName, 
        r.mobileNo, 
        r.emailId, 
        r.roomNo, 
        r.status
      ]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(term))
    );
  }, [items, q]);

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input 
          className="input" 
          placeholder="Search this day…" 
          value={q} 
          onChange={e => setQ(e.target.value)} 
        />
        <div className="small" style={{ color: "var(--text-muted)" }}>
          {filtered.length} result(s)
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Booking No.</th>
              <th>Guest Name</th>
              <th>Mobile No.</th>
              <th>Room</th>
              <th>No. of Rooms</th>
              <th>No. of Days</th>
              <th>Status</th>
              <th>Arrival Date</th>
              <th>Departure Date</th>
              <th>Total Amount</th>
              <th>Advance Amount</th>
              <th>Debit Balance</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr className="no-rows">
                <td colSpan={12}>No reservations</td>
              </tr>
            )}
            {filtered.map(r => (
              <tr key={r._id || r.id || r.bookingNo}>
                <td>{r.bookingNo || r.confirmNo || "—"}</td>
                <td>{r.guestName || "—"}</td>
                <td>{r.mobileNo || "—"}</td>
                <td>{r.roomNo || "—"}</td>
                <td>{r.noOfRooms || "—"}</td>
                <td>{r.noOfDays || "—"}</td>
                <td><StatusPill value={r.status} /></td>
                <td>{fmtYMDH(r.arrivalDate)}</td>
                <td>{fmtYMDH(r.departureDate)}</td>
                <td>{formatCurrency(r.totalAmount)}</td>
                <td>{formatCurrency(r.advanceAmount)}</td>
                <td>{formatCurrency(r.debitBalance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- Small UI ---------- */
function KPI({ label, value, icon = "📌" }) {
  return (
    <div className="kpi-card">
      <div className="kpi-icon">{icon}</div>
      <div>
        <div className="kpi-title">{label}</div>
        <div className="kpi-number">{value ?? 0}</div>
      </div>
    </div>
  );
}

function Pill({ label, tone = "slate" }) {
  const tones = {
    green: { bg: "#ecfdf5", br: "#a7f3d0", fg: "#166534" },
    blue:  { bg: "#eff6ff", br: "#bfdbfe", fg: "#1e40af" },
    slate: { bg: "#f1f5f9", br: "#e2e8f0", fg: "#334155" },
  }[tone] || { bg: "#f1f5f9", br: "#e2e8f0", fg: "#334155" };

  return (
    <span style={{
      display: "inline-block", 
      padding: ".1rem .45rem",
      borderRadius: 999, 
      background: tones.bg, 
      border: `1px solid ${tones.br}`, 
      color: tones.fg,
      fontSize: ".7rem", 
      fontWeight: 800
    }}>
      {label}
    </span>
  );
}

function StatusPill({ value }) {
  const v = String(value || "BOOKED").toUpperCase();
  const map = {
    BOOKED:      { bg: "#eef2ff", br: "#c7d2fe", fg: "#3730a3" },
    CHECKED_IN:  { bg: "#ecfdf5", br: "#a7f3d0", fg: "#166534" },
    CHECKED_OUT: { bg: "#f1f5f9", br: "#e2e8f0", fg: "#334155" },
    CANCELLED:   { bg: "#fef2f2", br: "#fecaca", fg: "#991b1b" },
    NO_SHOW:     { bg: "#fff1f2", br: "#fecdd3", fg: "#9f1239" },
  }[v] || { bg: "#f1f5f9", br: "#e2e8f0", fg: "#334155" };

  return (
    <span style={{
      display: "inline-block", 
      padding: ".15rem .5rem",
      borderRadius: 999, 
      background: map.bg, 
      border: `1px solid ${map.br}`, 
      color: map.fg,
      fontSize: ".75rem", 
      fontWeight: 800
    }}>
      {labelize(v)}
    </span>
  );
}

function Banner({ type = "ok", children }) {
  const style = type === "err"
    ? { background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" }
    : { background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0" };
  
  return (
    <div style={{ 
      ...style, 
      padding: "8px 10px", 
      borderRadius: 10, 
      fontWeight: 700, 
      marginBottom: 10 
    }}>
      {children}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={backdropStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800 }}>
            {title}
          </h3>
          <button onClick={onClose} aria-label="Close" style={xStyle}>
            ×
          </button>
        </div>
        <div style={{ padding: 16, maxHeight: "70vh", overflowY: "auto" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ---------- Date & helpers ---------- */
function toYMD(d) {
  const dt = d instanceof Date ? d : new Date(d);
  const m = `${dt.getMonth() + 1}`.padStart(2, "0");
  const day = `${dt.getDate()}`.padStart(2, "0");
  return `${dt.getFullYear()}-${m}-${day}`;
}

function fmtYMD(s) { 
  try { 
    const dt = new Date(s); 
    return dt.toLocaleDateString(); 
  } catch { 
    return s || "—"; 
  } 
}

function fmtYMDH(s) { 
  try { 
    const dt = new Date(s); 
    return dt.toLocaleString(); 
  } catch { 
    return s || "—"; 
  } 
}

function fmtDate(d) { 
  if (!d) return "—"; 
  const dt = new Date(d); 
  return Number.isNaN(dt) ? "—" : dt.toLocaleDateString(); 
}

function formatCurrency(val) {
  if (val === null || val === undefined) return "—";
  const num = Number(val);
  return Number.isNaN(num) ? "—" : `₹${num.toFixed(2)}`;
}

function sameYMD(a, b) { 
  return a.getFullYear() === b.getFullYear() && 
         a.getMonth() === b.getMonth() && 
         a.getDate() === b.getDate(); 
}

function addDays(d, n) { 
  const dt = new Date(d); 
  dt.setDate(dt.getDate() + n); 
  return dt; 
}

function addMonths(d, n) { 
  const dt = new Date(d); 
  dt.setMonth(dt.getMonth() + n); 
  return dt; 
}

function startOfWeekMon(d) {
  const dt = new Date(d);
  const day = (dt.getDay() + 6) % 7; // Mon=0..Sun=6
  dt.setDate(dt.getDate() - day);
  dt.setHours(0,0,0,0);
  return dt;
}

function endOfWeekSun(d) {
  const dt = startOfWeekMon(d);
  dt.setDate(dt.getDate() + 7);
  dt.setHours(0,0,0,0);
  return dt; // exclusive
}

function makeCalendar(anchor) {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const calStart = startOfWeekMon(first);
  
  // cover 6 weeks (always)
  const weeks = [];
  let ptr = new Date(calStart);
  for (let w = 0; w < 6; w++) {
    const week = [];
    for (let i = 0; i < 7; i++) { 
      week.push(new Date(ptr)); 
      ptr = addDays(ptr, 1); 
    }
    weeks.push(week);
  }
  
  const end = endOfWeekSun(weeks[weeks.length - 1][6]); // exclusive
  return { 
    weeks, 
    start: calStart, 
    end, 
    startYMD: toYMD(calStart), 
    endYMD: toYMD(end) 
  };
}

function emptyDay() { 
  return { 
    items: [], 
    stayCount: 0, 
    checkInCount: 0, 
    checkOutCount: 0 
  }; 
}

function buildDayMap(items, startYMD, endYMD) {
  const map = {};
  const start = new Date(startYMD);
  const end = new Date(endYMD);
  
  // Initialize all days
  for (let d = new Date(start); d < end; d = addDays(d, 1)) {
    map[toYMD(d)] = emptyDay();
  }
  
  // Place items
  for (const r of items || []) {
    const ci = normDay(r.arrivalDate || r.checkIn);
    const co = normDay(r.departureDate || r.checkOut);
    
    if (!(ci && co && ci < co)) continue;

    // If reservation overlaps visible range
    const S = new Date(Math.max(ci.getTime(), start.getTime()));
    const E = new Date(Math.min(co.getTime(), end.getTime()));

    // check-in day
    if (ci >= start && ci < end) {
      const k = toYMD(ci);
      ensure(map, k);
      map[k].checkInCount++;
      map[k].items.push(r);
    }
    
    // stay nights for [S, E)
    for (let d = new Date(S); d < E; d = addDays(d, 1)) {
      const k = toYMD(d);
      ensure(map, k);
      map[k].stayCount++;
      if (!map[k].items.includes(r)) map[k].items.push(r);
    }
    
    // check-out day
    if (co >= start && co < end) {
      const k2 = toYMD(co);
      ensure(map, k2);
      map[k2].checkOutCount++;
      if (!map[k2].items.includes(r)) map[k2].items.push(r);
    }
  }
  
  // Sort items inside the day (room then guest)
  Object.values(map).forEach(d => {
    d.items.sort((a, b) => 
      String(a.roomNo || "").localeCompare(String(b.roomNo || "")) || 
      String(a.guestName || "").localeCompare(String(b.guestName || ""))
    );
  });
  
  return map;
}

function ensure(obj, k) { 
  if (!obj[k]) obj[k] = emptyDay(); 
}

function normDay(s) { 
  const dt = new Date(s); 
  if (Number.isNaN(dt)) return null; 
  dt.setHours(0,0,0,0); 
  return dt; 
}

function shortStatus(s) {
  const v = String(s || "").toUpperCase();
  if (v === "CHECKED_IN") return "IN";
  if (v === "CHECKED_OUT") return "OUT";
  if (v === "NO_SHOW") return "NS";
  if (v === "CANCELLED") return "CAN";
  return "BK";
}

function labelize(s) { 
  return String(s || "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase()); 
}

function sumBy(arr, fn) { 
  return (arr || []).reduce((n, x) => n + (Number(fn(x)) || 0), 0); 
}

/* ---------- Modal styles ---------- */
const backdropStyle = { 
  position: "fixed", 
  inset: 0, 
  background: "rgba(0,0,0,.45)", 
  display: "grid", 
  placeItems: "center", 
  zIndex: 1000 
};

const modalStyle = { 
  width: "min(1100px, calc(100% - 24px))", 
  background: "#fff", 
  borderRadius: 16, 
  boxShadow: "0 20px 60px rgba(0,0,0,.22)", 
  overflow: "hidden",
  maxHeight: "90vh",
  display: "flex",
  flexDirection: "column"
};

const headerStyle = { 
  display: "flex", 
  alignItems: "center", 
  justifyContent: "space-between", 
  padding: "14px 16px", 
  borderBottom: "1px solid #e5e7eb", 
  background: "#fff" 
};

const xStyle = { 
  border: "1px solid #e5e7eb", 
  background: "#fff", 
  color: "#111827", 
  borderRadius: 10, 
  width: 36, 
  height: 36, 
  cursor: "pointer",
  fontSize: "24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s ease"
};