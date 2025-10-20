// src/pages/Backoffice/masters/Area.js
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../../lib/api";
import { BackofficeSidebar } from "../../../components/sidebar/backofficesidebar";
import "../../../components/sidebar/Sidebar.css";
import "../../../assets/css/commanPage.css";

const PAGE_SIZE = 10;

// Hardcoded countries list
const COUNTRIES = [
  { code: "AF", name: "Afghanistan" },
  { code: "AU", name: "Australia" },
  { code: "BD", name: "Bangladesh" },
  { code: "BR", name: "Brazil" },
  { code: "CA", name: "Canada" },
  { code: "CN", name: "China" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" },
  { code: "IT", name: "Italy" },
  { code: "JP", name: "Japan" },
  { code: "MY", name: "Malaysia" },
  { code: "MX", name: "Mexico" },
  { code: "NL", name: "Netherlands" },
  { code: "PK", name: "Pakistan" },
  { code: "PH", name: "Philippines" },
  { code: "SG", name: "Singapore" },
  { code: "ZA", name: "South Africa" },
  { code: "KR", name: "South Korea" },
  { code: "ES", name: "Spain" },
  { code: "LK", name: "Sri Lanka" },
  { code: "TH", name: "Thailand" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
];

export default function AreaMaster() {
  const [rows, setRows] = useState([]);
  const [countriesList] = useState(COUNTRIES);
  const [q, setQ] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [properties, setProperties] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  // Load properties for dropdown
  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch("/api/properties?limit=200", { auth: true });
        const data = res?.data || res || [];
        setProperties(Array.isArray(data) ? data : []);
      } catch { /* ignore */ }
    })();
  }, []);

  // Load states when country filter changes
  useEffect(() => {
    if (!countryFilter) {
      setStates([]);
      setStateFilter("");
      return;
    }
    (async () => {
      try {
        const res = await apiFetch(`/api/states?countryCode=${countryFilter}&limit=500`, { auth: true });
        const data = res?.data || res || [];
        setStates(Array.isArray(data) ? data : []);
      } catch { 
        setStates([]);
      }
    })();
  }, [countryFilter]);

  // Load cities when state filter changes
  useEffect(() => {
    if (!stateFilter) {
      setCities([]);
      setCityFilter("");
      return;
    }
    (async () => {
      try {
        const res = await apiFetch(`/api/cities?stateCode=${stateFilter}&limit=500`, { auth: true });
        const data = res?.data || res || [];
        setCities(Array.isArray(data) ? data : []);
      } catch {
        setCities([]);
      }
    })();
  }, [stateFilter]);

  // Load areas
  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true); setErr("");
      try {
        const params = new URLSearchParams({ q, page, limit });
        if (branchFilter) params.set("propertyCode", branchFilter);
        if (countryFilter) params.set("countryCode", countryFilter);
        if (stateFilter) params.set("stateCode", stateFilter);
        if (cityFilter) params.set("cityCode", cityFilter);

        const res = await apiFetch(`/api/areas?${params.toString()}`, { auth: true });
        const data = res?.data || res || [];
        const count = res?.total ?? data.length ?? 0;
        if (!ignore) { setRows(Array.isArray(data) ? data : []); setTotal(Number(count) || 0); }
      } catch (e) {
        if (!ignore) { setErr(e?.message || "Failed to load areas."); setRows([]); setTotal(0); }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [q, page, limit, branchFilter, countryFilter, stateFilter, cityFilter]);

  // Client search fallback
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter(r =>
      [r.propertyCode, r.countryCode, r.stateCode, r.cityCode, r.area]
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

  // Helper functions to get names
  const getPropertyName = (code) => {
    const property = properties.find(p => p.code === code || p.propertyCode === code);
    return property ? (property.name || property.propertyName) : code || "—";
  };

  const getCountryName = (code) => {
    const country = countriesList.find(c => c.code === code);
    return country ? country.name : code || "—";
  };

  const getStateName = (code) => {
    const state = states.find(s => s.stateCode === code);
    return state ? state.state : code || "—";
  };

  const getCityName = (code) => {
    const city = cities.find(c => c.cityCode === code);
    return city ? city.city : code || "—";
  };

  return (
    <div className="page" style={{ display: "grid", gridTemplateColumns: "auto 1fr" }}>
      <BackofficeSidebar />

      <div className="res-wrap">
        <div className="res-topbar">
          <h2 style={{ margin: 0 }}>Area Master</h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <select
              className="res-select"
              value={branchFilter}
              onChange={(e) => { setBranchFilter(e.target.value); setPage(1); }}
              title="Filter by Property"
            >
              <option value="">All Properties</option>
              {properties.map(p => (
                <option key={p._id || p.code} value={p.code || p.propertyCode}>
                  {p.name || p.propertyName}
                </option>
              ))}
            </select>

            <select
              className="res-select"
              value={countryFilter}
              onChange={(e) => { setCountryFilter(e.target.value); setStateFilter(""); setCityFilter(""); setPage(1); }}
              title="Filter by Country"
            >
              <option value="">All Countries</option>
              {countriesList.map(c => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>

            <select
              className="res-select"
              value={stateFilter}
              onChange={(e) => { setStateFilter(e.target.value); setCityFilter(""); setPage(1); }}
              title="Filter by State"
              disabled={!countryFilter}
            >
              <option value="">All States</option>
              {states.map(s => <option key={s._id || s.stateCode} value={s.stateCode}>{s.state}</option>)}
            </select>

            <select
              className="res-select"
              value={cityFilter}
              onChange={(e) => { setCityFilter(e.target.value); setPage(1); }}
              title="Filter by City"
              disabled={!stateFilter}
            >
              <option value="">All Cities</option>
              {cities.map(c => <option key={c._id || c.cityCode} value={c.cityCode}>{c.city}</option>)}
            </select>

            <input
              className="res-select"
              placeholder="Search areas"
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              style={{ minWidth: 200 }}
            />
            
            <select
              className="res-select"
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
            >
              {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}/page</option>)}
            </select>
            <button className="btn" onClick={openCreate}>+ Add Area</button>
          </div>
        </div>

        <div className="panel">
          <div className="panel-h">
            <span>Areas</span>
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
                    <th>Country</th>
                    <th>State</th>
                    <th>City</th>
                    <th>Area</th>
                    <th>Created</th>
                    <th>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {(!dataToRender || dataToRender.length === 0) && !loading && (
                    <tr className="no-rows"><td colSpan={8}>No areas found</td></tr>
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
                              await apiFetch(`/api/areas/${id}`, { method: "DELETE", auth: true });
                              afterDelete(id);
                            }}
                          >???</button>
                        </td>
                        <td>{getPropertyName(r.propertyCode)}</td>
                        <td>{getCountryName(r.countryCode)}</td>
                        <td>{getStateName(r.stateCode)}</td>
                        <td>{getCityName(r.cityCode)}</td>
                        <td>{r.area || "—"}</td>
                        <td>{fmtDate(r.createdAt)}</td>
                        <td>{fmtDate(r.updatedAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginTop: 8 }}>
              <button className="btn" disabled={page <= 1 || loading}
                onClick={() => setPage(p => Math.max(1, p - 1))}>
                ‹ Prev
              </button>
              <span className="small" style={{ alignSelf: "center", color: "var(--muted)" }}>Page {page}</span>
              <button className="btn"
                disabled={loading || (!total ? dataToRender.length < limit : page * limit >= total)}
                onClick={() => setPage(p => p + 1)}>
                Next ›
              </button>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <AreaFormModal
          initial={editing}
          properties={properties}
          countriesList={countriesList}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={afterSave}
        />
      )}
    </div>
  );
}

