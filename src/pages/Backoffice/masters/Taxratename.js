// src/pages/Backoffice/masters/TaxRateName.js
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../../lib/api";
import { BackofficeSidebar } from "../../../components/sidebar/backofficesidebar";
import "../../../components/sidebar/Sidebar.css";
import "../../../assets/css/commanPage.css";

const PAGE_SIZE = 10;

export default function TaxRateName() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true); setErr("");
      try {
        const params = new URLSearchParams({ q, page, limit });
        const res = await apiFetch(`/api/tax-rate-names?${params.toString()}`, { auth: true });
        const data = res?.data || res || [];
        const count = res?.total ?? data.length ?? 0;
        if (!ignore) { setRows(Array.isArray(data) ? data : []); setTotal(Number(count) || 0); }
      } catch (e) {
        if (!ignore) { setErr(e?.message || "Failed to load tax rate names."); setRows([]); setTotal(0); }
      } finally { if (!ignore) setLoading(false); }
    })();
    return () => { ignore = true; };
  }, [q, page, limit]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter(r =>
      [r.taxRateName, r.shortName, r.under]
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
          <h2 style={{ margin: 0 }}>Tax Rate Name</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="res-select"
              placeholder="Search (tax rate name / short name / under)"
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
            <button className="btn" onClick={openCreate}>+ Add Tax Rate Name</button>
          </div>
        </div>

        <div className="panel">
          <div className="panel-h">
            <span>Tax Rate Names</span>
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
                    <th>Tax Rate Name</th>
                    <th>Short Name</th>
                    <th>Under</th>
                    <th>For Other Country</th>
                    <th>For Other State</th>
                    <th>For Other City</th>
                    <th>Created</th>
                    <th>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {(!dataToRender || dataToRender.length === 0) && !loading && (
                    <tr className="no-rows"><td colSpan={9}>No tax rate names found</td></tr>
                  )}

                  {dataToRender?.map(r => {
                    const id = r._id || r.id;
                    return (
                      <tr key={id}>
                        <td>
                          <button className="btn" style={btnSm} onClick={() => openEdit(r)}>??</button>
                          <button
                            className="btn" style={btnSm}
                            onClick={async () => {
                              await apiFetch(`/api/tax-rate-names/${id}`, { method: "DELETE", auth: true });
                              afterDelete(id);
                            }}
                          >???</button>
                        </td>
                        <td>{r.taxRateName || "—"}</td>
                        <td>{r.shortName || "—"}</td>
                        <td>{r.under || "—"}</td>
                        <td><YesNo value={r.forOtherCountry} /></td>
                        <td><YesNo value={r.forOtherState} /></td>
                        <td><YesNo value={r.forOtherCity} /></td>
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
        <TaxRateNameForm
          initial={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={afterSave}
        />
      )}
    </div>
  );
}

/* ---------- Form Modal ---------- */
function TaxRateNameForm({ initial, onClose, onSaved }) {
  const isEdit = !!initial;
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [taxRateName, setTaxRateName] = useState(initial?.taxRateName || "");
  const [shortName, setShortName] = useState(initial?.shortName || "");
  const [under, setUnder] = useState(initial?.under || "");
  const [forOtherCountry, setForOtherCountry] = useState(initial?.forOtherCountry ?? false);
  const [forOtherState, setForOtherState] = useState(initial?.forOtherState ?? false);
  const [forOtherCity, setForOtherCity] = useState(initial?.forOtherCity ?? false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(""); setOk("");

    if (!taxRateName.trim()) return setErr("Tax Rate Name is required");

    const payload = {
      taxRateName: taxRateName.trim(),
      shortName: shortName.trim(),
      under: under.trim(),
      forOtherCountry,
      forOtherState,
      forOtherCity,
    };

    setSaving(true);
    try {
      let saved;
      if (isEdit) {
        const id = initial._id || initial.id;
        saved = await apiFetch(`/api/tax-rate-names/${id}`, { method: "PATCH", auth: true, body: JSON.stringify(payload) });
      } else {
        saved = await apiFetch("/api/tax-rate-names", { method: "POST", auth: true, body: JSON.stringify(payload) });
      }
      setOk("Saved.");
      onSaved(saved);
    } catch (e2) {
      setErr(e2?.message || "Failed to save tax rate name.");
    } finally { setSaving(false); }
  };

  const handleReset = () => {
    setTaxRateName("");
    setShortName("");
    setUnder("");
    setForOtherCountry(false);
    setForOtherState(false);
    setForOtherCity(false);
    setErr("");
    setOk("");
  };

  return (
    <Modal title={isEdit ? "Edit Tax Rate Name" : "Add Tax Rate Name"} onClose={onClose}>
      {err && <Banner type="err">{err}</Banner>}
      {ok && <Banner type="ok">{ok}</Banner>}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 16 }}>
        <Row>
          <Field label="Tax Rate Name" required>
            <input className="input" value={taxRateName} onChange={e => setTaxRateName(e.target.value)} />
          </Field>
          <Field label="Short Name">
            <input className="input" value={shortName} onChange={e => setShortName(e.target.value)} />
          </Field>
          <Field label="Under">
            <select className="res-select" value={under} onChange={e => setUnder(e.target.value)}>
              <option value="">--Select--</option>
              <option value="GST">GST</option>
              <option value="CESS">CESS</option>
              <option value="SERVICE CHARGE">SERVICE CHARGE</option>
              <option value="VAT">VAT</option>
              <option value="SUR CHARGE">SUR CHARGE</option>
              <option value="VAT8%">VAT8%</option>
              <option value="MUNICIPALITY TAX">MUNICIPALITY TAX</option>
              <option value="TOURISM TAX">TOURISM TAX</option>
              <option value="EXCISE FEE">EXCISE FEE</option>
              <option value="SALES TAX">SALES TAX</option>
              <option value="TAX 18%">TAX 18%</option>
              <option value="SST">SST</option>
              <option value="SERVICE CHARGE(SC)">SERVICE CHARGE(SC)</option>
              <option value="SVC CHARGE">SVC CHARGE</option>
              <option value="Direct Expenses">Direct Expenses</option>
              <option value="Indirect Expenses">Indirect Expenses</option>
              <option value="Current Liabilities">Current Liabilities</option>
              <option value="Duties & Taxes">Duties & Taxes</option>
            </select>
          </Field>
        </Row>

        <Row>
          <RadioGroup label="For Other Country">
            <RadioOption 
              label="Yes" 
              checked={forOtherCountry === true} 
              onChange={() => setForOtherCountry(true)} 
            />
            <RadioOption 
              label="No" 
              checked={forOtherCountry === false} 
              onChange={() => setForOtherCountry(false)} 
            />
          </RadioGroup>
          
          <RadioGroup label="For Other State">
            <RadioOption 
              label="Yes" 
              checked={forOtherState === true} 
              onChange={() => setForOtherState(true)} 
            />
            <RadioOption 
              label="No" 
              checked={forOtherState === false} 
              onChange={() => setForOtherState(false)} 
            />
          </RadioGroup>
          
          <RadioGroup label="For Other City">
            <RadioOption 
              label="Yes" 
              checked={forOtherCity === true} 
              onChange={() => setForOtherCity(true)} 
            />
            <RadioOption 
              label="No" 
              checked={forOtherCity === false} 
              onChange={() => setForOtherCity(false)} 
            />
          </RadioGroup>
        </Row>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
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
function Row({ children }) { 
  return <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(3, minmax(160px, 1fr))" }}>{children}</div>; 
}

function Field({ label, required, children }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span className="label" style={{ fontWeight: 700 }}>
        {label} {required && <span style={{ color: "#b91c1c" }}>*</span>}
      </span>
      {children}
    </label>
  );
}

function RadioGroup({ label, children }) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <span className="label" style={{ fontWeight: 700 }}>{label}</span>
      <div style={{ display: "flex", gap: 12 }}>
        {children}
      </div>
    </div>
  );
}

