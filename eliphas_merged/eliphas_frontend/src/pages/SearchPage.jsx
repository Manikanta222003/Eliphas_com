import { useState, useRef, useEffect } from "react";
import API from "../api";

const inputStyle = { padding:"9px 12px", border:"1px solid #ccc", borderRadius:"4px", fontSize:"14px", width:"100%", boxSizing:"border-box" };
const labelStyle = { display:"block", marginBottom:"4px", fontWeight:"600", fontSize:"13px" };
const fieldStyle = { marginBottom:"14px" };

const BASIS_OPTIONS = [
  { value:"trip",     label:"Trip"     },
  { value:"contract", label:"Contract" },
  { value:"per_ton",  label:"Per Ton"  },
  { value:"machine",  label:"Machine"  },
];

const EMPTY_EDIT = {
  clientName:"", companyName:"", phoneNumber:"",
  vehicleNumber:"", challanNumber:"", fromLocation:"", toLocation:"",
  loadType:"", billingBasis:"", unitValue:"",
  companyFare:"", clientFare:"",
  dieselQuantity:"", dieselPricePerLitre:"",
  remarks:"",
  date:"", time:""
};

const STEP = { YEAR:"year", LOCATION:"location", SEARCH:"search" };

export default function SearchPage() {
  const user      = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin   = user.role === "admin";
  const isManager = user.role === "manager";
  const canEdit   = isAdmin || isManager;

  const [step,            setStep]            = useState(STEP.YEAR);
  const [yearInput,       setYearInput]       = useState("");
  const [financialYear,   setFinancialYear]   = useState("");

  // Location chain: ["Visakhapatnam", "Gajuwaka", "Tinder Dipo"] etc.
  const [locChain,        setLocChain]        = useState([]);
  const [locInput,        setLocInput]        = useState("");
  const [locErr,          setLocErr]          = useState("");
  const [companyLocation, setCompanyLocation] = useState("");
  const [formOpen,        setFormOpen]        = useState(false);

  const [filters, setFilters] = useState({
    vehicleNumber:"", challanNumber:"", date:"",
    fromLocation:"", toLocation:"", loadType:"",
    clientName:"", remarks:""
  });
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [editRecord, setEditRecord] = useState(null);
  const [editForm,   setEditForm]   = useState(EMPTY_EDIT);
  const [editSaving, setEditSaving] = useState(false);
  const [editMsg,    setEditMsg]    = useState({ text:"", type:"" });

  const [invoiceRecord, setInvoiceRecord] = useState(null);

  const yearRef = useRef(null);
  const locRef  = useRef(null);

  useEffect(() => { yearRef.current?.focus(); }, []);
  useEffect(() => { if (step === STEP.LOCATION) setTimeout(() => locRef.current?.focus(), 60); }, [step]);

  const handleYearKey = (e) => {
    if (e.key !== "Enter") return;
    const raw = yearInput.trim();
    if (!raw) { setMessage("Please enter a year."); return; }
    let fy = raw;
    if (/^\d{4}$/.test(raw)) { const y = parseInt(raw); fy = `${y}-${String(y+1).slice(-2)}`; }
    setFinancialYear(fy);
    setMessage("");
    setLocChain([]); setLocInput(""); setLocErr("");
    setStep(STEP.LOCATION);
  };

  // Add one level to the location chain
  const addLevel = () => {
    const raw = locInput.trim();
    if (!raw) { setLocErr("Please type a location name."); return; }
    setLocChain(prev => [...prev, raw]);
    setLocInput(""); setLocErr("");
    setTimeout(() => locRef.current?.focus(), 40);
  };

  const removeLastLevel = () => {
    setLocChain(prev => prev.slice(0, -1));
    setLocErr("");
    setTimeout(() => locRef.current?.focus(), 40);
  };

  const handleLocKey = (e) => {
    if (e.key === "Enter") { addLevel(); return; }
    if (e.key === "Backspace" && locInput === "" && locChain.length > 0) { removeLastLevel(); }
  };

  const openSearch = () => {
    if (locChain.length === 0) { setLocErr("Add at least one location."); return; }
    setCompanyLocation(locChain.join(" > "));
    setLocErr(""); setFormOpen(true); setResults([]);
    setStep(STEP.SEARCH);
  };

  const resetLocation = () => {
    setLocChain([]); setLocInput(""); setLocErr("");
    setCompanyLocation(""); setFormOpen(false); setResults([]);
    setStep(STEP.LOCATION);
    setTimeout(() => locRef.current?.focus(), 50);
  };

  const resetYear = () => {
    setFinancialYear(""); setYearInput("");
    setLocChain([]); setLocInput(""); setLocErr("");
    setCompanyLocation(""); setFormOpen(false); setResults([]);
    setStep(STEP.YEAR);
    setTimeout(() => yearRef.current?.focus(), 50);
  };

  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const clearFilters = () => {
    setFilters({ vehicleNumber:"", challanNumber:"", date:"", fromLocation:"", toLocation:"", loadType:"", clientName:"", remarks:"" });
    setResults([]); setMessage("");
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "";

  const search = async () => {
    try {
      setLoading(true); setMessage("");
      const params = new URLSearchParams({ financialYear, companyLocation });
      Object.entries(filters).forEach(([k, v]) => { if (v.trim()) params.append(k, v.trim()); });
      const res = await API.get(`/billing/search?${params.toString()}`);
      setResults(res.data);
      if (res.data.length === 0) setMessage("No records found.");
    } catch { setMessage("Search failed. Please try again."); }
    finally { setLoading(false); }
  };

  const deleteRecord = async (id) => {
    if (!window.confirm("Delete this record? This cannot be undone.")) return;
    try {
      await API.delete(`/billing/delete/${id}`);
      setResults(prev => prev.filter(r => r._id !== id));
      setMessage("Record deleted.");
    } catch { setMessage("Delete failed."); }
  };

  const openEdit = (record) => {
    setEditRecord(record);
    setEditMsg({ text:"", type:"" });
    setEditForm({
      clientName: record.clientName || "", companyName: record.companyName || "",
      phoneNumber: record.phoneNumber || "", vehicleNumber: record.vehicleNumber || "",
      challanNumber: record.challanNumber || "", fromLocation: record.fromLocation || "",
      toLocation: record.toLocation || "", loadType: record.loadType || "",
      billingBasis: record.billingBasis || "", unitValue: record.unitValue || "",
      companyFare: record.companyFare || "", clientFare: record.clientFare || "",
      dieselQuantity: record.dieselQuantity || "", dieselPricePerLitre: record.dieselPricePerLitre || "",
      remarks: record.remarks || "",
      date: record.date ? new Date(record.date).toISOString().split("T")[0] : "",
      time: record.time || "",
    });
  };

  const closeEdit = () => { setEditRecord(null); setEditForm(EMPTY_EDIT); setEditMsg({ text:"", type:"" }); };
  const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const saveEdit = async () => {
    if (!editForm.clientName || !editForm.vehicleNumber || !editForm.challanNumber) {
      setEditMsg({ text:"Client Name, Vehicle Number and Challan Number are required.", type:"error" }); return;
    }
    try {
      setEditSaving(true); setEditMsg({ text:"", type:"" });
      await API.put(`/billing/update/${editRecord._id}`, editForm);
      setResults(prev => prev.map(r => r._id === editRecord._id ? { ...r, ...editForm } : r));
      setEditMsg({ text:"Record updated successfully!", type:"success" });
      setTimeout(() => closeEdit(), 1200);
    } catch (err) {
      setEditMsg({ text: err.response?.data?.message || "Update failed.", type:"error" });
    } finally { setEditSaving(false); }
  };

  const enterKey = (e) => e.key === "Enter" && search();

  return (
    <div style={{ background:"#fff", borderRadius:"8px", padding:"28px", boxShadow:"0 1px 6px rgba(0,0,0,0.08)" }}>
      <h2 style={{ marginTop:0, marginBottom:"20px", color:"#1a1a2e" }}>Search Records</h2>

      {/* ── Year + Location steps ── */}
      {!formOpen && (
        <div style={{ background:"#f0f4ff", border:"1px solid #c5d0f5", borderRadius:"8px", padding:"24px", maxWidth:"540px", marginBottom:"24px" }}>
          {/* Step 1: Year */}
          <div style={{ marginBottom:"20px" }}>
            <label style={{ ...labelStyle, color:"#1a1a2e", fontSize:"14px" }}>
              {financialYear ? "✓ Financial Year: " : "1. Financial Year"}
              {financialYear && <strong style={{ marginLeft:"6px" }}>{financialYear}</strong>}
            </label>
            {!financialYear && (
              <>
                <input ref={yearRef} style={inputStyle} placeholder="Type year, press Enter (e.g. 2025)"
                  value={yearInput} onChange={e => setYearInput(e.target.value)} onKeyDown={handleYearKey} />
                <p style={{ margin:"6px 0 0", fontSize:"12px", color:"#888" }}>Press Enter to confirm</p>
              </>
            )}
            {financialYear && (
              <button onClick={resetYear} style={{ fontSize:"12px", color:"#666", background:"transparent", border:"none", cursor:"pointer", padding:0, marginTop:"4px" }}>
                ✏ Change
              </button>
            )}
          </div>

          {/* Step 2: Location chain */}
          {financialYear && (
            <div>
              <label style={{ ...labelStyle, color:"#1a1a2e", fontSize:"14px" }}>
                2. Company Location
              </label>
              <p style={{ margin:"0 0 10px", fontSize:"12px", color:"#666", lineHeight:"1.5" }}>
                Type city → press <strong>Enter</strong> to add. Then type sub-city → press <strong>Enter</strong> to add a sub-level.
                Press <strong>Backspace</strong> on empty input to remove last level.
              </p>

              {/* Chain breadcrumb */}
              {locChain.length > 0 && (
                <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:"4px", marginBottom:"10px", padding:"8px 10px", background:"#fff", border:"1px solid #c5d0f5", borderRadius:"6px" }}>
                  {locChain.map((loc, i) => (
                    <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:"3px" }}>
                      {i > 0 && <span style={{ color:"#888", fontSize:"14px", margin:"0 2px" }}>›</span>}
                      <span style={{ background:"#1a1a2e", color:"#fff", padding:"3px 10px", borderRadius:"20px", fontSize:"12px", fontWeight:"600" }}>
                        {loc}
                      </span>
                    </span>
                  ))}
                </div>
              )}

              <div style={{ display:"flex", gap:"8px" }}>
                <input
                  ref={locRef}
                  style={{ ...inputStyle, flex:1 }}
                  placeholder={locChain.length === 0 ? "Enter city name…" : "Enter sub-city (optional)…"}
                  value={locInput}
                  onChange={e => setLocInput(e.target.value)}
                  onKeyDown={handleLocKey}
                />
                {locInput.trim() && (
                  <button onClick={addLevel}
                    style={{ padding:"9px 14px", background:"#3a3a5e", color:"#fff", border:"none", borderRadius:"4px", cursor:"pointer", fontSize:"13px", whiteSpace:"nowrap" }}>
                    + Add
                  </button>
                )}
              </div>

              {locErr && <p style={{ margin:"8px 0 0", color:"#c00", fontSize:"13px" }}>{locErr}</p>}

              {locChain.length > 0 && (
                <div style={{ display:"flex", gap:"8px", marginTop:"12px", flexWrap:"wrap" }}>
                  <button onClick={openSearch}
                    style={{ padding:"9px 22px", background:"#1a1a2e", color:"#fff", border:"none", borderRadius:"4px", cursor:"pointer", fontSize:"13px", fontWeight:"600" }}>
                    🔍 Open Search
                  </button>
                  <button onClick={removeLastLevel}
                    style={{ padding:"9px 14px", background:"transparent", border:"1px solid #ccc", color:"#666", borderRadius:"4px", cursor:"pointer", fontSize:"13px" }}>
                    ← Remove Last Level
                  </button>
                </div>
              )}
            </div>
          )}

          {message && !formOpen && <p style={{ marginTop:"10px", color:"#c00", fontSize:"13px" }}>{message}</p>}
        </div>
      )}

      {/* ── Search filters ── */}
      {formOpen && (
        <>
          {/* Active filter banner */}
          <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"18px", padding:"10px 14px", background:"#e8f5e9", borderRadius:"6px", border:"1px solid #c8e6c9", flexWrap:"wrap" }}>
            <div style={{ fontSize:"13px", color:"#2e7d32", fontWeight:"600", display:"flex", alignItems:"center", flexWrap:"wrap", gap:"4px" }}>
              <span>📁 {financialYear} —</span>
              {companyLocation.split(" > ").map((part, i) => (
                <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:"3px" }}>
                  {i > 0 && <span style={{ opacity:0.5 }}>›</span>}
                  <span style={{ background:"rgba(46,125,50,0.15)", padding:"1px 8px", borderRadius:"10px" }}>{part}</span>
                </span>
              ))}
            </div>
            <button onClick={resetLocation}
              style={{ marginLeft:"auto", background:"transparent", border:"1px solid #999", color:"#555", padding:"4px 10px", borderRadius:"4px", cursor:"pointer", fontSize:"12px" }}>
              ← Change location
            </button>
            <button onClick={resetYear}
              style={{ background:"transparent", border:"1px solid #999", color:"#555", padding:"4px 10px", borderRadius:"4px", cursor:"pointer", fontSize:"12px" }}>
              ← Change year
            </button>
          </div>

          {/* Filters row 1 */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"0 20px" }}>
            {[{n:"clientName",p:"Search by client name",l:"Client Name"},{n:"vehicleNumber",p:"Vehicle number",l:"Vehicle Number"},{n:"challanNumber",p:"Challan number",l:"Challan Number"}].map(f=>(
              <div key={f.n} style={fieldStyle}>
                <label style={labelStyle}>{f.l}</label>
                <input style={inputStyle} name={f.n} placeholder={f.p} value={filters[f.n]} onChange={handleChange} onKeyDown={enterKey} />
              </div>
            ))}
          </div>

          {/* Filters row 2 */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:"0 20px" }}>
            {[{n:"fromLocation",p:"From",l:"From Location"},{n:"toLocation",p:"To",l:"To Location"},{n:"loadType",p:"Load type",l:"Load Type"}].map(f=>(
              <div key={f.n} style={fieldStyle}>
                <label style={labelStyle}>{f.l}</label>
                <input style={inputStyle} name={f.n} placeholder={f.p} value={filters[f.n]} onChange={handleChange} onKeyDown={enterKey} />
              </div>
            ))}
            <div style={fieldStyle}>
              <label style={labelStyle}>Date</label>
              <input style={inputStyle} name="date" type="date" value={filters.date} onChange={handleChange} />
            </div>
          </div>

          {/* Remarks */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Remarks <span style={{ fontWeight:"400", color:"#888", fontSize:"12px" }}>(search additional notes)</span></label>
            <input style={inputStyle} name="remarks" placeholder="Search by remarks / additional notes..." value={filters.remarks} onChange={handleChange} onKeyDown={enterKey} />
          </div>

          <div style={{ display:"flex", gap:"12px", marginBottom:"20px" }}>
            <button onClick={search} disabled={loading}
              style={{ padding:"10px 28px", background:"#1a1a2e", color:"#fff", border:"none", borderRadius:"4px", fontSize:"14px", cursor:"pointer", fontWeight:"600" }}>
              {loading ? "Searching..." : "🔍 Search"}
            </button>
            <button onClick={clearFilters}
              style={{ padding:"10px 20px", background:"transparent", color:"#555", border:"1px solid #ccc", borderRadius:"4px", fontSize:"14px", cursor:"pointer" }}>
              Clear Filters
            </button>
          </div>

          {message && <p style={{ color:"#888", marginBottom:"12px" }}>{message}</p>}

          {/* Results table */}
          {results.length > 0 && (
            <div style={{ overflowX:"auto" }}>
              <p style={{ marginBottom:"8px", color:"#555", fontSize:"13px", fontWeight:"600" }}>{results.length} record(s) found</p>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"13px" }}>
                <thead>
                  <tr style={{ background:"#1a1a2e", color:"#fff" }}>
                    {["#","Client","Company","Vehicle","Challan","Cargo","From","To","Co. Fare","Cl. Fare","Date","Remarks","Actions"].map(h => (
                      <th key={h} style={{ padding:"10px 12px", textAlign:"left", whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={r._id} style={{ background: i%2===0?"#fff":"#f9f9f9", borderBottom:"1px solid #eee" }}>
                      <td style={{ padding:"9px 12px", color:"#999" }}>{i+1}</td>
                      <td style={{ padding:"9px 12px", fontWeight:"600" }}>{r.clientName}</td>
                      <td style={{ padding:"9px 12px" }}>{r.companyName}</td>
                      <td style={{ padding:"9px 12px" }}>{r.vehicleNumber}</td>
                      <td style={{ padding:"9px 12px" }}>{r.challanNumber}</td>
                      <td style={{ padding:"9px 12px" }}>{r.loadType}</td>
                      <td style={{ padding:"9px 12px" }}>{r.fromLocation}</td>
                      <td style={{ padding:"9px 12px" }}>{r.toLocation}</td>
                      <td style={{ padding:"9px 12px" }}>₹{Number(r.companyFare||0).toLocaleString("en-IN")}</td>
                      <td style={{ padding:"9px 12px" }}>₹{Number(r.clientFare||0).toLocaleString("en-IN")}</td>
                      <td style={{ padding:"9px 12px", whiteSpace:"nowrap" }}>{fmtDate(r.date)}</td>
                      <td style={{ padding:"9px 12px", maxWidth:"140px", color: r.remarks?"#444":"#ccc", fontStyle: r.remarks?"normal":"italic" }}>{r.remarks||"—"}</td>
                      <td style={{ padding:"9px 12px", whiteSpace:"nowrap" }}>
                        <button onClick={() => setInvoiceRecord(r)}
                          style={{ padding:"5px 10px", background:"#2a9d8f", color:"#fff", border:"none", borderRadius:"4px", cursor:"pointer", fontSize:"12px", marginRight:"5px" }}>
                          🧾 Invoice
                        </button>
                        {canEdit && (
                          <button onClick={() => openEdit(r)}
                            style={{ padding:"5px 10px", background:"#1a1a2e", color:"#fff", border:"none", borderRadius:"4px", cursor:"pointer", fontSize:"12px", marginRight:"5px" }}>
                            ✏ Edit
                          </button>
                        )}
                        {isAdmin && (
                          <button onClick={() => deleteRecord(r._id)}
                            style={{ padding:"5px 10px", background:"#e63946", color:"#fff", border:"none", borderRadius:"4px", cursor:"pointer", fontSize:"12px" }}>
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── EDIT MODAL ── */}
      {editRecord && (
        <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.5)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
          <div style={{ background:"#fff", borderRadius:"10px", padding:"32px", width:"100%", maxWidth:"820px", maxHeight:"90vh", overflowY:"auto", boxShadow:"0 8px 40px rgba(0,0,0,0.25)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
              <h3 style={{ margin:0, color:"#1a1a2e", fontSize:"18px" }}>✏ Edit Billing Record</h3>
              <button onClick={closeEdit} style={{ background:"transparent", border:"none", fontSize:"22px", cursor:"pointer", color:"#666" }}>✕</button>
            </div>
            <div style={{ padding:"8px 14px", background:"#f0f4ff", borderRadius:"6px", marginBottom:"20px", fontSize:"13px", color:"#1a1a2e" }}>
              <strong>Editing:</strong> {editRecord.clientName} — {editRecord.vehicleNumber} — Challan #{editRecord.challanNumber}
            </div>
            {editMsg.text && (
              <div style={{ padding:"10px 14px", borderRadius:"4px", marginBottom:"16px", background: editMsg.type==="success"?"#d4edda":"#f8d7da", color: editMsg.type==="success"?"#155724":"#721c24", fontSize:"13px" }}>
                {editMsg.text}
              </div>
            )}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"0 20px" }}>
              {[{name:"clientName",label:"Client Name *"},{name:"companyName",label:"Company Name"},{name:"phoneNumber",label:"Phone Number"}].map(f=>(
                <div key={f.name} style={fieldStyle}><label style={labelStyle}>{f.label}</label><input style={inputStyle} name={f.name} value={editForm[f.name]} onChange={handleEditChange} /></div>
              ))}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"0 20px" }}>
              {[{name:"vehicleNumber",label:"Vehicle Number *"},{name:"challanNumber",label:"Challan Number *"},{name:"loadType",label:"Load Type / Cargo"}].map(f=>(
                <div key={f.name} style={fieldStyle}><label style={labelStyle}>{f.label}</label><input style={inputStyle} name={f.name} value={editForm[f.name]} onChange={handleEditChange} /></div>
              ))}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 20px" }}>
              {[{name:"fromLocation",label:"From Location"},{name:"toLocation",label:"To Location"}].map(f=>(
                <div key={f.name} style={fieldStyle}><label style={labelStyle}>{f.label}</label><input style={inputStyle} name={f.name} value={editForm[f.name]} onChange={handleEditChange} /></div>
              ))}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 20px" }}>
              <div style={fieldStyle}>
                <label style={labelStyle}>Billing Basis</label>
                <select style={inputStyle} name="billingBasis" value={editForm.billingBasis} onChange={handleEditChange}>
                  <option value="">-- Select --</option>
                  {BASIS_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div style={fieldStyle}><label style={labelStyle}>Unit Value (Net Weight / Days)</label><input style={inputStyle} name="unitValue" type="number" value={editForm.unitValue} onChange={handleEditChange} /></div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:"0 20px" }}>
              <div style={fieldStyle}><label style={labelStyle}>Company Rate (₹)</label><input style={inputStyle} name="companyFare" type="number" value={editForm.companyFare} onChange={handleEditChange} /></div>
              <div style={fieldStyle}><label style={labelStyle}>Company Fare</label><input style={{ ...inputStyle, background:"#f5f8ff", fontWeight:"600" }} readOnly value={editForm.companyFare ? `₹${Number(editForm.companyFare).toLocaleString("en-IN")}` : ""} /></div>
              <div style={fieldStyle}><label style={labelStyle}>Client Rate (₹)</label><input style={inputStyle} name="clientFare" type="number" value={editForm.clientFare} onChange={handleEditChange} /></div>
              <div style={fieldStyle}><label style={labelStyle}>Client Fare</label><input style={{ ...inputStyle, background:"#f5f8ff", fontWeight:"600" }} readOnly value={editForm.clientFare ? `₹${Number(editForm.clientFare).toLocaleString("en-IN")}` : ""} /></div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 20px" }}>
              <div style={fieldStyle}><label style={labelStyle}>Diesel Quantity (Litres)</label><input style={inputStyle} name="dieselQuantity" type="number" value={editForm.dieselQuantity} onChange={handleEditChange} /></div>
              <div style={fieldStyle}><label style={labelStyle}>Diesel Price / Litre (₹)</label><input style={inputStyle} name="dieselPricePerLitre" type="number" value={editForm.dieselPricePerLitre} onChange={handleEditChange} /></div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 20px" }}>
              <div style={fieldStyle}><label style={labelStyle}>Date</label><input style={inputStyle} name="date" type="date" value={editForm.date} onChange={handleEditChange} /></div>
              <div style={fieldStyle}><label style={labelStyle}>Time</label><input style={inputStyle} name="time" type="time" value={editForm.time} onChange={handleEditChange} /></div>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Remarks</label>
              <textarea style={{ ...inputStyle, height:"80px", resize:"vertical", fontFamily:"inherit" }} name="remarks" value={editForm.remarks} onChange={handleEditChange} />
            </div>
            <div style={{ display:"flex", gap:"12px", marginTop:"8px" }}>
              <button onClick={saveEdit} disabled={editSaving} style={{ padding:"11px 32px", background: editSaving?"#888":"#1a1a2e", color:"#fff", border:"none", borderRadius:"4px", fontSize:"14px", cursor: editSaving?"not-allowed":"pointer", fontWeight:"600" }}>
                {editSaving ? "Saving..." : "Save Changes"}
              </button>
              <button onClick={closeEdit} style={{ padding:"11px 24px", background:"transparent", color:"#555", border:"1px solid #ccc", borderRadius:"4px", fontSize:"14px", cursor:"pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── INVOICE MODAL ── */}
      {invoiceRecord && (
        <InvoiceModal
          record={invoiceRecord}
          financialYear={financialYear}
          companyLocation={companyLocation}
          onClose={() => setInvoiceRecord(null)}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Invoice Modal
// ─────────────────────────────────────────────
function InvoiceModal({ record, financialYear, companyLocation, onClose }) {
  const fmtDate = (d) => d
    ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" })
    : new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" });

  const clientFare  = Number(record.clientFare  || 0);
  const dieselQty   = Number(record.dieselQuantity || 0);
  const dieselPrice = Number(record.dieselPricePerLitre || 0);
  const dieselTotal = dieselQty * dieselPrice;
  const grandTotal  = clientFare + dieselTotal;

  const dateStr   = record.date ? new Date(record.date).toISOString().slice(0,10).replace(/-/g,"") : Date.now();
  const invoiceNo = `INV-${(record.challanNumber||"000").toString().padStart(4,"0")}-${dateStr}`;

  const printStyles = `
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Segoe UI',Arial,sans-serif; color:#1a1a2e; background:#fff; }
    .wrap { max-width:780px; margin:0 auto; padding:36px; }
    .hdr { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:3px solid #1a1a2e; padding-bottom:18px; margin-bottom:22px; }
    .co-name { font-size:19px; font-weight:800; color:#1a1a2e; letter-spacing:-0.5px; }
    .co-sub  { font-size:11px; color:#666; margin-top:2px; }
    .co-loc  { font-size:12px; color:#555; margin-top:6px; }
    .badge   { background:#1a1a2e; color:#fff; padding:10px 18px; border-radius:6px; text-align:right; }
    .badge .lbl { font-size:10px; opacity:.7; letter-spacing:1px; text-transform:uppercase; }
    .badge .num { font-size:14px; font-weight:700; margin-top:2px; }
    .badge .dt  { font-size:10px; opacity:.7; margin-top:3px; }
    .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:18px; margin-bottom:22px; }
    .box   { background:#f8f9fc; border-radius:8px; padding:14px; }
    .box h4 { font-size:10px; letter-spacing:1px; text-transform:uppercase; color:#888; margin-bottom:8px; font-weight:700; }
    .box p  { font-size:13px; margin-bottom:3px; }
    table  { width:100%; border-collapse:collapse; margin-bottom:18px; }
    thead tr { background:#1a1a2e; color:#fff; }
    th { padding:9px 12px; text-align:left; font-size:11px; letter-spacing:.5px; }
    td { padding:10px 12px; font-size:13px; border-bottom:1px solid #eee; }
    .tr { text-align:right; }
    tfoot td { font-weight:700; background:#f0f4ff; border-top:2px solid #1a1a2e; }
    .rem { background:#fffbf0; border:1px solid #ffe082; border-radius:6px; padding:10px 14px; margin-bottom:20px; font-size:13px; color:#5d4037; }
    .meta { display:flex; justify-content:space-between; font-size:12px; color:#888; margin-bottom:28px; }
    .sig { display:flex; justify-content:space-between; border-top:1px solid #eee; padding-top:18px; }
    .sig .note { font-size:12px; color:#888; }
    .sig .line { border-top:1px solid #1a1a2e; width:150px; margin-left:auto; margin-top:46px; padding-top:5px; font-size:11px; text-align:center; color:#1a1a2e; }
    @media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
  `;

  const invoiceHTML = `
    <div class="wrap">
      <div class="hdr">
        <div>
          <div class="co-name">ELIPHAS SHIPPING SERVICES</div>
          <div class="co-sub">PRIVATE LIMITED</div>
          <div class="co-loc">${companyLocation}</div>
        </div>
        <div class="badge">
          <div class="lbl">Invoice</div>
          <div class="num">${invoiceNo}</div>
          <div class="dt">${fmtDate(record.date)}</div>
        </div>
      </div>
      <div class="grid2">
        <div class="box">
          <h4>Bill To</h4>
          <p><strong>${record.clientName||"—"}</strong></p>
          ${record.companyName ? `<p>${record.companyName}</p>` : ""}
          ${record.phoneNumber ? `<p>📞 ${record.phoneNumber}</p>` : ""}
        </div>
        <div class="box">
          <h4>Trip Details</h4>
          <p><strong>Vehicle:</strong> ${record.vehicleNumber||"—"}</p>
          <p><strong>Challan No:</strong> ${record.challanNumber||"—"}</p>
          <p><strong>Cargo:</strong> ${record.loadType||"—"}</p>
          <p><strong>Route:</strong> ${record.fromLocation||"—"} → ${record.toLocation||"—"}</p>
        </div>
      </div>
      <table>
        <thead><tr>
          <th>Description</th>
          <th class="tr">Qty / Wt</th>
          <th class="tr">Rate (₹)</th>
          <th class="tr">Amount (₹)</th>
        </tr></thead>
        <tbody>
          <tr>
            <td>Transport Charges<br><small style="color:#888">${record.billingBasis?"Basis: "+record.billingBasis:""} ${record.fromLocation&&record.toLocation?"· "+record.fromLocation+" to "+record.toLocation:""}</small></td>
            <td class="tr">${record.unitValue||"—"}</td>
            <td class="tr">${clientFare>0?clientFare.toLocaleString("en-IN"):"—"}</td>
            <td class="tr"><strong>${clientFare>0?"₹"+clientFare.toLocaleString("en-IN"):"—"}</strong></td>
          </tr>
          ${dieselTotal>0?`<tr>
            <td>Diesel Charges<br><small style="color:#888">${dieselQty}L × ₹${dieselPrice}/L</small></td>
            <td class="tr">${dieselQty} L</td>
            <td class="tr">₹${dieselPrice.toLocaleString("en-IN")}</td>
            <td class="tr"><strong>₹${dieselTotal.toLocaleString("en-IN")}</strong></td>
          </tr>`:""}
        </tbody>
        <tfoot><tr>
          <td colspan="3" class="tr" style="font-size:14px">Total Amount</td>
          <td class="tr" style="font-size:15px">₹${grandTotal.toLocaleString("en-IN")}</td>
        </tr></tfoot>
      </table>
      ${record.remarks?`<div class="rem"><strong>Remarks:</strong> ${record.remarks}</div>`:""}
      <div class="meta">
        <span>Financial Year: <strong style="color:#1a1a2e">${financialYear}</strong></span>
        <span>Location: <strong style="color:#1a1a2e">${companyLocation}</strong></span>
      </div>
      <div class="sig">
        <div class="note"><p>Thank you for your business.</p><p>This is a computer-generated invoice.</p></div>
        <div><div class="line">Authorised Signatory</div></div>
      </div>
    </div>
  `;

  const handlePrint = () => {
    const win = window.open("", "_blank");
    win.document.write(`<!DOCTYPE html><html><head><title>Invoice - ${invoiceNo}</title><style>${printStyles}</style></head><body>${invoiceHTML}</body></html>`);
    win.document.close();
    setTimeout(() => { win.print(); win.close(); }, 350);
  };

  return (
    <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.65)", zIndex:2000, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
      <div style={{ background:"#fff", borderRadius:"12px", width:"100%", maxWidth:"840px", maxHeight:"92vh", overflowY:"auto", boxShadow:"0 16px 60px rgba(0,0,0,0.35)" }}>
        {/* Modal toolbar */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 24px", borderBottom:"1px solid #eee", position:"sticky", top:0, background:"#fff", zIndex:10 }}>
          <div>
            <span style={{ fontWeight:"700", color:"#1a1a2e", fontSize:"16px" }}>🧾 Invoice Preview</span>
            <span style={{ marginLeft:"12px", fontSize:"12px", color:"#888" }}>{invoiceNo}</span>
          </div>
          <div style={{ display:"flex", gap:"10px" }}>
            <button onClick={handlePrint}
              style={{ padding:"9px 20px", background:"#1a1a2e", color:"#fff", border:"none", borderRadius:"6px", cursor:"pointer", fontSize:"13px", fontWeight:"600" }}>
              🖨️ Print / Save PDF
            </button>
            <button onClick={onClose}
              style={{ padding:"9px 16px", background:"transparent", border:"1px solid #ccc", color:"#555", borderRadius:"6px", cursor:"pointer", fontSize:"13px" }}>
              ✕ Close
            </button>
          </div>
        </div>

        {/* Invoice preview */}
        <div style={{ padding:"32px 40px", fontFamily:"'Segoe UI',Arial,sans-serif", color:"#1a1a2e" }}>
          {/* Header */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", borderBottom:"3px solid #1a1a2e", paddingBottom:"18px", marginBottom:"22px" }}>
            <div>
              <div style={{ fontSize:"19px", fontWeight:"800", letterSpacing:"-0.5px" }}>ELIPHAS SHIPPING SERVICES</div>
              <div style={{ fontSize:"11px", color:"#666", marginTop:"2px" }}>PRIVATE LIMITED</div>
              <div style={{ fontSize:"12px", color:"#555", marginTop:"6px" }}>{companyLocation}</div>
            </div>
            <div style={{ background:"#1a1a2e", color:"#fff", padding:"10px 18px", borderRadius:"6px", textAlign:"right" }}>
              <div style={{ fontSize:"10px", opacity:0.7, letterSpacing:"1px", textTransform:"uppercase" }}>Invoice</div>
              <div style={{ fontSize:"14px", fontWeight:"700", marginTop:"2px" }}>{invoiceNo}</div>
              <div style={{ fontSize:"10px", opacity:0.7, marginTop:"3px" }}>{fmtDate(record.date)}</div>
            </div>
          </div>

          {/* Bill to + Trip */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"18px", marginBottom:"22px" }}>
            <div style={{ background:"#f8f9fc", borderRadius:"8px", padding:"14px" }}>
              <div style={{ fontSize:"10px", letterSpacing:"1px", textTransform:"uppercase", color:"#888", marginBottom:"8px", fontWeight:"700" }}>Bill To</div>
              <div style={{ fontSize:"14px", fontWeight:"700", marginBottom:"3px" }}>{record.clientName||"—"}</div>
              {record.companyName && <div style={{ fontSize:"13px", color:"#555", marginBottom:"3px" }}>{record.companyName}</div>}
              {record.phoneNumber && <div style={{ fontSize:"12px", color:"#888" }}>📞 {record.phoneNumber}</div>}
            </div>
            <div style={{ background:"#f8f9fc", borderRadius:"8px", padding:"14px" }}>
              <div style={{ fontSize:"10px", letterSpacing:"1px", textTransform:"uppercase", color:"#888", marginBottom:"8px", fontWeight:"700" }}>Trip Details</div>
              <div style={{ fontSize:"13px", marginBottom:"3px" }}><strong>Vehicle:</strong> {record.vehicleNumber||"—"}</div>
              <div style={{ fontSize:"13px", marginBottom:"3px" }}><strong>Challan No:</strong> {record.challanNumber||"—"}</div>
              <div style={{ fontSize:"13px", marginBottom:"3px" }}><strong>Cargo:</strong> {record.loadType||"—"}</div>
              <div style={{ fontSize:"13px" }}><strong>Route:</strong> {record.fromLocation||"—"} → {record.toLocation||"—"}</div>
            </div>
          </div>

          {/* Line items table */}
          <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:"18px" }}>
            <thead>
              <tr style={{ background:"#1a1a2e", color:"#fff" }}>
                {["Description","Qty / Wt","Rate (₹)","Amount (₹)"].map(h=>(
                  <th key={h} style={{ padding:"9px 12px", textAlign: h==="Description"?"left":"right", fontSize:"11px", letterSpacing:"0.5px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom:"1px solid #eee" }}>
                <td style={{ padding:"11px 12px", fontSize:"13px" }}>
                  Transport Charges
                  {(record.billingBasis||record.fromLocation) && (
                    <div style={{ fontSize:"11px", color:"#888", marginTop:"2px" }}>
                      {record.billingBasis && `Basis: ${record.billingBasis}`}
                      {record.billingBasis && record.fromLocation && " · "}
                      {record.fromLocation && record.toLocation && `${record.fromLocation} to ${record.toLocation}`}
                    </div>
                  )}
                </td>
                <td style={{ padding:"11px 12px", textAlign:"right", fontSize:"13px" }}>{record.unitValue||"—"}</td>
                <td style={{ padding:"11px 12px", textAlign:"right", fontSize:"13px" }}>{clientFare>0?clientFare.toLocaleString("en-IN"):"—"}</td>
                <td style={{ padding:"11px 12px", textAlign:"right", fontSize:"13px", fontWeight:"600" }}>
                  {clientFare>0?`₹${clientFare.toLocaleString("en-IN")}`:"—"}
                </td>
              </tr>
              {dieselTotal>0 && (
                <tr style={{ borderBottom:"1px solid #eee" }}>
                  <td style={{ padding:"11px 12px", fontSize:"13px" }}>
                    Diesel Charges
                    <div style={{ fontSize:"11px", color:"#888", marginTop:"2px" }}>{dieselQty}L × ₹{dieselPrice}/L</div>
                  </td>
                  <td style={{ padding:"11px 12px", textAlign:"right", fontSize:"13px" }}>{dieselQty} L</td>
                  <td style={{ padding:"11px 12px", textAlign:"right", fontSize:"13px" }}>₹{dieselPrice.toLocaleString("en-IN")}</td>
                  <td style={{ padding:"11px 12px", textAlign:"right", fontSize:"13px", fontWeight:"600" }}>₹{dieselTotal.toLocaleString("en-IN")}</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} style={{ padding:"11px 12px", fontWeight:"700", background:"#f0f4ff", borderTop:"2px solid #1a1a2e", textAlign:"right", fontSize:"14px" }}>
                  Total Amount
                </td>
                <td style={{ padding:"11px 12px", fontWeight:"800", background:"#f0f4ff", borderTop:"2px solid #1a1a2e", textAlign:"right", fontSize:"15px", color:"#1a1a2e" }}>
                  ₹{grandTotal.toLocaleString("en-IN")}
                </td>
              </tr>
            </tfoot>
          </table>

          {record.remarks && (
            <div style={{ background:"#fffbf0", border:"1px solid #ffe082", borderRadius:"6px", padding:"10px 14px", marginBottom:"20px", fontSize:"13px", color:"#5d4037" }}>
              <strong>Remarks:</strong> {record.remarks}
            </div>
          )}

          <div style={{ display:"flex", justifyContent:"space-between", fontSize:"12px", color:"#888", marginBottom:"28px" }}>
            <span>Financial Year: <strong style={{ color:"#1a1a2e" }}>{financialYear}</strong></span>
            <span>Location: <strong style={{ color:"#1a1a2e" }}>{companyLocation}</strong></span>
          </div>

          <div style={{ display:"flex", justifyContent:"space-between", borderTop:"1px solid #eee", paddingTop:"18px" }}>
            <div style={{ fontSize:"12px", color:"#888" }}>
              <p style={{ marginBottom:"4px" }}>Thank you for your business.</p>
              <p>This is a computer-generated invoice.</p>
            </div>
            <div>
              <div style={{ height:"46px" }} />
              <div style={{ borderTop:"1px solid #1a1a2e", width:"150px", marginLeft:"auto", paddingTop:"5px", fontSize:"11px", color:"#1a1a2e", textAlign:"center" }}>
                Authorised Signatory
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
