import { ShieldCheck } from 'lucide-react'

export default function Brand({ compact = false }) {
  return <div className="flex items-center gap-3">
    <span className="grid size-10 place-items-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200"><ShieldCheck size={22} /></span>
    {!compact && <span className="text-lg font-bold tracking-tight text-slate-900">Repo<span className="text-indigo-600">Rescue</span></span>}
  </div>
}
