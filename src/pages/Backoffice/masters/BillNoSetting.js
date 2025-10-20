// src/pages/Backoffice/masters/BillNoSetting.js
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../../lib/api";
import { BackofficeSidebar } from "../../../components/sidebar/backofficesidebar";
import "../../../components/sidebar/Sidebar.css";
import "../../../assets/css/commanPage.css";

const PAGE_SIZE = 10;

export default function BillNoSettingMaster() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  // Load bill no settings
  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true); setErr("");
      try {
        const params = new URLSearchParams({ q, page, limit });
        const res = await apiFetch(`/api/bill-no-settings?${params.toString()}`, { auth: true });
        const data = res?.data || res || [];
        const count = res?.total ?? data.length ?? 0;
        if (!ignore) { setRows(Array.isArray(data) ? data : []); setTotal(Number(count) || 0); }
      } catch (e) {
        if (!ignore) { setErr(e?.message || "Failed to load bill no settings."); setRows([]); setTotal(0); }
      } finally { if (!ignore) setLoading(false); }
    })();
    return () => { ignore = true; };
  }, [q, page, limit]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter(r =>
      [r.branch, r.financialYear, r.billingType]
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
          <h2 style={{ margin: 0 }}>Bill No Setting</h2>
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
            <button className="btn" onClick={openCreate}>+ Add</button>
          </div>
        </div>

        <div className="panel">
          <div className="panel-h">
            <span>Bill No Settings</span>
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
                    <th>Financial Year</th>
                    <th>Billing Type</th>
                    <th>Created</th>
                    <th>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {(!dataToRender || dataToRender.length === 0) && !loading && (
                    <tr className="no-rows"><td colSpan={6}>No settings found</td></tr>
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
                              await apiFetch(`/api/bill-no-settings/${id}`, { method: "DELETE", auth: true });
                              afterDelete(id);
                            }}
                          >??</button>
                        </td>
                        <td>{r.branch || "—"}</td>
                        <td>{r.financialYear || "—"}</td>
                        <td>{r.billingType || "—"}</td>
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
        <BillNoSettingForm
          initial={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={afterSave}
        />
      )}
    </div>
  );
}

