// src/pages/Frontdesk/Calendar.js
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../../lib/api";
import ReservationSidebar from "../../../components/sidebar/ReservationSidebar";
import "../../../components/sidebar/Sidebar.css";
import "../../../assets/css/commanPage.css";

/**
 * Responsive Monthly Calendar with clean, professional design
 */

export default function Calendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [q, setQ] = useState("");
  const [propertyCode, setPropertyCode] = useState("");

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [openDay, setOpenDay] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [bookingDisplay, setBookingDisplay] = useState("");
  const [hoveredDateISO, setHoveredDateISO] = useState(null);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [selectedDateISO, setSelectedDateISO] = useState(null);

  const { monthStartISO, monthEndISO, days, monthLabel } = useMemo(
    () => buildMonth(year, month),
    [year, month]
  );

  const eventsByDate = useMemo(() => {
    const m = new Map();
    for (const e of events) {
      const d = toISODate(e.date || e.when || e.start || e.checkIn || e.checkInAt);
      if (!d) continue;
      if (!m.has(d)) m.set(d, []);
      m.get(d).push(e);
    }
    for (const k of m.keys()) {
      m.get(k).sort((a, b) =>
        String(a.roomNo || a.title || a.guestName || "").localeCompare(
          String(b.roomNo || b.title || b.guestName || "")
        )
      );
    }
    return m;
  }, [events]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const params = new URLSearchParams({
          from: monthStartISO,
          to: monthEndISO,
        });
        if (q.trim()) params.set("q", q.trim());
        if (propertyCode.trim()) params.set("propertyCode", propertyCode.trim().toUpperCase());

        const res = await apiFetch(`/api/calendar?${params.toString()}`, { auth: true });
        const data = res?.data || res?.items || res || [];
        if (!ignore) setEvents(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!ignore) { 
          setErr(e?.message || "Failed to load calendar."); 
          setEvents([]); 
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [monthStartISO, monthEndISO, q, propertyCode]);

  const goPrev = () => {
    const d = addMonths(new Date(year, month, 1), -1);
    setYear(d.getFullYear()); 
    setMonth(d.getMonth());
  };
  
  const goNext = () => {
    const d = addMonths(new Date(year, month, 1), 1);
    setYear(d.getFullYear()); 
    setMonth(d.getMonth());
  };
  
  const goToday = () => {
    const d = new Date();
    setYear(d.getFullYear()); 
    setMonth(d.getMonth());
  };

  const openDayEvents = (dISO) => {
    setOpenDay(dISO);
  };

  const handleAddEvent = (dISO) => {
    setSelectedDateISO(dISO);
    setShowAddEventModal(true);
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    
    try {
      await apiFetch(`/api/calendar/${eventId}`, { 
        method: 'DELETE',
        auth: true 
      });
      
      // Refresh events
      const params = new URLSearchParams({
        from: monthStartISO,
        to: monthEndISO,
      });
      if (q.trim()) params.set("q", q.trim());
      if (propertyCode.trim()) params.set("propertyCode", propertyCode.trim().toUpperCase());
      
      const res = await apiFetch(`/api/calendar?${params.toString()}`, { auth: true });
      const data = res?.data || res?.items || res || [];
      setEvents(Array.isArray(data) ? data : []);
      
      alert('Event deleted successfully!');
    } catch (e) {
      alert('Failed to delete event: ' + (e?.message || 'Unknown error'));
    }
  };
  
  const dayList = openDay ? (eventsByDate.get(openDay) || []) : [];

  return (
    <div style={pageWrapper}>
      <ReservationSidebar />

      <div style={contentArea}>
        <div style={container}>
          {/* Page Header */}
          <div style={pageHeader}>
            <h1 style={mainTitle}>Monthly Calendar</h1>
          </div>

          {/* Controls Bar */}
          <div style={controlBar}>
            <div style={navSection}>
              <button style={btnPrev} onClick={goPrev}>
                ← Prev
              </button>
              <div style={currentMonth}>{monthLabel}</div>
              <button style={btnNext} onClick={goNext}>
                Next →
              </button>
              <button style={btnToday} onClick={goToday}>
                Today
              </button>
              
              {/* Date Display - Only Day & Date */}
              <input
                style={dateDisplayInput}
                value={selectedDate || "Select a date..."}
                readOnly
                placeholder="Date"
              />
            </div>

            <div style={filterSection}>
              <input
                style={propertyInput}
                placeholder="PROPERTY CODE"
                value={propertyCode}
                onChange={(e) => setPropertyCode(e.target.value.toUpperCase())}
                maxLength={15}
              />
              <input
                style={searchInput}
                value={bookingDisplay || "Hover over dates to see bookings"}
                readOnly
                placeholder="Bookings"
              />
            </div>
          </div>

          {/* Calendar Box */}
          <div style={calendarBox}>
            {/* Info Bar */}
            <div style={infoBar}>
              <div style={infoLeft}>
                <span style={monthText}>{monthLabel}</span>
              </div>
              <div style={infoRight}>
                {loading ? (
                  <span style={loadingBadge}>Loading...</span>
                ) : (
                  <span style={eventsBadge}>
                    Events: <strong>{hoveredDateISO ? 
                      (eventsByDate.get(hoveredDateISO)?.length || 0) 
                      : events.length}</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Calendar Content */}
            <div style={calendarContent}>
              {err && <ErrorAlert>{err}</ErrorAlert>}

              <CalendarGrid
                days={days}
                eventsByDate={eventsByDate}
                onOpenDay={openDayEvents}
                today={toISODate(today.toISOString())}
                setSelectedDate={setSelectedDate}
                setBookingDisplay={setBookingDisplay}
                setHoveredDateISO={setHoveredDateISO}
                setSelectedDateISO={setSelectedDateISO}
                setShowAddEventModal={setShowAddEventModal}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Day Modal */}
      {openDay && (
        <DayModal 
          date={openDay} 
          events={dayList}
          onClose={() => setOpenDay(null)}
          onDelete={handleDeleteEvent}
          onAddEvent={() => handleAddEvent(openDay)}
        />
      )}

      {/* Add Event Modal */}
      {showAddEventModal && (
        <AddEventModal
          date={selectedDateISO}
          onClose={() => {
            setShowAddEventModal(false);
            setSelectedDateISO(null);
          }}
          onSuccess={() => {
            // Refresh events
            const params = new URLSearchParams({
              from: monthStartISO,
              to: monthEndISO,
            });
            if (q.trim()) params.set("q", q.trim());
            if (propertyCode.trim()) params.set("propertyCode", propertyCode.trim().toUpperCase());
            
            apiFetch(`/api/calendar?${params.toString()}`, { auth: true })
              .then(res => {
                const data = res?.data || res?.items || res || [];
                setEvents(Array.isArray(data) ? data : []);
              })
              .catch(() => {});
            
            setShowAddEventModal(false);
            setSelectedDateISO(null);
          }}
        />
      )}
    </div>
  );
}

