// src/pages/Backoffice/masters/OrderCancelTime.js
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../../lib/api";
import { BackofficeSidebar } from "../../../components/sidebar/backofficesidebar";
import "../../../components/sidebar/Sidebar.css";
import "../../../assets/css/commanPage.css";

const PAGE_SIZE = 10;

export default function OrderCancelTimeMaster() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  // Load order cancel settings
  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true); setErr("");
      try {
        const params = new URLSearchParams({ q, page, limit });
        const res = await apiFetch(`/api/order-cancel-settings?${params.toString()}`, { auth: true });
        const data = res?.data || res || [];
        const count = res?.total ?? data.length ?? 0;
        if (!ignore) { setRows(Array.isArray(data) ? data : []); setTotal(Number(count) || 0); }
      } catch (e) {
        if (!ignore) { setErr(e?.message || "Failed to load order cancel settings."); setRows([]); setTotal(0); }
      } finally { if (!ignore) setLoading(false); }
    })();
    return () => { ignore = true; };
  }, [q, page, limit]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter(r =>
      [r.property, r.orderTime, r.complainTime, r.deliveryBoyOrderAcceptTime]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(term))
    );
  }, [rows, q]);

  const dataToRender = rows?.length && total > rows.length ? rows : filtered;

  const openCreate = () => { setEditing(null); setShowForm(true); };
  const openEdit = (row) => { setEditing(row); setShowForm(true); };

  const afterSave = (saved) => {
    setShowForm(false); setEditing(null);
    setRows(prev => {
      const id = saved._id || saved.id;
      const idx = prev.findIndex(p => (p._id || p.id) === id);
      if (idx === -1) return [saved, ...prev];
      const next = prev.slice(); next[idx] = saved; return next;
    });
  };

  const afterDelete = (id) => {
    setRows(prev => prev.filter(r => (r._id || r.id) !== id));
    setTotal(t => Math.max(0, t - 1));
  };

  return (
    <div className="page" style={{ display: "grid", gridTemplateColumns: "auto 1fr" }}>
      <BackofficeSidebar />

      <div className="res-wrap">
        <div className="res-topbar">
          <h2 style={{ margin: 0 }}>Order/Complain Cancel Setting</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="res-select"
              placeholder="Search settings"
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              style={{ minWidth: 320 }}
            />
            <select
              className="res-select"
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
            >
              {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}/page</option>)}
            </select>
            <button className="btn" onClick={openCreate}>+ Add Setting</button>
          </div>
        </div>

        <div className="panel">
          <div className="panel-h">
            <span>Cancel Settings</span>
            <span className="small" style={{ color: "var(--muted)" }}>
              {loading ? "Loading…" : `Total: ${total || dataToRender.length}`}
            </span>
          </div>

          <div className="panel-b">
            {err && <Banner type="err">{err}</Banner>}

            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: 90 }}>Action</th>
                    <th>Property</th>
                    <th>Order Time (Min)</th>
                    <th>Complain Time (Min)</th>
                    <th>Delivery Boy Accept Time (Min)</th>
                    <th>Created</th>
                    <th>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {(!dataToRender || dataToRender.length === 0) && !loading && (
                    <tr className="no-rows"><td colSpan={7}>No settings found</td></tr>
                  )}

                  {dataToRender?.map(r => {
                    const id = r._id || r.id;
                    return (
                      <tr key={id}>
                        <td>
                          <button className="btn" style={btnSm} onClick={() => openEdit(r)}>?</button>
                          <button
                            className="btn" style={btnSm}
                            onClick={async () => {
                              if (!window.confirm("Delete this setting?")) return;
                              await apiFetch(`/api/order-cancel-settings/${id}`, { method: "DELETE", auth: true });
                              afterDelete(id);
                            }}
                          >??</button>
                        </td>
                        <td>{r.property || "—"}</td>
                        <td>{r.orderTime ?? "—"}</td>
                        <td>{r.complainTime ?? "—"}</td>
                        <td>{r.deliveryBoyOrderAcceptTime ?? "—"}</td>
                        <td>{fmtDate(r.createdAt)}</td>
                        <td>{fmtDate(r.updatedAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginTop: 8 }}>
              <button className="btn" disabled={page <= 1 || loading} onClick={() => setPage(p => Math.max(1, p - 1))}>‹ Prev</button>
              <span className="small" style={{ alignSelf: "center", color: "var(--muted)" }}>Page {page}</span>
              <button className="btn" disabled={loading || (!total ? dataToRender.length < limit : page * limit >= total)} onClick={() => setPage(p => p + 1)}>Next ›</button>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <OrderCancelTimeForm
          initial={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={afterSave}
        />
      )}
    </div>
  );
}

/* ---------- Form Modal ---------- */
function OrderCancelTimeForm({ initial, onClose, onSaved }) {
  const isEdit = !!initial;
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [properties, setProperties] = useState([]);

  const [property, setProperty] = useState(initial?.property || "");
  const [orderTime, setOrderTime] = useState(initial?.orderTime ?? 0);
  const [complainTime, setComplainTime] = useState(initial?.complainTime ?? 0);
  const [deliveryBoyOrderAcceptTime, setDeliveryBoyOrderAcceptTime] = useState(initial?.deliveryBoyOrderAcceptTime ?? 0);

  // Load properties
  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch("/api/properties?limit=200", { auth: true });
        const data = res?.data || res || [];
        setProperties(Array.isArray(data) ? data : []);
      } catch { /* ignore */ }
    })();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault(); setErr(""); setOk("");

    if (!property.trim()) return setErr("Property is required");
    if (orderTime < 0) return setErr("Order Time must be 0 or greater");
    if (complainTime < 0) return setErr("Complain Time must be 0 or greater");
    if (deliveryBoyOrderAcceptTime < 0) return setErr("Delivery Boy Order Accept Time must be 0 or greater");

    const payload = {
      property: property.trim(),
      orderTime: Number(orderTime),
      complainTime: Number(complainTime),
      deliveryBoyOrderAcceptTime: Number(deliveryBoyOrderAcceptTime),
    };

    setSaving(true);
    try {
      let saved;
      if (isEdit) {
        const id = initial._id || initial.id;
        saved = await apiFetch(`/api/order-cancel-settings/${id}`, { method: "PATCH", auth: true, body: JSON.stringify(payload) });
      } else {
        saved = await apiFetch("/api/order-cancel-settings", { method: "POST", auth: true, body: JSON.stringify(payload) });
      }
      setOk("Saved.");
      onSaved(saved);
    } catch (e2) {
      setErr(e2?.message || "Failed to save setting.");
    } finally { setSaving(false); }
  };

  const handleReset = () => {
    setProperty("");
    setOrderTime(0);
    setComplainTime(0);
    setDeliveryBoyOrderAcceptTime(0);
    setErr("");
    setOk("");
  };

  return (
    <Modal title={isEdit ? "Edit Order/Complain Cancel Setting" : "Add Order/Complain Cancel Setting"} onClose={onClose}>
      {err && <Banner type="err">{err}</Banner>}
      {ok && <Banner type="ok">{ok}</Banner>}

      <div style={{ background: "#f9fafb", padding: "8px 12px", marginBottom: 16, borderRadius: 8 }}>
        <span style={{ color: "#059669", fontWeight: 700 }}>All * filed Mandatory</span>
      </div>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 16 }}>
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(4, 1fr)" }}>
          <Field label="Property" required>
            <select className="res-select" value={property} onChange={e => setProperty(e.target.value)}>
              <option value="">--Select--</option>
              {properties.map(p => (
                <option key={p._id || p.code} value={p.code || p.propertyCode}>
                  {p.name || p.propertyName}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Order Time" required helpText="In Min">
            <input 
              className="input" 
              type="number" 
              min="0"
              value={orderTime} 
              onChange={e => setOrderTime(e.target.value)} 
            />
          </Field>

          <Field label="Complain Time" required helpText="In Min">
            <input 
              className="input" 
              type="number" 
              min="0"
              value={complainTime} 
              onChange={e => setComplainTime(e.target.value)} 
            />
          </Field>

          <Field label="Delivery Boy Order Accept Time" required helpText="In Min">
            <input 
              className="input" 
              type="number" 
              min="0"
              value={deliveryBoyOrderAcceptTime} 
              onChange={e => setDeliveryBoyOrderAcceptTime(e.target.value)} 
            />
          </Field>
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-start" }}>
          <button 
            type="button" 
            className="btn" 
            style={{ background: "#dc2626", color: "#fff" }} 
            onClick={handleReset}
          >
            RESET
          </button>
          <button 
            type="submit" 
            className="btn" 
            style={{ background: "#7c3aed", color: "#fff" }}
            disabled={saving}
          >
            {saving ? "Saving…" : "SAVE"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------- UI Components ---------- */
function Field({ label, required, helpText, children }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span className="label" style={{ fontWeight: 700 }}>
        {label} {required && <span style={{ color: "#b91c1c" }}>*</span>}
        {helpText && <span style={{ color: "#059669", fontWeight: 400 }}>{helpText}</span>}
      </span>
      {children}
    </label>
  );
}

function Banner({ type = "ok", children }) {
  const style = type === "err"
    ? { background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" }
    : { background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0" };
  return <div style={{ ...style, padding: "8px 10px", borderRadius: 10, fontWeight: 700, marginBottom: 10 }}>{children}</div>;
}

function Modal({ title, onClose, children }) {
  return (
    <div style={backdropStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800 }}>{title}</h3>
          <button onClick={onClose} aria-label="Close" style={xStyle}>×</button>
        </div>
        <div style={{ padding: 16 }}>{children}</div>
      </div>
    </div>
  );
}

const btnSm = { padding: ".3rem .5rem", marginRight: 4, fontWeight: 700 };
const backdropStyle = { position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", display: "grid", placeItems: "center", zIndex: 1000 };
const modalStyle = { width: "min(1000px, calc(100% - 24px))", background: "#fff", borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,.22)", overflow: "hidden", maxHeight: "90vh", overflowY: "auto" };
const headerStyle = { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid #e5e7eb", background: "#fff", position: "sticky", top: 0, zIndex: 1 };
const xStyle = { border: "1px solid #e5e5e5", background: "#fff", color: "#111827", borderRadius: 10, width: 36, height: 36, cursor: "pointer" };
function fmtDate(d) { if (!d) return "—"; const dt = new Date(d); return Number.isNaN(dt) ? "—" : dt.toLocaleDateString(); }