import { useState, useRef, useEffect } from "react";
import API from "../api";

const BASIS_OPTIONS = [
  { value: "trip",     label: "Trip",     unit: "Days" },
  { value: "contract", label: "Contract", unit: "Days" },
  { value: "per_ton",  label: "Per Ton",  unit: "Weight (tons)" },
  { value: "machine",  label: "Machine",  unit: "Hours" },
];

const inp = {
  width:"100%", padding:"10px 13px", border:"1.5px solid #d0d7e8",
  borderRadius:"6px", fontSize:"14px", boxSizing:"border-box",
  outline:"none", transition:"border 0.2s"
};
const lbl = { display:"block", marginBottom:"5px", fontWeight:"600", fontSize:"13px", color:"#444" };
const fld = { marginBottom:"16px" };

function Field({ label, children }) {
  return <div style={fld}><label style={lbl}>{label}</label>{children}</div>;
}

const EMPTY_FORM = {
  clientName:"", companyName:"", phoneNumber:"",
  vehicleNumber:"", challanNumber:"", fromLocation:"", toLocation:"",
  loadType:"", billingBasis:"", unitValue:"",
  companyFare:"", clientFare:"",
  dieselQuantity:"", dieselPricePerLitre:"",
  remarks:"",
  date: new Date().toISOString().split("T")[0],
  time: new Date().toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" })
};

// Stage constants
const S = { YEAR:"year", LOCATION:"location", FORM:"form" };

