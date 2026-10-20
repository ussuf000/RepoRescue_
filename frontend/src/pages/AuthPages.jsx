import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ArrowRight, LoaderCircle, ShieldCheck } from 'lucide-react'
import Brand from '../components/Brand.jsx'

function AuthShell({ title, subtitle, children, footer }) {
  return <main className="flex min-h-screen bg-white">
    <section className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
      <div className="w-full max-w-[420px]"><div className="mb-10"><Brand /></div><h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1><p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p>{children}<p className="mt-8 text-center text-sm text-slate-500">{footer}</p></div>
    </section>
    <aside className="relative hidden overflow-hidden bg-[#10152d] px-14 py-16 text-white lg:flex lg:w-1/2 lg:flex-col lg:justify-between">
      <div className="absolute -right-24 -top-24 size-[460px] rounded-full border border-white/10"/><div className="absolute -right-8 -top-8 size-[330px] rounded-full border border-white/10"/><div className="absolute -bottom-40 -left-28 size-[430px] rounded-full bg-indigo-600/20 blur-3xl"/>
      <div className="relative"><div className="mb-8 grid size-12 place-items-center rounded-2xl bg-indigo-500"><ShieldCheck size={25}/></div><p className="text-sm font-semibold uppercase tracking-[.2em] text-indigo-300">Debug with clarity</p><h2 className="mt-5 max-w-md text-4xl font-bold leading-tight">Turn confusing errors into your next fix.</h2><p className="mt-5 max-w-md leading-7 text-slate-300">Get a clear explanation of what broke, why it happened, and how to move forward.</p></div>
      <div className="relative rounded-2xl border border-white/10 bg-white/[.06] p-5"><p className="font-mono text-xs leading-6 text-slate-300">TypeError: Cannot read properties of undefined<br/><span className="text-emerald-300">→</span> Understand the source. Find a practical fix.</p></div>
    </aside>
  </main>
}

function Field({ label, ...props }) {
  return <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">{label}</span><input {...props} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" /></label>
}

export function LoginPage({ user, onLogin }) {
  const navigate = useNavigate(); const [form, setForm] = useState({ email: '', password: '' }); const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  if (user) return <Navigate to="/" replace />
  async function submit(event) { event.preventDefault(); setError(''); setBusy(true); try { await onLogin(form); navigate('/') } catch (e) { setError(e.message) } finally { setBusy(false) } }
  return <AuthShell title="Welcome back" subtitle="Sign in to continue to your workspace." footer={<>New to RepoRescue? <Link className="font-semibold text-indigo-600 hover:text-indigo-700" to="/register">Create an account</Link></>}>
    <form onSubmit={submit} className="mt-8 space-y-5"><Field label="Email address" type="email" autoComplete="email" placeholder="you@example.com" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}/><Field label="Password" type="password" autoComplete="current-password" placeholder="Enter your password" required minLength={6} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}/>{error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}<button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-60">{busy ? <LoaderCircle className="animate-spin" size={18}/> : <>Sign in <ArrowRight size={17}/></>}</button></form>
  </AuthShell>
}

export function RegisterPage({ user, onRegister }) {
  const navigate = useNavigate(); const [form, setForm] = useState({ username: '', email: '', password: '' }); const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  if (user) return <Navigate to="/" replace />
  async function submit(event) { event.preventDefault(); setError(''); setBusy(true); try { await onRegister(form); navigate('/') } catch (e) { setError(e.message) } finally { setBusy(false) } }
  return <AuthShell title="Create your account" subtitle="Set up your workspace and start solving errors." footer={<>Already have an account? <Link className="font-semibold text-indigo-600 hover:text-indigo-700" to="/login">Sign in</Link></>}>
    <form onSubmit={submit} className="mt-8 space-y-5"><Field label="Your name" type="text" autoComplete="name" placeholder="Alex Morgan" required minLength={2} value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}/><Field label="Email address" type="email" autoComplete="email" placeholder="you@example.com" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}/><Field label="Password" type="password" autoComplete="new-password" placeholder="At least 6 characters" required minLength={6} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}/>{error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}<button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-60">{busy ? <LoaderCircle className="animate-spin" size={18}/> : <>Create account <ArrowRight size={17}/></>}</button><p className="text-center text-xs leading-5 text-slate-400">Your account is protected by secure cookie-based authentication.</p></form>
  </AuthShell>
}
