import { useEffect, useState } from 'react'
import { AlertCircle, Check, Copy, LoaderCircle, X } from 'lucide-react'
import { api } from '../lib/api.js'

export default function AnalysisDetailsDialog({ analysis, onClose }) {
  const [detail, setDetail] = useState(null)
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState('')

  useEffect(() => {
    let active = true
    const previousOverflow = document.body.style.overflow
    const onKeyDown = event => { if (event.key === 'Escape') onClose() }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    api(`/${analysis._id}`).then(data => { if (active) setDetail(data.analysis) })
      .catch(reason => { if (active) setError(reason.message) })
      .finally(() => { if (active) setBusy(false) })
    return () => {
      active = false
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [analysis._id, onClose])

  async function copyFix() {
    const text = detail?.correctedCode || detail?.solution
    if (!text) return
    try { await navigator.clipboard.writeText(text); setCopied(true); setCopyError('') }
    catch { setCopied(false); setCopyError('Clipboard access failed. Select and copy the text manually.') }
  }

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-2 sm:p-4" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
    <section role="dialog" aria-modal="true" aria-labelledby="shared-analysis-title" className="flex max-h-[calc(100dvh-1rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:max-h-[90dvh]">
      <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-6"><div><p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Analysis details</p><h2 id="shared-analysis-title" className="mt-1 text-lg font-bold text-slate-900">{detail?.errorType || analysis.errorType || 'Analysis'}</h2></div><button aria-label="Close details" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={18}/></button></header>
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-4 sm:p-6">
        {busy ? <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500"><LoaderCircle size={18} className="animate-spin"/> Loading analysis…</div>
          : error ? <p role="alert" className="flex gap-2 rounded-xl bg-rose-50 p-4 text-sm text-rose-700"><AlertCircle size={17}/>{error}</p>
            : detail && <>
              <div className="flex flex-wrap items-center justify-between gap-2"><span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">{detail.errorType}</span><span className="text-xs text-slate-400">{detail.createdAt ? new Date(detail.createdAt).toLocaleString() : ''}</span></div>
              <DetailBlock title="Original error"><pre className="max-h-56 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-slate-950 p-4 font-mono text-xs leading-5 text-white">{detail.errorMessage}</pre></DetailBlock>
              {detail.codeSnippet && <DetailBlock title={`Code snippet${detail.language ? ` · ${detail.language}` : ''}`}><pre className="max-h-56 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-slate-950 p-4 font-mono text-xs leading-5 text-white">{detail.codeSnippet}</pre></DetailBlock>}
              <DetailBlock title="Root cause"><p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">{detail.rootCause}</p></DetailBlock>
              <div><div className="mb-2 flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-semibold text-slate-800">Solution</h3><button onClick={copyFix} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Copy size={14}/> {copied ? 'Copied' : 'Copy Fix'}</button></div><p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">{detail.solution}</p></div>
              {detail.correctedCode && <DetailBlock title="Corrected code"><pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-slate-950 p-4 font-mono text-xs leading-5 text-white">{detail.correctedCode}</pre></DetailBlock>}
              {copied && <p role="status" className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700"><Check size={16}/> Copied to clipboard</p>}
              {copyError && <p role="alert" className="text-sm text-rose-600">{copyError}</p>}
            </>}
      </div>
    </section>
  </div>
}

function DetailBlock({ title, children }) {
  return <div><h3 className="mb-2 text-sm font-semibold text-slate-800">{title}</h3>{children}</div>
}
