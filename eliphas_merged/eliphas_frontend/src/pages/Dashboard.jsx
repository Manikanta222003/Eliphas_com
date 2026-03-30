import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BillingForm    from './BillingForm'
import SearchPage     from './SearchPage'
import ReportsPage    from './ReportsPage'
import UserManagement from './UserManagement'

const TAB_STYLES = (active) => ({
  padding:'12px 24px', marginRight:'4px', border:'none',
  borderBottom: active ? '3px solid #fff' : '3px solid transparent',
  background:'transparent', fontWeight: active?'700':'400',
  fontSize:'14px', cursor:'pointer', color: active?'#fff':'#aaa'
})

const ROLE_COLORS = { admin:'#e63946', manager:'#f4a261', user:'#2a9d8f' }

export default function Dashboard() {
  const navigate = useNavigate()
  const user     = JSON.parse(localStorage.getItem('user') || '{}')
  const role     = user.role || 'user'
  const isAdmin   = role === 'admin'
  const isManager = role === 'manager'
  const isUser    = role === 'user'

  // Default tab: user role lands on search (view only)
  const [tab, setTab] = useState(isUser ? 'search' : 'billing')

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div style={{ fontFamily:'Arial, sans-serif', minHeight:'100vh', background:'#f5f6fa' }}>
      <div style={{ background:'#1a1a2e' }}>
        <div style={{ padding:'0 24px', display:'flex', alignItems:'center', justifyContent:'space-between', height:'52px', borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
          <span style={{ fontSize:'18px', fontWeight:'700', color:'#fff' }}>ELIPHAS Billing</span>
          <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
            <span style={{ fontSize:'13px', color:'#ccc' }}>
              {user.username}&nbsp;
              <span style={{ background: ROLE_COLORS[role]||'#555', padding:'2px 8px', borderRadius:'10px', fontSize:'11px', fontWeight:'700', color:'#fff' }}>
                {role?.toUpperCase()}
              </span>
            </span>
            <button onClick={logout} style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.4)', color:'#ccc', padding:'5px 14px', borderRadius:'4px', cursor:'pointer', fontSize:'13px' }}>
              Logout
            </button>
          </div>
        </div>
        <div style={{ padding:'0 20px', display:'flex' }}>
          {/* Billing tab — admin & manager only */}
          {!isUser && <button style={TAB_STYLES(tab==='billing')}  onClick={() => setTab('billing')}>Add Billing</button>}
          {/* Search tab — all roles */}
          <button style={TAB_STYLES(tab==='search')}   onClick={() => setTab('search')}>Search</button>
          {/* Reports — admin & manager get full reports; user gets view only (handled inside ReportsPage) */}
          {!isUser && <button style={TAB_STYLES(tab==='reports')}  onClick={() => setTab('reports')}>Reports</button>}
          {/* Users — admin only */}
          {isAdmin && <button style={TAB_STYLES(tab==='users')} onClick={() => setTab('users')}>Users</button>}
        </div>
      </div>
      <div style={{ padding:'24px' }}>
        {tab==='billing'  && !isUser && <BillingForm />}
        {tab==='search'   && <SearchPage />}
        {tab==='reports'  && !isUser && <ReportsPage user={user} />}
        {tab==='users'    && isAdmin && <UserManagement />}
      </div>
    </div>
  )
}
