import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, BookmarkCheck, LoaderCircle, RefreshCw } from 'lucide-react'
import { api } from '../lib/api.js'
import AnalysisRow from '../components/AnalysisRow.jsx'
import AnalysisDetailsDialog from '../components/AnalysisDetailsDialog.jsx'

export default function BookmarksPage() {
  const [items, setItems] = useState([])
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [bookmarkBusy, setBookmarkBusy] = useState('')
  const closeDetails = useCallback(() => setSelected(null), [])

  const load = useCallback(async () => {
    setBusy(true); setError('')
    try { const data = await api('/api/bookmarks'); setItems(data.analyses || []) }
    catch (reason) { setError(reason.message) }
    finally { setBusy(false) }
  }, [])
  useEffect(() => { load() }, [load])

  async function unbookmark(item) {
    setBookmarkBusy(item._id); setError('')
    try { await api(`/api/bookmarks/${item._id}`, { method: 'DELETE' }); setItems(current => current.filter(entry => entry._id !== item._id)) }
    catch (reason) { setError(reason.message) }
    finally { setBookmarkBusy('') }
  }

  return <>
    <div className="mb-7"><div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600"><BookmarkCheck size={15}/> Saved work</div><h1 className="text-3xl font-bold tracking-tight text-slate-900">Bookmarks</h1><p className="mt-2 text-sm text-slate-500">Keep useful analyses close at hand.</p></div>
    {error && <div role="alert" className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-rose-50 p-4 text-sm text-rose-700"><span className="flex items-center gap-2"><AlertCircle size={17}/>{error}</span><button onClick={load} className="inline-flex items-center gap-1 font-semibold"><RefreshCw size={14}/> Retry</button></div>}
    <section className="panel overflow-hidden">{busy ? <div className="flex items-center justify-center gap-2 p-14 text-sm text-slate-500"><LoaderCircle size={18} className="animate-spin"/> Loading bookmarks…</div> : items.length ? <div className="divide-y divide-slate-100">{items.map(item => <AnalysisRow key={item._id} analysis={item} onOpen={setSelected} onToggleBookmark={unbookmark} bookmarkBusy={bookmarkBusy === item._id}/>)}</div> : <div className="px-6 py-16 text-center"><div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-amber-50 text-amber-600"><BookmarkCheck size={22}/></div><h2 className="font-semibold text-slate-800">No bookmarks yet</h2><p className="mt-1 text-sm text-slate-500">Bookmark an analysis from your dashboard or history to save it here.</p></div>}</section>
    {selected && <AnalysisDetailsDialog analysis={selected} onClose={closeDetails}/>}
  </>
}