/* ---------- Form Modal ---------- */
function AreaFormModal({ initial, onClose, onSaved, properties, countriesList }) {
  const isEdit = !!initial;
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [propertyCode, setPropertyCode] = useState(initial?.propertyCode || "");
  const [countryCode, setCountryCode] = useState(initial?.countryCode || "");
  const [stateCode, setStateCode] = useState(initial?.stateCode || "");
  const [cityCode, setCityCode] = useState(initial?.cityCode || "");
  const [area, setArea] = useState(initial?.area || "");
  
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  // Load states when country changes
  useEffect(() => {
    if (!countryCode) {
      setStates([]);
      setStateCode("");
      return;
    }
    (async () => {
      try {
        const res = await apiFetch(`/api/states?countryCode=${countryCode}&limit=500`, { auth: true });
        const data = res?.data || res || [];
        setStates(Array.isArray(data) ? data : []);
      } catch {
        setStates([]);
      }
    })();
  }, [countryCode]);

  // Load cities when state changes
  useEffect(() => {
    if (!stateCode) {
      setCities([]);
      setCityCode("");
      return;
    }
    (async () => {
      try {
        const res = await apiFetch(`/api/cities?stateCode=${stateCode}&limit=500`, { auth: true });
        const data = res?.data || res || [];
        setCities(Array.isArray(data) ? data : []);
      } catch {
        setCities([]);
      }
    })();
  }, [stateCode]);

  const onSubmit = async (e) => {
    e.preventDefault(); setErr(""); setOk("");

    if (!propertyCode.trim()) return setErr("Property is required");
    if (!countryCode.trim()) return setErr("Country is required");
    if (!stateCode.trim()) return setErr("State is required");
    if (!cityCode.trim()) return setErr("City is required");
    if (!area.trim()) return setErr("Area is required");

    const payload = {
      propertyCode: propertyCode.trim().toUpperCase(),
      countryCode: countryCode.trim().toUpperCase(),
      stateCode: stateCode.trim().toUpperCase(),
      cityCode: cityCode.trim().toUpperCase(),
      area: area.trim(),
    };

    setSaving(true);
    try {
      let saved;
      if (isEdit) {
        const id = initial._id || initial.id;
        saved = await apiFetch(`/api/areas/${id}`, { method: "PATCH", auth: true, body: JSON.stringify(payload) });
      } else {
        saved = await apiFetch("/api/areas", { method: "POST", auth: true, body: JSON.stringify(payload) });
      }
      setOk("Saved.");
      onSaved(saved);
    } catch (e2) {
      setErr(e2?.message || "Failed to save area.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setPropertyCode("");
    setCountryCode("");
    setStateCode("");
    setCityCode("");
    setArea("");
    setErr("");
    setOk("");
  };

  return (
    <Modal title={isEdit ? "Edit Area" : "Add Area"} onClose={onClose}>
      {err && <Banner type="err">{err}</Banner>}
      {ok && <Banner type="ok">{ok}</Banner>}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <Row>
          <Field label="Property" required>
            <select
              className="res-select"
              value={propertyCode}
              onChange={(e) => setPropertyCode(e.target.value)}
            >
              <option value="">--Select--</option>
              {properties.map(p => (
                <option key={p._id || p.code} value={p.code || p.propertyCode}>
                  {p.name || p.propertyName}
                </option>
              ))}
            </select>
          </Field>
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
            <select
              className="res-select"
              value={stateCode}
              onChange={(e) => setStateCode(e.target.value)}
              disabled={!countryCode}
            >
              <option value="">--Select--</option>
              {states.map(s => (
                <option key={s._id || s.stateCode} value={s.stateCode}>{s.state}</option>
              ))}
            </select>
          </Field>
        </Row>

        <Row>
          <Field label="City" required>
            <select
              className="res-select"
              value={cityCode}
              onChange={(e) => setCityCode(e.target.value)}
              disabled={!stateCode}
            >
              <option value="">--Select--</option>
              {cities.map(c => (
                <option key={c._id || c.cityCode} value={c.cityCode}>{c.city}</option>
              ))}
            </select>
          </Field>
          <Field label="Area" required>
            <input className="input" value={area} onChange={e => setArea(e.target.value)} />
          </Field>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <button 
              type="button" 
              className="btn" 
              style={{ background: "#dc2626", color: "#fff", flex: 1 }} 
              onClick={handleReset}
            >
              RESET
            </button>
            <button 
              type="submit" 
              className="btn" 
              style={{ background: "#7c3aed", color: "#fff", flex: 1 }}
              disabled={saving}
            >
              {saving ? "Saving…" : "SAVE"}
            </button>
          </div>
        </Row>
      </form>
    </Modal>
  );
}

/* ---------- Small UI bits ---------- */
function Row({ children }) { 
  return <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(3, minmax(160px, 1fr))" }}>{children}</div>; 
}
function Field({ label, required, children }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span className="label" style={{ fontWeight: 700 }}>{label} {required && <span style={{ color: "#b91c1c" }}>*</span>}</span>
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
const modalStyle = { width: "min(900px, calc(100% - 24px))", background: "#fff", borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,.22)", overflow: "hidden" };
const headerStyle = { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid #e5e7eb", background: "#fff" };
const xStyle = { border: "1px solid #e5e5e5", background: "#fff", color: "#111827", borderRadius: 10, width: 36, height: 36, cursor: "pointer" };
function fmtDate(d) { if (!d) return "—"; const dt = new Date(d); return Number.isNaN(dt) ? "—" : dt.toLocaleDateString(); }