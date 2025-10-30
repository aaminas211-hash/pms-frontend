import { useEffect, useMemo, useRef, useState } from "react";
import ReservationSidebar from "../../../components/sidebar/ReservationSidebar";

// --- Mock API Function ---
const mockApiFetch = async (url, options = {}) => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  if (url.includes("/folio")) {
    return {
      data: [
        { _id: "1", ts: new Date().toISOString(), kind: "CHARGE", desc: "Room Charge", amount: 5000 },
        { _id: "2", ts: new Date().toISOString(), kind: "CHARGE", desc: "Restaurant", amount: 850 },
        { _id: "3", ts: new Date().toISOString(), kind: "PAYMENT", desc: "Cash Payment", amount: 3000 },
      ],
    };
  }
  if (url.includes("/rooms")) {
    return {
      data: [
        { roomNo: "101", roomTypeName: "Deluxe Room" },
        { roomNo: "102", roomTypeName: "Deluxe Room" },
        { roomNo: "201", roomTypeName: "Suite" },
      ],
    };
  }
  return {
    _id: "guest123",
    status: "INHOUSE",
    propertyCode: "PROP-001",
    guest: {
      name: "John Doe",
      mobile: "+91 98765 43210",
      email: "john.doe@example.com",
    },
    arrival: new Date().toISOString(),
    departure: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    nights: 3,
    adults: 2,
    children: 1,
    roomTypeCode: "DLX",
    roomNo: "305",
    rate: {
      planCode: "EP",
      base: 5000,
    },
    remarks: "Early check-in requested",
  };
};

