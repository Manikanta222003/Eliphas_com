import { useState } from "react";
import API from "../api";

const START_YEAR = 2000;
const END_YEAR   = 2050;
const FINANCIAL_YEARS = Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, i) => {
  const y = START_YEAR + i;
  return `${y}-${String(y + 1).slice(-2)}`;
}).reverse();

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
  date:"", time:""
};

export default function SearchPage() {
  const user    = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";

  const [financialYear,   setFinancialYear]   = useState("");
  const [companyLocation, setCompanyLocation] = useState("");
  const [formOpen,        setFormOpen]        = useState(false);

  const [filters, setFilters] = useState({ vehicleNumber:"", challanNumber:"", date:"", fromLocation:"", toLocation:"", loadType:"", clientName:"" });
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Edit modal state
  const [editRecord, setEditRecord] = useState(null);   // null = closed
  const [editForm,   setEditForm]   = useState(EMPTY_EDIT);
  const [editSaving, setEditSaving] = useState(false);
  const [editMsg,    setEditMsg]    = useState({ text:"", type:"" });

  const openSearch = () => {
    if (!financialYear || !companyLocation.trim()) {
      setMessage("Please select Financial Year and enter Company Location."); return;
    }
    setMessage(""); setFormOpen(true); setResults([]);
  };

  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const search = async () => {
    try {
      setLoading(true); setMessage("");
      const params = new URLSearchParams({ financialYear, companyLocation });
      Object.entries(filters).forEach(([k, v]) => { if (v.trim()) params.append(k, v.trim()); });
      const res = await API.get(`/billing/search?${params.toString()}`);
      setResults(res.data);
      if (res.data.length === 0) setMessage("No records found.");
    } catch {
      setMessage("Search failed. Please try again.");
    } finally { setLoading(false); }
  };

  const deleteRecord = async (id) => {
    if (!window.confirm("Delete this record? This cannot be undone.")) return;
    try {
      await API.delete(`/billing/delete/${id}`);
      setResults(prev => prev.filter(r => r._id !== id));
      setMessage("Record deleted.");
    } catch { setMessage("Delete failed."); }
  };

  // Open edit modal — pre-fill form with record values
  const openEdit = (record) => {
    setEditRecord(record);
    setEditMsg({ text:"", type:"" });
    setEditForm({
      clientName:          record.clientName          || "",
      companyName:         record.companyName         || "",
      phoneNumber:         record.phoneNumber         || "",
      vehicleNumber:       record.vehicleNumber       || "",
      challanNumber:       record.challanNumber       || "",
      fromLocation:        record.fromLocation        || "",
      toLocation:          record.toLocation          || "",
      loadType:            record.loadType            || "",
      billingBasis:        record.billingBasis        || "",
      unitValue:           record.unitValue           || "",
      companyFare:         record.companyFare         || "",
      clientFare:          record.clientFare          || "",
      dieselQuantity:      record.dieselQuantity      || "",
      dieselPricePerLitre: record.dieselPricePerLitre || "",
      date: record.date ? new Date(record.date).toISOString().split("T")[0] : "",
      time: record.time || "",
    });
  };

  const closeEdit = () => { setEditRecord(null); setEditMsg({ text:"", type:"" }); };

  const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const saveEdit = async () => {
    if (!editForm.clientName || !editForm.vehicleNumber || !editForm.challanNumber) {
      setEditMsg({ text:"Client Name, Vehicle Number and Challan Number are required.", type:"error" }); return;
    }
    try {
      setEditSaving(true); setEditMsg({ text:"", type:"" });
      const res = await API.put(`/billing/update/${editRecord._id}`, editForm);
      // Update the results list in-place
      setResults(prev => prev.map(r => r._id === editRecord._id ? { ...r, ...res.data.data } : r));
      setEditMsg({ text:"Record updated successfully!", type:"success" });
      setTimeout(closeEdit, 1200);
    } catch (err) {
      setEditMsg({ text: err.response?.data?.message || "Update failed.", type:"error" });
    } finally { setEditSaving(false); }
  };

  const clearFilters = () => {
    setFilters({ vehicleNumber:"", challanNumber:"", date:"", fromLocation:"", toLocation:"", loadType:"", clientName:"" });
    setResults([]); setMessage("");
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN") : "";

  return (
    <div style={{ background:"#fff", borderRadius:"8px", padding:"28px", boxShadow:"0 1px 6px rgba(0,0,0,0.08)" }}>
      <h2 style={{ marginTop:0, marginBottom:"24px", color:"#1a1a2e" }}>Search Billing Records</h2>

      {/* Step 1 */}
      <div style={{ background:"#f0f4ff", border:"1px solid #c5d0f5", borderRadius:"8px", padding:"20px 24px", marginBottom:"24px" }}>
        <h3 style={{ margin:"0 0 16px 0", fontSize:"14px", color:"#1a1a2e" }}>Step 1 — Select Financial Year & Location</h3>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr auto", gap:"12px 20px", alignItems:"end" }}>
          <div>
            <label style={labelStyle}>Financial Year *</label>
            <select style={inputStyle} value={financialYear} onChange={e => { setFinancialYear(e.target.value); setFormOpen(false); setResults([]); }}>
              <option value="">-- Select Financial Year --</option>
              {FINANCIAL_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Company Location *</label>
            <input style={inputStyle} placeholder="e.g. Hyderabad, Mumbai..."
              value={companyLocation} onChange={e => { setCompanyLocation(e.target.value); setFormOpen(false); setResults([]); }} />
          </div>
          <button onClick={openSearch} style={{ padding:"9px 24px", background:"#1a1a2e", color:"#fff", border:"none", borderRadius:"4px", cursor:"pointer", fontWeight:"600", fontSize:"14px", whiteSpace:"nowrap", height:"38px" }}>
            Search →
          </button>
        </div>
        {message && !formOpen && (
          <p style={{ color:"#888", marginTop:"10px", fontSize:"13px" }}>{message}</p>
        )}
      </div>

      {/* Step 2 — Filters */}
      {formOpen && (
        <>
          <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"18px", padding:"10px 16px", background:"#e8f5e9", borderRadius:"6px", border:"1px solid #c8e6c9" }}>
            <span style={{ fontSize:"13px", color:"#2e7d32", fontWeight:"600" }}>
              📁 {financialYear} — {companyLocation}
            </span>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"12px 20px", marginBottom:"18px" }}>
            {[
              { name:"clientName",    label:"Client Name",    placeholder:"Search by client name" },
              { name:"vehicleNumber", label:"Vehicle Number", placeholder:"Vehicle Number" },
              { name:"challanNumber", label:"Challan Number", placeholder:"Challan Number" },
              { name:"date",          label:"Date",           type:"date" },
              { name:"fromLocation",  label:"From Location",  placeholder:"From Location" },
              { name:"toLocation",    label:"To Location",    placeholder:"To Location" },
              { name:"loadType",      label:"Load Type",      placeholder:"e.g. Sand, Cement" },
            ].map(f => (
              <div key={f.name}>
                <label style={labelStyle}>{f.label}</label>
                <input style={inputStyle} name={f.name} type={f.type||"text"} placeholder={f.placeholder||""}
                  value={filters[f.name]} onChange={handleChange} />
              </div>
            ))}
          </div>

          <div style={{ display:"flex", gap:"12px", marginBottom:"20px" }}>
            <button onClick={search} disabled={loading} style={{ padding:"10px 28px", background:"#1a1a2e", color:"#fff", border:"none", borderRadius:"4px", fontSize:"14px", cursor:"pointer", fontWeight:"600" }}>
              {loading ? "Searching..." : "Search"}
            </button>
            <button onClick={clearFilters} style={{ padding:"10px 20px", background:"transparent", color:"#555", border:"1px solid #ccc", borderRadius:"4px", fontSize:"14px", cursor:"pointer" }}>
              Clear
            </button>
          </div>

          {message && <p style={{ color:"#888", marginBottom:"12px" }}>{message}</p>}

          {results.length > 0 && (
            <div style={{ overflowX:"auto" }}>
              <p style={{ marginBottom:"8px", color:"#555", fontSize:"13px" }}>{results.length} record(s) found</p>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"13px" }}>
                <thead>
                  <tr style={{ background:"#1a1a2e", color:"#fff" }}>
                    {["Client","Company","Vehicle","Challan","From","To","Load","Basis","Co. Fare","Cl. Fare","Date"].map(h => (
                      <th key={h} style={{ padding:"10px 12px", textAlign:"left", whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                    {isAdmin && <th style={{ padding:"10px 12px", textAlign:"center" }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={r._id} style={{ background: i%2===0?"#fff":"#f9f9f9", borderBottom:"1px solid #eee" }}>
                      <td style={{ padding:"9px 12px" }}>{r.clientName}</td>
                      <td style={{ padding:"9px 12px" }}>{r.companyName}</td>
                      <td style={{ padding:"9px 12px" }}>{r.vehicleNumber}</td>
                      <td style={{ padding:"9px 12px" }}>{r.challanNumber}</td>
                      <td style={{ padding:"9px 12px" }}>{r.fromLocation}</td>
                      <td style={{ padding:"9px 12px" }}>{r.toLocation}</td>
                      <td style={{ padding:"9px 12px" }}>{r.loadType}</td>
                      <td style={{ padding:"9px 12px" }}>{r.billingBasis}</td>
                      <td style={{ padding:"9px 12px" }}>₹{r.companyFare}</td>
                      <td style={{ padding:"9px 12px" }}>₹{r.clientFare}</td>
                      <td style={{ padding:"9px 12px", whiteSpace:"nowrap" }}>{fmtDate(r.date)}</td>
                      {isAdmin && (
                        <td style={{ padding:"9px 12px", textAlign:"center", whiteSpace:"nowrap" }}>
                          <button onClick={() => openEdit(r)}
                            style={{ padding:"5px 12px", background:"#1a1a2e", color:"#fff", border:"none", borderRadius:"4px", cursor:"pointer", fontSize:"12px", marginRight:"6px" }}>
                            ✏ Edit
                          </button>
                          <button onClick={() => deleteRecord(r._id)}
                            style={{ padding:"5px 12px", background:"#e63946", color:"#fff", border:"none", borderRadius:"4px", cursor:"pointer", fontSize:"12px" }}>
                            Delete
                          </button>
                        </td>
                      )}
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
        <div style={{
          position:"fixed", top:0, left:0, right:0, bottom:0,
          background:"rgba(0,0,0,0.5)", zIndex:1000,
          display:"flex", alignItems:"center", justifyContent:"center", padding:"20px"
        }}>
          <div style={{
            background:"#fff", borderRadius:"10px", padding:"32px",
            width:"100%", maxWidth:"820px", maxHeight:"90vh",
            overflowY:"auto", boxShadow:"0 8px 40px rgba(0,0,0,0.25)"
          }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
              <h3 style={{ margin:0, color:"#1a1a2e", fontSize:"18px" }}>✏ Edit Billing Record</h3>
              <button onClick={closeEdit} style={{ background:"transparent", border:"none", fontSize:"22px", cursor:"pointer", color:"#666", lineHeight:1 }}>✕</button>
            </div>

            <div style={{ padding:"8px 14px", background:"#f0f4ff", borderRadius:"6px", marginBottom:"20px", fontSize:"13px", color:"#1a1a2e" }}>
              <strong>Editing:</strong> {editRecord.clientName} — {editRecord.vehicleNumber} — Challan #{editRecord.challanNumber}
            </div>

            {editMsg.text && (
              <div style={{ padding:"10px 14px", borderRadius:"4px", marginBottom:"16px",
                background: editMsg.type==="success"?"#d4edda":"#f8d7da",
                color: editMsg.type==="success"?"#155724":"#721c24", fontSize:"13px" }}>
                {editMsg.text}
              </div>
            )}

            {/* Row 1 */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"0 20px" }}>
              {[
                { name:"clientName",  label:"Client Name *",  placeholder:"Client Name" },
                { name:"companyName", label:"Company Name",   placeholder:"Company Name" },
                { name:"phoneNumber", label:"Phone Number",   placeholder:"Phone Number" },
              ].map(f => (
                <div key={f.name} style={fieldStyle}>
                  <label style={labelStyle}>{f.label}</label>
                  <input style={inputStyle} name={f.name} placeholder={f.placeholder} value={editForm[f.name]} onChange={handleEditChange} />
                </div>
              ))}
            </div>

            {/* Row 2 */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"0 20px" }}>
              {[
                { name:"vehicleNumber", label:"Vehicle Number *", placeholder:"e.g. AP12AB1234" },
                { name:"challanNumber", label:"Challan Number *", placeholder:"Challan Number" },
                { name:"loadType",      label:"Load Type",        placeholder:"e.g. Sand, Gravel" },
              ].map(f => (
                <div key={f.name} style={fieldStyle}>
                  <label style={labelStyle}>{f.label}</label>
                  <input style={inputStyle} name={f.name} placeholder={f.placeholder} value={editForm[f.name]} onChange={handleEditChange} />
                </div>
              ))}
            </div>

            {/* Row 3 */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 20px" }}>
              {[
                { name:"fromLocation", label:"From Location", placeholder:"From Location" },
                { name:"toLocation",   label:"To Location",   placeholder:"To Location" },
              ].map(f => (
                <div key={f.name} style={fieldStyle}>
                  <label style={labelStyle}>{f.label}</label>
                  <input style={inputStyle} name={f.name} placeholder={f.placeholder} value={editForm[f.name]} onChange={handleEditChange} />
                </div>
              ))}
            </div>

            {/* Row 4 */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 20px" }}>
              <div style={fieldStyle}>
                <label style={labelStyle}>Billing Basis</label>
                <select style={inputStyle} name="billingBasis" value={editForm.billingBasis} onChange={handleEditChange}>
                  <option value="">-- Select Billing Basis --</option>
                  {BASIS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Unit Value</label>
                <input style={inputStyle} name="unitValue" type="number" placeholder="Unit value" value={editForm.unitValue} onChange={handleEditChange} />
              </div>
            </div>

            {/* Row 5 — Fares */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 20px" }}>
              <div style={fieldStyle}>
                <label style={labelStyle}>Company Fare (₹)</label>
                <input style={inputStyle} name="companyFare" type="number" placeholder="Company fare" value={editForm.companyFare} onChange={handleEditChange} />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Client Fare (₹)</label>
                <input style={inputStyle} name="clientFare" type="number" placeholder="Client fare" value={editForm.clientFare} onChange={handleEditChange} />
              </div>
            </div>

            {/* Row 6 — Diesel */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 20px" }}>
              <div style={fieldStyle}>
                <label style={labelStyle}>Diesel Quantity (Litres)</label>
                <input style={inputStyle} name="dieselQuantity" type="number" placeholder="Litres" value={editForm.dieselQuantity} onChange={handleEditChange} />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Diesel Price per Litre (₹)</label>
                <input style={inputStyle} name="dieselPricePerLitre" type="number" placeholder="Price/litre" value={editForm.dieselPricePerLitre} onChange={handleEditChange} />
              </div>
            </div>

            {/* Row 7 — Date / Time */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 20px" }}>
              <div style={fieldStyle}>
                <label style={labelStyle}>Date</label>
                <input style={inputStyle} name="date" type="date" value={editForm.date} onChange={handleEditChange} />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Time</label>
                <input style={inputStyle} name="time" type="time" value={editForm.time} onChange={handleEditChange} />
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display:"flex", gap:"12px", marginTop:"8px" }}>
              <button onClick={saveEdit} disabled={editSaving} style={{
                padding:"11px 32px", background: editSaving?"#888":"#1a1a2e",
                color:"#fff", border:"none", borderRadius:"4px",
                fontSize:"14px", cursor: editSaving?"not-allowed":"pointer", fontWeight:"600"
              }}>
                {editSaving ? "Saving..." : "Save Changes"}
              </button>
              <button onClick={closeEdit} style={{ padding:"11px 24px", background:"transparent", color:"#555", border:"1px solid #ccc", borderRadius:"4px", fontSize:"14px", cursor:"pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
