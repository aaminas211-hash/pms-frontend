import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../lib/api";
import ReservationSidebar from "../../components/sidebar/ReservationSidebar";
import "../../assets/css/commanPage.css";

const PAGE_SIZE = 20;

export default function CancelReservationList() {
  // ---- sidebar ----
  const [sbOpen, setSbOpen] = useState(false);
  const openSidebar = () => setSbOpen(true);
  const closeSidebar = () => setSbOpen(false);

  // ---- data state ----
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({});

  const [arrivalDate, setArrivalDate] = useState(toYMD(new Date()));
  const [toDate, setToDate] = useState(toYMD(new Date()));
  const [bookedBy, setBookedBy] = useState("");
  const [bookingNo, setBookingNo] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Load data
  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const params = new URLSearchParams({
          arrivalDate,
          toDate,
          bookedBy,
          bookingNo,
          page,
          limit,
        });

        const res = await apiFetch(`/api/reservations/cancelled?${params.toString()}`, { auth: true });

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
          setErr(e?.message || "Failed to load cancelled reservations.");
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
  }, [arrivalDate, toDate, bookedBy, bookingNo, page, limit]);

  const onExportExcel = () => {
    // Export to Excel functionality
    alert("Export to Excel functionality");
  };

  // Calculate totals
  const totals = useMemo(() => {
    return rows.reduce(
      (acc, r) => ({
        days: acc.days + (r.noOfDays || 0),
        rooms: acc.rooms + (r.noOfRooms || 0),
        pax: acc.pax + (r.pax || 0),
      }),
      { days: 0, rooms: 0, pax: 0 }
    );
  }, [rows]);

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
          padding: "10px 20px",
          borderRadius: "8px",
          marginBottom: "15px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
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
            <h2 style={{ margin: 0, color: "#333", fontSize: "18px" }}>Reservation All Cancel List</h2>
          </div>
          <button
            onClick={onExportExcel}
            style={{
              padding: "8px 20px",
              backgroundColor: "#10b981",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            📊 Excel
          </button>
        </div>

        {/* Filters */}
        <div style={{
          backgroundColor: "#fff",
          padding: "15px 20px",
          borderRadius: "8px",
          marginBottom: "15px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "15px",
            alignItems: "end"
          }}>
            <div>
              <label style={labelStyle}>Arrival Date</label>
              <input
                type="date"
                value={arrivalDate}
                onChange={(e) => {
                  setArrivalDate(e.target.value);
                  setPage(1);
                }}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>To</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setPage(1);
                }}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Booked By</label>
              <select
                value={bookedBy}
                onChange={(e) => {
                  setBookedBy(e.target.value);
                  setPage(1);
                }}
                style={inputStyle}
              >
                <option value="">All Users</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="reception">Reception</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Booking No</label>
              <input
                type="text"
                placeholder="Enter Booking Number"
                value={bookingNo}
                onChange={(e) => {
                  setBookingNo(e.target.value);
                  setPage(1);
                }}
                style={inputStyle}
              />
            </div>
            <div>
              <button
                onClick={() => setPage(1)}
                style={{
                  padding: "9px 30px",
                  backgroundColor: "#2196F3",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  width: "100%",
                }}
              >
                Show
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {err && (
          <div style={{
            backgroundColor: "#ffebee",
            color: "#c62828",
            padding: "12px",
            borderRadius: "6px",
            marginBottom: "15px",
            fontWeight: "500"
          }}>
            {err}
          </div>
        )}

        {/* Table */}
        <div className="panel">
          <div className="panel-b" style={{ padding: 0 }}>
            <div className="table-wrap">
              <table className="table" style={{ fontSize: "13px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f5f5f5" }}>
                    <th style={thStyle}>Sr. No.</th>
                    <th style={thStyle}>Guest Name</th>
                    <th style={thStyle}>Booking No.</th>
                    <th style={thStyle}>Arrival Date</th>
                    <th style={thStyle}>No. of Days</th>
                    <th style={thStyle}>No. of Room</th>
                    <th style={thStyle}>Pax</th>
                    <th style={thStyle}>Mobile No.</th>
                    <th style={thStyle}>Arrival From</th>
                    <th style={thStyle}>Departure To</th>
                    <th style={thStyle}>Cancel Date & Time</th>
                    <th style={thStyle}>Reason</th>
                    <th style={thStyle}>User Name</th>
                    <th style={thStyle}>Activate</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Total Row */}
                  <tr style={{ backgroundColor: "#f9fafb", fontWeight: "600" }}>
                    <td style={tdStyle} colSpan={2}>Total</td>
                    <td style={tdStyle}></td>
                    <td style={tdStyle}></td>
                    <td style={tdStyle}>{totals.days}</td>
                    <td style={tdStyle}>{totals.rooms}</td>
                    <td style={tdStyle}>{totals.pax}</td>
                    <td style={tdStyle} colSpan={7}></td>
                  </tr>

                  {loading ? (
                    <tr>
                      <td colSpan={14} style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                        Loading...
                      </td>
                    </tr>
                  ) : (!rows || rows.length === 0) ? (
                    <tr className="no-rows">
                      <td colSpan={14}>No cancelled reservations found</td>
                    </tr>
                  ) : (
                    rows.map((r, idx) => {
                      const id = r._id || r.id || r.bookingNo;
                      return (
                        <tr key={id}>
                          <td style={tdStyle}>{(page - 1) * limit + idx + 1}</td>
                          <td style={tdStyle}>
                            <div style={{ fontWeight: 600 }}>{r.guestName || "—"}</div>
                          </td>
                          <td style={tdStyle}>{r.bookingNo || r.code || "—"}</td>
                          <td style={tdStyle}>{fmtDate(r.arrivalDate || r.checkIn)}</td>
                          <td style={tdStyle}>{r.noOfDays || r.nights || diffNights(r.checkIn, r.checkOut)}</td>
                          <td style={tdStyle}>{r.noOfRooms || r.rooms || 0}</td>
                          <td style={tdStyle}>{r.pax || (r.adults || 0) + (r.children || 0)}</td>
                          <td style={tdStyle}>{r.mobile || r.mobileNo || "—"}</td>
                          <td style={tdStyle}>{r.arrivalFrom || r.source || "—"}</td>
                          <td style={tdStyle}>{fmtDate(r.departureDate || r.checkOut)}</td>
                          <td style={tdStyle}>{fmtDateTime(r.cancelDate || r.cancelledAt || r.updatedAt)}</td>
                          <td style={tdStyle} title={r.reason || ""}>
                            {truncate(r.reason || "—", 30)}
                          </td>
                          <td style={tdStyle}>{r.userName || r.cancelledBy || "—"}</td>
                          <td style={tdStyle}>
                            <button
                              style={{
                                padding: "4px 12px",
                                fontSize: "11px",
                                backgroundColor: "#ef4444",
                                color: "#fff",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                              }}
                            >
                              Activate
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer with count and pagination */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 20px",
              borderTop: "1px solid #e5e7eb",
              backgroundColor: "#fafafa"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px" }}>
                <span style={{ fontWeight: "500" }}>Total Count: {total || rows.length}</span>
                <span>|</span>
                <span>Show</span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  style={{
                    padding: "4px 8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "13px"
                  }}
                >
                  {[10, 20, 50, 100].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  className="btn"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  style={{
                    opacity: page <= 1 || loading ? 0.5 : 1,
                    cursor: page <= 1 || loading ? "not-allowed" : "pointer"
                  }}
                >
                  ‹ Prev
                </button>
                <span className="small" style={{ alignSelf: "center", color: "var(--muted)" }}>
                  Page {page}
                </span>
                <button
                  className="btn"
                  disabled={loading || (total ? page * limit >= total : rows.length < limit)}
                  onClick={() => setPage(p => p + 1)}
                  style={{
                    opacity: loading || (total ? page * limit >= total : rows.length < limit) ? 0.5 : 1,
                    cursor: loading || (total ? page * limit >= total : rows.length < limit) ? "not-allowed" : "pointer"
                  }}
                >
                  Next ›
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Styles ---------- */
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
};

const thStyle = {
  padding: "10px 12px",
  textAlign: "left",
  fontWeight: "600",
  fontSize: "12px",
  color: "#333",
  borderBottom: "2px solid #ddd",
  whiteSpace: "nowrap"
};

const tdStyle = {
  padding: "10px 12px",
  fontSize: "13px",
  color: "#333",
  borderBottom: "1px solid #f0f0f0"
};

/* ---------- Helpers ---------- */
function toYMD(d) {
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.valueOf())) return "";
  const m = `${dt.getMonth() + 1}`.padStart(2, "0");
  const day = `${dt.getDate()}`.padStart(2, "0");
  return `${dt.getFullYear()}-${m}-${day}`;
}

function fmtDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  return Number.isNaN(dt.valueOf()) ? "—" : dt.toLocaleDateString();
}

function fmtDateTime(d) {
  if (!d) return "—";
  const dt = new Date(d);
  return Number.isNaN(dt.valueOf()) ? "—" : dt.toLocaleString();
}

function diffNights(a, b) {
  const A = new Date(a), B = new Date(b);
  if (Number.isNaN(A.valueOf()) || Number.isNaN(B.valueOf())) return 0;
  return Math.max(0, Math.round((B - A) / (1000 * 60 * 60 * 24)));
}

function isPlainObj(o) {
  return !!o && typeof o === "object" && !Array.isArray(o);
}

function truncate(str, len) {
  return str.length > len ? str.substring(0, len) + "..." : str;
}