function RadioOption({ label, checked, onChange }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
      <input 
        type="radio" 
        checked={checked} 
        onChange={onChange}
        style={{ cursor: "pointer" }}
      />
      <span>{label}</span>
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

function YesNo({ value }) {
  const isYes = value === true;
  return (
    <span style={{
      display: "inline-block", padding: ".15rem .5rem",
      borderRadius: 999, background: isYes ? "#ecfdf5" : "#f3f4f6",
      border: `1px solid ${isYes ? "#a7f3d0" : "#e5e7eb"}`,
      color: isYes ? "#15803d" : "#334155", fontSize: ".75rem", fontWeight: 700
    }}>
      {isYes ? "Yes" : "No"}
    </span>
  );
}

const btnSm = { padding: ".3rem .5rem", marginRight: 4, fontWeight: 700 };
const backdropStyle = { position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", display: "grid", placeItems: "center", zIndex: 1000 };
const modalStyle = { width: "min(900px, calc(100% - 24px))", background: "#fff", borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,.22)", overflow: "hidden" };
const headerStyle = { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid #e5e7eb", background: "#fff" };
const xStyle = { border: "1px solid #e5e5e5", background: "#fff", color: "#111827", borderRadius: 10, width: 36, height: 36, cursor: "pointer" };
function fmtDate(d) { if (!d) return "—"; const dt = new Date(d); return Number.isNaN(dt) ? "—" : dt.toLocaleDateString(); }  