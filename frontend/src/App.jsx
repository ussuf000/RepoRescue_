import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import AppLayout from './components/AppLayout.jsx'
import { api, profileFrom } from './lib/api.js'
import DashboardPage from './pages/DashboardPage.jsx'
import HistoryPage from './pages/HistoryPage.jsx'
import CodeAnalyzerPage from './pages/CodeAnalyzerPage.jsx'
import ProjectsPage from './pages/ProjectsPage.jsx'
import BookmarksPage from './pages/BookmarksPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import NewAnalysisPage from './pages/NewAnalysisPage.jsx'
import { LoginPage, RegisterPage } from './pages/AuthPages.jsx'

const PROFILE_KEY = 'reporescue.profile'
const PREFERENCES_KEY = 'reporescue.preferences'

function loadPreferences() {
  try { return { theme: 'light', language: 'Auto detect', ...JSON.parse(localStorage.getItem(PREFERENCES_KEY) || '{}') } }
  catch { return { theme: 'light', language: 'Auto detect' } }
}

export default function App() {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem(PROFILE_KEY)) } catch { return null } })
  const [preferences, setPreferences] = useState(loadPreferences)
  const navigate = useNavigate()
  useEffect(() => {
    document.documentElement.dataset.theme = preferences.theme
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences))
  }, [preferences])
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
  function updateProfile(nextUser) {
    const next = profileFrom(nextUser)
    localStorage.setItem(PROFILE_KEY, JSON.stringify(next))
    setUser(next)
  }
  return <Routes>
    <Route path="/login" element={<LoginPage user={user} onLogin={values => authenticate('/login', values)} />} />
    <Route path="/register" element={<RegisterPage user={user} onRegister={values => authenticate('/register', values)} />} />
    <Route element={user ? <AppLayout user={user} onLogout={logout} preferences={preferences}/> : <Navigate to="/login" replace/>}>
      <Route index element={<DashboardPage/>}/>
      <Route path="analyze" element={<NewAnalysisPage/>}/>
      <Route path="analyzer" element={<CodeAnalyzerPage preferences={preferences}/>}/>
      <Route path="history" element={<HistoryPage/>}/>
      <Route path="projects" element={<ProjectsPage/>}/>
      <Route path="bookmarks" element={<BookmarksPage/>}/>
      <Route path="settings" element={<SettingsPage preferences={preferences} onPreferencesChange={setPreferences}/>}/>
      <Route path="profile" element={<ProfilePage onUserUpdated={updateProfile}/>}/>
    </Route>
    <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace/>}/>
  </Routes>
}
