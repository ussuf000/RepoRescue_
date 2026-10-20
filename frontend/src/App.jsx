import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import AppLayout from './components/AppLayout.jsx'
import { api, profileFrom } from './lib/api.js'
import DashboardPage from './pages/DashboardPage.jsx'
import HistoryPage from './pages/HistoryPage.jsx'
import { LoginPage, RegisterPage } from './pages/AuthPages.jsx'

const PROFILE_KEY = 'reporescue.profile'

export default function App() {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem(PROFILE_KEY)) } catch { return null } })
  const navigate = useNavigate()
  useEffect(() => {
    const expire = () => { localStorage.removeItem(PROFILE_KEY); setUser(null); navigate('/login', { replace: true }) }
    window.addEventListener('reporescue:unauthorized', expire)
    return () => window.removeEventListener('reporescue:unauthorized', expire)
  }, [navigate])
  async function authenticate(path, credentials) {
    const data = await api(path, { method: 'POST', body: JSON.stringify(credentials) })
    const next = profileFrom(data.user)
    localStorage.setItem(PROFILE_KEY, JSON.stringify(next)); setUser(next)
  }
  async function logout() {
    try { await api('/logout') } catch { /* Local session state still needs clearing. */ }
    localStorage.removeItem(PROFILE_KEY); setUser(null); navigate('/login', { replace: true })
  }
  return <Routes>
    <Route path="/login" element={<LoginPage user={user} onLogin={values => authenticate('/login', values)} />} />
    <Route path="/register" element={<RegisterPage user={user} onRegister={values => authenticate('/register', values)} />} />
    <Route element={user ? <AppLayout user={user} onLogout={logout}/> : <Navigate to="/login" replace/>}>
      <Route index element={<DashboardPage/>}/>
      <Route path="history" element={<HistoryPage/>}/>
    </Route>
    <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace/>}/>
  </Routes>
}
