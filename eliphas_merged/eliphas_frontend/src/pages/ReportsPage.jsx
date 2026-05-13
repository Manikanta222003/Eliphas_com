import { useState, useRef, useEffect } from "react";
import API from "../api";
import "./ReportsPage.css";

const PERIODS = ["daily", "weekly", "monthly", "yearly", "custom"];

export default function ReportsPage({ user }) {
  const isManager = user?.role === "manager";

  const [data,         setData]         = useState([]);
  const [message,      setMessage]      = useState("");
  const [activeReport, setActiveReport] = useState("");
  const [reportMode,   setReportMode]   = useState("billing");
  const [loading,      setLoading]      = useState(false);
  const [customFrom,   setCustomFrom]   = useState("");
  const [customTo,     setCustomTo]     = useState("");

  // Financial year
  const [yearInput,     setYearInput]     = useState("");
  const [financialYear, setFinancialYear] = useState("");

  // Location chain (city > sub-city > …)
  const [locChain,        setLocChain]        = useState([]);
  const [locInput,        setLocInput]        = useState("");
  const [locErr,          setLocErr]          = useState("");
  const [companyLocation, setCompanyLocation] = useState("");
  const [filterReady,     setFilterReady]     = useState(false);

  const locRef = useRef(null);

  const handleYearKey = (e) => {
    if (e.key !== "Enter") return;
    const raw = yearInput.trim();
    if (!raw) return;
    let fy = raw;
    if (/^\d{4}$/.test(raw)) { const y = parseInt(raw); fy = `${y}-${String(y+1).slice(-2)}`; }
    setFinancialYear(fy);
  };

  const addLevel = () => {
    const raw = locInput.trim();
    if (!raw) { setLocErr("Please type a location name."); return; }
    setLocChain(prev => [...prev, raw]);
    setLocInput(""); setLocErr("");
    setTimeout(() => locRef.current?.focus(), 40);
  };

  const removeLastLevel = () => {
    setLocChain(prev => prev.slice(0, -1));
    setTimeout(() => locRef.current?.focus(), 40);
  };

  const handleLocKey = (e) => {
    if (e.key === "Enter") { addLevel(); return; }
    if (e.key === "Backspace" && locInput === "" && locChain.length > 0) { removeLastLevel(); }
  };

  const applyFilter = () => {
    const loc = locChain.join(" > ");
    setCompanyLocation(loc);
    setFilterReady(true);
    setLocErr("");
  };

  const resetFilter = () => {
    setYearInput(""); setFinancialYear("");
    setLocChain([]); setLocInput(""); setLocErr(""); setCompanyLocation("");
    setFilterReady(false); setData([]); setActiveReport(""); setMessage("");
  };

  const buildLocationParams = () => {
    const p = new URLSearchParams();
    if (financialYear)   p.append("financialYear",   financialYear);
    if (companyLocation) p.append("companyLocation", companyLocation);
    return p.toString();
  };

  const getUrl = (type, suffix = "") => {
    const locParams = buildLocationParams();
    if (type === "custom") {
      const base = `/reports/custom${suffix}?from=${customFrom}&to=${customTo}`;
      return locParams ? `${base}&${locParams}` : base;
    }
    const base = `/reports/${type}${suffix}`;
    return locParams ? `${base}?${locParams}` : base;
  };

  const loadReport = async (type, mode = "billing") => {
    if (type === "custom" && (!customFrom || !customTo)) {
      setMessage("Please select both From and To dates."); return;
    }
    try {
      setLoading(true); setActiveReport(type); setReportMode(mode); setMessage(""); setData([]);
      const endpoint = mode === "diesel" ? getUrl(type, "-diesel-view") : getUrl(type);
      const res = await API.get(endpoint);
      const result = res.data?.data || [];
      setData(result);
      if (result.length === 0) setMessage("No records found for this period.");
    } catch { setMessage("Failed to load report."); }
    finally { setLoading(false); }
  };

  const download = async (type, format, fareType = "") => {
    if (type === "custom" && (!customFrom || !customTo)) {
      setMessage("Please select From and To dates."); return;
    }
    try {
      setMessage("");
      let suffix;
      if (fareType === "diesel")                        suffix = `-diesel-${format}`;
      else if (fareType === "client" || fareType === "company") suffix = `-${fareType}-${format}`;
      else                                               suffix = `-${format}`;
      const url = getUrl(type, suffix);
      const mimeMap = {
        excel: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        pdf:   "application/pdf",
        csv:   "text/csv"
      };
      const extMap = { excel:"xlsx", pdf:"pdf", csv:"csv" };
      const response = await API.get(url, { responseType:"blob" });
      const blob = new Blob([response.data], { type: mimeMap[format] });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      const locSuffix = companyLocation ? `_${companyLocation.replace(/[\s>]+/g,"_").replace(/_+/g,"_")}` : "";
      link.download = `${fareType||"billing"}${locSuffix}_${type}_report.${extMap[format]}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);
    } catch (err) {
      setMessage(`Download failed. ${err.response?.data?.message || ""}`);
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "";

  const withMargin = data.map((item, idx) => {
    const co = Number(item.companyFare || 0);
    const cl = Number(item.clientFare  || 0);
    const marginAmt  = co - cl;
    const marginRate = (co && cl && item.unitValue) ? ((co - cl) / Number(item.unitValue || 1)) : 0;
    return { ...item, _idx: idx + 1, marginRate: marginRate.toFixed(2), marginAmt };
  });

  const grandCompanyFare = data.reduce((s, i) => s + Number(i.companyFare || 0), 0);
  const grandClientFare  = data.reduce((s, i) => s + Number(i.clientFare  || 0), 0);
  const grandMargin      = grandCompanyFare - grandClientFare;

  const btnStyle = (type) => ({
    padding:"9px 18px", marginRight:"8px", marginBottom:"8px",
    border: activeReport===type ? "2px solid #1a1a2e" : "1px solid #ccc",
    background: activeReport===type ? "#1a1a2e" : "#fff",
    color: activeReport===type ? "#fff" : "#333",
    borderRadius:"4px", cursor:"pointer",
    fontWeight: activeReport===type ? "700" : "400", fontSize:"14px"
  });

  const dlBtn = (color, disabled) => ({
    padding:"6px 12px", marginRight:"4px", border:"none",
    background: disabled ? "#ccc" : color, color:"#fff",
    borderRadius:"4px", cursor: disabled ? "not-allowed" : "pointer",
    fontSize:"12px", fontWeight:"600", opacity: disabled ? 0.6 : 1
  });

  const inputStyle = { padding:"8px 10px", border:"1px solid #ccc", borderRadius:"4px", fontSize:"13px" };

  return (
    <div style={{ background:"#fff", borderRadius:"8px", padding:"28px", boxShadow:"0 1px 6px rgba(0,0,0,0.08)" }}>
      <h2 style={{ marginTop:0, marginBottom:"24px", color:"#1a1a2e" }}>Billing Reports</h2>

      {/* ── Year + Location Chain Filter ── */}
      <div style={{ background:"#f0f4ff", border:"1px solid #c5d0f5", borderRadius:"8px", padding:"18px 20px", marginBottom:"20px" }}>
        <div style={{ fontSize:"13px", fontWeight:"700", color:"#1a1a2e", marginBottom:"14px" }}>
          📍 Filter by Financial Year & Location
        </div>

        <div style={{ display:"flex", flexWrap:"wrap", gap:"16px", alignItems:"flex-start" }}>
          {/* Year */}
          <div>
            <label style={{ display:"block", marginBottom:"4px", fontWeight:"600", fontSize:"12px", color:"#555" }}>Financial Year</label>
            <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
              <input style={{ ...inputStyle, width:"140px" }}
                placeholder="e.g. 2025 or 2025-26"
                value={yearInput}
                onChange={e => setYearInput(e.target.value)}
                onKeyDown={handleYearKey}
              />
              {financialYear && (
                <span style={{ fontSize:"12px", background:"#1a1a2e", color:"#fff", padding:"2px 8px", borderRadius:"10px" }}>
                  {financialYear} ✓
                </span>
              )}
            </div>
            <p style={{ margin:"4px 0 0", fontSize:"11px", color:"#888" }}>Press Enter to confirm</p>
          </div>

          {/* Location chain */}
          <div style={{ flex:1, minWidth:"260px" }}>
            <label style={{ display:"block", marginBottom:"4px", fontWeight:"600", fontSize:"12px", color:"#555" }}>
              Company Location
              <span style={{ fontWeight:"400", color:"#888", marginLeft:"6px" }}>
                (Enter city → sub-city → … press Enter each level)
              </span>
            </label>

            {/* Chain chips */}
            {locChain.length > 0 && (
              <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:"4px", marginBottom:"8px", padding:"6px 10px", background:"#fff", border:"1px solid #c5d0f5", borderRadius:"6px" }}>
                {locChain.map((loc, i) => (
                  <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:"3px" }}>
                    {i > 0 && <span style={{ color:"#888", fontSize:"14px" }}>›</span>}
                    <span style={{ background:"#1a1a2e", color:"#fff", padding:"2px 9px", borderRadius:"20px", fontSize:"12px", fontWeight:"600" }}>
                      {loc}
                    </span>
                  </span>
                ))}
              </div>
            )}

            <div style={{ display:"flex", gap:"6px" }}>
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
                  style={{ padding:"8px 12px", background:"#3a3a5e", color:"#fff", border:"none", borderRadius:"4px", cursor:"pointer", fontSize:"12px", whiteSpace:"nowrap" }}>
                  + Add
                </button>
              )}
              {locChain.length > 0 && (
                <button onClick={removeLastLevel}
                  style={{ padding:"8px 10px", background:"transparent", border:"1px solid #ccc", color:"#666", borderRadius:"4px", cursor:"pointer", fontSize:"12px" }}>
                  ← Remove
                </button>
              )}
            </div>
            {locErr && <p style={{ margin:"4px 0 0", fontSize:"12px", color:"#c00" }}>{locErr}</p>}
          </div>

          {/* Apply / Clear */}
          <div style={{ display:"flex", gap:"8px", alignItems:"flex-end", paddingBottom:"2px" }}>
            <button onClick={applyFilter}
              style={{ padding:"8px 18px", background:"#1a1a2e", color:"#fff", border:"none", borderRadius:"4px", cursor:"pointer", fontWeight:"600", fontSize:"13px" }}>
              Apply Filter
            </button>
            {filterReady && (
              <button onClick={resetFilter}
                style={{ padding:"8px 14px", background:"transparent", border:"1px solid #ccc", color:"#666", borderRadius:"4px", cursor:"pointer", fontSize:"13px" }}>
                Clear
              </button>
            )}
          </div>
        </div>

        {filterReady && (
          <div style={{ marginTop:"12px", padding:"6px 12px", background:"#e8f5e9", borderRadius:"4px", fontSize:"13px", color:"#2e7d32", fontWeight:"600", display:"inline-flex", alignItems:"center", gap:"6px", flexWrap:"wrap" }}>
            <span>Active filter:</span>
            <span style={{ fontWeight:"700" }}>{financialYear||"All years"}</span>
            {companyLocation && (
              <>
                <span style={{ opacity:0.5 }}>·</span>
                {companyLocation.split(" > ").map((part, i) => (
                  <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:"3px" }}>
                    {i > 0 && <span style={{ opacity:0.5 }}>›</span>}
                    <span style={{ background:"rgba(46,125,50,0.15)", padding:"1px 7px", borderRadius:"10px" }}>{part}</span>
                  </span>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Period Buttons ── */}
      <div style={{ marginBottom:"8px" }}>
        <span style={{ fontWeight:"600", fontSize:"13px", color:"#555", marginRight:"12px" }}>📄 Billing View:</span>
        {PERIODS.map(p => (
          <button key={p} style={btnStyle(p)} onClick={() => loadReport(p, "billing")}>
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>
      <div style={{ marginBottom:"8px" }}>
        <span style={{ fontWeight:"600", fontSize:"13px", color:"#555", marginRight:"12px" }}>⛽ Diesel View:</span>
        {PERIODS.map(p => (
          <button key={`d-${p}`} style={{ ...btnStyle(p), borderColor: activeReport===p && reportMode==="diesel" ? "#e9a825":"#ccc", background: activeReport===p && reportMode==="diesel" ? "#e9a825":"#fff", color: activeReport===p && reportMode==="diesel" ? "#fff":"#333" }} onClick={() => loadReport(p, "diesel")}>
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Custom date range */}
      <div style={{ display:"flex", alignItems:"center", gap:"12px", padding:"12px 16px", background:"#f5f6fa", borderRadius:"4px", marginBottom:"24px", flexWrap:"wrap" }}>
        <label style={{ fontWeight:"600", fontSize:"13px" }}>Custom Range:</label>
        <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
          style={{ padding:"7px 10px", border:"1px solid #ccc", borderRadius:"4px", fontSize:"13px" }} />
        <span style={{ color:"#777" }}>to</span>
        <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
          style={{ padding:"7px 10px", border:"1px solid #ccc", borderRadius:"4px", fontSize:"13px" }} />
      </div>

      {/* ── Download Section ── */}
      <div style={{ marginBottom:"28px" }}>
        <div style={{ fontWeight:"700", fontSize:"13px", color:"#1a1a2e", marginBottom:"6px" }}>
          Download Reports
          {filterReady && companyLocation && (
            <span style={{ marginLeft:"10px", fontSize:"12px", fontWeight:"600", background:"#e8f5e9", color:"#2e7d32", padding:"2px 10px", borderRadius:"10px" }}>
              📍 {companyLocation}
            </span>
          )}
        </div>
        {isManager && <div style={{ marginBottom:"10px", fontSize:"12px", color:"#e63946" }}>⚠ Manager: PDF only</div>}

        {/* Billing Downloads */}
        <div style={{ marginBottom:"18px", overflowX:"auto" }}>
          <div style={{ fontSize:"13px", fontWeight:"600", color:"#1a1a2e", marginBottom:"8px" }}>📄 Billing Report (matches Excel format)</div>
          <table style={{ borderCollapse:"collapse", fontSize:"13px", minWidth:"700px" }}>
            <thead>
              <tr>
                <th style={{ padding:"6px 14px 6px 0", textAlign:"left", color:"#777", fontWeight:"600" }}>Period</th>
                <th style={{ padding:"6px 10px", textAlign:"center", color:"#2a9d8f" }}>Client Excel</th>
                <th style={{ padding:"6px 10px", textAlign:"center", color:"#1b7a6b" }}>Company Excel</th>
                <th style={{ padding:"6px 10px", textAlign:"center", color:"#e63946" }}>Client PDF</th>
                <th style={{ padding:"6px 10px", textAlign:"center", color:"#c1121f" }}>Company PDF</th>
                <th style={{ padding:"6px 10px", textAlign:"center", color:"#457b9d" }}>Client CSV</th>
                <th style={{ padding:"6px 10px", textAlign:"center", color:"#2d5f8a" }}>Company CSV</th>
              </tr>
            </thead>
            <tbody>
              {PERIODS.map(p => (
                <tr key={p}>
                  <td style={{ padding:"4px 14px 4px 0", fontWeight:"600", textTransform:"capitalize" }}>{p}</td>
                  <td style={{ padding:"4px 8px", textAlign:"center" }}><button style={dlBtn("#2a9d8f", isManager)} disabled={isManager} onClick={() => download(p,"excel","client")}>⬇ Client</button></td>
                  <td style={{ padding:"4px 8px", textAlign:"center" }}><button style={dlBtn("#1b7a6b", isManager)} disabled={isManager} onClick={() => download(p,"excel","company")}>⬇ Company</button></td>
                  <td style={{ padding:"4px 8px", textAlign:"center" }}><button style={dlBtn("#e63946", false)} onClick={() => download(p,"pdf","client")}>⬇ Client PDF</button></td>
                  <td style={{ padding:"4px 8px", textAlign:"center" }}><button style={dlBtn("#c1121f", false)} onClick={() => download(p,"pdf","company")}>⬇ Company PDF</button></td>
                  <td style={{ padding:"4px 8px", textAlign:"center" }}><button style={dlBtn("#457b9d", isManager)} disabled={isManager} onClick={() => download(p,"csv","client")}>⬇ Client</button></td>
                  <td style={{ padding:"4px 8px", textAlign:"center" }}><button style={dlBtn("#2d5f8a", isManager)} disabled={isManager} onClick={() => download(p,"csv","company")}>⬇ Company</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Diesel Downloads */}
        <div>
          <div style={{ fontSize:"13px", fontWeight:"600", color:"#1a1a2e", marginBottom:"8px" }}>⛽ Diesel Report</div>
          <table style={{ borderCollapse:"collapse", fontSize:"13px" }}>
            <thead>
              <tr>
                <th style={{ padding:"6px 14px 6px 0", textAlign:"left", color:"#777", fontWeight:"600" }}>Period</th>
                <th style={{ padding:"6px 10px", textAlign:"center", color:"#e9a825" }}>Diesel Excel</th>
                <th style={{ padding:"6px 10px", textAlign:"center", color:"#e63946" }}>Diesel PDF</th>
              </tr>
            </thead>
            <tbody>
              {PERIODS.map(p => (
                <tr key={p}>
                  <td style={{ padding:"4px 14px 4px 0", fontWeight:"600", textTransform:"capitalize" }}>{p}</td>
                  <td style={{ padding:"4px 8px", textAlign:"center" }}><button style={dlBtn("#e9a825", isManager)} disabled={isManager} onClick={() => download(p,"excel","diesel")}>⬇ Excel</button></td>
                  <td style={{ padding:"4px 8px", textAlign:"center" }}><button style={dlBtn("#e63946", false)} onClick={() => download(p,"pdf","diesel")}>⬇ PDF</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {message && <p style={{ color:"#888", marginBottom:"12px" }}>{message}</p>}
      {loading  && <p style={{ color:"#555", marginBottom:"12px" }}>Loading report...</p>}

      {/* ── Report Tables ── */}
      {!loading && data.length > 0 && (
        <div style={{ overflowX:"auto" }}>
          <div style={{ marginBottom:"6px", fontWeight:"700", fontSize:"15px", color:"#1a1a2e", textAlign:"center", letterSpacing:"0.5px" }}>
            ELIPHAS SHIPPING SERVICES PRIVATE LIMITED
          </div>
          <div style={{ marginBottom:"12px", fontSize:"13px", color:"#555", textAlign:"center" }}>
            {reportMode === "diesel" ? "⛽ DIESEL" : "📄 BILLING"} — {activeReport.toUpperCase()} REPORT
            {(financialYear || companyLocation) && (
              <span style={{ marginLeft:"10px", color:"#1a1a2e", fontWeight:"600" }}>
                [{financialYear}
                {financialYear && companyLocation && " | "}
                {companyLocation}]
              </span>
            )}
            &nbsp;— {data.length} record(s)
          </div>

          {reportMode === "billing" && (
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"12.5px", border:"1px solid #ccc" }}>
              <thead>
                <tr style={{ background:"#1a1a2e", color:"#fff" }}>
                  {["S. NO","DATE","VEHICLE. NO","COMPANY\nNAME","CARGO","CHALLAN\nNO","FROM","TO","NET\nWEIGHT","COMPANY\nRATE","COMPANY\nFARE","CLIENT\nRATE","CLIENT\nFARE","MARGIN\nRATE","MARGIN\nAMOUNT","REMARKS"].map(h => (
                    <th key={h} style={{ padding:"8px 10px", textAlign: h.includes("RATE")||h.includes("FARE")||h.includes("WEIGHT")||h.includes("NO") ? "right" : "left", whiteSpace:"pre-line", minWidth: h==="S. NO"?"50px":"auto", borderRight:"1px solid #2d2d4e" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {withMargin.map((item, i) => {
                  const co  = Number(item.companyFare || 0);
                  const cl  = Number(item.clientFare  || 0);
                  const mAmt = co - cl;
                  return (
                    <tr key={item._id} style={{ background: i%2===0?"#fff":"#f9f9f9", borderBottom:"1px solid #e0e0e0" }}>
                      <td style={{ padding:"7px 10px", textAlign:"right", borderRight:"1px solid #eee" }}>{i+1}</td>
                      <td style={{ padding:"7px 10px", whiteSpace:"nowrap", borderRight:"1px solid #eee" }}>{formatDate(item.date||item.createdAt)}</td>
                      <td style={{ padding:"7px 10px", fontWeight:"600", borderRight:"1px solid #eee" }}>{item.vehicleNumber}</td>
                      <td style={{ padding:"7px 10px", borderRight:"1px solid #eee" }}>{item.companyName}</td>
                      <td style={{ padding:"7px 10px", borderRight:"1px solid #eee" }}>{item.loadType}</td>
                      <td style={{ padding:"7px 10px", textAlign:"right", borderRight:"1px solid #eee" }}>{item.challanNumber}</td>
                      <td style={{ padding:"7px 10px", borderRight:"1px solid #eee" }}>{item.fromLocation}</td>
                      <td style={{ padding:"7px 10px", borderRight:"1px solid #eee" }}>{item.toLocation}</td>
                      <td style={{ padding:"7px 10px", textAlign:"right", borderRight:"1px solid #eee" }}>{item.unitValue||"-"}</td>
                      <td style={{ padding:"7px 10px", textAlign:"right", borderRight:"1px solid #eee" }}>{item.companyFare ? Number(item.companyFare).toLocaleString("en-IN") : "-"}</td>
                      <td style={{ padding:"7px 10px", textAlign:"right", fontWeight:"600", borderRight:"1px solid #eee" }}>₹{co.toLocaleString("en-IN")}</td>
                      <td style={{ padding:"7px 10px", textAlign:"right", borderRight:"1px solid #eee" }}>{item.clientFare ? Number(item.clientFare).toLocaleString("en-IN") : "-"}</td>
                      <td style={{ padding:"7px 10px", textAlign:"right", fontWeight:"600", borderRight:"1px solid #eee" }}>₹{cl.toLocaleString("en-IN")}</td>
                      <td style={{ padding:"7px 10px", textAlign:"right", borderRight:"1px solid #eee" }}>{item.marginRate||"-"}</td>
                      <td style={{ padding:"7px 10px", textAlign:"right", color: mAmt>=0?"#1b7a6b":"#e63946", fontWeight:"600", borderRight:"1px solid #eee" }}>₹{mAmt.toLocaleString("en-IN")}</td>
                      <td style={{ padding:"7px 10px", color: item.remarks?"#444":"#ccc", fontStyle: item.remarks?"normal":"italic", maxWidth:"140px" }}>{item.remarks||"—"}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background:"#1a1a2e", color:"#fff", fontWeight:"700" }}>
                  <td colSpan={10} style={{ padding:"9px 10px" }}>TOTAL ({data.length} records)</td>
                  <td style={{ padding:"9px 10px", textAlign:"right" }}>₹{grandCompanyFare.toLocaleString("en-IN")}</td>
                  <td></td>
                  <td style={{ padding:"9px 10px", textAlign:"right" }}>₹{grandClientFare.toLocaleString("en-IN")}</td>
                  <td></td>
                  <td style={{ padding:"9px 10px", textAlign:"right", color: grandMargin>=0?"#90ee90":"#ff9999" }}>₹{grandMargin.toLocaleString("en-IN")}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          )}

          {reportMode === "diesel" && (
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"12.5px", border:"1px solid #ccc" }}>
              <thead>
                <tr style={{ background:"#e9a825", color:"#1a1a2e" }}>
                  {["S. NO","DATE","VEHICLE. NO","CLIENT NAME","CHALLAN\nNO","CARGO","DIESEL\nQTY (L)","PRICE /\nLITRE (₹)","TOTAL\nDIESEL (₹)","REMARKS"].map(h => (
                    <th key={h} style={{ padding:"8px 10px", textAlign: h.includes("QTY")||h.includes("LITRE")||h.includes("TOTAL")||h.includes("NO") ? "right" : "left", whiteSpace:"pre-line", minWidth: h==="S. NO"?"50px":"auto", borderRight:"1px solid #c8860a" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((item, i) => {
                  const qty   = Number(item.dieselQuantity      || 0);
                  const price = Number(item.dieselPricePerLitre || 0);
                  const total = qty * price;
                  return (
                    <tr key={item._id} style={{ background: i%2===0?"#fff":"#fffbf0", borderBottom:"1px solid #e0e0e0" }}>
                      <td style={{ padding:"7px 10px", textAlign:"right", borderRight:"1px solid #eee" }}>{i+1}</td>
                      <td style={{ padding:"7px 10px", whiteSpace:"nowrap", borderRight:"1px solid #eee" }}>{formatDate(item.date||item.createdAt)}</td>
                      <td style={{ padding:"7px 10px", fontWeight:"600", borderRight:"1px solid #eee" }}>{item.vehicleNumber}</td>
                      <td style={{ padding:"7px 10px", borderRight:"1px solid #eee" }}>{item.clientName}</td>
                      <td style={{ padding:"7px 10px", textAlign:"right", borderRight:"1px solid #eee" }}>{item.challanNumber}</td>
                      <td style={{ padding:"7px 10px", borderRight:"1px solid #eee" }}>{item.loadType}</td>
                      <td style={{ padding:"7px 10px", textAlign:"right", borderRight:"1px solid #eee" }}>{qty>0?qty:"-"}</td>
                      <td style={{ padding:"7px 10px", textAlign:"right", borderRight:"1px solid #eee" }}>{price>0?`₹${price.toLocaleString("en-IN")}`:"-"}</td>
                      <td style={{ padding:"7px 10px", textAlign:"right", fontWeight:"600", color:"#b45309", borderRight:"1px solid #eee" }}>{total>0?`₹${total.toLocaleString("en-IN")}`:"-"}</td>
                      <td style={{ padding:"7px 10px", color: item.remarks?"#444":"#ccc", fontStyle: item.remarks?"normal":"italic" }}>{item.remarks||"—"}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background:"#e9a825", color:"#1a1a2e", fontWeight:"700" }}>
                  <td colSpan={6} style={{ padding:"9px 10px" }}>TOTAL ({data.length} records)</td>
                  <td style={{ padding:"9px 10px", textAlign:"right" }}>{data.reduce((s,i)=>s+Number(i.dieselQuantity||0),0).toLocaleString("en-IN")} L</td>
                  <td></td>
                  <td style={{ padding:"9px 10px", textAlign:"right" }}>₹{data.reduce((s,i)=>s+Number(i.dieselQuantity||0)*Number(i.dieselPricePerLitre||0),0).toLocaleString("en-IN")}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