/* ---------- Form Modal ---------- */
function BillNoSettingForm({ initial, onClose, onSaved }) {
  const isEdit = !!initial;
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [branches, setBranches] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const [branch, setBranch] = useState(initial?.branch || "");
  const [financialYear, setFinancialYear] = useState(initial?.financialYear || "");
  const [billingType, setBillingType] = useState(initial?.billingType || "");
  const [settings, setSettings] = useState(initial?.settings || []);

  // Financial Year options
  const financialYearOptions = generateFinancialYears();

  // Billing Type options
  const billingTypeOptions = [
    { label: "Department wise", value: "Department wise" },
    { label: "Outlet wise", value: "Outlet wise" },
    { label: "Sub Department wise", value: "Sub Department wise" },
    { label: "User wise", value: "User wise" },
  ];

  // Load branches
  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch("/api/properties?limit=200", { auth: true });
        const data = res?.data || res || [];
        setBranches(Array.isArray(data) ? data : []);
      } catch { /* ignore */ }
    })();
  }, []);

  // Load data based on billing type
  useEffect(() => {
    if (!billingType || !branch) {
      setSettings([]);
      return;
    }

    (async () => {
      setLoadingData(true);
      try {
        let data = [];
        
        if (billingType === "Department wise") {
          const res = await apiFetch(`/api/departments?propertyCode=${branch}&limit=500`, { auth: true });
          const departments = res?.data || res || [];
          
          const grouped = {};
          departments.forEach(dept => {
            const deptName = dept.name || dept.departmentName;
            if (!grouped[deptName]) {
              grouped[deptName] = {
                department: deptName,
                startBillNo: 0,
                suffix: "",
                fpNo: ""
              };
            }
          });
          data = Object.values(grouped);
          
        } else if (billingType === "Outlet wise") {
          const res = await apiFetch(`/api/outlets?propertyCode=${branch}&limit=500`, { auth: true });
          const outlets = res?.data || res || [];
          
          data = outlets.map(outlet => ({
            department: outlet.department || outlet.departmentName || "",
            subDepartment: outlet.subDepartment || outlet.subDepartmentName || "",
            outlet: outlet.name || outlet.outletName || "",
            startBillNo: 0,
            suffix: "",
            fpNo: ""
          }));
          
        } else if (billingType === "Sub Department wise") {
          const res = await apiFetch(`/api/subdepartments?propertyCode=${branch}&limit=500`, { auth: true });
          const subDepts = res?.data || res || [];
          
          data = subDepts.map(subDept => ({
            department: subDept.department || subDept.departmentName || "",
            subDepartment: subDept.name || subDept.subDepartmentName || "",
            startBillNo: 0,
            suffix: "",
            fpNo: ""
          }));
          
        } else if (billingType === "User wise") {
          const res = await apiFetch(`/api/users?propertyCode=${branch}&limit=500`, { auth: true });
          const users = res?.data || res || [];
          
          data = users.map(user => ({
            user: user.name || user.userName || user.email || "",
            startBillNo: 0,
            suffix: "",
            fpNo: ""
          }));
        }
        
        setSettings(data);
      } catch (error) {
        console.error("Error loading data:", error);
        setErr("Failed to load data for selected billing type");
        setSettings([]);
      } finally {
        setLoadingData(false);
      }
    })();
  }, [billingType, branch]);

  const updateSetting = (index, field, value) => {
    const updated = [...settings];
    updated[index] = { ...updated[index], [field]: value };
    setSettings(updated);
  };

  const onSubmit = async (e) => {
    e.preventDefault(); setErr(""); setOk("");

    if (!branch.trim()) return setErr("Branch is required");
    if (!financialYear.trim()) return setErr("Financial Year is required");
    if (!billingType.trim()) return setErr("Billing Type is required");

    const payload = {
      branch: branch.trim(),
      financialYear: financialYear.trim(),
      billingType: billingType.trim(),
      settings: settings,
    };

    setSaving(true);
    try {
      let saved;
      if (isEdit) {
        const id = initial._id || initial.id;
        saved = await apiFetch(`/api/bill-no-settings/${id}`, { method: "PATCH", auth: true, body: JSON.stringify(payload) });
      } else {
        saved = await apiFetch("/api/bill-no-settings", { method: "POST", auth: true, body: JSON.stringify(payload) });
      }
      setOk("Saved successfully!");
      setTimeout(() => onSaved(saved), 1000);
    } catch (e2) {
      setErr(e2?.message || "Failed to save setting.");
    } finally { setSaving(false); }
  };

  const handleReset = () => {
    setBranch("");
    setFinancialYear("");
    setBillingType("");
    setSettings([]);
    setErr("");
    setOk("");
  };

  const renderTableHeaders = () => {
    switch(billingType) {
      case "Department wise":
        return (
          <tr>
            <th style={tableHeaderStyle}>S.N.</th>
            <th style={tableHeaderStyle}>Department</th>
            <th style={tableHeaderStyle}>Start Bill No.(Numbers Only)</th>
            <th style={tableHeaderStyle}>Suffix</th>
            <th style={tableHeaderStyle}>FpNo</th>
          </tr>
        );
      case "Outlet wise":
        return (
          <tr>
            <th style={tableHeaderStyle}>S.N.</th>
            <th style={tableHeaderStyle}>Department</th>
            <th style={tableHeaderStyle}>Sub Department</th>
            <th style={tableHeaderStyle}>Outlet</th>
            <th style={tableHeaderStyle}>Start Bill No.(Numbers Only)</th>
            <th style={tableHeaderStyle}>Suffix</th>
            <th style={tableHeaderStyle}>FpNo</th>
          </tr>
        );
      case "Sub Department wise":
        return (
          <tr>
            <th style={tableHeaderStyle}>S.N.</th>
            <th style={tableHeaderStyle}>Department</th>
            <th style={tableHeaderStyle}>Sub Department</th>
            <th style={tableHeaderStyle}>Start Bill No.(Numbers Only)</th>
            <th style={tableHeaderStyle}>Suffix</th>
            <th style={tableHeaderStyle}>FpNo</th>
          </tr>
        );
      case "User wise":
        return (
          <tr>
            <th style={tableHeaderStyle}>S.N.</th>
            <th style={tableHeaderStyle}>User</th>
            <th style={tableHeaderStyle}>Start Bill No.(Numbers Only)</th>
            <th style={tableHeaderStyle}>Suffix</th>
            <th style={tableHeaderStyle}>FpNo</th>
          </tr>
        );
      default:
        return null;
    }
  };

  const renderTableRow = (setting, index) => {
    const rowBg = index % 2 === 0 ? "#e8e8f0" : "#fff";
    
    switch(billingType) {
      case "Department wise":
        return (
          <tr key={index} style={{ background: rowBg }}>
            <td style={tableCellStyle}>{index + 1}</td>
            <td style={tableCellStyle}>{setting.department}</td>
            <td style={tableCellStyle}>
              <input
                type="number"
                min="0"
                value={setting.startBillNo}
                onChange={e => updateSetting(index, 'startBillNo', Number(e.target.value))}
                style={inputStyle}
              />
            </td>
            <td style={tableCellStyle}>
              <input
                type="text"
                value={setting.suffix}
                onChange={e => updateSetting(index, 'suffix', e.target.value.toUpperCase())}
                style={inputStyle}
              />
            </td>
            <td style={tableCellStyle}>
              <input
                type="text"
                value={setting.fpNo}
                onChange={e => updateSetting(index, 'fpNo', e.target.value)}
                style={inputStyle}
              />
            </td>
          </tr>
        );
      
      case "Outlet wise":
        return (
          <tr key={index} style={{ background: rowBg }}>
            <td style={tableCellStyle}>{index + 1}</td>
            <td style={tableCellStyle}>{setting.department}</td>
            <td style={tableCellStyle}>{setting.subDepartment}</td>
            <td style={tableCellStyle}>{setting.outlet}</td>
            <td style={tableCellStyle}>
              <input
                type="number"
                min="0"
                value={setting.startBillNo}
                onChange={e => updateSetting(index, 'startBillNo', Number(e.target.value))}
                style={inputStyle}
              />
            </td>
            <td style={tableCellStyle}>
              <input
                type="text"
                value={setting.suffix}
                onChange={e => updateSetting(index, 'suffix', e.target.value.toUpperCase())}
                style={inputStyle}
              />
            </td>
            <td style={tableCellStyle}>
              <input
                type="text"
                value={setting.fpNo}
                onChange={e => updateSetting(index, 'fpNo', e.target.value)}
                style={inputStyle}
              />
            </td>
          </tr>
        );
      
      case "Sub Department wise":
        return (
          <tr key={index} style={{ background: rowBg }}>
            <td style={tableCellStyle}>{index + 1}</td>
            <td style={tableCellStyle}>{setting.department}</td>
            <td style={tableCellStyle}>{setting.subDepartment}</td>
            <td style={tableCellStyle}>
              <input
                type="number"
                min="0"
                value={setting.startBillNo}
                onChange={e => updateSetting(index, 'startBillNo', Number(e.target.value))}
                style={inputStyle}
              />
            </td>
            <td style={tableCellStyle}>
              <input
                type="text"
                value={setting.suffix}
                onChange={e => updateSetting(index, 'suffix', e.target.value.toUpperCase())}
                style={inputStyle}
              />
            </td>
            <td style={tableCellStyle}>
              <input
                type="text"
                value={setting.fpNo}
                onChange={e => updateSetting(index, 'fpNo', e.target.value)}
                style={inputStyle}
              />
            </td>
          </tr>
        );
      
      case "User wise":
        return (
          <tr key={index} style={{ background: rowBg }}>
            <td style={tableCellStyle}>{index + 1}</td>
            <td style={tableCellStyle}>{setting.user}</td>
            <td style={tableCellStyle}>
              <input
                type="number"
                min="0"
                value={setting.startBillNo}
                onChange={e => updateSetting(index, 'startBillNo', Number(e.target.value))}
                style={inputStyle}
              />
            </td>
            <td style={tableCellStyle}>
              <input
                type="text"
                value={setting.suffix}
                onChange={e => updateSetting(index, 'suffix', e.target.value.toUpperCase())}
                style={inputStyle}
              />
            </td>
            <td style={tableCellStyle}>
              <input
                type="text"
                value={setting.fpNo}
                onChange={e => updateSetting(index, 'fpNo', e.target.value)}
                style={inputStyle}
              />
            </td>
          </tr>
        );
      
      default:
        return null;
    }
  };

  const shouldShowTable = billingType && branch && settings.length > 0;

  return (
    <div style={backdropStyle}>
      <div style={modalContainerStyle}>
        {/* Modal Header */}
        <div style={modalHeaderStyle}>
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#1e293b" }}>
            {isEdit ? "Edit" : "Add"} Bill No Setting
          </h3>
          <button onClick={onClose} style={closeButtonStyle} aria-label="Close">×</button>
        </div>

        {/* Modal Content */}
        <div style={modalContentStyle}>
          {err && <Banner type="err">{err}</Banner>}
          {ok && <Banner type="ok">{ok}</Banner>}

          {/* Green Label */}
          <div style={{ marginBottom: 20 }}>
            <span style={{ color: "#059669", fontWeight: 700, fontSize: "14px" }}>
              All * filed Mandatory
            </span>
          </div>

          <form onSubmit={onSubmit}>
            {/* Form Fields - Initial Selection */}
            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(3, 1fr)", marginBottom: 20 }}>
              <Field label="Property" required>
                <select 
                  value={branch} 
                  onChange={e => {
                    setBranch(e.target.value);
                    setSettings([]);
                  }}
                  style={selectInputStyle}
                >
                  <option value="">--Select--</option>
                  {branches.map(b => (
                    <option key={b._id || b.code} value={b.code || b.propertyCode}>
                      {b.name || b.propertyName}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Financial Year" required>
                <select 
                  value={financialYear} 
                  onChange={e => setFinancialYear(e.target.value)}
                  style={selectInputStyle}
                >
                  <option value="">--Select--</option>
                  {financialYearOptions.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Billing Type" required>
                <select 
                  value={billingType} 
                  onChange={e => {
                    setBillingType(e.target.value);
                    setSettings([]);
                  }}
                  style={selectInputStyle}
                >
                  <option value="">--Select--</option>
                  {billingTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
              <button 
                type="button" 
                style={resetButtonStyle} 
                onClick={handleReset}
                disabled={saving}
              >
                RESET
              </button>
              <button 
                type="submit" 
                style={saveButtonStyle}
                disabled={saving || loadingData}
              >
                {saving ? "SAVING…" : "SAVE"}
              </button>
            </div>

            {/* Loading indicator */}
            {loadingData && (
              <div style={{ textAlign: "center", padding: "20px", color: "#7c3aed", fontWeight: 600 }}>
                Loading data...
              </div>
            )}

            {/* Settings Table */}
            {shouldShowTable && !loadingData && (
              <div style={{ marginTop: 0, maxHeight: "400px", overflowY: "auto" }}>
                <table style={tableStyle}>
                  <thead>
                    {renderTableHeaders()}
                  </thead>
                  <tbody>
                    {settings.map((setting, index) => renderTableRow(setting, index))}
                  </tbody>
                </table>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

/* ---------- UI Components ---------- */
function Field({ label, required, children }) {
  return (
    <div>
      <label style={{ display: "block", marginBottom: 8, fontSize: "14px", fontWeight: 600, color: "#64748b" }}>
        {label} {required && <span style={{ color: "#dc2626" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function Banner({ type = "ok", children }) {
  const style = type === "err"
    ? { background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" }
    : { background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0" };
  return <div style={{ ...style, padding: "10px 14px", borderRadius: 6, fontWeight: 600, marginBottom: 16, fontSize: "14px" }}>{children}</div>;
}

function generateFinancialYears() {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = -2; i <= 5; i++) {
    const startYear = currentYear + i;
    const endYear = startYear + 1;
    years.push(`${startYear}-${endYear}`);
  }
  return years;
}

// Modal Styles (matching your screenshot)
const backdropStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0, 0, 0, 0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: "20px"
};

const modalContainerStyle = {
  background: "#fff",
  borderRadius: "8px",
  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
  width: "min(1200px, 100%)",
  maxHeight: "90vh",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden"
};

const modalHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "16px 24px",
  borderBottom: "1px solid #e2e8f0",
  background: "#fff"
};

const closeButtonStyle = {
  background: "transparent",
  border: "none",
  fontSize: "28px",
  color: "#64748b",
  cursor: "pointer",
  padding: "0",
  width: "32px",
  height: "32px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  lineHeight: 1
};

const modalContentStyle = {
  padding: "24px",
  overflowY: "auto",
  flex: 1
};

const selectInputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: "6px",
  fontSize: "14px",
  background: "#fff",
  boxSizing: "border-box",
  color: "#334155"
};

// Table Styles
const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "13px",
  background: "#fff"
};

const tableHeaderStyle = {
  background: "#c5bdd9",
  padding: "10px 12px",
  textAlign: "left",
  fontWeight: 700,
  border: "1px solid #a8a0b8",
  fontSize: "13px",
  color: "#000"
};

const tableCellStyle = {
  padding: "8px 12px",
  border: "1px solid #d1d5db",
  fontSize: "13px",
  verticalAlign: "middle"
};

const inputStyle = {
  width: "100%",
  padding: "7px 10px",
  border: "1px solid #9ca3af",
  borderRadius: "3px",
  fontSize: "13px",
  background: "#fff",
  boxSizing: "border-box"
};

// Button Styles (matching your screenshot)
const resetButtonStyle = {
  padding: "10px 24px",
  color: "#fff",
  background: "#dc2626",
  border: "none",
  borderRadius: "4px",
  fontSize: "14px",
  fontWeight: 700,
  cursor: "pointer",
  minWidth: 100,
  textTransform: "uppercase"
};

const saveButtonStyle = {
  padding: "10px 24px",
  color: "#fff",
  background: "#7c3aed",
  border: "none",
  borderRadius: "4px",
  fontSize: "14px",
  fontWeight: 700,
  cursor: "pointer",
  minWidth: 100,
  textTransform: "uppercase"
};

const btnSm = { padding: ".3rem .5rem", marginRight: 4, fontWeight: 700 };

function fmtDate(d) { if (!d) return "—"; const dt = new Date(d); return Number.isNaN(dt) ? "—" : dt.toLocaleDateString(); }