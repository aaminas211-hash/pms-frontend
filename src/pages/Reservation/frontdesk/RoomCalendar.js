import { useEffect, useMemo, useState } from "react";
import ReservationSidebar from "../../../components/sidebar/ReservationSidebar";
import "../../../components/sidebar/Sidebar.css";
import "../../../assets/css/commanPage.css";
import { apiFetch } from "../../../lib/api";

const DEFAULT_SPAN = 14;

export default function RoomCalendar() {
  const [propertyCode, setPropertyCode] = useState("");
  const [from, setFrom] = useState(toISODate(startOfDay(new Date())));
  const [spanDays, setSpanDays] = useState(DEFAULT_SPAN);
  const to = useMemo(() => toISODate(addDays(new Date(from), spanDays - 1)), [from, spanDays]);
  const days = useMemo(() => eachDay(new Date(from), new Date(to)), [from, to]);
  const [rooms, setRooms] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [viewing, setViewing] = useState(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const roomParams = new URLSearchParams();
        if (propertyCode) roomParams.set("propertyCode", propertyCode.trim().toUpperCase());
        roomParams.set("activeOnly", "1");
        const rRes = await apiFetch(`/api/rooms?${roomParams}`, { auth: true });
        const roomList = rRes?.data || rRes?.items || rRes || [];
        const calParams = new URLSearchParams({ from, to });
        if (propertyCode) calParams.set("propertyCode", propertyCode.trim().toUpperCase());
        const bRes = await apiFetch(`/api/bookings/room-calendar?${calParams}`, { auth: true });
        const evList = bRes?.data || bRes?.items || bRes || [];
        if (!ignore) {
          setRooms(Array.isArray(roomList) ? roomList : []);
          setEvents(Array.isArray(evList) ? evList : []);
        }
      } catch (e) {
        if (!ignore) setErr(e?.message || "Failed to load room calendar.");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [propertyCode, from, to]);

  const grid = useMemo(() => {
    const byRoom = new Map();
    rooms.forEach(r => byRoom.set(r.code || r.roomNo || r._id, {}));
    for (const ev of events) {
      const rc = ev.roomCode || ev.roomNo || ev.room || "";
      const start = startOfDay(new Date(ev.checkIn));
      const end = startOfDay(new Date(ev.checkOut));
      for (const d of days) {
        if (isBetween(start, d, addDays(end, -1))) {
          const key = toISODate(d);
          const row = byRoom.get(rc);
          if (row) (row[key] ||= []).push(ev);
        }
      }
    }
    return byRoom;
  }, [rooms, events, days]);

  const goPrev = () => setFrom(toISODate(addDays(new Date(from), -spanDays)));
  const goNext = () => setFrom(toISODate(addDays(new Date(from), +spanDays)));
  const goToday = () => setFrom(toISODate(startOfDay(new Date())));

  return (
    <div className="page" style={{ display: "grid", gridTemplateColumns: "auto 1fr" }}>
      <ReservationSidebar />
      
      <div className="res-wrap" style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #f8fafc, #f1f5f9)', padding: '24px' }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
          <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '20px', padding: '32px', marginBottom: '24px', boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)' }}>
            <h1 style={{ margin: '0 0 8px', fontSize: '2rem', fontWeight: 800, color: '#fff' }}>🏨 Room Calendar</h1>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.9)', fontSize: '1rem' }}>Manage your room bookings and availability</p>
          </div>

          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <input placeholder="Property Code" value={propertyCode} onChange={e => setPropertyCode(e.target.value)} style={{ padding: '12px 16px', borderRadius: '10px', border: '2px solid #e2e8f0', fontSize: '0.95rem', fontWeight: 600, textTransform: 'uppercase', width: '200px', outline: 'none' }} />
              <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={{ padding: '12px 16px', borderRadius: '10px', border: '2px solid #e2e8f0', fontSize: '0.95rem', fontWeight: 600, outline: 'none' }} />
              <select value={spanDays} onChange={e => setSpanDays(Number(e.target.value))} style={{ padding: '12px 16px', borderRadius: '10px', border: '2px solid #e2e8f0', fontSize: '0.95rem', fontWeight: 600, outline: 'none', cursor: 'pointer' }}>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n} {n === 1 ? 'day' : 'days'}</option>)}
              </select>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                <button onClick={goPrev} style={{ padding: '10px 18px', borderRadius: '10px', border: '2px solid #e2e8f0', background: '#fff', color: '#475569', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>‹ Prev</button>
                <button onClick={goToday} style={{ padding: '10px 18px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>Today</button>
                <button onClick={goNext} style={{ padding: '10px 18px', borderRadius: '10px', border: '2px solid #e2e8f0', background: '#fff', color: '#475569', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>Next ›</button>
              </div>
            </div>
          </div>

          {err && <div style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', padding: '12px 16px', borderRadius: '12px', fontWeight: 600, marginBottom: '20px' }}>{err}</div>}

          <div style={{ background: '#fff', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, color: '#475569' }}>Legend:</span>
              <Legend label="Booked" color="#dbeafe" border="#93c5fd" text="#1e40af" />
              <Legend label="In-House" color="#d1fae5" border="#6ee7b7" text="#065f46" />
              <Legend label="Blocked" color="#f1f5f9" border="#cbd5e1" text="#334155" />
              <Legend label="Out of Order" color="#fee2e2" border="#fca5a5" text="#991b1b" />
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '2px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>Calendar View</h3>
              <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>{loading ? "🔄 Loading..." : `${rooms.length} rooms · ${days.length} days`}</span>
            </div>

            <div style={{ overflow: 'auto', maxHeight: 'calc(100vh - 400px)' }}>
              <div style={{ minWidth: '1000px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: `240px repeat(${days.length}, 1fr)`, position: 'sticky', top: 0, zIndex: 10, background: '#fff' }}>
                  <div style={{ position: 'sticky', left: 0, zIndex: 11, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '16px', fontWeight: 800, color: '#fff', borderRight: '2px solid #e2e8f0' }}>Room Details</div>
                  {days.map(d => {
                    const isToday = toISODate(d) === toISODate(new Date());
                    return (
                      <div key={+d} style={{ background: isToday ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' : '#f8fafc', padding: '12px 8px', textAlign: 'center', borderRight: '1px solid #e2e8f0', borderBottom: '2px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: isToday ? '#fff' : '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>{weekdayShort(d)}</div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: isToday ? '#fff' : '#0f172a' }}>{d.getDate()}</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: isToday ? 'rgba(255,255,255,0.9)' : '#64748b' }}>{monthShort(d)}</div>
                      </div>
                    );
                  })}
                </div>

                {rooms.map((r, idx) => {
                  const rKey = r.code || r.roomNo || r._id;
                  const rowMap = grid.get(rKey) || {};
                  return (
                    <div key={rKey} style={{ display: 'grid', gridTemplateColumns: `240px repeat(${days.length}, 1fr)`, background: idx % 2 === 0 ? '#fff' : '#fafbfc' }}>
                      <div style={{ position: 'sticky', left: 0, zIndex: 9, background: idx % 2 === 0 ? '#fff' : '#fafbfc', padding: '16px', borderRight: '2px solid #e2e8f0', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a', marginBottom: '4px' }}>{rKey}</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>{r.roomTypeCode || r.type || "—"}{r.floor && ` · Floor ${r.floor}`}</div>
                      </div>
                      {days.map(d => {
                        const key = toISODate(d);
                        const evs = rowMap[key] || [];
                        const first = evs[0];
                        return (
                          <div key={key} style={{ position: 'relative', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', minHeight: '60px', padding: '8px' }}>
                            {first && <CellEvent ev={first} onClick={() => setViewing(first)} />}
                            {evs.length > 1 && <span style={{ position: 'absolute', right: 6, bottom: 6, background: '#667eea', color: '#fff', borderRadius: '12px', padding: '2px 8px', fontSize: '0.7rem', fontWeight: 700 }}>+{evs.length - 1}</span>}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      {viewing && <ViewModal ev={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}

function CellEvent({ ev, onClick }) {
  const style = colorForStatus(ev?.status);
  const tag = (ev?.status || "").toUpperCase();
  return (
    <button 
      onClick={onClick} 
      style={{
        ...style,
        width: '100%',
        height: '44px',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '0 10px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
    >
      <span style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.8 }}>{tagLabel(tag)}</span>
      <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>{ev.bookingNo || ""}</span>
    </button>
  );
}

function Legend({ label, color, border, text }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 14px',
      borderRadius: '10px',
      background: color,
      border: `2px solid ${border}`,
      color: text,
      fontWeight: 700,
      fontSize: '0.85rem'
    }}>
      <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: text, opacity: 0.6 }} />
      {label}
    </span>
  );
}

function ViewModal({ ev, onClose }) {
  const [details, setDetails] = useState(null);
  const [err, setErr] = useState("");
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoadingDetails(true);
      setErr("");
      try {
        const res = await apiFetch(`/api/bookings/${ev._id || ev.id}`, { auth: true });
        if (!ignore) setDetails(res?.data || res || ev);
      } catch (e) {
        if (!ignore) {
          setErr(e?.message || "Failed to load details.");
          setDetails(ev);
        }
      } finally {
        if (!ignore) setLoadingDetails(false);
      }
    })();
    return () => { ignore = true; };
  }, [ev]);

  const d = details || ev || {};
  const statusStyle = colorForStatus(d.status);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'grid', placeItems: 'center', zIndex: 1000, padding: '20px' }} onClick={onClose}>
      <div style={{ width: 'min(950px, 100%)', background: '#fff', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: '0 0 6px', fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>{d.bookingNo || "Booking Details"}</h2>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem', fontWeight: 500 }}>Complete reservation information</p>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'rgba(255,255,255,0.2)', color: '#fff', borderRadius: '12px', width: '44px', height: '44px', cursor: 'pointer', fontSize: '1.8rem', fontWeight: 300 }}>×</button>
        </div>

        <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
          {err && <div style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', padding: '12px 16px', borderRadius: '12px', fontWeight: 600, marginBottom: '20px' }}>{err}</div>}
          {loadingDetails && <div style={{ textAlign: 'center', color: '#64748b', padding: '40px', fontSize: '1rem', fontWeight: 600 }}>⏳ Loading details...</div>}

          <div style={{ display: 'grid', gap: '28px' }}>
            <div>
              <span style={{
                ...statusStyle,
                padding: '10px 20px',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: 700,
                display: 'inline-block',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                {(d.status || '').replace('_', ' ')}
              </span>
            </div>

            <Section title="👤 Guest Information">
              <InfoGrid>
                <InfoCard icon="👤" label="Guest Name" value={d?.guest?.name} />
                <InfoCard icon="📱" label="Mobile" value={d?.guest?.mobile} />
                <InfoCard icon="✉️" label="Email" value={d?.guest?.email} />
              </InfoGrid>
            </Section>

            <Section title="📋 Booking Details">
              <InfoGrid>
                <InfoCard icon="🏨" label="Room" value={d.roomCode} />
                <InfoCard icon="🛏️" label="Room Type" value={d.roomTypeCode} />
                <InfoCard icon="🏢" label="Property" value={d.propertyCode} />
                <InfoCard icon="📅" label="Check-In" value={fmtDate(d.checkIn)} />
                <InfoCard icon="📅" label="Check-Out" value={fmtDate(d.checkOut)} />
                <InfoCard icon="🌙" label="Nights" value={d.nights} />
                <InfoCard icon="👥" label="Adults" value={d.adults} />
                <InfoCard icon="👶" label="Children" value={d.children} />
                <InfoCard icon="📍" label="Source" value={d.source} />
              </InfoGrid>
            </Section>

            <Section title="💳 Payment Information">
              <InfoGrid>
                <InfoCard icon="💰" label="Total Amount" value={fmtMoney(d.amountTotal)} highlight />
                <InfoCard icon="✅" label="Payment Status" value={d.paymentStatus} />
                <InfoCard icon="💵" label="Amount Paid" value={fmtMoney(d.amountPaid)} />
              </InfoGrid>
            </Section>

            {d.specialRequests && (
              <Section title="📝 Special Requests">
                <div style={{ padding: '18px', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', borderRadius: '12px', fontSize: '0.95rem', color: '#475569', border: '2px solid #e2e8f0', lineHeight: 1.7, fontWeight: 500 }}>{d.specialRequests}</div>
              </Section>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', paddingTop: '20px', borderTop: '2px solid #f1f5f9' }}>
              <button onClick={onClose} style={{ padding: '14px 28px', borderRadius: '12px', border: '2px solid #e2e8f0', background: '#fff', color: '#475569', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}>Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h4 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{title}</h4>
      {children}
    </div>
  );
}

function InfoGrid({ children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
      {children}
    </div>
  );
}

function InfoCard({ icon, label, value, highlight }) {
  return (
    <div style={{ padding: '16px', background: highlight ? '#f0fdf4' : '#f8fafc', borderRadius: '12px', border: `1px solid ${highlight ? '#bbf7d0' : '#e2e8f0'}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span style={{ fontSize: '1.2rem' }}>{icon}</span>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      </div>
      <div style={{ fontSize: highlight ? '1.3rem' : '1rem', fontWeight: highlight ? 800 : 600, color: highlight ? '#166534' : '#0f172a', wordBreak: 'break-word' }}>{value || '—'}</div>
    </div>
  );
}

function colorForStatus(status, custom) {
  if (custom) return { background: custom, border: '1px solid rgba(0,0,0,.12)', color: '#111827' };
  const s = String(status || "").toUpperCase();
  if (s === "IN_HOUSE") return { background: '#dcfce7', border: '1px solid #bbf7d0', color: '#166534' };
  if (s === "BLOCKED") return { background: '#f3f4f6', border: '1px solid #e5e7eb', color: '#334155' };
  if (s === "OOO" || s === "OUT_OF_ORDER") return { background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b' };
  return { background: '#dbeafe', border: '1px solid #93c5fd', color: '#1e40af' };
}

function tagLabel(s) {
  if (s === "IN_HOUSE") return "IN";
  if (s === "BLOCKED") return "BLK";
  if (s === "OOO" || s === "OUT_OF_ORDER") return "OOO";
  return "BKD";
}

function startOfDay(d) {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

function addDays(d, n) {
  const dt = new Date(d);
  dt.setDate(dt.getDate() + n);
  return startOfDay(dt);
}

function toISODate(d) {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function eachDay(a, b) {
  const start = startOfDay(a);
  const end = startOfDay(b);
  const out = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    out.push(new Date(d));
  }
  return out;
}

function isBetween(start, d, end) {
  return +start <= +d && +d <= +end;
}

function weekdayShort(d) {
  return d.toLocaleDateString(undefined, { weekday: "short" });
}

function monthShort(d) {
  return d.toLocaleDateString(undefined, { month: "short" });
}

function fmtDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? "—" : dt.toLocaleDateString();
}

function fmtMoney(x) {
  const n = Number(x || 0);
  try {
    return n.toLocaleString(undefined, { style: "currency", currency: "INR", maximumFractionDigits: 2 });
  } catch {
    return `₹${n.toFixed(2)}`;
  }
}