import { useEffect, useState } from 'react'
import { AlertCircle, LoaderCircle, Save, UserRound } from 'lucide-react'
import { api } from '../lib/api.js'

export default function ProfilePage({ onUserUpdated }) {
  const [profile, setProfile] = useState({ username: '', email: '', createdAt: '' })
  const [busy, setBusy] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    api('/api/profile').then(data => { if (active) setProfile({ username: data.user.username || '', email: data.user.email || '', createdAt: data.user.createdAt || '' }) })
      .catch(reason => { if (active) setError(reason.message) })
      .finally(() => { if (active) setBusy(false) })
    return () => { active = false }
  }, [])

  async function submit(event) {
    event.preventDefault(); setSaving(true); setError(''); setMessage('')
    try {
      const data = await api('/api/profile', { method: 'PATCH', body: JSON.stringify({ username: profile.username, email: profile.email }) })
      setProfile(current => ({ ...current, username: data.user.username, email: data.user.email, createdAt: data.user.createdAt || current.createdAt }))
      onUserUpdated(data.user)
      setMessage('Profile updated.')
    } catch (reason) { setError(reason.message) }
    finally { setSaving(false) }
  }

  return <>
    <div className="mb-7"><div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600"><UserRound size={15}/> Account</div><h1 className="text-3xl font-bold tracking-tight text-slate-900">Profile</h1><p className="mt-2 text-sm text-slate-500">Manage your account information.</p></div>
    {error && <p role="alert" className="mb-4 flex gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700"><AlertCircle size={17}/>{error}</p>}
    {busy ? <div className="panel flex items-center justify-center gap-2 p-14 text-sm text-slate-500"><LoaderCircle size={18} className="animate-spin"/> Loading account…</div> : <form onSubmit={submit} className="panel max-w-2xl space-y-5 p-5 sm:p-6"><label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Name</span><input required minLength={2} maxLength={80} value={profile.username} onChange={event => setProfile({ ...profile, username: event.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"/></label><label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Email address</span><input required type="email" maxLength={254} value={profile.email} onChange={event => setProfile({ ...profile, email: event.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"/></label>{profile.createdAt && <p className="text-xs text-slate-400">Member since {new Date(profile.createdAt).toLocaleDateString()}</p>}{message && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}<button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">{saving ? <LoaderCircle size={17} className="animate-spin"/> : <Save size={17}/>} Save profile</button></form>}
  </>
}