// --- Main Component ---
export default function CheckInGuestDetails() {
  const [stay, setStay] = useState(null);
  const [folio, setFolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [showExtend, setShowExtend] = useState(false);
  const [showMove, setShowMove] = useState(false);
  const [showCharge, setShowCharge] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const printRef = useRef(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      setErr("");
      setOk("");
      try {
        const st = await mockApiFetch("/api/checkins/123");
        const fo = await mockApiFetch("/api/checkins/123/folio");
        if (!ignore) {
          setStay(st || null);
          setFolio(fo?.data || fo || []);
        }
      } catch (e) {
        if (!ignore) setErr(e?.message || "Failed to load guest details.");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  const totals = useMemo(() => {
    let charges = 0,
      payments = 0;
    for (const r of folio || []) {
      const amt = Number(r.amount || 0);
      if ((r.kind || "").toUpperCase() === "PAYMENT") payments += amt;
      else charges += amt;
    }
    return {
      charges,
      payments,
      balance: round2(charges - payments),
    };
  }, [folio]);

  const canAct = useMemo(() => (stay?.status || "").toUpperCase() === "INHOUSE" || (stay?.status || "").toUpperCase() === "CHECKEDIN", [stay]);

  function printSlip() {
    const el = printRef.current;
    if (!el) return;
    const w = window.open("", "PRINT", "height=800,width=700");
    if (!w) return;
    w.document.write(`
      <html>
        <head>
          <title>Check-in Details</title>
          <style>
            body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; color:#111; }
            table { width:100%; border-collapse: collapse; }
            td, th { padding: 6px 8px; border-bottom: 1px solid #eee; vertical-align: top; }
            .right { text-align:right; }
          </style>
        </head>
        <body>${el.innerHTML}</body>
      </html>
    `);
    w.document.close();
    w.focus();
    w.print();
    w.close();
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        minHeight: "100vh",
        background: "#f9fafb"
      }}
    >
      <div>
        <ReservationSidebar />
      </div>
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "32px",
          justifySelf: "center",
          width: "100%"
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "20px 24px",
            marginBottom: "16px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "#111827" }}>Guest Details</h1>
            {stay?.status && (
              <span
                style={{
                  padding: "6px 14px",
                  borderRadius: "9999px",
                  background: "#dcfce7",
                  color: "#166534",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.025em",
                }}
              >
                {String(stay.status)}
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <ActionButton onClick={printSlip} disabled={!stay}>🖨 Print</ActionButton>
            <ActionButton onClick={() => setShowExtend(true)} disabled={!canAct}>⏱ Extend</ActionButton>
            <ActionButton onClick={() => setShowMove(true)} disabled={!canAct}>🔁 Move</ActionButton>
            <ActionButton onClick={() => setShowCharge(true)} disabled={!canAct}>➕ Charge</ActionButton>
            <ActionButton onClick={() => setShowPayment(true)} disabled={!canAct}>💳 Payment</ActionButton>
            <ActionButton onClick={() => setShowCheckout(true)} disabled={!canAct || totals.balance > 0} primary>✅ Checkout</ActionButton>
          </div>
        </div>

        {err && <Banner type="err">{err}</Banner>}
        {ok && <Banner type="ok">{ok}</Banner>}

        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          {loading && <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>Loading guest details...</div>}
          {!loading && !stay && <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>No guest data available.</div>}
          {stay && (
            <div ref={printRef}>
              <div style={{ textAlign: "center", marginBottom: "32px", paddingBottom: "24px", borderBottom: "2px solid #f3f4f6" }}>
                <h2 style={{ margin: "0 0 8px 0", fontSize: "1.875rem", fontWeight: 800, color: "#111827" }}>
                  {stay.guest?.name || "Guest"}
                </h2>
                <p style={{ margin: 0, color: "#6b7280", fontSize: "1rem" }}>Property: {stay.propertyCode || "—"}</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "32px" }}>
                <InfoCard label="Contact Information">
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <InfoRow icon="📱" value={stay.guest?.mobile || "—"} />
                    <InfoRow icon="✉️" value={stay.guest?.email || "—"} />
                  </div>
                </InfoCard>
                <InfoCard label="Stay Details">
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <InfoRow icon="📅" label="Check-in" value={fmtDate(stay.arrival)} />
                    <InfoRow icon="📅" label="Check-out" value={fmtDate(stay.departure)} />
                    <InfoRow icon="🌙" value={`${stay.nights || diffDays(stay.arrival, stay.departure)} night(s)`} />
                  </div>
                </InfoCard>
                <InfoCard label="Room & Occupancy">
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <InfoRow icon="🏨" label="Room Type" value={stay.roomTypeCode || "—"} />
                    <InfoRow icon="🚪" label="Room No" value={stay.roomNo || "—"} />
                    <InfoRow icon="👥" value={`${stay.adults || 1} Adult(s), ${stay.children || 0} Child(ren)`} />
                  </div>
                </InfoCard>
                <InfoCard label="Rate Plan">
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <InfoRow icon="💰" label="Plan" value={stay.rate?.planCode || "—"} />
                    <InfoRow icon="💵" label="Rate" value={stay.rate?.base ? fmtMoney(stay.rate.base) : "—"} />
                  </div>
                </InfoCard>
              </div>

              {stay.remarks && (
                <div style={{ background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: "12px", padding: "16px", marginBottom: "32px" }}>
                  <div style={{ fontWeight: 700, color: "#92400e", marginBottom: "4px" }}>📝 Remarks</div>
                  <div style={{ color: "#78350f" }}>{stay.remarks}</div>
                </div>
              )}

              <div style={{ marginTop: "32px" }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "1.25rem", fontWeight: 800, color: "#111827" }}>Folio Statement</h3>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                        <th style={{ padding: "12px", textAlign: "left", fontWeight: 700, color: "#374151", fontSize: "0.875rem" }}>Date & Time</th>
                        <th style={{ padding: "12px", textAlign: "left", fontWeight: 700, color: "#374151", fontSize: "0.875rem" }}>Description</th>
                        <th style={{ padding: "12px", textAlign: "right", fontWeight: 700, color: "#374151", fontSize: "0.875rem" }}>Charge</th>
                        <th style={{ padding: "12px", textAlign: "right", fontWeight: 700, color: "#374151", fontSize: "0.875rem" }}>Payment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(folio || []).map((r) => (
                        <tr key={r._id || r.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                          <td style={{ padding: "12px", color: "#6b7280", fontSize: "0.875rem" }}>{fmtDateTime(r.ts || r.date)}</td>
                          <td style={{ padding: "12px", color: "#111827" }}>{r.desc || r.description || r.note || "—"}</td>
                          <td style={{ padding: "12px", textAlign: "right", color: "#dc2626", fontWeight: 600 }}>
                            {(r.kind || "").toUpperCase() === "PAYMENT" ? "—" : fmtMoney(r.amount)}
                          </td>
                          <td style={{ padding: "12px", textAlign: "right", color: "#059669", fontWeight: 600 }}>
                            {(r.kind || "").toUpperCase() === "PAYMENT" ? fmtMoney(r.amount) : "—"}
                          </td>
                        </tr>
                      ))}
                      {(!folio || folio.length === 0) && (
                        <tr>
                          <td colSpan={4} style={{ padding: "24px", textAlign: "center", color: "#9ca3af" }}>
                            No folio entries yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div style={{ marginTop: "24px", background: "#f9fafb", borderRadius: "12px", padding: "20px", display: "grid", gap: "12px" }}>
                  <TotalRow label="Total Charges" value={totals.charges} color="#dc2626" />
                  <TotalRow label="Total Payments" value={totals.payments} color="#059669" />
                  <div style={{ height: "1px", background: "#e5e7eb", margin: "4px 0" }} />
                  <TotalRow label="Balance Due" value={totals.balance} color="#111827" bold />
                </div>
                
              </div>
            </div>
          )}
        </div>
      </div>
      <div /> {/* right empty column for centering */}
    </div>
  );
}

// --- Helper/Small Components ---
function ActionButton({ children, onClick, disabled, primary }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "10px 18px",
        borderRadius: "10px",
        border: primary ? "none" : "1px solid #e5e7eb",
        background: disabled ? "#f3f4f6" : primary ? "#2563eb" : "#fff",
        color: disabled ? "#9ca3af" : primary ? "#fff" : "#111827",
        fontWeight: 600,
        fontSize: "0.875rem",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.target.style.transform = "translateY(-1px)";
          e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
        }
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = "translateY(0)";
        e.target.style.boxShadow = "none";
      }}
    >
      {children}
    </button>
  );
}

