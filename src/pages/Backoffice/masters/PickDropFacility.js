// src/pages/Backoffice/PickDropFacility.js
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../../lib/api";
import { BackofficeSidebar } from "../../../components/sidebar/backofficesidebar";
import "../../../components/sidebar/Sidebar.css";
import "../../../assets/css/commanPage.css";
// ? REMOVE THIS LINE:
// import Topbar from "../../../components/layout/Topbar";

const PAGE_SIZE = 10;

export default function PickDropFacility() {
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
        const res = await apiFetch(`/api/pickdropfacilities?${params.toString()}`, { auth: true });
        const data = res?.data || res?.items || res || [];
        const count = res?.total ?? data.length ?? 0;
        if (!ignore) {
          setRows(Array.isArray(data) ? data : []);
          setTotal(Number(count) || 0);
        }
      } catch (e) {
        if (!ignore) {
          setErr(e?.message || "Failed to load Pick/Drop facilities.");
          setRows([]);
          setTotal(0);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [q, page, limit, filterProp]);

  // Client fallback search
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter(r =>
      [r.branch, r.name]
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
        {/* ? REMOVE THIS LINE: */}
        {/* <Topbar /> */}

        {/* Topbar */}
        <div className="res-topbar">
          <h2 style={{ margin: 0 }}>Pick/Drop Facilities</h2>
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
              placeholder="Search (facility name)"
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              style={{ minWidth: 280 }}
            />

            <select
              className="res-select"
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
            >
              {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}/page</option>)}
            </select>

            <button className="btn" onClick={openCreate}>+ Add Facility</button>
          </div>
        </div>

        {/* Table */}
        <div className="panel">
          <div className="panel-h">
            <span>Facility List</span>
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
                    <th>Name</th>
                    <th>Pick & Drop</th>
                    <th>Created</th>
                    <th>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {(!dataToRender || dataToRender.length === 0) && !loading && (
                    <tr className="no-rows"><td colSpan={6}>No facilities found</td></tr>
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
                        <td>{r.name || "—"}</td>
                        <td><YesNo value={r.pickAndDrop} /></td>
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
        <PickDropFormModal
          initial={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={afterSave}
          propsList={propsList}
        />
      )}

      {showDelete && (
        <ConfirmModal
          title="Delete Facility?"
          message={`Delete facility "${toDelete?.name}"? This cannot be undone.`}
          confirmText="Delete"
          onClose={() => { setShowDelete(false); setToDelete(null); }}
          onConfirm={async () => {
            const id = toDelete?._id || toDelete?.id;
            await apiFetch(`/api/pickdropfacilities/${id}`, { method: "DELETE", auth: true });
            afterDelete(id);
          }}
        />
      )}
    </div>
  );
}

/* ---------- Form Modal ---------- */
function PickDropFormModal({ initial, onClose, onSaved, propsList }) {
  const isEdit = !!initial;
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [branch, setBranch] = useState(initial?.branch || "");
  const [name, setName] = useState(initial?.name || "");
  const [pickAndDrop, setPickAndDrop] = useState(initial?.pickAndDrop ?? false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");

    if (!branch) return setErr("Branch is required");
    if (!name.trim()) return setErr("Name is required");

    const payload = {
      branch,
      name: name.trim(),
      pickAndDrop,
    };

    console.log("Saving pick/drop facility:", payload);

    setSaving(true);
    try {
      let saved;
      if (isEdit) {
        const id = initial._id || initial.id;
        saved = await apiFetch(`/api/pickdropfacilities/${id}`, {
          method: "PATCH",
          auth: true,
          body: JSON.stringify(payload)
        });
      } else {
        saved = await apiFetch("/api/pickdropfacilities", {
          method: "POST",
          auth: true,
          body: JSON.stringify(payload)
        });
      }
      setOk("Saved successfully!");
      setTimeout(() => onSaved(saved), 500);
    } catch (e2) {
      setErr(e2?.message || "Failed to save facility.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (isEdit) {
      setBranch(initial?.branch || "");
      setName(initial?.name || "");
      setPickAndDrop(initial?.pickAndDrop ?? false);
    } else {
      setBranch("");
      setName("");
      setPickAndDrop(false);
    }
    setErr("");
    setOk("");
  };

  return (
    <Modal title={isEdit ? "Edit Facility" : "Add Facility"} onClose={onClose}>
      {err && <Banner type="err">{err}</Banner>}
      {ok && <Banner type="ok">{ok}</Banner>}

      <form onSubmit={onSubmit}>
        {/* Row 1: Branch and Name */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
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

          <Field label="Name" required>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter facility name"
            />
          </Field>
        </div>

        {/* Row 2: Pick & Drop */}
        <div style={{ marginBottom: 20 }}>
          <Field label="Pick & Drop">
            <select
              className="input"
              value={pickAndDrop ? "Yes" : "No"}
              onChange={(e) => setPickAndDrop(e.target.value === "Yes")}
              style={{ cursor: "pointer", width: "100%" }}
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
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

function YesNo({ value }) {
  const isYes = !!value;
  return (
    <span style={{
      display: "inline-block",
      padding: ".15rem .5rem",
      borderRadius: 999,
      background: isYes ? "#dcfce7" : "#f3f4f6",
      border: `1px solid ${isYes ? "#bbf7d0" : "#e5e7eb"}`,
      color: isYes ? "#166534" : "#334155",
      fontSize: ".75rem",
      fontWeight: 700
    }}>
      {isYes ? "Yes" : "No"}
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
  width: "min(600px, 95%)",
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