/* ============ Calendar Grid Component ============ */
function CalendarGrid({ days, eventsByDate, onOpenDay, today, setSelectedDate, setBookingDisplay, setHoveredDateISO, setSelectedDateISO, setShowAddEventModal }) {
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  return (
    <div>
      {/* Weekday Header */}
      <div style={weekHeader}>
        {weekdays.map((day) => (
          <div key={day} style={weekDay}>
            <span style={weekDayFull}>{day}</span>
            <span style={weekDayShort}>{day.slice(0, 3)}</span>
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div style={calendarDaysGrid}>
        {days.map((d, idx) => {
          const dISO = d?.iso || "";
          const list = dISO ? (eventsByDate.get(dISO) || []) : [];
          const isToday = dISO === today;
          const hasEvents = list.length > 0;
          
          if (!d) {
            return <div key={idx} style={emptyDay} />;
          }
          
          return (
            <div
              key={idx}
              style={{
                ...calendarDay,
                ...(isToday && todayStyle),
              }}
              onMouseEnter={() => {
                if (dISO) {
                  setHoveredDateISO(dISO);
                  // Set only day and date in date field
                  const dateOnly = fmtDateOnly(dISO);
                  setSelectedDate(dateOnly);
                  
                  // Set bookings in search field
                  const dayEvents = list;
                  if (dayEvents.length > 0) {
                    const eventsList = dayEvents.map((e, i) => 
                      `${i + 1}. ${e.guestName || e.title || 'Guest'} - Room ${e.roomNo || 'N/A'} - ${e.status || 'Pending'}`
                    ).join(' | ');
                    setBookingDisplay(eventsList);
                  } else {
                    setBookingDisplay('No bookings');
                  }
                }
              }}
              onMouseLeave={() => {
                setHoveredDateISO(null);
                setSelectedDate('');
                setBookingDisplay('');
              }}
              onClick={() => {
                if (dISO) {
                  // Set only day and date in date field
                  const dateOnly = fmtDateOnly(dISO);
                  setSelectedDate(dateOnly);
                  
                  // Set bookings in search field
                  const dayEvents = list;
                  if (dayEvents.length > 0) {
                    const eventsList = dayEvents.map((e, i) => 
                      `${i + 1}. ${e.guestName || e.title || 'Guest'} - Room ${e.roomNo || 'N/A'} - ${e.status || 'Pending'}`
                    ).join(' | ');
                    setBookingDisplay(eventsList);
                    // Open day modal if events exist
                    onOpenDay?.(dISO);
                  } else {
                    setBookingDisplay('No bookings');
                    // Open add event modal if no events
                    setSelectedDateISO(dISO);
                    setShowAddEventModal(true);
                  }
                }
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && dISO) {
                  e.preventDefault();
                  // Set only day and date in date field
                  const dateOnly = fmtDateOnly(dISO);
                  setSelectedDate(dateOnly);
                  
                  // Set bookings in search field
                  const dayEvents = list;
                  if (dayEvents.length > 0) {
                    const eventsList = dayEvents.map((ev, i) => 
                      `${i + 1}. ${ev.guestName || ev.title || 'Guest'} - Room ${ev.roomNo || 'N/A'} - ${ev.status || 'Pending'}`
                    ).join(' | ');
                    setBookingDisplay(eventsList);
                  } else {
                    setBookingDisplay('No bookings');
                  }
                  
                  if (hasEvents) onOpenDay?.(dISO);
                }
              }}
            >
              <div style={dayTop}>
                <span style={isToday ? todayLabel : dayLabel}>
                  {d.day}
                </span>
                {hasEvents && (
                  <span style={countBadge}>{list.length}</span>
                )}
              </div>

              {hasEvents && (
                <div style={eventsArea}>
                  {list.slice(0, 4).map((e, i) => (
                    <div key={e.id || i} style={eventItem}>
                      <div style={eventIndicator} />
                      <span style={eventText}>
                        {e.roomNo && <strong style={roomNum}>Room {e.roomNo}</strong>}
                        {e.roomNo && " - "}
                        <span style={guestText}>
                          {e.guestName || e.title || "Guest"}
                        </span>
                      </span>
                    </div>
                  ))}
                  {list.length > 4 && (
                    <div style={moreText}>
                      +{list.length - 4} more booking{list.length - 4 !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============ Modal Component ============ */
function DayModal({ date, events, onClose, onDelete, onAddEvent }) {
  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <div style={modalHead}>
          <h2 style={modalHeading}>Events — {fmtLong(date)}</h2>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button onClick={onAddEvent} style={btnAddEvent}>
              + Add Event
            </button>
            <button onClick={onClose} style={btnClose} aria-label="Close">
              ✕
            </button>
          </div>
        </div>
        
        <div style={modalBody}>
          {events.length === 0 ? (
            <div style={noEvents}>
              <div style={noEventsIcon}>📅</div>
              <div style={noEventsText}>No events scheduled for this day</div>
              <button onClick={onAddEvent} style={btnAddEventLarge}>
                + Add Event
              </button>
            </div>
          ) : (
            <div style={eventList}>
              {events.map((e, i) => (
                <div key={e.id || i} style={eventBox}>
                  <div style={eventHeader}>
                    <span style={eventName}>
                      {e.title || e.guestName || "Event"}
                    </span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {e.status && (
                        <span style={statusBadge}>
                          {String(e.status).toUpperCase()}
                        </span>
                      )}
                      <button 
                        onClick={() => onDelete(e.id)} 
                        style={btnDeleteEvent}
                        aria-label="Delete event"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  <div style={eventDetails}>
                    {e.roomNo && (
                      <span style={detailItem}>
                        🏠 Room {e.roomNo}
                      </span>
                    )}
                    {e.mobile && (
                      <span style={detailItem}>
                        📱 {e.mobile}
                      </span>
                    )}
                    {e.reservationNo && (
                      <span style={detailItem}>
                        📋 Res# {e.reservationNo}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={modalFoot}>
          <button style={btnCloseMain} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============ Add Event Modal Component ============ */
function AddEventModal({ date, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    guestName: '',
    roomNo: '',
    title: '',
    status: 'PENDING',
    mobile: '',
    reservationNo: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await apiFetch('/api/calendar', {
        method: 'POST',
        auth: true,
        body: JSON.stringify({
          ...formData,
          date: date,
          checkIn: date,
        }),
      });

      alert('Event added successfully!');
      onSuccess();
    } catch (error) {
      alert('Failed to add event: ' + (error?.message || 'Unknown error'));
      setSaving(false);
    }
  };

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <div style={modalHead}>
          <h2 style={modalHeading}>Add Event — {fmtLong(date)}</h2>
          <button onClick={onClose} style={btnClose} aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={modalBody}>
            <div style={formGrid}>
              <div style={formGroup}>
                <label style={formLabel}>Guest Name *</label>
                <input
                  style={formInput}
                  type="text"
                  value={formData.guestName}
                  onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                  required
                  placeholder="Enter guest name"
                />
              </div>

              <div style={formGroup}>
                <label style={formLabel}>Room Number *</label>
                <input
                  style={formInput}
                  type="text"
                  value={formData.roomNo}
                  onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
                  required
                  placeholder="e.g., 101"
                />
              </div>

              <div style={formGroup}>
                <label style={formLabel}>Title</label>
                <input
                  style={formInput}
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Event title"
                />
              </div>

              <div style={formGroup}>
                <label style={formLabel}>Status</label>
                <select
                  style={formInput}
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="CHECKED_IN">Checked In</option>
                  <option value="CHECKED_OUT">Checked Out</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div style={formGroup}>
                <label style={formLabel}>Mobile Number</label>
                <input
                  style={formInput}
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="e.g., +91 9876543210"
                  pattern="[0-9+\s-]*"
                />
              </div>

              <div style={formGroup}>
                <label style={formLabel}>Reservation Number</label>
                <input
                  style={formInput}
                  type="text"
                  value={formData.reservationNo}
                  onChange={(e) => setFormData({ ...formData, reservationNo: e.target.value })}
                  placeholder="e.g., RES-12345"
                />
              </div>
            </div>
          </div>

          <div style={modalFoot}>
            <button type="button" style={btnCancel} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" style={btnSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ============ Error Alert ============ */
function ErrorAlert({ children }) {
  return (
    <div style={alertBox}>
      <span style={alertIcon}>⚠️</span>
      <span style={alertText}>{children}</span>
    </div>
  );
}

/* ============ Date Helper Functions ============ */
function buildMonth(year, monthIdx) {
  const first = new Date(year, monthIdx, 1);
  const last = new Date(year, monthIdx + 1, 0);
  const startWeekday = first.getDay();
  const daysIn = last.getDate();

  const days = [];
  for (let i = 0; i < startWeekday; i++) days.push(null);
  for (let d = 1; d <= daysIn; d++) {
    const iso = toISODate(new Date(year, monthIdx, d).toISOString());
    days.push({ day: d, iso });
  }
  const remainder = days.length % 7;
  if (remainder) for (let i = 0; i < 7 - remainder; i++) days.push(null);

  const monthStartISO = toISODate(first.toISOString());
  const monthEndISO = toISODate(last.toISOString());
  const monthLabel = `${first.toLocaleString(undefined, { month: "long" })} ${year}`;
  return { monthStartISO, monthEndISO, days, monthLabel };
}

function addMonths(date, n) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

function toISODate(dLike) {
  const d = new Date(dLike);
  if (Number.isNaN(+d)) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fmtLong(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { 
      weekday: "long", 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    });
  } catch { 
    return iso; 
  }
}

function fmtDateOnly(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { 
      weekday: "short", 
      day: "numeric"
    });
  } catch { 
    return iso; 
  }
}

/* ============ Styles ============ */
const pageWrapper = {
  display: "flex",
  minHeight: "100vh",
  background: "#f5f7fa",
};

const contentArea = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  overflow: "auto",
  justifyContent: "flex-start",
  alignItems: "center",
};

const container = {
  width: "100%",
  maxWidth: "1600px",
  margin: "0 auto",
  padding: "24px 24px 24px 160px",
};

const pageHeader = {
  marginBottom: "24px",
};

const mainTitle = {
  fontSize: "28px",
  fontWeight: "700",
  color: "#1a202c",
  margin: 0,
};

const controlBar = {
  display: "flex",
  gap: "16px",
  marginBottom: "24px",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
};

const navSection = {
  display: "flex",
  gap: "8px",
  alignItems: "center",
  flexWrap: "wrap",
};

const btnPrev = {
  padding: "10px 20px",
  background: "#ffffff",
  border: "2px solid #e2e8f0",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: "600",
  color: "#4a5568",
  cursor: "pointer",
  transition: "all 0.2s",
  outline: "none",
};

const btnNext = {
  padding: "10px 20px",
  background: "#ffffff",
  border: "2px solid #e2e8f0",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: "600",
  color: "#4a5568",
  cursor: "pointer",
  transition: "all 0.2s",
  outline: "none",
};

const currentMonth = {
  padding: "10px 24px",
  background: "#ffffff",
  border: "2px solid #4299e1",
  borderRadius: "8px",
  fontSize: "16px",
  fontWeight: "700",
  color: "#2b6cb0",
};

const btnToday = {
  padding: "10px 20px",
  background: "#4299e1",
  border: "2px solid #4299e1",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: "600",
  color: "#ffffff",
  cursor: "pointer",
  transition: "all 0.2s",
  outline: "none",
};

const dateDisplayInput = {
  padding: "10px 16px",
  background: "#fff3cd",
  border: "2px solid #ffc107",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: "700",
  color: "#856404",
  minWidth: "150px",
  outline: "none",
  cursor: "default",
  textAlign: "center",
};

const filterSection = {
  display: "flex",
  gap: "12px",
  flex: "1",
  minWidth: "300px",
  maxWidth: "100%",
  flexWrap: "wrap",
};

const propertyInput = {
  padding: "10px 16px",
  background: "#ffffff",
  border: "2px solid #e2e8f0",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: "600",
  color: "#2d3748",
  width: "180px",
  outline: "none",
  transition: "border-color 0.2s",
};

const searchInput = {
  padding: "10px 16px",
  background: "#f0fdf4",
  border: "2px solid #48bb78",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: "600",
  color: "#166534",
  flex: 2,
  minWidth: "400px",
  outline: "none",
  cursor: "default",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const calendarBox = {
  background: "#ffffff",
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  overflow: "hidden",
};

const infoBar = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "20px 24px",
  borderBottom: "2px solid #edf2f7",
  background: "#f7fafc",
};

const infoLeft = {
  display: "flex",
  alignItems: "center",
};

const monthText = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#2d3748",
};

const infoRight = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const loadingBadge = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#4299e1",
};

const eventsBadge = {
  fontSize: "14px",
  color: "#718096",
};

const calendarContent = {
  padding: "24px",
};

const alertBox = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "14px 18px",
  background: "#fff5f5",
  border: "2px solid #feb2b2",
  borderRadius: "8px",
  marginBottom: "20px",
};

const alertIcon = {
  fontSize: "20px",
};

const alertText = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#c53030",
};

const weekHeader = {
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
  gap: "10px",
  marginBottom: "10px",
  padding: "12px 0",
  borderBottom: "2px solid #edf2f7",
};

const weekDay = {
  textAlign: "center",
  fontWeight: "700",
  color: "#4a5568",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const weekDayFull = {
  fontSize: "13px",
  display: "inline",
};

const weekDayShort = {
  fontSize: "13px",
  display: "none",
};

const calendarDaysGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
  gap: "10px",
  minHeight: "500px",
};

const emptyDay = {
  background: "transparent",
};

const calendarDay = {
  background: "#ffffff",
  border: "2px solid #e2e8f0",
  borderRadius: "10px",
  minHeight: "130px",
  padding: "12px",
  display: "flex",
  flexDirection: "column",
  transition: "all 0.2s",
  cursor: "pointer",
};

const todayStyle = {
  background: "#ebf8ff",
  border: "3px solid #4299e1",
  boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.1)",
};

const dayTop = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "8px",
};

const dayLabel = {
  fontSize: "16px",
  fontWeight: "700",
  color: "#4a5568",
};

const todayLabel = {
  fontSize: "16px",
  fontWeight: "800",
  color: "#2b6cb0",
};

const countBadge = {
  background: "#4299e1",
  color: "#ffffff",
  fontSize: "11px",
  fontWeight: "700",
  padding: "3px 8px",
  borderRadius: "12px",
  minWidth: "20px",
  textAlign: "center",
};

const eventsArea = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};

const eventItem = {
  display: "flex",
  alignItems: "flex-start",
  gap: "6px",
  padding: "6px 8px",
  background: "#f7fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "6px",
  fontSize: "12px",
};

const eventIndicator = {
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  background: "#4299e1",
  marginTop: "3px",
  flexShrink: 0,
};

const eventText = {
  flex: 1,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  color: "#2d3748",
};

const roomNum = {
  color: "#2b6cb0",
  fontWeight: "700",
};

const guestText = {
  color: "#4a5568",
};

const moreText = {
  fontSize: "11px",
  color: "#718096",
  fontWeight: "600",
  textAlign: "center",
  paddingTop: "4px",
};

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0, 0, 0, 0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
  padding: "20px",
};

const modal = {
  background: "#ffffff",
  borderRadius: "12px",
  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
  width: "100%",
  maxWidth: "700px",
  maxHeight: "85vh",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

const modalHead = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "20px 24px",
  borderBottom: "2px solid #edf2f7",
  background: "#f7fafc",
};

const modalHeading = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#2d3748",
  margin: 0,
};

const btnClose = {
  width: "36px",
  height: "36px",
  borderRadius: "8px",
  border: "2px solid #e2e8f0",
  background: "#ffffff",
  color: "#718096",
  fontSize: "20px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "700",
  transition: "all 0.2s",
  outline: "none",
};

const modalBody = {
  padding: "24px",
  overflowY: "auto",
  flex: 1,
};

const noEvents = {
  textAlign: "center",
  padding: "40px 20px",
};

const noEventsIcon = {
  fontSize: "48px",
  marginBottom: "12px",
};

const noEventsText = {
  fontSize: "16px",
  color: "#718096",
};

const eventList = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const eventBox = {
  padding: "16px",
  background: "#f7fafc",
  border: "2px solid #e2e8f0",
  borderRadius: "10px",
};

const eventHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "10px",
  gap: "12px",
  flexWrap: "wrap",
};

const eventName = {
  fontSize: "16px",
  fontWeight: "700",
  color: "#2d3748",
};

const statusBadge = {
  padding: "4px 12px",
  background: "#4299e1",
  color: "#ffffff",
  fontSize: "11px",
  fontWeight: "700",
  borderRadius: "6px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const eventDetails = {
  display: "flex",
  flexWrap: "wrap",
  gap: "12px",
  fontSize: "14px",
  color: "#4a5568",
};

const detailItem = {
  display: "flex",
  alignItems: "center",
  gap: "4px",
};

const modalFoot = {
  padding: "16px 24px",
  borderTop: "2px solid #edf2f7",
  background: "#f7fafc",
  display: "flex",
  justifyContent: "flex-end",
};

const btnCloseMain = {
  padding: "10px 24px",
  background: "#4299e1",
  border: "none",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.2s",
  outline: "none",
};

const btnAddEvent = {
  padding: "8px 16px",
  background: "#48bb78",
  border: "none",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "13px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.2s",
  outline: "none",
};

const btnAddEventLarge = {
  padding: "12px 24px",
  background: "#48bb78",
  border: "none",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.2s",
  outline: "none",
  marginTop: "16px",
};

const btnDeleteEvent = {
  padding: "4px 8px",
  background: "transparent",
  border: "1px solid #e2e8f0",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px",
  transition: "all 0.2s",
  outline: "none",
};

const formGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "16px",
};

const formGroup = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};

const formLabel = {
  fontSize: "13px",
  fontWeight: "600",
  color: "#4a5568",
};

const formInput = {
  padding: "10px 12px",
  border: "2px solid #e2e8f0",
  borderRadius: "8px",
  fontSize: "14px",
  color: "#2d3748",
  outline: "none",
  transition: "border-color 0.2s",
};

const btnCancel = {
  padding: "10px 24px",
  background: "#ffffff",
  border: "2px solid #e2e8f0",
  borderRadius: "8px",
  color: "#4a5568",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.2s",
  outline: "none",
};

const btnSave = {
  padding: "10px 24px",
  background: "#48bb78",
  border: "none",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.2s",
  outline: "none",
};