import { useState, useEffect } from "react";
import API from "../api";

const inputStyle = { width:"100%", padding:"9px 12px", border:"1px solid #ccc", borderRadius:"4px", fontSize:"14px", boxSizing:"border-box" };

const ROLE_BADGE = { admin:"#e63946", manager:"#f4a261", user:"#2a9d8f" };

export default function UserManagement() {
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [users,   setUsers]   = useState([]);
  const [message, setMessage] = useState({ text:"", type:"" });
  const [loading, setLoading] = useState(false);

  // Create flow
  const [step, setStep] = useState("form");
  const [form, setForm] = useState({ username:"", password:"", role:"manager", email:"" });
  const [pendingUsername, setPendingUsername] = useState("");
  const [otp, setOtp] = useState("");

  // Edit flow
  const [editingUser, setEditingUser]   = useState(null); // user object being edited
  const [editForm,    setEditForm]      = useState({ username:"", email:"", role:"", password:"" });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try { const res = await API.get("/auth/users"); setUsers(res.data); }
    catch (e) { console.error(e); }
  };

  const msg = (text, type="error") => setMessage({ text, type });

  // ── CREATE: Step A ──
  const initiateCreate = async () => {
    if (!form.username || !form.password || !form.email) { msg("Username, password and email required."); return; }
    try {
      setLoading(true); setMessage({ text:"", type:"" });
      const res = await API.post("/auth/users/initiate", form);
      setPendingUsername(form.username); setStep("otp"); setOtp("");
      msg(`OTP sent to ${res.data.email}. Enter it below.`, "info");
    } catch (err) {
      msg(err.response?.data?.message || "Failed to send OTP.");
    } finally { setLoading(false); }
  };

  // ── CREATE: Step B ──
  const confirmCreate = async () => {
    if (!otp.trim() || otp.trim().length < 6) { msg("Please enter the 6-digit OTP."); return; }
    try {
      setLoading(true); setMessage({ text:"", type:"" });
      await API.post("/auth/users/confirm", { username: pendingUsername, otp: otp.trim() });
      msg(`User "${pendingUsername}" created successfully.`, "success");
      setForm({ username:"", password:"", role:"manager", email:"" });
      setOtp(""); setStep("form"); fetchUsers();
    } catch (err) {
      msg(err.response?.data?.message || "OTP verification failed.");
    } finally { setLoading(false); }
  };

  // ── DELETE ──
  const deleteUser = async (id, username) => {
    if (!window.confirm(`Delete user "${username}"? This cannot be undone.`)) return;
    try {
      const res = await API.delete(`/auth/users/${id}`);
      msg(res.data.message, "success"); fetchUsers();
    } catch (err) { msg(err.response?.data?.message || "Delete failed."); }
  };

  // ── EDIT ──
  const openEdit = (u) => {
    setEditingUser(u);
    setEditForm({ username: u.username, email: u.email || "", role: u.role, password:"" });
    setMessage({ text:"", type:"" });
  };

  const saveEdit = async () => {
    try {
      setLoading(true); setMessage({ text:"", type:"" });
      const payload = { username: editForm.username, email: editForm.email, role: editForm.role };
      if (editForm.password.trim()) payload.password = editForm.password;
      const res = await API.put(`/auth/users/${editingUser._id}`, payload);
      msg(res.data.message || "User updated.", "success");
      setEditingUser(null); fetchUsers();
    } catch (err) {
      msg(err.response?.data?.message || "Update failed.");
    } finally { setLoading(false); }
  };

  const msgBox = (m) => m.text ? (
    <div style={{ padding:"10px 14px", borderRadius:"4px", marginBottom:"14px", fontSize:"13px",
      background: m.type==="success"?"#d4edda": m.type==="info"?"#d1ecf1":"#f8d7da",
      color: m.type==="success"?"#155724": m.type==="info"?"#0c5460":"#721c24" }}>
      {m.text}
    </div>
  ) : null;

  return (
    <div style={{ background:"#fff", borderRadius:"8px", padding:"28px", boxShadow:"0 1px 6px rgba(0,0,0,0.08)" }}>
      <h2 style={{ marginTop:0, marginBottom:"24px", color:"#1a1a2e" }}>User Management</h2>

      {/* CREATE FORM */}
      <div style={{ background:"#f5f6fa", borderRadius:"6px", padding:"20px", marginBottom:"28px" }}>
        <h3 style={{ marginTop:0, marginBottom:"16px", fontSize:"15px" }}>
          {step==="form" ? "Create New User" : "Verify OTP"}
        </h3>
        {msgBox(message)}

        {step==="form" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr auto", gap:"12px", alignItems:"end" }}>
            {[
              { label:"Username",            key:"username", type:"text",     placeholder:"Username" },
              { label:"Password",            key:"password", type:"password", placeholder:"Password" },
              { label:"Email (OTP sent here)", key:"email",  type:"email",    placeholder:"user@email.com" },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display:"block", marginBottom:"5px", fontWeight:"600", fontSize:"13px" }}>{f.label}</label>
                <input style={inputStyle} type={f.type} placeholder={f.placeholder}
                  value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
              </div>
            ))}
            <div>
              <label style={{ display:"block", marginBottom:"5px", fontWeight:"600", fontSize:"13px" }}>Role</label>
              <select style={inputStyle} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="manager">Manager</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button onClick={initiateCreate} disabled={loading} style={{ padding:"9px 20px", background:"#1a1a2e", color:"#fff", border:"none", borderRadius:"4px", cursor:"pointer", fontWeight:"600", fontSize:"14px", whiteSpace:"nowrap" }}>
              {loading ? "Sending OTP..." : "Send OTP →"}
            </button>
          </div>
        )}

        {step==="otp" && (
          <div style={{ display:"flex", gap:"12px", alignItems:"end", maxWidth:"420px" }}>
            <div style={{ flex:1 }}>
              <label style={{ display:"block", marginBottom:"5px", fontWeight:"600", fontSize:"13px" }}>Enter 6-digit OTP</label>
              <input style={inputStyle} placeholder="Enter OTP" value={otp} maxLength={6}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ""))} />
            </div>
            <button onClick={confirmCreate} disabled={loading} style={{ padding:"9px 20px", background:"#2e7d32", color:"#fff", border:"none", borderRadius:"4px", cursor:"pointer", fontWeight:"600" }}>
              {loading ? "Verifying..." : "Confirm ✓"}
            </button>
            <button onClick={() => { setStep("form"); setOtp(""); setMessage({ text:"", type:"" }); }}
              style={{ padding:"9px 16px", background:"transparent", color:"#888", border:"1px solid #ccc", borderRadius:"4px", cursor:"pointer" }}>
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {editingUser && (
        <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.4)", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:"#fff", borderRadius:"8px", padding:"28px", width:"460px", boxShadow:"0 4px 24px rgba(0,0,0,0.2)" }}>
            <h3 style={{ marginTop:0, marginBottom:"18px", color:"#1a1a2e" }}>Edit User: {editingUser.username}</h3>
            {msgBox(message)}
            {[
              { label:"Username", key:"username", type:"text" },
              { label:"Email",    key:"email",    type:"email" },
              { label:"New Password (leave blank to keep)", key:"password", type:"password" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom:"14px" }}>
                <label style={{ display:"block", marginBottom:"5px", fontWeight:"600", fontSize:"13px" }}>{f.label}</label>
                <input style={inputStyle} type={f.type} value={editForm[f.key]}
                  onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })} />
              </div>
            ))}
            <div style={{ marginBottom:"18px" }}>
              <label style={{ display:"block", marginBottom:"5px", fontWeight:"600", fontSize:"13px" }}>Role</label>
              <select style={inputStyle} value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })}>
                <option value="manager">Manager</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div style={{ display:"flex", gap:"10px" }}>
              <button onClick={saveEdit} disabled={loading} style={{ padding:"10px 24px", background:"#1a1a2e", color:"#fff", border:"none", borderRadius:"4px", cursor:"pointer", fontWeight:"600" }}>
                {loading ? "Saving..." : "Save Changes"}
              </button>
              <button onClick={() => { setEditingUser(null); setMessage({ text:"", type:"" }); }}
                style={{ padding:"10px 18px", background:"transparent", color:"#555", border:"1px solid #ccc", borderRadius:"4px", cursor:"pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* USERS TABLE */}
      <h3 style={{ marginBottom:"12px", fontSize:"15px", color:"#333" }}>All Users ({users.length})</h3>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"14px" }}>
        <thead>
          <tr style={{ background:"#1a1a2e", color:"#fff" }}>
            {["#","Username","Email","Role","Status","Actions"].map(h => (
              <th key={h} style={{ padding:"10px 14px", textAlign:"left" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => {
            const isSelf = u.username === currentUser.username;
            const canDel = !isSelf && u.role !== "admin";
            return (
              <tr key={u._id} style={{ borderBottom:"1px solid #eee", background: i%2===0?"#fff":"#f9f9f9" }}>
                <td style={{ padding:"10px 14px", color:"#aaa" }}>{i+1}</td>
                <td style={{ padding:"10px 14px", fontWeight:"600" }}>
                  {u.username} {isSelf && <span style={{ fontSize:"11px", color:"#888" }}>(you)</span>}
                </td>
                <td style={{ padding:"10px 14px", color:"#555" }}>{u.email || "—"}</td>
                <td style={{ padding:"10px 14px" }}>
                  <span style={{ padding:"3px 10px", borderRadius:"12px", fontSize:"12px", fontWeight:"600", background: ROLE_BADGE[u.role]+"22", color: ROLE_BADGE[u.role] }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding:"10px 14px" }}>
                  <span style={{ padding:"3px 10px", borderRadius:"12px", fontSize:"12px", fontWeight:"600", background: u.isVerified?"#e8f5e9":"#fff8e1", color: u.isVerified?"#2e7d32":"#f57f17" }}>
                    {u.isVerified ? "Verified" : "Pending"}
                  </span>
                </td>
                <td style={{ padding:"10px 14px", display:"flex", gap:"6px" }}>
                  <button onClick={() => openEdit(u)} style={{ padding:"5px 12px", background:"#1a73e8", color:"#fff", border:"none", borderRadius:"4px", cursor:"pointer", fontSize:"12px" }}>
                    Edit
                  </button>
                  {canDel ? (
                    <button onClick={() => deleteUser(u._id, u.username)} style={{ padding:"5px 12px", background:"#e63946", color:"#fff", border:"none", borderRadius:"4px", cursor:"pointer", fontSize:"12px" }}>
                      Delete
                    </button>
                  ) : (
                    <span style={{ color:"#ccc", fontSize:"12px", padding:"5px 4px" }}>—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
 
