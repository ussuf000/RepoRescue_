import { Bookmark, Braces, ChartNoAxesCombined, Clock3, FolderKanban, LogOut, Plus, Settings2, UserRound, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import Brand from './Brand.jsx'

export default function Sidebar({ user, onLogout, open, onClose }) {
  const links = [
    { to: '/', label: 'Dashboard', icon: ChartNoAxesCombined },
    { to: '/analyze', label: 'New Analysis', icon: Plus },
    { to: '/analyzer', label: 'Code Analyzer', icon: Braces },
    { to: '/history', label: 'Analysis history', icon: Clock3 },
    { to: '/projects', label: 'Projects', icon: FolderKanban },
    { to: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
    { to: '/settings', label: 'Settings', icon: Settings2 },
  ]
  return <>
    {open && <button aria-label="Close menu" className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden" onClick={onClose} />}
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col overflow-y-auto border-r border-slate-200 bg-white px-5 py-6 transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center justify-between"><Brand /><button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden" onClick={onClose}><X size={19}/></button></div>
      <div className="mt-11 px-3 text-[11px] font-bold uppercase tracking-[.14em] text-slate-400">Workspace</div>
      <nav className="mt-3 space-y-1">
        {links.map(({ to, label, icon: Icon }) => <NavLink end key={to} to={to} onClick={onClose} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}><Icon size={18}/>{label}</NavLink>)}
      </nav>
      <div className="mt-auto rounded-2xl bg-slate-50 p-4">
        <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">{user?.username?.[0]?.toUpperCase() || 'D'}</span><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{user?.username || 'Developer'}</p><p className="truncate text-xs text-slate-500">{user?.email}</p></div></div>
        <NavLink to="/profile" onClick={onClose} className={({ isActive }) => `mt-4 flex items-center gap-2 text-xs font-medium ${isActive ? 'text-indigo-700' : 'text-slate-500 hover:text-indigo-600'}`}><UserRound size={15}/> Profile</NavLink>
        <button onClick={onLogout} className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-rose-600"><LogOut size={15}/> Sign out</button>
      </div>
    </aside>
  </>
}
