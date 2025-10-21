import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../lib/api";
import ReservationSidebar from "../../components/sidebar/ReservationSidebar";
import "../../components/sidebar/Sidebar.css";
import "../../assets/css/commanPage.css";

const PAGE_SIZE = 20;
const STATUS_OPTIONS = [
  "ALL",
  "Booked",
  "Confirmed",
  "Cancelled",
  "NoShow",
  "CheckedIn",
  "CheckedOut",
];

export default function ReservationStatusView() {
  // ---- sidebar (mobile drawer) ----
  const [sbOpen, setSbOpen] = useState(false);
  const openSidebar = () => setSbOpen(true);
  const closeSidebar = () => setSbOpen(false);

  // ---- data state ----
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({});
  const [q, setQ] = useState("");
  const [date, setDate] = useState(toYMD(new Date()));
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Load list + summary
  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const params = new URLSearchParams({
          date,
          status: status === "ALL" ? "" : status,
          q,
          page,
          limit,
        });

        const res = await apiFetch(`/api/reservations/status-view?${params.toString()}`, { auth: true });

        const data = res?.data?.items || res?.items || res?.data || res || [];
        const sum = res?.data?.summary || res?.summary || {};
        const count = res?.total ?? res?.data?.total ?? data.length ?? 0;

        if (!ignore) {
          setRows(Array.isArray(data) ? data : []);
          setSummary(isPlainObj(sum) ? sum : {});
          setTotal(Number(count) || 0);
        }
      } catch (e) {
        if (!ignore) {
          setErr(e?.message || "Failed to load reservation status.");
          setRows([]);
          setSummary({});
          setTotal(0);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [date, status, q, page, limit]);

  // Client-side filter fallback
  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    const term = q.trim().toLowerCase();
    return rows.filter((r) =>
      [r.bookingNo, r.confirmationNo, r.guestName, r.mobile, r.roomInfo, r.status]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    );
  }, [rows, q]);

  const dataToRender = rows?.length && total > rows.length ? rows : filtered;

  return (
    <div className="page" style={{ display: "grid", gridTemplateColumns: "auto 1fr" }}>
      {/* ===== Sidebar ===== */}
      <ReservationSidebar className={`rsb ${sbOpen ? "open" : ""}`} />
      {sbOpen && <div className="rsb-overlay" onClick={closeSidebar} />}

      {/* ===== Content ===== */}
      <div className="res-wrap">
        {/* Header */}
        <div style={{ 
          backgroundColor: "#fff", 
          padding: "15px 20px", 
          borderRadius: "8px", 
          marginBottom: "20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                type="button"
                className="btn"
                onClick={openSidebar}
                aria-label="Open menu"
                style={{ padding: ".45rem .6rem" }}
              >
                ☰
              </button>
              <h2 style={{ margin: 0, color: "#333", fontSize: "20px" }}>Reservation Status View</h2>
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button style={btnStyle("#4CAF50")}>Search</button>
              <button style={btnStyle("#2196F3")}>Save</button>
              <button style={btnStyle("#FF9800")}>Excel</button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ 
          backgroundColor: "#fff", 
          padding: "20px", 
          borderRadius: "8px", 
          marginBottom: "20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "15px" }}>
            <div>
              <label style={labelStyle}>Booking No.</label>
              <input type="text" placeholder="Booking Number" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Guest Name / Mob No.</label>
              <input 
                type="text" 
                placeholder="Guest Name or Mobile" 
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                style={inputStyle} 
              />
            </div>
            <div>
              <label style={labelStyle}>Email Id</label>
              <input type="email" placeholder="Email Address" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>From</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setPage(1);
                }}
                style={inputStyle} 
              />
            </div>
            <div>
              <label style={labelStyle}>To</label>
              <input type="date" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Guest Type</label>
              <select style={inputStyle}>
                <option>GuestType</option>
                <option>Individual</option>
                <option>Corporate</option>
                <option>Group</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Sales Representative By</label>
              <select style={inputStyle}>
                <option>Sales Representative By</option>
                <option>Rep 1</option>
                <option>Rep 2</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Company</label>
              <select style={inputStyle}>
                <option>Select Company</option>
                <option>Company A</option>
                <option>Company B</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Booked By</label>
              <select style={inputStyle}>
                <option>Select Booked By</option>
                <option>User 1</option>
                <option>User 2</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Adv. Booking (Status)</label>
              <select 
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                style={inputStyle}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {labelize(s)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Confirmation Voucher No.</label>
              <input type="text" placeholder="Voucher Number" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Business Market</label>
              <select style={inputStyle}>
                <option>Select Source</option>
                <option>Direct</option>
                <option>Online</option>
                <option>Agent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", 
          gap: "15px",
          marginBottom: "20px"
        }}>
          <KPI label="Booked" value={summary.booked} color="#2196F3" />
          <KPI label="Confirmed" value={summary.confirmed} color="#4CAF50" />
          <KPI label="Checked In" value={summary.checkedIn} color="#FF9800" />
          <KPI label="Checked Out" value={summary.checkedOut} color="#9C27B0" />
          <KPI label="Cancelled" value={summary.cancelled} color="#F44336" />
          <KPI label="No Show" value={summary.noShow} color="#607D8B" />
          <KPI label="Total" value={summary.total ?? total} color="#000" />
        </div>

        {/* Error Message */}
        {err && (
          <div style={{ 
            backgroundColor: "#ffebee", 
            color: "#c62828", 
            padding: "12px", 
            borderRadius: "6px", 
            marginBottom: "20px",
            fontWeight: "500"
          }}>
            {err}
          </div>
        )}

        {/* Table */}
        <div className="panel">
          <div className="panel-h">
            <span>
              Reservations • {fmtYMD(date)} {status !== "ALL" ? `• ${labelize(status)}` : ""}
            </span>
            <span className="small" style={{ color: "var(--muted)" }}>
              {loading ? "Loading…" : `Total: ${total || dataToRender.length}`}
            </span>
          </div>
          <div className="panel-b">
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Booking/Confirm No.</th>
                    <th>Guest Name</th>
                    <th>No. of Rooms</th>
                    <th>No. of Days</th>
                    <th>Room Information</th>
                    <th>Arrival Date / Departure Date</th>
                    <th>Room Charges</th>
                    <th>Service Amount</th>
                    <th>Total Amount</th>
                    <th>Advance Amount</th>
                    <th>Paidup Amt.</th>
                    <th>Debit Balance</th>
                    <th>Credit Balance</th>
                    <th>Retention Charge</th>
                    <th>Bill No.</th>
                    <th>Status</th>
                    <th>User Name</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={18} style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                        Loading...
                      </td>
                    </tr>
                  ) : (!dataToRender || dataToRender.length === 0) ? (
                    <tr className="no-rows">
                      <td colSpan={18}>No reservations found</td>
                    </tr>
                  ) : (
                    dataToRender.map((r, idx) => {
                      const id = r._id || r.id || r.bookingNo;
                      return (
                        <tr key={id}>
                          <td>{(page - 1) * limit + idx + 1}</td>
                          <td>
                            <div style={{ fontWeight: 700 }}>{r.bookingNo || r.reservationNo || "—"}</div>
                            <div className="small" style={{ color: "var(--muted)" }}>
                              {r.confirmationNo || ""}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 700 }}>{r.guestName || "—"}</div>
                            <div className="small" style={{ color: "var(--muted)" }}>
                              {r.mobile || r.email || ""}
                            </div>
                          </td>
                          <td>{r.noOfRooms || r.rooms || 0}</td>
                          <td>{r.noOfDays || r.nights || diffNights(r.checkIn || r.arrivalDate, r.checkOut || r.departureDate)}</td>
                          <td>{r.roomInfo || r.roomType || "—"}</td>
                          <td>
                            <div>{fmtDate(r.arrivalDate || r.checkIn)}</div>
                            <div>{fmtDate(r.departureDate || r.checkOut)}</div>
                          </td>
                          <td style={{ textAlign: "right" }}>₹{fmtMoney(r.roomCharges || 0)}</td>
                          <td style={{ textAlign: "right" }}>₹{fmtMoney(r.serviceAmount || 0)}</td>
                          <td style={{ textAlign: "right", fontWeight: 700 }}>₹{fmtMoney(r.totalAmount || r.amount || 0)}</td>
                          <td style={{ textAlign: "right" }}>₹{fmtMoney(r.advanceAmount || 0)}</td>
                          <td style={{ textAlign: "right" }}>₹{fmtMoney(r.paidupAmount || 0)}</td>
                          <td style={{ textAlign: "right", color: (r.debitBalance || 0) > 0 ? "#d32f2f" : "inherit" }}>
                            ₹{fmtMoney(r.debitBalance || 0)}
                          </td>
                          <td style={{ textAlign: "right", color: (r.creditBalance || 0) > 0 ? "#388e3c" : "inherit" }}>
                            ₹{fmtMoney(r.creditBalance || 0)}
                          </td>
                          <td style={{ textAlign: "right" }}>₹{fmtMoney(r.retentionCharge || 0)}</td>
                          <td>{r.billNo || "—"}</td>
                          <td>
                            <StatusPill value={r.status} />
                          </td>
                          <td>{r.userName || r.createdBy || "—"}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
              <div className="small" style={{ color: "var(--muted)" }}>
                Showing {dataToRender.length ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, total || dataToRender.length)} of {total || dataToRender.length} entries
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  className="btn"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  « Prev
                </button>
                <span className="small" style={{ alignSelf: "center", color: "var(--muted)" }}>
                  Page {page}
                </span>
                <button
                  className="btn"
                  disabled={loading || (total ? page * limit >= total : dataToRender.length < limit)}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next »
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- UI Components ---------- */
function KPI({ label, value, color }) {
  return (
    <div className="kpi-card" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="kpi-icon">📊</div>
      <div>
        <div className="kpi-title">{label}</div>
        <div className="kpi-number" style={{ color }}>{value ?? 0}</div>
      </div>
    </div>
  );
}

function StatusPill({ value }) {
  const v = String(value || "—").toUpperCase();
  const map = {
    BOOKED: { bg: "#eff6ff", br: "#bfdbfe", fg: "#1e40af" },
    CONFIRMED: { bg: "#ecfdf5", br: "#a7f3d0", fg: "#166534" },
    CANCELLED: { bg: "#fef2f2", br: "#fecaca", fg: "#991b1b" },
    NOSHOW: { bg: "#fff1f2", br: "#fecdd3", fg: "#9f1239" },
    CHECKEDIN: { bg: "#f0fdf4", br: "#bbf7d0", fg: "#15803d" },
    CHECKEDOUT: { bg: "#f1f5f9", br: "#e2e8f0", fg: "#334155" },
  };
  const t = map[v] || { bg: "#f3f4f6", br: "#e5e7eb", fg: "#334155" };
  return (
    <span
      style={{
        display: "inline-block",
        padding: ".15rem .5rem",
        borderRadius: 999,
        background: t.bg,
        border: `1px solid ${t.br}`,
        color: t.fg,
        fontSize: ".75rem",
        fontWeight: 800,
      }}
    >
      {labelize(v)}
    </span>
  );
}

/* ---------- Button Styles ---------- */
const btnStyle = (bg) => ({
  padding: "8px 20px",
  backgroundColor: bg,
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "500",
  transition: "opacity 0.2s"
});

const labelStyle = {
  display: "block",
  fontSize: "12px",
  fontWeight: "500",
  color: "#555",
  marginBottom: "6px"
};

const inputStyle = {
  width: "100%",
  padding: "8px 12px",
  border: "1px solid #ddd",
  borderRadius: "6px",
  fontSize: "13px",
  outline: "none",
  transition: "border-color 0.2s"
};

/* ---------- Helpers ---------- */
function labelize(s) {
  return String(s || "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function toYMD(d) {
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.valueOf())) return "";
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

function fmtDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  return Number.isNaN(dt.valueOf()) ? "—" : dt.toLocaleDateString();
}

function fmtMoney(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return "0";
  return v.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function diffNights(a, b) {
  const A = new Date(a),
    B = new Date(b);
  if (Number.isNaN(A.valueOf()) || Number.isNaN(B.valueOf())) return 0;
  return Math.max(0, Math.round((B - A) / (1000 * 60 * 60 * 24)));
}

function isPlainObj(o) {
  return !!o && typeof o === "object" && !Array.isArray(o);
}