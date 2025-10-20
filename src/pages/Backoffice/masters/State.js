// src/pages/Backoffice/masters/State.js
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../../lib/api";
import { BackofficeSidebar } from "../../../components/sidebar/backofficesidebar";
import "../../../components/sidebar/Sidebar.css";
import "../../../assets/css/commanPage.css";

const PAGE_SIZE = 10;
const MASTER_TYPE = "STATE";

// Hardcoded countries list
const COUNTRIES = [
  { code: "AF", name: "Afghanistan" },
  { code: "AL", name: "Albania" },
  { code: "DZ", name: "Algeria" },
  { code: "AS", name: "American Samoa" },
  { code: "AD", name: "Andorra" },
  { code: "AO", name: "Angola" },
  { code: "AR", name: "Argentina" },
  { code: "AM", name: "Armenia" },
  { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" },
  { code: "AZ", name: "Azerbaijan" },
  { code: "BS", name: "Bahamas" },
  { code: "BH", name: "Bahrain" },
  { code: "BD", name: "Bangladesh" },
  { code: "BB", name: "Barbados" },
  { code: "BY", name: "Belarus" },
  { code: "BE", name: "Belgium" },
  { code: "BZ", name: "Belize" },
  { code: "BJ", name: "Benin" },
  { code: "BT", name: "Bhutan" },
  { code: "BO", name: "Bolivia" },
  { code: "BA", name: "Bosnia and Herzegovina" },
  { code: "BW", name: "Botswana" },
  { code: "BR", name: "Brazil" },
  { code: "BN", name: "Brunei" },
  { code: "BG", name: "Bulgaria" },
  { code: "BF", name: "Burkina Faso" },
  { code: "BI", name: "Burundi" },
  { code: "KH", name: "Cambodia" },
  { code: "CM", name: "Cameroon" },
  { code: "CA", name: "Canada" },
  { code: "CV", name: "Cape Verde" },
  { code: "CF", name: "Central African Republic" },
  { code: "TD", name: "Chad" },
  { code: "CL", name: "Chile" },
  { code: "CN", name: "China" },
  { code: "CO", name: "Colombia" },
  { code: "KM", name: "Comoros" },
  { code: "CG", name: "Congo" },
  { code: "CR", name: "Costa Rica" },
  { code: "HR", name: "Croatia" },
  { code: "CU", name: "Cuba" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czech Republic" },
  { code: "DK", name: "Denmark" },
  { code: "DJ", name: "Djibouti" },
  { code: "DM", name: "Dominica" },
  { code: "DO", name: "Dominican Republic" },
  { code: "EC", name: "Ecuador" },
  { code: "EG", name: "Egypt" },
  { code: "SV", name: "El Salvador" },
  { code: "GQ", name: "Equatorial Guinea" },
  { code: "ER", name: "Eritrea" },
  { code: "EE", name: "Estonia" },
  { code: "ET", name: "Ethiopia" },
  { code: "FJ", name: "Fiji" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "GA", name: "Gabon" },
  { code: "GM", name: "Gambia" },
  { code: "GE", name: "Georgia" },
  { code: "DE", name: "Germany" },
  { code: "GH", name: "Ghana" },
  { code: "GR", name: "Greece" },
  { code: "GD", name: "Grenada" },
  { code: "GT", name: "Guatemala" },
  { code: "GN", name: "Guinea" },
  { code: "GW", name: "Guinea-Bissau" },
  { code: "GY", name: "Guyana" },
  { code: "HT", name: "Haiti" },
  { code: "HN", name: "Honduras" },
  { code: "HU", name: "Hungary" },
  { code: "IS", name: "Iceland" },
  { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" },
  { code: "IR", name: "Iran" },
  { code: "IQ", name: "Iraq" },
  { code: "IE", name: "Ireland" },
  { code: "IL", name: "Israel" },
  { code: "IT", name: "Italy" },
  { code: "JM", name: "Jamaica" },
  { code: "JP", name: "Japan" },
  { code: "JO", name: "Jordan" },
  { code: "KZ", name: "Kazakhstan" },
  { code: "KE", name: "Kenya" },
  { code: "KI", name: "Kiribati" },
  { code: "KP", name: "North Korea" },
  { code: "KR", name: "South Korea" },
  { code: "KW", name: "Kuwait" },
  { code: "KG", name: "Kyrgyzstan" },
  { code: "LA", name: "Laos" },
  { code: "LV", name: "Latvia" },
  { code: "LB", name: "Lebanon" },
  { code: "LS", name: "Lesotho" },
  { code: "LR", name: "Liberia" },
  { code: "LY", name: "Libya" },
  { code: "LI", name: "Liechtenstein" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "MK", name: "North Macedonia" },
  { code: "MG", name: "Madagascar" },
  { code: "MW", name: "Malawi" },
  { code: "MY", name: "Malaysia" },
  { code: "MV", name: "Maldives" },
  { code: "ML", name: "Mali" },
  { code: "MT", name: "Malta" },
  { code: "MH", name: "Marshall Islands" },
  { code: "MR", name: "Mauritania" },
  { code: "MU", name: "Mauritius" },
  { code: "MX", name: "Mexico" },
  { code: "FM", name: "Micronesia" },
  { code: "MD", name: "Moldova" },
  { code: "MC", name: "Monaco" },
  { code: "MN", name: "Mongolia" },
  { code: "ME", name: "Montenegro" },
  { code: "MA", name: "Morocco" },
  { code: "MZ", name: "Mozambique" },
  { code: "MM", name: "Myanmar" },
  { code: "NA", name: "Namibia" },
  { code: "NR", name: "Nauru" },
  { code: "NP", name: "Nepal" },
  { code: "NL", name: "Netherlands" },
  { code: "NZ", name: "New Zealand" },
  { code: "NI", name: "Nicaragua" },
  { code: "NE", name: "Niger" },
  { code: "NG", name: "Nigeria" },
  { code: "NO", name: "Norway" },
  { code: "OM", name: "Oman" },
  { code: "PK", name: "Pakistan" },
  { code: "PW", name: "Palau" },
  { code: "PA", name: "Panama" },
  { code: "PG", name: "Papua New Guinea" },
  { code: "PY", name: "Paraguay" },
  { code: "PE", name: "Peru" },
  { code: "PH", name: "Philippines" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "QA", name: "Qatar" },
  { code: "RO", name: "Romania" },
  { code: "RU", name: "Russia" },
  { code: "RW", name: "Rwanda" },
  { code: "KN", name: "Saint Kitts and Nevis" },
  { code: "LC", name: "Saint Lucia" },
  { code: "VC", name: "Saint Vincent and the Grenadines" },
  { code: "WS", name: "Samoa" },
  { code: "SM", name: "San Marino" },
  { code: "ST", name: "Sao Tome and Principe" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "SN", name: "Senegal" },
  { code: "RS", name: "Serbia" },
  { code: "SC", name: "Seychelles" },
  { code: "SL", name: "Sierra Leone" },
  { code: "SG", name: "Singapore" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "SB", name: "Solomon Islands" },
  { code: "SO", name: "Somalia" },
  { code: "ZA", name: "South Africa" },
  { code: "SS", name: "South Sudan" },
  { code: "ES", name: "Spain" },
  { code: "LK", name: "Sri Lanka" },
  { code: "SD", name: "Sudan" },
  { code: "SR", name: "Suriname" },
  { code: "SZ", name: "Eswatini" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
  { code: "SY", name: "Syria" },
  { code: "TW", name: "Taiwan" },
  { code: "TJ", name: "Tajikistan" },
  { code: "TZ", name: "Tanzania" },
  { code: "TH", name: "Thailand" },
  { code: "TL", name: "Timor-Leste" },
  { code: "TG", name: "Togo" },
  { code: "TO", name: "Tonga" },
  { code: "TT", name: "Trinidad and Tobago" },
  { code: "TN", name: "Tunisia" },
  { code: "TR", name: "Turkey" },
  { code: "TM", name: "Turkmenistan" },
  { code: "TV", name: "Tuvalu" },
  { code: "UG", name: "Uganda" },
  { code: "UA", name: "Ukraine" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "UY", name: "Uruguay" },
  { code: "UZ", name: "Uzbekistan" },
  { code: "VU", name: "Vanuatu" },
  { code: "VA", name: "Vatican City" },
  { code: "VE", name: "Venezuela" },
  { code: "VN", name: "Vietnam" },
  { code: "YE", name: "Yemen" },
  { code: "ZM", name: "Zambia" },
  { code: "ZW", name: "Zimbabwe" }
];

export default function StateMaster() {
  const [rows, setRows] = useState([]);
  const [countriesList, setCountriesList] = useState(COUNTRIES);
  const [filterCountry, setFilterCountry] = useState("");

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  // Load countries from API and merge with hardcoded list
  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch("/api/masters?type=COUNTRY&limit=200", { auth: true });
        const arr = res?.data || res?.items || res || [];
        if (arr.length > 0) {
          const apiCountries = arr.map(c => ({ 
            code: c.countryCode || c.code, 
            name: c.countryName || c.country || c.name 
          }));
          setCountriesList(apiCountries);
        }
        // If API fails or returns empty, keep the hardcoded COUNTRIES list
      } catch (error) {
        console.error("Failed to load countries from API, using hardcoded list:", error);
        // Keep the hardcoded COUNTRIES list
      }
    })();
  }, []);

  // Load list
  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const params = new URLSearchParams({
          q,
          page,
          limit,
          ...(filterCountry ? { countryCode: filterCountry } : {}),
        });
        const res = await apiFetch(`/api/states?${params.toString()}`, { auth: true });
        const data = res?.data || res?.items || res || [];
        const count = res?.total ?? data.length ?? 0;
        if (!ignore) {
          setRows(Array.isArray(data) ? data : []);
          setTotal(Number(count) || 0);
        }
      } catch (e) {
        if (!ignore) {
          setErr(e?.message || "Failed to load states.");
          setRows([]); setTotal(0);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [q, page, limit, filterCountry]);

  // Client fallback search
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter(r =>
      [r.countryCode, r.state, r.stateCode]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(term))
    );
  }, [rows, q]);

  const dataToRender = rows?.length && total > rows.length ? rows : filtered;

  const openCreate = () => { setEditing(null); setShowForm(true); };
  const openEdit = (row) => { setEditing(row); setShowForm(true); };
  const askDelete = (row) => { setToDelete(row); setShowDelete(true); };

  // Helper to get country name from code
  const getCountryName = (code) => {
    const country = countriesList.find(c => c.code === code);
    return country ? country.name : code || "—";
  };

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
    setShowDelete(false); setToDelete(null);
    setRows(prev => prev.filter(r => (r._id || r.id) !== id));
    setTotal(t => Math.max(0, t - 1));
  };

  return (
    <div className="page" style={{ display: "grid", gridTemplateColumns: "auto 1fr" }}>
      <BackofficeSidebar />

      <div className="res-wrap">
        {/* Topbar */}
        <div className="res-topbar">
          <h2 style={{ margin: 0 }}>State Master</h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <select
              className="res-select"
              value={filterCountry}
              onChange={(e) => { setFilterCountry(e.target.value); setPage(1); }}
              title="Filter by Country"
            >
              <option value="">All Countries</option>
              {countriesList.map(c => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>

            <input
              className="res-select"
              placeholder="Search (country / state / state code)"
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
            <button className="btn" onClick={openCreate}>+ Add State</button>
          </div>
        </div>

        {/* Table */}
        <div className="panel">
          <div className="panel-h">
            <span>States</span>
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
                    <th>Country</th>
                    <th>State</th>
                    <th>State Code</th>
                    <th>Created</th>
                    <th>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {(!dataToRender || dataToRender.length === 0) && !loading && (
                    <tr className="no-rows"><td colSpan={6}>No states found</td></tr>
                  )}

                  {dataToRender?.map(r => {
                    const id = r._id || r.id;
                    return (
                      <tr key={id}>
                        <td>
                          <button className="btn" style={btnSm} onClick={() => openEdit(r)}>??</button>
                          <button className="btn" style={btnSm} onClick={() => askDelete(r)}>???</button>
                        </td>
                        <td>{getCountryName(r.countryCode)}</td>
                        <td>{r.state || "—"}</td>
                        <td>{r.stateCode || "—"}</td>
                        <td>{fmtDate(r.createdAt)}</td>
                        <td>{fmtDate(r.updatedAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginTop: 8 }}>
              <button className="btn" disabled={page <= 1 || loading} onClick={() => setPage(p => Math.max(1, p - 1))}>
                ‹ Prev
              </button>
              <span className="small" style={{ alignSelf: "center", color: "var(--muted)" }}>Page {page}</span>
              <button
                className="btn"
                disabled={loading || (!total ? dataToRender.length < limit : page * limit >= total)}
                onClick={() => setPage(p => p + 1)}
              >
                Next ›
              </button>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <StateFormModal
          initial={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={afterSave}
          countriesList={countriesList}
          defaultCountry={filterCountry}
        />
      )}

      {showDelete && (
        <ConfirmModal
          title="Delete State?"
          message={`Delete state "${toDelete?.state}" (${toDelete?.stateCode})? This cannot be undone.`}
          confirmText="Delete"
          onClose={() => { setShowDelete(false); setToDelete(null); }}
          onConfirm={async () => {
            const id = toDelete?._id || toDelete?.id;
            await apiFetch(`/api/states/${id}`, { method: "DELETE", auth: true });
            afterDelete(id);
          }}
        />
      )}
    </div>
  );
}

/* ---------- Form Modal ---------- */
function StateFormModal({ initial, onClose, onSaved, countriesList, defaultCountry }) {
  const isEdit = !!initial;
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [countryCode, setCountryCode] = useState(initial?.countryCode || defaultCountry || "");
  const [state, setState] = useState(initial?.state || "");
  const [stateCode, setStateCode] = useState(initial?.stateCode || "");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(""); setOk("");

    if (!countryCode.trim()) return setErr("Country is required");
    if (!state.trim()) return setErr("State is required");
    if (!stateCode.trim()) return setErr("State Code is required");

    const payload = {
      countryCode: countryCode.trim().toUpperCase(),
      state: state.trim(),
      stateCode: stateCode.trim().toUpperCase(),
    };

    setSaving(true);
    try {
      let saved;
      if (isEdit) {
        const id = initial._id || initial.id;
        saved = await apiFetch(`/api/states/${id}`, { method: "PATCH", auth: true, body: JSON.stringify(payload) });
      } else {
        saved = await apiFetch("/api/states", { method: "POST", auth: true, body: JSON.stringify(payload) });
      }
      setOk("Saved.");
      onSaved(saved);
    } catch (e2) {
      setErr(e2?.message || "Failed to save state.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setCountryCode("");
    setState("");
    setStateCode("");
    setErr("");
    setOk("");
  };

  return (
    <Modal title={isEdit ? "Edit State" : "Create State"} onClose={onClose}>
      {err && <Banner type="err">{err}</Banner>}
      {ok && <Banner type="ok">{ok}</Banner>}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <Row>
          <Field label="Country" required>
            <select
              className="res-select"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
            >
              <option value="">--Select--</option>
              {countriesList.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="State" required>
            <input className="input" value={state} onChange={e => setState(e.target.value)} />
          </Field>
          <Field label="State Code" required>
            <input className="input" value={stateCode} onChange={e => setStateCode(e.target.value)} />
          </Field>
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

/* ---------- Tiny UI helpers ---------- */
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
function ConfirmModal({ title, message, confirmText = "OK", onConfirm, onClose }) {
  const [busy, setBusy] = useState(false);
  return (
    <Modal title={title} onClose={onClose}>
      <p style={{ marginTop: 0 }}>{message}</p>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button className="btn" type="button" onClick={onClose}>Cancel</button>
        <button className="btn" type="button" disabled={busy} onClick={async () => {
          setBusy(true); try { await onConfirm?.(); onClose(); } finally { setBusy(false); }
        }}>
          {busy ? "Working…" : confirmText}
        </button>
      </div>
    </Modal>
  );
}
const btnSm = { padding: ".3rem .5rem", marginRight: 4, fontWeight: 700 };
const backdropStyle = { position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", display: "grid", placeItems: "center", zIndex: 1000 };
const modalStyle = { width: "min(900px, calc(100% - 24px))", background: "#fff", borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,.22)", overflow: "hidden" };
const headerStyle = { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid #e5e7eb", background: "#fff" };
const xStyle = { border: "1px solid #e5e5e5", background: "#fff", color: "#111827", borderRadius: 10, width: 36, height: 36, cursor: "pointer" };
function fmtDate(d) { if (!d) return "—"; const dt = new Date(d); return Number.isNaN(dt) ? "—" : dt.toLocaleDateString(); }