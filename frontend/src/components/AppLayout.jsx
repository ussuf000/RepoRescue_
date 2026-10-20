import { Menu, ShieldCheck } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import Sidebar from './Sidebar.jsx'

export default function AppLayout({ user, onLogout }) {
  const [open, setOpen] = useState(false)
  return <div className="min-h-screen bg-[#f6f8fc]">
    <Sidebar user={user} onLogout={onLogout} open={open} onClose={() => setOpen(false)} />
    <main className="min-h-screen lg:pl-[260px]">
      <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-5 backdrop-blur md:px-9">
        <div className="flex items-center gap-3"><button aria-label="Open menu" className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" onClick={() => setOpen(true)}><Menu size={20}/></button><div><p className="text-sm font-semibold text-slate-800">Developer workspace</p><p className="hidden text-xs text-slate-400 sm:block">Your personal debugging companion</p></div></div>
        <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700"><span className="size-1.5 rounded-full bg-emerald-500"/> AI ready</div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-8 md:px-9 md:py-10"><Outlet /></div>
      <footer className="px-5 pb-7 text-center text-xs text-slate-400 lg:pl-[260px]">RepoRescue · Clearer errors, faster fixes</footer>
    </main>
  </div>
}