function Banner({ type = "ok", children }) {
  const style =
    type === "err"
      ? { background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" }
      : { background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0" };
  return (
    <div
      style={{
        ...style,
        padding: "12px 16px",
        borderRadius: "12px",
        fontWeight: 600,
        marginBottom: "16px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}
    >
      {children}
    </div>
  );
}

function InfoCard({ label, children }) {
  return (
    <div
      style={{
        background: "#f9fafb",
        borderRadius: "12px",
        padding: "16px",
        border: "1px solid #e5e7eb",
      }}
    >
      <div
        style={{
          fontWeight: 700,
          color: "#374151",
          marginBottom: "12px",
          fontSize: "0.875rem",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9375rem" }}>
      {icon && <span style={{ fontSize: "1.125rem" }}>{icon}</span>}
      {label && <span style={{ color: "#6b7280", minWidth: "fit-content" }}>{label}:</span>}
      <span style={{ color: "#111827", fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function TotalRow({ label, value, color, bold }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ color: "#374151", fontWeight: bold ? 800 : 600, fontSize: bold ? "1.125rem" : "1rem" }}>{label}</span>
      <span style={{ color, fontWeight: bold ? 800 : 600, fontSize: bold ? "1.25rem" : "1rem" }}>{fmtMoney(value)}</span>
    </div>
  );
}

// --- Utility Functions ---
function round2(n) {
  return Math.round((Number(n || 0) + Number.EPSILON) * 100) / 100;
}
function fmtMoney(n) {
  const v = Number(n || 0);
  if (!v) return "₹0.00";
  return v.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
function fmtDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function diffDays(aISO, bISO) {
  const a = new Date(aISO),
    b = new Date(bISO);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 1;
  return Math.max(1, Math.round((b - a) / (1000 * 60 * 60 * 24)));
}
