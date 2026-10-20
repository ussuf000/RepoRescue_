import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, Check, Clock3, Copy, LoaderCircle, Search, Trash2, X } from 'lucide-react'
import { api } from '../lib/api.js'

const dateText = value => {
  if (!value) return 'Date unavailable'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

const correctedCodeOf = analysis => analysis?.correctedCode || analysis?.fixedCode || analysis?.codeFix || analysis?.suggestedCode || ''

export default function HistoryPage() {
  const [items, setItems] = useState([])
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [deleting, setDeleting] = useState('')
  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState(null)
  const [detailBusy, setDetailBusy] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [copyStatus, setCopyStatus] = useState('')
  const [copyError, setCopyError] = useState('')

  const load = useCallback(async () => {
    setBusy(true)
    setError('')
    try {
      const data = await api('/api/history')
      setItems(data.analyses || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!selected) return undefined
    const previousOverflow = document.body.style.overflow
    const onKeyDown = event => {
      if (event.key === 'Escape') closeDetails()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [selected])

  async function openDetails(item) {
    setSelected(item)
    setDetail(null)
    setDetailError('')
    setCopyError('')
    setCopyStatus('')
    setDetailBusy(true)
    try {
      const data = await api(`/${item._id}`)
      setDetail(data.analysis)
    } catch (e) {
      setDetailError(e.message)
    } finally {
      setDetailBusy(false)
    }
  }

  function closeDetails() {
    setSelected(null)
    setDetail(null)
    setDetailError('')
    setCopyError('')
    setCopyStatus('')
  }

  async function copyText(value) {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setCopyStatus('Copied to clipboard')
      setCopyError('')
    } catch {
      setCopyStatus('')
      setCopyError('Clipboard access failed. Select the text and copy it manually.')
    }
  }

  const copyFixValue = correctedCodeOf(detail) || detail?.solution || ''

  async function remove(id) {
    if (!window.confirm('Delete this analysis from your history?')) return
    setDeleting(id)
    setError('')
    try {
      await api(`/${id}`, { method: 'DELETE' })
      setItems(current => current.filter(item => item._id !== id))
      if (selected?._id === id) closeDetails()
    } catch (e) {
      setError(e.message)
    } finally {
      setDeleting('')
    }
  }

  const normalizedQuery = query.trim().toLocaleLowerCase()
  const filtered = items.filter(item =>
    `${item.errorType || ''} ${item.errorMessage || ''}`.toLocaleLowerCase().includes(normalizedQuery),
  )
  const correctedCode = correctedCodeOf(detail)

  return <>
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600"><Clock3 size={15}/> Your workspace</div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Analysis history</h1>
        <p className="mt-2 text-sm text-slate-500">Review the errors you’ve worked through.</p>
      </div>
      <div className="relative w-full sm:max-w-xs">
        <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
        <input aria-label="Search history" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search analyses…" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"/>
      </div>
    </div>

    {error && <div role="alert" className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-700"><span className="flex items-start gap-2"><AlertCircle size={17} className="mt-0.5 shrink-0"/>{error}</span><button onClick={load} className="shrink-0 font-semibold underline underline-offset-2">Retry</button></div>}

    <section className="panel overflow-hidden">
      {busy ? <div className="flex items-center justify-center gap-2 p-14 text-sm text-slate-500"><LoaderCircle className="animate-spin" size={18}/> Loading your history…</div>
        : filtered.length === 0 ? <div className="px-6 py-16 text-center">
          <div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600"><Clock3 size={22}/></div>
          <h2 className="font-semibold text-slate-800">{normalizedQuery ? 'No matching analyses' : 'No analyses yet'}</h2>
          <p className="mt-1 text-sm text-slate-500">{normalizedQuery ? 'Try another error type or part of the original error message.' : 'Completed error analyses will appear here after you analyze an error.'}</p>
          {normalizedQuery && <button onClick={() => setQuery('')} className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700">Clear search</button>}
        </div>
        : <div className="divide-y divide-slate-100">{filtered.map(item => <article key={item._id} className="p-5 transition hover:bg-slate-50/60 md:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2"><span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">{item.errorType || 'Analysis'}</span><span className="text-xs text-slate-400">{dateText(item.createdAt)}</span></div>
              <p className="line-clamp-2 whitespace-pre-wrap font-mono text-xs leading-5 text-slate-600">{item.errorMessage}</p>
            </div>
            <button aria-label="Delete analysis" title="Delete analysis" disabled={deleting === item._id} onClick={() => remove(item._id)} className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50">{deleting === item._id ? <LoaderCircle size={17} className="animate-spin"/> : <Trash2 size={17}/>}</button>
          </div>
          <button onClick={() => openDetails(item)} className="mt-3 text-left text-xs font-semibold text-indigo-600 hover:text-indigo-700">View explanation <span aria-hidden="true">›</span></button>
        </article>)}</div>}
    </section>

    {selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-2 sm:p-4" onMouseDown={event => { if (event.target === event.currentTarget) closeDetails() }}>
      <section role="dialog" aria-modal="true" aria-labelledby="analysis-detail-title" className="flex max-h-[calc(100dvh-1rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:max-h-[90dvh]">
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 bg-white px-4 py-4 sm:gap-4 sm:px-6">
          <div><p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Analysis details</p><h2 id="analysis-detail-title" className="mt-1 text-lg font-bold text-slate-900">{detail?.errorType || selected.errorType || 'Error analysis'}</h2></div>
          <button aria-label="Close details" onClick={closeDetails} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={18}/></button>
        </header>
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-4 sm:p-5 md:p-6">
          {detailBusy ? <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500"><LoaderCircle size={18} className="animate-spin"/> Loading analysis details…</div>
            : detailError ? <div role="alert" className="flex gap-2 rounded-xl bg-rose-50 p-4 text-sm text-rose-700"><AlertCircle size={17} className="mt-0.5 shrink-0"/>{detailError}</div>
              : detail && <>
                <div className="flex flex-wrap items-center justify-between gap-2"><span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">{detail.errorType || 'Analysis'}</span><span className="text-xs text-slate-400">Created {dateText(detail.createdAt)}</span></div>
                <div>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-semibold text-slate-800">Original error</h3><button onClick={() => copyText(detail.errorMessage)} disabled={!detail.errorMessage} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"><Copy size={14}/> Copy Error</button></div>
                  <pre className="max-h-56 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-slate-950 p-4 font-mono text-xs leading-5 text-white selection:bg-indigo-500 selection:text-white">{detail.errorMessage || 'No original error was saved.'}</pre>
                </div>
                <DetailBlock title="Root cause"><p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">{detail.rootCause || 'No root cause was saved.'}</p></DetailBlock>
                <div>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-semibold text-slate-800">Solution</h3><button onClick={() => copyText(copyFixValue)} disabled={!copyFixValue} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"><Copy size={14}/> Copy Fix</button></div>
                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">{detail.solution || 'No solution was saved.'}</p>
                </div>
                {correctedCode && <DetailBlock title="Corrected code"><pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-slate-950 p-4 font-mono text-xs leading-5 text-white selection:bg-indigo-500 selection:text-white">{correctedCode}</pre></DetailBlock>}
                {copyStatus && <p role="status" aria-live="polite" className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700"><Check size={16}/>{copyStatus}</p>}
                {copyError && <p role="alert" className="text-sm text-rose-600">{copyError}</p>}
              </>}
        </div>
      </section>
    </div>}
  </>
}

function DetailBlock({ title, children }) {
  return <div><h3 className="mb-2 text-sm font-semibold text-slate-800">{title}</h3>{children}</div>
}
