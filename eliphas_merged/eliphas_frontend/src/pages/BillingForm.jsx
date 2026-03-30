import { useState } from "react";
import API from "../api";

// Financial years — from 2019-20 up to next year (covers all historical data)
const START_YEAR = 2000;
const END_YEAR   = 2050;
const FINANCIAL_YEARS = Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, i) => {
  const y = START_YEAR + i;
  return `${y}-${String(y + 1).slice(-2)}`;
}).reverse(); // newest first (2050-51 … 2000-01)

// Billing basis options & their unit label
const BASIS_OPTIONS = [
  { value: "trip",     label: "Trip",     unit: "Days" },
  { value: "contract", label: "Contract", unit: "Hours" },
  { value: "per_ton",  label: "Per Ton",  unit: "Weight (tons)" },
  { value: "machine",  label: "Machine",  unit: "Hours" },
];

const inputStyle = { width:"100%", padding:"9px 12px", border:"1px solid #ccc", borderRadius:"4px", fontSize:"14px", boxSizing:"border-box" };
const labelStyle = { display:"block", marginBottom:"4px", fontWeight:"600", fontSize:"13px", color:"#333" };
const fieldStyle = { marginBottom:"16px" };

function Field({ label, children }) {
  return (
    <div style={fieldStyle}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

const EMPTY_FORM = {
  clientName:"", companyName:"", phoneNumber:"",
  vehicleNumber:"", challanNumber:"", fromLocation:"", toLocation:"",
  loadType:"", billingBasis:"", unitValue:"",
  companyFare:"", clientFare:"",
  dieselQuantity:"", dieselPricePerLitre:"",
  date: new Date().toISOString().split("T")[0],
  time: new Date().toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" })
};

export default function BillingForm() {
  const [financialYear,    setFinancialYear]    = useState("");
  const [companyLocation,  setCompanyLocation]  = useState("");
  const [formOpen,         setFormOpen]         = useState(false);
  const [form,             setForm]             = useState(EMPTY_FORM);
  const [message,          setMessage]          = useState({ text:"", type:"" });
  const [saving,           setSaving]           = useState(false);

  const selectedBasis = BASIS_OPTIONS.find(b => b.value === form.billingBasis);

  const openForm = () => {
    if (!financialYear || !companyLocation.trim()) {
      setMessage({ text:"Please select Financial Year and enter Company Location first.", type:"error" }); return;
    }
    setMessage({ text:"", type:"" });
    setFormOpen(true);
    setForm(EMPTY_FORM);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async () => {
    if (!form.clientName || !form.vehicleNumber || !form.challanNumber) {
      setMessage({ text:"Client Name, Vehicle Number and Challan Number are required.", type:"error" }); return;
    }
    try {
      setSaving(true); setMessage({ text:"", type:"" });
      await API.post("/billing/add", { ...form, financialYear, companyLocation });
      setMessage({ text:"Billing saved successfully!", type:"success" });
      setForm(EMPTY_FORM);
    } catch (error) {
      setMessage({ text: error.response?.data?.message || "Error saving billing.", type:"error" });
    } finally { setSaving(false); }
  };

  return (
    <div style={{ background:"#fff", borderRadius:"8px", padding:"28px", maxWidth:"960px", boxShadow:"0 1px 6px rgba(0,0,0,0.08)" }}>
      <h2 style={{ marginTop:0, marginBottom:"24px", color:"#1a1a2e" }}>Add Billing Entry</h2>

      {/* ── STEP 1: Financial Year + Company Location ── */}
      <div style={{ background:"#f0f4ff", border:"1px solid #c5d0f5", borderRadius:"8px", padding:"20px 24px", marginBottom:"24px" }}>
        <h3 style={{ margin:"0 0 16px 0", fontSize:"14px", color:"#1a1a2e" }}>Step 1 — Select Financial Year & Location</h3>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr auto", gap:"12px 20px", alignItems:"end" }}>
          <div>
            <label style={labelStyle}>Financial Year *</label>
            <select style={inputStyle} value={financialYear} onChange={e => { setFinancialYear(e.target.value); setFormOpen(false); }}>
              <option value="">-- Select Financial Year --</option>
              {FINANCIAL_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Company Location *</label>
            <input style={inputStyle} placeholder="e.g. Hyderabad, Mumbai..."
              value={companyLocation} onChange={e => { setCompanyLocation(e.target.value); setFormOpen(false); }} />
          </div>
          <button onClick={openForm} style={{ padding:"9px 24px", background:"#1a1a2e", color:"#fff", border:"none", borderRadius:"4px", cursor:"pointer", fontWeight:"600", fontSize:"14px", whiteSpace:"nowrap", height:"38px" }}>
            Open Form →
          </button>
        </div>
        {message.text && !formOpen && (
          <div style={{ marginTop:"12px", padding:"10px 14px", borderRadius:"4px", fontSize:"13px",
            background: message.type==="error"?"#f8d7da":"#d4edda",
            color: message.type==="error"?"#721c24":"#155724" }}>
            {message.text}
          </div>
        )}
      </div>

      {/* ── STEP 2: Billing Form ── */}
      {formOpen && (
        <>
          <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"20px", padding:"10px 16px", background:"#e8f5e9", borderRadius:"6px", border:"1px solid #c8e6c9" }}>
            <span style={{ fontSize:"13px", color:"#2e7d32", fontWeight:"600" }}>
              📁 {financialYear} — {companyLocation}
            </span>
          </div>

          {message.text && (
            <div style={{ padding:"12px 16px", borderRadius:"4px", marginBottom:"20px",
              background: message.type==="success"?"#d4edda":"#f8d7da",
              color: message.type==="success"?"#155724":"#721c24",
              border:`1px solid ${message.type==="success"?"#c3e6cb":"#f5c6cb"}` }}>
              {message.text}
            </div>
          )}

          {/* ROW 1 */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"0 20px" }}>
            <Field label="Client Name *">
              <input style={inputStyle} name="clientName" placeholder="Client Name" value={form.clientName} onChange={handleChange} />
            </Field>
            <Field label="Company Name">
              <input style={inputStyle} name="companyName" placeholder="Company Name" value={form.companyName} onChange={handleChange} />
            </Field>
            <Field label="Phone Number">
              <input style={inputStyle} name="phoneNumber" placeholder="Phone Number" value={form.phoneNumber} onChange={handleChange} />
            </Field>
          </div>

          {/* ROW 2 */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"0 20px" }}>
            <Field label="Vehicle Number *">
              <input style={inputStyle} name="vehicleNumber" placeholder="e.g. AP12AB1234" value={form.vehicleNumber} onChange={handleChange} />
            </Field>
            <Field label="Challan Number *">
              <input style={inputStyle} name="challanNumber" placeholder="Challan Number" value={form.challanNumber} onChange={handleChange} />
            </Field>
            <Field label="Load Type">
              <input style={inputStyle} name="loadType" placeholder="e.g. Sand, Gravel" value={form.loadType} onChange={handleChange} />
            </Field>
          </div>

          {/* ROW 3 */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 20px" }}>
            <Field label="From Location">
              <input style={inputStyle} name="fromLocation" placeholder="From Location" value={form.fromLocation} onChange={handleChange} />
            </Field>
            <Field label="To Location">
              <input style={inputStyle} name="toLocation" placeholder="To Location" value={form.toLocation} onChange={handleChange} />
            </Field>
          </div>

          {/* ROW 4 — Billing Basis + dynamic unit */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 20px" }}>
            <Field label="Type of Transport / Billing Basis">
              <select style={inputStyle} name="billingBasis" value={form.billingBasis} onChange={handleChange}>
                <option value="">-- Select Billing Basis --</option>
                {BASIS_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
            <Field label={selectedBasis ? `Unit Value (${selectedBasis.unit})` : "Unit Value"}>
              <input style={inputStyle} name="unitValue" type="number"
                placeholder={selectedBasis ? `Enter ${selectedBasis.unit}` : "Select basis first"}
                disabled={!form.billingBasis} value={form.unitValue} onChange={handleChange} />
            </Field>
          </div>

          {/* ROW 5 — Fares */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 20px" }}>
            <Field label="Company Fare (₹)">
              <input style={inputStyle} name="companyFare" placeholder="Fare for company" type="number" value={form.companyFare} onChange={handleChange} />
            </Field>
            <Field label="Client Fare (₹)">
              <input style={inputStyle} name="clientFare" placeholder="Fare for client" type="number" value={form.clientFare} onChange={handleChange} />
            </Field>
          </div>

          {/* ROW 6 — Diesel */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 20px" }}>
            <Field label="Diesel Quantity (Litres)">
              <input style={inputStyle} name="dieselQuantity" placeholder="Litres used today" type="number" value={form.dieselQuantity} onChange={handleChange} />
            </Field>
            <Field label="Diesel Price per Litre (₹)">
              <input style={inputStyle} name="dieselPricePerLitre" placeholder="Price per litre" type="number" value={form.dieselPricePerLitre} onChange={handleChange} />
            </Field>
          </div>

          {/* ROW 7 — Date / Time */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 20px" }}>
            <Field label="Date">
              <input style={inputStyle} name="date" type="date" value={form.date} onChange={handleChange} />
            </Field>
            <Field label="Time">
              <input style={inputStyle} name="time" type="time" value={form.time} onChange={handleChange} />
            </Field>
          </div>

          <button onClick={save} disabled={saving} style={{
            marginTop:"8px", padding:"12px 32px",
            background: saving?"#888":"#1a1a2e", color:"#fff",
            border:"none", borderRadius:"4px", fontSize:"15px",
            cursor: saving?"not-allowed":"pointer", fontWeight:"600"
          }}>
            {saving ? "Saving..." : "Save Billing"}
          </button>
        </>
      )}
    </div>
  );
}
