// src/pages/Backoffice/Ledger.js
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../../lib/api";
import { BackofficeSidebar } from "../../../components/sidebar/backofficesidebar";
import "../../../components/sidebar/Sidebar.css";
import "../../../assets/css/commanPage.css";

const PAGE_SIZE = 10;

const LEDGER_GROUPS = ["ASSET", "LIABILITY", "INCOME", "EXPENSE", "BANK", "OTHER"];
const REGISTRATION_TYPES = ["Regular", "Composition", "Unregistered"];

export default function Ledger() {
  const [rows, setRows] = useState([]);
  const [propsList, setPropsList] = useState([]);
  const [filterProp, setFilterProp] = useState("");
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

  // Load properties for dropdowns
  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch("/api/properties?limit=200", { auth: true });
        const arr = res?.data || res || [];
        setPropsList(arr.map(p => ({ code: p.code, name: p.name })));
      } catch {
        // ignore
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
          ...(filterProp ? { branch: filterProp } : {}),
        });
        const res = await apiFetch(`/api/ledgers?${params.toString()}`, { auth: true });
        const data = res?.data || res?.items || res || [];
        const count = res?.total ?? data.length ?? 0;
        if (!ignore) {
          setRows(Array.isArray(data) ? data : []);
          setTotal(Number(count) || 0);
        }
      } catch (e) {
        if (!ignore) {
          setErr(e?.message || "Failed to load ledgers.");
          setRows([]);
          setTotal(0);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [q, page, limit, filterProp]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter(r =>
      [r.branch, r.ledgerName, r.underGroup, r.panNo, r.gstIn, r.city]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(term))
    );
  }, [rows, q]);

  const dataToRender = rows?.length && total > rows.length ? rows : filtered;

  const openCreate = () => { setEditing(null); setShowForm(true); };
  const openEdit = (row) => { setEditing(row); setShowForm(true); };
  const askDelete = (row) => { setToDelete(row); setShowDelete(true); };

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
          <h2 style={{ margin: 0 }}>Ledger</h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <select
              className="res-select"
              value={filterProp}
              onChange={(e) => { setFilterProp(e.target.value); setPage(1); }}
              title="Branch"
            >
              <option value="">All Branches</option>
              {propsList.map(p => (
                <option key={p.code} value={p.code}>{p.name}</option>
              ))}
            </select>

            <input
              className="res-select"
              placeholder="Search (ledger name / PAN / GST / city)"
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              style={{ minWidth: 300 }}
            />

            <select
              className="res-select"
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
            >
              {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}/page</option>)}
            </select>

            <button className="btn" onClick={openCreate}>+ Add Ledger</button>
          </div>
        </div>

        {/* Table */}
        <div className="panel">
          <div className="panel-h">
            <span>Ledgers</span>
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
                    <th>Branch</th>
                    <th>Ledger Name</th>
                    <th>Under Group</th>
                    <th>Opening Balance</th>
                    <th>PAN No</th>
                    <th>GST IN</th>
                    <th>City</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {(!dataToRender || dataToRender.length === 0) && !loading && (
                    <tr className="no-rows"><td colSpan={9}>No ledgers found</td></tr>
                  )}

                  {dataToRender?.map(r => {
                    const id = r._id || r.id;
                    return (
                      <tr key={id}>
                        <td>
                          <button className="btn" style={btnSm} onClick={() => openEdit(r)} title="Edit">??</button>
                          <button className="btn" style={btnSm} onClick={() => askDelete(r)} title="Delete">???</button>
                        </td>
                        <td>{r.branch || "—"}</td>
                        <td>{r.ledgerName || "—"}</td>
                        <td>{r.underGroup || "—"}</td>
                        <td>
                          {r.openingBalance !== undefined && r.openingBalance !== null
                            ? `${r.openingBalance} ${r.balanceType || 'CR'}`
                            : "—"}
                        </td>
                        <td>{r.panNo || "—"}</td>
                        <td>{r.gstIn || "—"}</td>
                        <td>{r.city || "—"}</td>
                        <td>{fmtDate(r.createdAt)}</td>
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
        <LedgerFormModal
          initial={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={afterSave}
          propsList={propsList}
        />
      )}

      {showDelete && (
        <ConfirmModal
          title="Delete Ledger?"
          message={`Delete ledger "${toDelete?.ledgerName}"? This cannot be undone.`}
          confirmText="Delete"
          onClose={() => { setShowDelete(false); setToDelete(null); }}
          onConfirm={async () => {
            const id = toDelete?._id || toDelete?.id;
            await apiFetch(`/api/ledgers/${id}`, { method: "DELETE", auth: true });
            afterDelete(id);
          }}
        />
      )}
    </div>
  );
}

/* ---------- Form Modal ---------- */
function LedgerFormModal({ initial, onClose, onSaved, propsList }) {
  const isEdit = !!initial;
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  // Row 1
  const [branch, setBranch] = useState(initial?.branch || "");
  
  // Row 2
  const [underGroup, setUnderGroup] = useState(initial?.underGroup || "");
  const [ledgerName, setLedgerName] = useState(initial?.ledgerName || "");
  const [shortName, setShortName] = useState(initial?.shortName || "");
  const [openingBalance, setOpeningBalance] = useState(initial?.openingBalance?.toString() || "0");
  const [balanceType, setBalanceType] = useState(initial?.balanceType || "CR");
  
  // Row 3
  const [panNo, setPanNo] = useState(initial?.panNo || "");
  const [country, setCountry] = useState(initial?.country || "");
  const [state, setState] = useState(initial?.state || "");
  const [city, setCity] = useState(initial?.city || "");
  
  // Row 4
  const [address, setAddress] = useState(initial?.address || "");
  const [gstIn, setGstIn] = useState(initial?.gstIn || "");
  const [registrationType, setRegistrationType] = useState(initial?.registrationType || "");

  const [countries] = useState([
    { code: "IN", name: "India" },
    { code: "US", name: "United States" },
    { code: "UK", name: "United Kingdom" },
    { code: "AE", name: "United Arab Emirates" }
  ]);
  
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  // Update states when country changes
  useEffect(() => {
    if (country === "IN") {
      setStates([
        { code: "MH", name: "Maharashtra" },
        { code: "DL", name: "Delhi" },
        { code: "KA", name: "Karnataka" },
        { code: "GJ", name: "Gujarat" },
        { code: "TN", name: "Tamil Nadu" }
      ]);
    } else {
      setStates([]);
      setState("");
    }
  }, [country]);

  // Update cities when state changes
  useEffect(() => {
    if (state === "MH") {
      setCities([
        { name: "Mumbai" },
        { name: "Pune" },
        { name: "Thane" },
        { name: "Nagpur" }
      ]);
    } else if (state === "DL") {
      setCities([
        { name: "New Delhi" },
        { name: "Delhi" }
      ]);
    } else if (state === "KA") {
      setCities([
        { name: "Bangalore" },
        { name: "Mysore" }
      ]);
    } else {
      setCities([]);
      setCity("");
    }
  }, [state]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(""); 
    setOk("");

    // Validation
    if (!branch) return setErr("Branch is required");
    if (!ledgerName.trim()) return setErr("Ledger Name is required");
    if (openingBalance === "" || openingBalance === null) return setErr("Opening Balance is required");
    if (!country) return setErr("Country is required");
    if (!state) return setErr("State is required");
    if (!city) return setErr("City is required");

    const payload = {
      branch,
      underGroup: underGroup || undefined, // Don't send empty string
      ledgerName: ledgerName.trim(),
      shortName: shortName.trim() || undefined,
      openingBalance: parseFloat(openingBalance) || 0,
      balanceType,
      panNo: panNo.trim() || undefined,
      country,
      state,
      city,
      address: address.trim() || undefined,
      gstIn: gstIn.trim() || undefined,
      registrationType: registrationType || undefined,
    };

    console.log("Saving ledger:", payload);

    setSaving(true);
    try {
      let saved;
      if (isEdit) {
        const id = initial._id || initial.id;
        saved = await apiFetch(`/api/ledgers/${id}`, { 
          method: "PATCH", 
          auth: true, 
          body: JSON.stringify(payload) 
        });
      } else {
        saved = await apiFetch("/api/ledgers", { 
          method: "POST", 
          auth: true, 
          body: JSON.stringify(payload) 
        });
      }
      setOk("Saved successfully!");
      setTimeout(() => onSaved(saved), 500);
    } catch (e2) {
      setErr(e2?.message || "Failed to save ledger.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (isEdit) {
      setBranch(initial?.branch || "");
      setUnderGroup(initial?.underGroup || "");
      setLedgerName(initial?.ledgerName || "");
      setShortName(initial?.shortName || "");
      setOpeningBalance(initial?.openingBalance?.toString() || "0");
      setBalanceType(initial?.balanceType || "CR");
      setPanNo(initial?.panNo || "");
      setCountry(initial?.country || "");
      setState(initial?.state || "");
      setCity(initial?.city || "");
      setAddress(initial?.address || "");
      setGstIn(initial?.gstIn || "");
      setRegistrationType(initial?.registrationType || "");
    } else {
      setBranch("");
      setUnderGroup("");
      setLedgerName("");
      setShortName("");
      setOpeningBalance("0");
      setBalanceType("CR");
      setPanNo("");
      setCountry("");
      setState("");
      setCity("");
      setAddress("");
      setGstIn("");
      setRegistrationType("");
    }
    setErr("");
    setOk("");
  };

  return (
    <Modal title={isEdit ? "Edit Ledger" : "Add Ledger"} onClose={onClose}>
      {err && <Banner type="err">{err}</Banner>}
      {ok && <Banner type="ok">{ok}</Banner>}

      <form onSubmit={onSubmit}>
        {/* Row 1: Branch */}
        <div style={{ marginBottom: 16 }}>
          <Field label="Branch" required>
            <select
              className="input"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              style={{ cursor: "pointer", width: "100%" }}
            >
              <option value="">Select Branch</option>
              {propsList.map(p => (
                <option key={p.code} value={p.code}>{p.name}</option>
              ))}
            </select>
          </Field>
        </div>

        {/* Row 2: Under Group, Ledger Name, Short Name, Opening Balance */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1.5fr", gap: 16, marginBottom: 16 }}>
          <Field label="Under Group">
            <select
              className="input"
              value={underGroup}
              onChange={(e) => setUnderGroup(e.target.value)}
              style={{ cursor: "pointer" }}
            >
              <option value="">--Select--</option>
              {LEDGER_GROUPS.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </Field>

          <Field label="Ledger Name" required>
            <input
              className="input"
              value={ledgerName}
              onChange={(e) => setLedgerName(e.target.value)}
              placeholder="Enter ledger name"
            />
          </Field>

          <Field label="Short Name">
            <input
              className="input"
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
              placeholder="Short name"
            />
          </Field>

          <Field label="Opening Balance" required>
            <div style={{ display: "flex", gap: 4 }}>
              <input
                className="input"
                type="number"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                placeholder="0"
                step="0.01"
                style={{ flex: 1 }}
              />
              <select
                className="input"
                value={balanceType}
                onChange={(e) => setBalanceType(e.target.value)}
                style={{ width: 70, cursor: "pointer" }}
              >
                <option value="CR">CR</option>
                <option value="DR">DR</option>
              </select>
            </div>
          </Field>
        </div>

        {/* Row 3: PAN No, Country, State, City */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
          <Field label="PAN No.">
            <input
              className="input"
              value={panNo}
              onChange={(e) => setPanNo(e.target.value)}
              placeholder="PAN number"
              maxLength={10}
            />
          </Field>

          <Field label="Country" required>
            <select
              className="input"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              style={{ cursor: "pointer" }}
            >
              <option value="">--Select--</option>
              {countries.map(c => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </Field>

          <Field label="State" required>
            <select
              className="input"
              value={state}
              onChange={(e) => setState(e.target.value)}
              style={{ cursor: "pointer" }}
              disabled={!country}
            >
              <option value="">--Select--</option>
              {states.map(s => (
                <option key={s.code} value={s.code}>{s.name}</option>
              ))}
            </select>
          </Field>

          <Field label="City" required>
            <select
              className="input"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              style={{ cursor: "pointer" }}
              disabled={!state}
            >
              <option value="">--Select--</option>
              {cities.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </Field>
        </div>

        {/* Row 4: Address, GST IN, Registration Type */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
          <Field label="Address">
            <input
              className="input"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter address"
            />
          </Field>

          <Field label="Gst In">
            <input
              className="input"
              value={gstIn}
              onChange={(e) => setGstIn(e.target.value)}
              placeholder="GST number"
              maxLength={15}
            />
          </Field>

          <Field label="Registration Type">
            <select
              className="input"
              value={registrationType}
              onChange={(e) => setRegistrationType(e.target.value)}
              style={{ cursor: "pointer" }}
            >
              <option value="">--Select--</option>
              {REGISTRATION_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Field>
        </div>

        {/* Buttons */}
        <div style={{
          display: "flex",
          gap: 8,
          justifyContent: "flex-start",
          paddingTop: 16,
          borderTop: "1px solid #e5e7eb"
        }}>
          <button
            type="submit"
            className="btn"
            disabled={saving}
            style={{
              background: "#667eea",
              color: "#fff",
              padding: "10px 24px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}
          >
            {saving ? "Saving…" : "SAVE"}
          </button>
          <button
            type="button"
            className="btn"
            onClick={handleReset}
            style={{
              background: "#dc2626",
              color: "#fff",
              padding: "10px 24px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}
          >
            RESET
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------- UI Helpers ---------- */
function Field({ label, required, children }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontWeight: 600, fontSize: "14px", color: "#374151" }}>
        {label}
        {required && <span style={{ color: "#dc2626", marginLeft: 2 }}>*</span>}
      </span>
      {children}
    </label>
  );
}

function Banner({ type = "ok", children }) {
  const style = type === "err"
    ? { background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" }
    : { background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0" };
  return (
    <div style={{
      ...style,
      padding: "10px 12px",
      borderRadius: 8,
      fontWeight: 600,
      marginBottom: 16,
      fontSize: "14px"
    }}>
      {children}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={backdropStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>{title}</h3>
          <button onClick={onClose} aria-label="Close" style={xStyle}>×</button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}

function ConfirmModal({ title, message, confirmText = "OK", onConfirm, onClose }) {
  const [busy, setBusy] = useState(false);
  return (
    <Modal title={title} onClose={onClose}>
      <p style={{ marginTop: 0, marginBottom: 20, color: "#4b5563" }}>{message}</p>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button
          className="btn"
          onClick={onClose}
          style={{ padding: "8px 16px" }}
        >
          Cancel
        </button>
        <button
          className="btn"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await onConfirm?.();
            } finally {
              setBusy(false);
            }
          }}
          style={{
            background: "#dc2626",
            color: "#fff",
            padding: "8px 16px"
          }}
        >
          {busy ? "Working…" : confirmText}
        </button>
      </div>
    </Modal>
  );
}

function OnOff({ value }) {
  const on = !!value;
  return (
    <span style={{
      display: "inline-block",
      padding: ".15rem .5rem",
      borderRadius: 999,
      background: on ? "#ecfdf5" : "#f3f4f6",
      border: `1px solid ${on ? "#a7f3d0" : "#e5e7eb"}`,
      color: on ? "#15803d" : "#334155",
      fontSize: ".75rem",
      fontWeight: 700
    }}>
      {on ? "Active" : "Inactive"}
    </span>
  );
}

const btnSm = {
  padding: ".4rem .6rem",
  marginRight: 6,
  fontSize: "16px",
  border: "1px solid #e5e7eb",
  background: "#fff",
  cursor: "pointer",
  borderRadius: 6
};

const backdropStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.5)",
  display: "grid",
  placeItems: "center",
  zIndex: 1000,
  backdropFilter: "blur(2px)"
};

const modalStyle = {
  width: "min(1000px, 95%)",
  background: "#fff",
  borderRadius: 12,
  boxShadow: "0 20px 60px rgba(0,0,0,.3)",
  overflow: "hidden",
  maxHeight: "90vh",
  overflowY: "auto"
};

const headerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "16px 20px",
  borderBottom: "1px solid #e5e7eb",
  background: "#f9fafb"
};

const xStyle = {
  border: "1px solid #d1d5db",
  background: "#fff",
  borderRadius: 6,
  width: 32,
  height: 32,
  cursor: "pointer",
  fontSize: "20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#6b7280"
};

function fmtDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? "—" : dt.toLocaleDateString("en-IN", {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}