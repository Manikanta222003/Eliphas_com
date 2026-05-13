import { useState } from 'react'
import API from '../api'
import { useNavigate } from 'react-router-dom'

const inputStyle = { width:'100%', padding:'10px 12px', border:'1px solid #ccc', borderRadius:'4px', fontSize:'14px', boxSizing:'border-box' }
const btnPrimary = { width:'100%', padding:'12px', background:'#1a1a2e', color:'#fff', border:'none', borderRadius:'4px', fontSize:'15px', cursor:'pointer', fontWeight:'600', marginTop:'4px' }

function Alert({ msg, type }) {
  if (!msg) return null
  return (
    <div style={{ padding:'10px 14px', borderRadius:'4px', marginBottom:'16px',
      background: type==='success'?'#d4edda': type==='info'?'#d1ecf1':'#f8d7da',
      color:      type==='success'?'#155724': type==='info'?'#0c5460':'#721c24', fontSize:'13px' }}>
      {msg}
    </div>
  )
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [alert,    setAlert]    = useState({ msg:'', type:'' })

  const submitLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setAlert({ msg:'Please enter username and password.', type:'error' }); return
    }
    try {
      setLoading(true); setAlert({ msg:'', type:'' })
      const res = await API.post('/auth/login', { username, password })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user',  JSON.stringify(res.data.user))
      navigate('/dashboard')
    } catch (err) {
      setAlert({ msg: err.response?.data?.message || 'Invalid username or password.', type:'error' })
    } finally { setLoading(false) }
  }

  return (
    <div style={{ fontFamily:'Arial, sans-serif', minHeight:'100vh', background:'#f0f2f5' }}>
      <div style={{ background:'#1a1a2e', padding:'0 32px', height:'56px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:'20px', fontWeight:'700', color:'#fff' }}>ELIPHAS Billing</span>
        <button onClick={() => navigate('/')} style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.3)', color:'#ccc', padding:'5px 14px', borderRadius:'4px', cursor:'pointer', fontSize:'13px' }}>
          ← Back to Website
        </button>
      </div>

      <div style={{ display:'flex', justifyContent:'center', padding:'60px 24px' }}>
        <div style={{ background:'#fff', padding:'40px 44px', borderRadius:'8px', boxShadow:'0 2px 18px rgba(0,0,0,0.10)', width:'400px' }}>
          <h2 style={{ marginTop:0, marginBottom:'4px', color:'#1a1a2e', fontSize:'22px' }}>Staff Login</h2>
          <p style={{ color:'#888', fontSize:'13px', marginTop:0, marginBottom:'26px' }}>Admin, Manager & User access</p>
          <Alert msg={alert.msg} type={alert.type} />
          <div style={{ marginBottom:'16px' }}>
            <label style={{ display:'block', marginBottom:'5px', fontWeight:'600', fontSize:'13px' }}>Username</label>
            <input style={inputStyle} placeholder="Enter username" value={username}
              onChange={(e) => setUsername(e.target.value)} onKeyDown={(e) => e.key==='Enter' && submitLogin()} />
          </div>
          <div style={{ marginBottom:'24px' }}>
            <label style={{ display:'block', marginBottom:'5px', fontWeight:'600', fontSize:'13px' }}>Password</label>
            <input style={inputStyle} type="password" placeholder="Enter password" value={password}
              onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key==='Enter' && submitLogin()} />
          </div>
          <button onClick={submitLogin} disabled={loading} style={{ ...btnPrimary, opacity: loading?0.7:1 }}>
            {loading ? 'Logging in...' : 'Login →'}
          </button>
        </div>
      </div>
    </div>
  )
}
 
