import { useCallback, useEffect, useState } from 'react'
import { ArrowRight, BarChart3, Clock3, FolderKanban, LoaderCircle, RefreshCw, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api.js'
import AnalysisRow from '../components/AnalysisRow.jsx'
import AnalysisDetailsDialog from '../components/AnalysisDetailsDialog.jsx'

const cards = [
  { key: 'totalAnalyses', label: 'Total analyses', icon: BarChart3, tone: 'bg-indigo-50 text-indigo-600' },
  { key: 'todayAnalyses', label: 'Created today (UTC)', icon: Clock3, tone: 'bg-emerald-50 text-emerald-600' },
]

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [bookmarkBusy, setBookmarkBusy] = useState('')

  const load = useCallback(async () => {
    setBusy(true)
    setError('')
    try { const data = await api('/api/dashboard/stats'); setStats(data.stats) }
    catch (reason) { setError(reason.message) }
    finally { setBusy(false) }
  }, [])
  useEffect(() => { load() }, [load])

  const maxTrend = Math.max(1, ...(stats?.dailyTrend || []).map(day => day.count))
  const topType = stats?.errorTypes?.[0]
  const closeDetails = useCallback(() => setSelected(null), [])

  async function toggleBookmark(item) {
    setBookmarkBusy(item._id)
    try {
      await api(`/api/bookmarks/${item._id}`, { method: item.isBookmarked ? 'DELETE' : 'POST' })
      await load()
    } catch (reason) { setError(reason.message) }
    finally { setBookmarkBusy('') }
  }

  return <>
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700"><Sparkles size={14}/> Developer overview</div><h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1><p className="mt-2 text-sm text-slate-500">Your debugging activity, at a glance.</p></div>
      <Link to="/analyze" className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700">Analyze an error <ArrowRight size={17}/></Link>
    </div>

    {error && <div role="alert" className="mb-5 flex items-center justify-between gap-3 rounded-xl bg-rose-50 p-4 text-sm text-rose-700"><span>{error}</span><button onClick={load} className="inline-flex shrink-0 items-center gap-1.5 font-semibold"><RefreshCw size={15}/> Retry</button></div>}

    {busy && !stats ? <div className="panel flex items-center justify-center gap-2 p-16 text-sm text-slate-500"><LoaderCircle size={19} className="animate-spin"/> Loading your dashboard…</div> : stats && <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ key, label, icon: Icon, tone }) => <article className="panel p-5" key={key}><div className="flex items-center justify-between"><span className="text-sm font-medium text-slate-500">{label}</span><span className={`grid size-10 place-items-center rounded-xl ${tone}`}><Icon size={19}/></span></div><p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{stats[key] ?? 0}</p></article>)}
        <article className="panel p-5"><div className="flex items-center justify-between"><span className="text-sm font-medium text-slate-500">Most common error</span><span className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-600"><BarChart3 size={19}/></span></div><p className="mt-4 truncate text-lg font-bold text-slate-900" title={topType?._id}>{topType?._id || 'No data yet'}</p><p className="mt-1 text-xs text-slate-400">{topType ? `${topType.count} occurrence${topType.count === 1 ? '' : 's'}` : 'Run an analysis to see trends'}</p></article>
        <Link to="/projects" className="panel group p-5 transition hover:border-indigo-200"><div className="flex items-center justify-between"><span className="text-sm font-medium text-slate-500">Projects</span><span className="grid size-10 place-items-center rounded-xl bg-violet-50 text-violet-600"><FolderKanban size={19}/></span></div><p className="mt-4 text-sm font-semibold text-slate-800 group-hover:text-indigo-700">Organize your work</p><p className="mt-1 text-xs text-slate-400">View your project workspace →</p></Link>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <section className="panel overflow-hidden"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-semibold text-slate-900">Recent analyses</h2><p className="mt-1 text-xs text-slate-400">Your latest debugging sessions</p></div><Link to="/history" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">View history</Link></div>
          {stats.recentAnalyses?.length ? <div className="divide-y divide-slate-100">{stats.recentAnalyses.map(item => <AnalysisRow key={item._id} analysis={item} onOpen={setSelected} onToggleBookmark={toggleBookmark} bookmarkBusy={bookmarkBusy === item._id}/>)}</div> : <div className="px-5 py-12 text-center"><p className="text-sm font-semibold text-slate-700">No analyses yet</p><p className="mt-1 text-xs text-slate-500">Your completed analyses will appear here.</p></div>}
        </section>

        <section className="panel p-5"><div className="mb-5"><h2 className="font-semibold text-slate-900">Error activity</h2><p className="mt-1 text-xs text-slate-400">Daily analyses over the past 7 days (UTC)</p></div>
          <div className="flex h-40 items-end gap-2 border-b border-slate-100 pb-2" role="img" aria-label={`Daily analyses: ${(stats.dailyTrend || []).map(day => `${day.date}, ${day.count}`).join('; ')}`}>
            {(stats.dailyTrend || []).map(day => <div key={day.date} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"><span className="text-[10px] font-semibold text-slate-500">{day.count}</span><div className="w-full max-w-10 rounded-t-lg bg-indigo-500 transition-all" style={{ height: `${Math.max(day.count ? 12 : 4, day.count / maxTrend * 100)}%` }} title={`${day.count} analyses`} /><span className="text-[10px] text-slate-400">{new Date(`${day.date}T00:00:00Z`).toLocaleDateString(undefined, { weekday: 'short', timeZone: 'UTC' })}</span></div>)}
          </div>
          <div className="mt-5"><h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Error type breakdown</h3>{stats.errorTypes?.length ? <div className="space-y-3">{stats.errorTypes.slice(0, 5).map(type => <div key={type._id}><div className="mb-1 flex justify-between gap-3 text-xs"><span className="truncate text-slate-600">{type._id || 'Uncategorized'}</span><span className="font-semibold text-slate-700">{type.count}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-400" style={{ width: `${Math.max(5, type.count / Math.max(1, topType?.count || 1) * 100)}%` }}/></div></div>)}</div> : <p className="text-sm text-slate-400">No error statistics yet.</p>}</div>
        </section>
      </div>
    </>}
    {selected && <AnalysisDetailsDialog analysis={selected} onClose={closeDetails}/>}
  </>
}