export default function BillingForm() {
  const [stage, setStage]               = useState(S.YEAR);
  const [yearInput, setYearInput]       = useState("");
  const [financialYear, setFinancialYear] = useState("");
  const [yearErr, setYearErr]           = useState("");

  // Location chain: array of strings, e.g. ["Visakhapatnam","Gajuwaka","Tinder Dipo"]
  const [locChain, setLocChain]         = useState([]);
  const [locInput, setLocInput]         = useState("");
  const [locErr, setLocErr]             = useState("");

  const [companyLocation, setCompanyLocation] = useState("");

  const [form,    setForm]    = useState(EMPTY_FORM);
  const [message, setMessage] = useState({ text:"", type:"" });
  const [saving,  setSaving]  = useState(false);

  const yearRef = useRef(null);
  const locRef  = useRef(null);

  useEffect(() => { yearRef.current?.focus(); }, []);
  useEffect(() => { if (stage === S.LOCATION) setTimeout(() => locRef.current?.focus(), 60); }, [stage]);

  const selectedBasis = BASIS_OPTIONS.find(b => b.value === form.billingBasis);

  // ── Step 1: Confirm year ──
  const confirmYear = () => {
    const raw = yearInput.trim();
    if (!raw) { setYearErr("Please enter a year."); return; }
    let fy = raw;
    if (/^\d{4}$/.test(raw)) { const y = parseInt(raw); fy = `${y}-${String(y + 1).slice(-2)}`; }
    setFinancialYear(fy);
    setYearErr("");
    setLocChain([]);
    setLocInput("");
    setStage(S.LOCATION);
  };

  // ── Step 2: Add one level to location chain ──
  const addLevel = () => {
    const raw = locInput.trim();
    if (!raw) { setLocErr("Please type a location name."); return; }
    setLocChain(prev => [...prev, raw]);
    setLocInput("");
    setLocErr("");
    setTimeout(() => locRef.current?.focus(), 40);
  };

  // Remove last level
  const removeLastLevel = () => {
    setLocChain(prev => prev.slice(0, -1));
    setLocErr("");
    setTimeout(() => locRef.current?.focus(), 40);
  };

  // Open form with the current chain as-is (stop adding locations)
  const openForm = () => {
    if (locChain.length === 0) { setLocErr("Add at least one location."); return; }
    setCompanyLocation(locChain.join(" > "));
    setForm(EMPTY_FORM);
    setMessage({ text:"", type:"" });
    setStage(S.FORM);
  };

  // Reset everything
  const resetAll = () => {
    setStage(S.YEAR); setYearInput(""); setFinancialYear(""); setYearErr("");
    setLocChain([]); setLocInput(""); setLocErr(""); setCompanyLocation("");
    setMessage({ text:"", type:"" });
    setTimeout(() => yearRef.current?.focus(), 60);
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
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Error saving billing.", type:"error" });
    } finally { setSaving(false); }
  };

  // ── Styles ──
  const card = {
    background:"#f4f7ff", border:"1.5px solid #c8d4f0",
    borderRadius:"10px", padding:"28px", maxWidth:"540px"
  };
  const primaryBtn = (disabled) => ({
    padding:"10px 24px", background: disabled ? "#aaa" : "#1a1a2e",
    color:"#fff", border:"none", borderRadius:"6px",
    fontSize:"14px", fontWeight:"700", cursor: disabled ? "not-allowed" : "pointer"
  });
  const ghostBtn = {
    padding:"10px 18px", background:"transparent",
    border:"1.5px solid #1a1a2e", color:"#1a1a2e",
    borderRadius:"6px", fontSize:"14px", fontWeight:"600", cursor:"pointer"
  };
  const dangerGhost = {
    padding:"8px 14px", background:"transparent",
    border:"1.5px solid #e63946", color:"#e63946",
    borderRadius:"6px", fontSize:"13px", fontWeight:"600", cursor:"pointer"
  };

  return (
    <div style={{ background:"#fff", borderRadius:"10px", padding:"30px", maxWidth:"980px", boxShadow:"0 2px 10px rgba(0,0,0,0.07)" }}>
      <h2 style={{ marginTop:0, marginBottom:"24px", color:"#1a1a2e", fontSize:"20px" }}>Add Billing Entry</h2>

      {/* ══════════════ STAGE 1: YEAR ══════════════ */}
      {stage === S.YEAR && (
        <div style={card}>
          <div style={{ fontSize:"12px", fontWeight:"700", color:"#8a96b3", letterSpacing:"1px", marginBottom:"8px" }}>STEP 1 OF 3</div>
          <h3 style={{ margin:"0 0 6px 0", fontSize:"17px", color:"#1a1a2e" }}>Financial Year</h3>
          <p style={{ margin:"0 0 18px 0", fontSize:"13px", color:"#666" }}>
            Type the year and press <kbd style={{ background:"#dde3f0", padding:"2px 7px", borderRadius:"4px", fontFamily:"monospace" }}>Enter</kbd> or click Confirm.
          </p>
          <input
            ref={yearRef}
            style={{ ...inp, fontSize:"17px", letterSpacing:"2px" }}
            placeholder="e.g. 2025 or 2025-26"
            value={yearInput}
            onChange={e => { setYearInput(e.target.value); setYearErr(""); }}
            onKeyDown={e => e.key === "Enter" && confirmYear()}
          />
          {yearErr && <p style={{ margin:"8px 0 0", color:"#e63946", fontSize:"13px" }}>⚠ {yearErr}</p>}
          <p style={{ margin:"10px 0 20px", fontSize:"12px", color:"#999" }}>Typing "2025" auto-formats to "2025-26"</p>
          <button style={primaryBtn(false)} onClick={confirmYear}>Confirm Year →</button>
        </div>
      )}

      {/* ══════════════ STAGE 2: LOCATION BUILDER ══════════════ */}
      {stage === S.LOCATION && (
        <div style={card}>
          <div style={{ fontSize:"12px", fontWeight:"700", color:"#8a96b3", letterSpacing:"1px", marginBottom:"8px" }}>STEP 2 OF 3</div>
          <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"6px" }}>
            <h3 style={{ margin:0, fontSize:"17px", color:"#1a1a2e" }}>Build Location Path</h3>
            <span style={{ fontSize:"12px", background:"#1a1a2e", color:"#fff", padding:"3px 10px", borderRadius:"12px", fontWeight:"600" }}>{financialYear}</span>
          </div>
          <p style={{ margin:"0 0 16px 0", fontSize:"13px", color:"#666" }}>
            Type each location level and press <kbd style={{ background:"#dde3f0", padding:"2px 7px", borderRadius:"4px", fontFamily:"monospace" }}>Enter</kbd> or <strong>+ Add Level</strong>.<br/>
            Add as many levels as you want. When done, click <strong>"Open Form"</strong>.
          </p>

          {/* Current path display */}
          <div style={{ marginBottom:"16px" }}>
            <div style={{ fontSize:"12px", fontWeight:"700", color:"#8a96b3", marginBottom:"8px", letterSpacing:"0.5px" }}>CURRENT PATH</div>
            {locChain.length === 0 ? (
              <div style={{ padding:"12px 16px", background:"#eef1f9", borderRadius:"6px", color:"#aaa", fontSize:"13px", fontStyle:"italic" }}>
                No location added yet — type below to start
              </div>
            ) : (
              <div style={{ display:"flex", alignItems:"center", flexWrap:"wrap", gap:"4px", padding:"12px 16px", background:"#eef1f9", borderRadius:"6px", minHeight:"46px" }}>
                {locChain.map((loc, i) => (
                  <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:"4px" }}>
                    {i > 0 && <span style={{ color:"#8a96b3", fontSize:"16px", fontWeight:"300", margin:"0 2px" }}>›</span>}
                    <span style={{
                      padding:"4px 12px", borderRadius:"20px", fontSize:"13px", fontWeight:"600",
                      background: i === 0 ? "#1a1a2e" : i === 1 ? "#2a5298" : i === 2 ? "#2a9d8f" : i === 3 ? "#e9a825" : "#7b2d8b",
                      color:"#fff"
                    }}>
                      {loc}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Input row */}
          <div style={{ display:"flex", gap:"8px", marginBottom:"8px" }}>
            <input
              ref={locRef}
              style={{ ...inp, flex:1 }}
              placeholder={
                locChain.length === 0 ? "Enter city (e.g. Visakhapatnam)" :
                locChain.length === 1 ? "Enter area (e.g. Gajuwaka)" :
                `Enter sub-location level ${locChain.length + 1}...`
              }
              value={locInput}
              onChange={e => { setLocInput(e.target.value); setLocErr(""); }}
              onKeyDown={e => e.key === "Enter" && addLevel()}
            />
            <button onClick={addLevel} style={{ ...primaryBtn(false), whiteSpace:"nowrap", padding:"10px 20px" }}>
              + Add Level
            </button>
          </div>

          {locErr && <p style={{ margin:"0 0 10px", color:"#e63946", fontSize:"13px" }}>⚠ {locErr}</p>}

          {/* Hint */}
          <p style={{ margin:"0 0 20px", fontSize:"12px", color:"#999" }}>
            Example: <em>Visakhapatnam</em> → <em>Gajuwaka</em> → <em>Tinder Dipo</em> → <em>Gate 3</em> — add as many as needed
          </p>

          {/* Action buttons */}
          <div style={{ display:"flex", gap:"10px", flexWrap:"wrap", alignItems:"center" }}>
            <button
              onClick={openForm}
              disabled={locChain.length === 0}
              style={{ ...primaryBtn(locChain.length === 0), padding:"12px 28px", fontSize:"15px" }}
              title={locChain.length === 0 ? "Add at least one location first" : "Open the billing form"}
            >
              Open Form ✓
            </button>

            {locChain.length > 0 && (
              <button onClick={removeLastLevel} style={dangerGhost}>
                ← Remove Last Level
              </button>
            )}

            <button onClick={resetAll} style={{ ...ghostBtn, marginLeft:"auto", fontSize:"13px", padding:"8px 16px" }}>
              ← Change Year
            </button>
          </div>

          {/* Live preview of final location string */}
          {locChain.length > 0 && (
            <div style={{ marginTop:"18px", padding:"10px 14px", background:"#e8f5e9", borderRadius:"6px", border:"1px solid #c8e6c9", fontSize:"13px" }}>
              <span style={{ color:"#555", fontWeight:"600" }}>Will be saved as: </span>
              <span style={{ color:"#2e7d32", fontWeight:"700" }}>{locChain.join(" > ")}</span>
            </div>
          )}
        </div>
      )}

      {/* ══════════════ STAGE 3: BILLING FORM ══════════════ */}
      {stage === S.FORM && (
        <>
          {/* Banner */}
          <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"22px", padding:"11px 18px", background:"#e8f5e9", borderRadius:"8px", border:"1px solid #c8e6c9", flexWrap:"wrap" }}>
            <div>
              <div style={{ fontSize:"11px", color:"#555", fontWeight:"600", letterSpacing:"0.5px", marginBottom:"2px" }}>FILING UNDER</div>
              <div style={{ fontSize:"14px", color:"#1a1a2e", fontWeight:"700" }}>📁 {financialYear} — {companyLocation}</div>
            </div>
            <div style={{ marginLeft:"auto", display:"flex", gap:"8px" }}>
              <button
                onClick={() => { setStage(S.LOCATION); setCompanyLocation(""); }}
                style={{ background:"transparent", border:"1px solid #aaa", color:"#555", padding:"5px 12px", borderRadius:"5px", cursor:"pointer", fontSize:"12px" }}>
                ← Change Location
              </button>
              <button onClick={resetAll}
                style={{ background:"transparent", border:"1px solid #aaa", color:"#555", padding:"5px 12px", borderRadius:"5px", cursor:"pointer", fontSize:"12px" }}>
                ← Change Year
              </button>
            </div>
          </div>

          {message.text && (
            <div style={{ padding:"12px 16px", borderRadius:"6px", marginBottom:"20px",
              background: message.type === "success" ? "#d4edda" : "#f8d7da",
              color:      message.type === "success" ? "#155724" : "#721c24",
              border:`1px solid ${message.type === "success" ? "#c3e6cb" : "#f5c6cb"}`,
              fontWeight:"600", fontSize:"14px"
            }}>
              {message.type === "success" ? "✓ " : "⚠ "}{message.text}
            </div>
          )}

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"0 20px" }}>
            <Field label="Client Name *"><input style={inp} name="clientName" placeholder="Client Name" value={form.clientName} onChange={handleChange} /></Field>
            <Field label="Company Name"><input style={inp} name="companyName" placeholder="Company Name" value={form.companyName} onChange={handleChange} /></Field>
            <Field label="Phone Number"><input style={inp} name="phoneNumber" placeholder="Phone Number" value={form.phoneNumber} onChange={handleChange} /></Field>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"0 20px" }}>
            <Field label="Vehicle Number *"><input style={inp} name="vehicleNumber" placeholder="e.g. AP12AB1234" value={form.vehicleNumber} onChange={handleChange} /></Field>
            <Field label="Challan Number *"><input style={inp} name="challanNumber" placeholder="Challan Number" value={form.challanNumber} onChange={handleChange} /></Field>
            <Field label="Load Type / Cargo"><input style={inp} name="loadType" placeholder="e.g. L-STONE, COAL" value={form.loadType} onChange={handleChange} /></Field>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 20px" }}>
            <Field label="From Location"><input style={inp} name="fromLocation" placeholder="From" value={form.fromLocation} onChange={handleChange} /></Field>
            <Field label="To Location"><input style={inp} name="toLocation" placeholder="To" value={form.toLocation} onChange={handleChange} /></Field>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"0 20px" }}>
            <Field label="Billing Basis">
              <select style={inp} name="billingBasis" value={form.billingBasis} onChange={handleChange}>
                <option value="">-- Select --</option>
                {BASIS_OPTIONS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </Field>
            <Field label={`Unit Value${selectedBasis ? ` (${selectedBasis.unit})` : ""}`}>
              <input style={inp} name="unitValue" type="number" placeholder="Unit value" value={form.unitValue} onChange={handleChange} />
            </Field>
            <div />
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:"0 20px" }}>
            <Field label="Company Rate (₹)"><input style={inp} name="companyFare" type="number" placeholder="Rate" value={form.companyFare} onChange={handleChange} /></Field>
            <Field label="Company Fare (auto)">
              <input style={{ ...inp, background:"#f0f4ff", fontWeight:"700", color:"#1a1a2e" }} readOnly
                value={form.companyFare ? `₹${Number(form.companyFare).toLocaleString("en-IN")}` : ""} />
            </Field>
            <Field label="Client Rate (₹)"><input style={inp} name="clientFare" type="number" placeholder="Rate" value={form.clientFare} onChange={handleChange} /></Field>
            <Field label="Client Fare (auto)">
              <input style={{ ...inp, background:"#f0f4ff", fontWeight:"700", color:"#1a1a2e" }} readOnly
                value={form.clientFare ? `₹${Number(form.clientFare).toLocaleString("en-IN")}` : ""} />
            </Field>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 20px" }}>
            <Field label="Diesel Quantity (Litres)"><input style={inp} name="dieselQuantity" type="number" placeholder="Litres" value={form.dieselQuantity} onChange={handleChange} /></Field>
            <Field label="Diesel Price / Litre (₹)"><input style={inp} name="dieselPricePerLitre" type="number" placeholder="₹/litre" value={form.dieselPricePerLitre} onChange={handleChange} /></Field>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 20px" }}>
            <Field label="Date"><input style={inp} name="date" type="date" value={form.date} onChange={handleChange} /></Field>
            <Field label="Time"><input style={inp} name="time" type="time" value={form.time} onChange={handleChange} /></Field>
          </div>

          <div style={fld}>
            <label style={lbl}>Remarks <span style={{ fontWeight:"400", color:"#888", fontSize:"12px" }}>(optional)</span></label>
            <textarea
              style={{ ...inp, height:"76px", resize:"vertical", fontFamily:"inherit" }}
              name="remarks"
              placeholder="Any additional notes or remarks..."
              value={form.remarks}
              onChange={handleChange}
            />
          </div>

          <div style={{ display:"flex", gap:"12px", marginTop:"12px" }}>
            <button onClick={save} disabled={saving} style={{ ...primaryBtn(saving), padding:"13px 40px", fontSize:"15px" }}>
              {saving ? "Saving..." : "Save Billing Entry ✓"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
