import { useState } from "react";
import API from "../api";
import "./ReportsPage.css";

const PERIODS = ["daily", "weekly", "monthly", "yearly", "custom"];

const START_YEAR = 2000;
const END_YEAR   = 2050;
const FINANCIAL_YEARS = Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, i) => {
  const y = START_YEAR + i;
  return `${y}-${String(y + 1).slice(-2)}`;
}).reverse();

const LOCATIONS = ["Hyderabad", "Mumbai", "Delhi", "Chennai", "Bangalore", "Kolkata", "Pune", "Ahmedabad"];

export default function ReportsPage({ user }) {
  const isManager = user?.role === "manager";

  const [data,            setData]            = useState([]);
  const [message,         setMessage]         = useState("");
  const [activeReport,    setActiveReport]    = useState("");
  const [loading,         setLoading]         = useState(false);
  const [customFrom,      setCustomFrom]      = useState("");
  const [customTo,        setCustomTo]        = useState("");
  const [financialYear,   setFinancialYear]   = useState("");
  const [companyLocation, setCompanyLocation] = useState("");

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

  const loadReport = async (type) => {
    if (type === "custom" && (!customFrom || !customTo)) {
      setMessage("Please select both From and To dates."); return;
    }
    try {
      setLoading(true); setActiveReport(type); setMessage(""); setData([]);
      const res = await API.get(getUrl(type));
      const result = res.data?.data || [];
      setData(result);
      if (result.length === 0) setMessage("No records found for this period.");
    } catch (err) {
      setMessage("Failed to load report.");
    } finally { setLoading(false); }
  };

  const download = async (type, format, fareType = "") => {
    if (type === "custom" && (!customFrom || !customTo)) {
      setMessage("Please select From and To dates."); return;
    }
    try {
      setMessage("");
      let suffix;
      if (fareType === "diesel") {
        suffix = `-diesel-${format}`;
      } else if (fareType === "client" || fareType === "company") {
        suffix = `-${fareType}-${format}`;
      } else {
        suffix = `-${format}`;
      }

      const url = getUrl(type, suffix);
      const mimeMap = {
        excel: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        pdf:   "application/pdf",
        csv:   "text/csv"
      };
      const extMap = { excel:"xlsx", pdf:"pdf", csv:"csv" };

      const response = await API.get(url, { responseType:"blob" });
      const blob     = new Blob([response.data], { type: mimeMap[format] });
      const link     = document.createElement("a");
      link.href      = window.URL.createObjectURL(blob);
      const locSuffix = companyLocation ? `_${companyLocation.replace(/\s+/g,"_")}` : "";
      link.download  = `${fareType||"billing"}${locSuffix}_${type}_report.${extMap[format]}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);
    } catch (err) {
      setMessage(`Download failed. ${err.response?.data?.message || ""}`);
    }
  };

  const grandCompanyFare = data.reduce((s, i) => s + Number(i.companyFare || 0), 0);
  const grandClientFare  = data.reduce((s, i) => s + Number(i.clientFare  || 0), 0);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "";

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

  const inputStyle = { padding:"7px 10px", border:"1px solid #ccc", borderRadius:"4px", fontSize:"13px", width:"100%" };

  return (
    <div style={{ background:"#fff", borderRadius:"8px", padding:"28px", boxShadow:"0 1px 6px rgba(0,0,0,0.08)" }}>
      <h2 style={{ marginTop:0, marginBottom:"24px", color:"#1a1a2e" }}>Billing Reports</h2>

      {/* Location Filter */}
      <div style={{ background:"#f0f4ff", border:"1px solid #c5d0f5", borderRadius:"8px", padding:"16px 20px", marginBottom:"20px" }}>
        <div style={{ fontSize:"13px", fontWeight:"700", color:"#1a1a2e", marginBottom:"10px" }}>
          📍 Filter by Financial Year & Location <span style={{ fontWeight:"400", color:"#666" }}>(optional — narrows all downloads to selected location)</span>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px 20px" }}>
          <div>
            <label style={{ display:"block", marginBottom:"4px", fontWeight:"600", fontSize:"13px" }}>Financial Year</label>
            <select style={inputStyle} value={financialYear} onChange={e => setFinancialYear(e.target.value)}>
              <option value="">-- All Years --</option>
              {FINANCIAL_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display:"block", marginBottom:"4px", fontWeight:"600", fontSize:"13px" }}>Company Location</label>
            <input list="location-suggestions" style={inputStyle} placeholder="Type or select location..."
              value={companyLocation} onChange={e => setCompanyLocation(e.target.value)} />
            <datalist id="location-suggestions">
              {LOCATIONS.map(l => <option key={l} value={l} />)}
            </datalist>
          </div>
        </div>
      </div>

      {/* View Period Buttons */}
      <div style={{ marginBottom:"8px" }}>
        <span style={{ fontWeight:"600", fontSize:"13px", color:"#555", marginRight:"12px" }}>View Report:</span>
        {PERIODS.map(p => (
          <button key={p} style={btnStyle(p)} onClick={() => loadReport(p)}>
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Custom Date Range */}
      <div style={{ display:"flex", alignItems:"center", gap:"12px", padding:"12px 16px", background:"#f5f6fa", borderRadius:"4px", marginBottom:"24px", flexWrap:"wrap" }}>
        <label style={{ fontWeight:"600", fontSize:"13px" }}>Custom Range:</label>
        <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
          style={{ padding:"7px 10px", border:"1px solid #ccc", borderRadius:"4px", fontSize:"13px" }} />
        <span style={{ color:"#777" }}>to</span>
        <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
          style={{ padding:"7px 10px", border:"1px solid #ccc", borderRadius:"4px", fontSize:"13px" }} />
      </div>

      {/* Download Section */}
      <div style={{ marginBottom:"28px" }}>
        <span style={{ fontWeight:"600", fontSize:"13px", color:"#555", display:"block", marginBottom:"12px" }}>
          Download Reports:
          {isManager && <span style={{ marginLeft:"10px", fontSize:"12px", color:"#e63946", fontWeight:"400" }}>⚠ Manager: PDF only</span>}
        </span>

        {/* Billing Downloads */}
        <div style={{ marginBottom:"16px", overflowX:"auto" }}>
          <div style={{ fontSize:"13px", fontWeight:"600", color:"#1a1a2e", marginBottom:"8px" }}>📄 Billing Report</div>
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
                  <td style={{ padding:"4px 8px", textAlign:"center" }}>
                    <button style={dlBtn("#2a9d8f", isManager)} disabled={isManager} onClick={() => download(p, "excel", "client")}>⬇ Client</button>
                  </td>
                  <td style={{ padding:"4px 8px", textAlign:"center" }}>
                    <button style={dlBtn("#1b7a6b", isManager)} disabled={isManager} onClick={() => download(p, "excel", "company")}>⬇ Company</button>
                  </td>
                  <td style={{ padding:"4px 8px", textAlign:"center" }}>
                    <button style={dlBtn("#e63946", false)} onClick={() => download(p, "pdf", "client")}>⬇ Client PDF</button>
                  </td>
                  <td style={{ padding:"4px 8px", textAlign:"center" }}>
                    <button style={dlBtn("#c1121f", false)} onClick={() => download(p, "pdf", "company")}>⬇ Company PDF</button>
                  </td>
                  <td style={{ padding:"4px 8px", textAlign:"center" }}>
                    <button style={dlBtn("#457b9d", isManager)} disabled={isManager} onClick={() => download(p, "csv", "client")}>⬇ Client</button>
                  </td>
                  <td style={{ padding:"4px 8px", textAlign:"center" }}>
                    <button style={dlBtn("#2d5f8a", isManager)} disabled={isManager} onClick={() => download(p, "csv", "company")}>⬇ Company</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Diesel Downloads */}
        <div>
          <div style={{ fontSize:"13px", fontWeight:"600", color:"#1a1a2e", marginBottom:"8px" }}>⛽ Diesel Report (per vehicle per day)</div>
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
                  <td style={{ padding:"4px 8px", textAlign:"center" }}>
                    <button style={dlBtn("#e9a825", isManager)} disabled={isManager} onClick={() => download(p, "excel", "diesel")}>⬇ Excel</button>
                  </td>
                  <td style={{ padding:"4px 8px", textAlign:"center" }}>
                    <button style={dlBtn("#e63946", false)} onClick={() => download(p, "pdf", "diesel")}>⬇ PDF</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {message && <p style={{ color:"#888", marginBottom:"12px" }}>{message}</p>}
      {loading && <p style={{ color:"#555", marginBottom:"12px" }}>Loading report...</p>}

      {!loading && data.length > 0 && (
        <div style={{ overflowX:"auto" }}>
          <p style={{ fontSize:"13px", color:"#555", marginBottom:"8px" }}>
            {data.length} record(s) — {activeReport.toUpperCase()} REPORT
            {(financialYear || companyLocation) && (
              <span style={{ marginLeft:"10px", color:"#1a1a2e", fontWeight:"600" }}>
                [{financialYear && financialYear}{financialYear && companyLocation && " | "}{companyLocation && companyLocation}]
              </span>
            )}
          </p>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"13px" }}>
            <thead>
              <tr style={{ background:"#1a1a2e", color:"#fff" }}>
                {["Client","Company","Vehicle","Challan","From","To","Basis","Co. Fare (₹)","Cl. Fare (₹)","Date"].map(h => (
                  <th key={h} style={{ padding:"10px 12px", textAlign: h.includes("Fare") ? "right" : "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item, i) => (
                <tr key={item._id} style={{ background: i%2===0?"#fff":"#f9f9f9", borderBottom:"1px solid #eee" }}>
                  <td style={{ padding:"9px 12px" }}>{item.clientName}</td>
                  <td style={{ padding:"9px 12px" }}>{item.companyName}</td>
                  <td style={{ padding:"9px 12px" }}>{item.vehicleNumber}</td>
                  <td style={{ padding:"9px 12px" }}>{item.challanNumber}</td>
                  <td style={{ padding:"9px 12px" }}>{item.fromLocation}</td>
                  <td style={{ padding:"9px 12px" }}>{item.toLocation}</td>
                  <td style={{ padding:"9px 12px" }}>{item.billingBasis}</td>
                  <td style={{ padding:"9px 12px", textAlign:"right" }}>₹{Number(item.companyFare||0).toLocaleString("en-IN")}</td>
                  <td style={{ padding:"9px 12px", textAlign:"right" }}>₹{Number(item.clientFare||0).toLocaleString("en-IN")}</td>
                  <td style={{ padding:"9px 12px" }}>{formatDate(item.date||item.createdAt)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background:"#1a1a2e", color:"#fff", fontWeight:"700" }}>
                <td colSpan={7} style={{ padding:"10px 12px" }}>GRAND TOTAL ({data.length} records)</td>
                <td style={{ padding:"10px 12px", textAlign:"right" }}>₹{grandCompanyFare.toLocaleString("en-IN")}</td>
                <td style={{ padding:"10px 12px", textAlign:"right" }}>₹{grandClientFare.toLocaleString("en-IN")}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}