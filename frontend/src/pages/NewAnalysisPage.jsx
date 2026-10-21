import { useState } from 'react'
import { AlertCircle, ArrowRight, Braces, LoaderCircle, Sparkles } from 'lucide-react'
import { api } from '../lib/api.js'
import AnalysisResult from '../components/AnalysisResult.jsx'

export default function NewAnalysisPage() {
  const [errorMessage, setErrorMessage] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault(); setError(''); setAnalysis(null)
    if (!errorMessage.trim()) { setError('Paste an error message or stack trace to continue.'); return }
    setBusy(true)
    try { const data = await api('/api/analysis', { method: 'POST', body: JSON.stringify({ errorMessage: errorMessage.trim() }) }); setAnalysis(data.analysis) }
    catch (reason) { setError(reason.message) }
    finally { setBusy(false) }
  }

  return <>
    <div className="mb-8"><div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700"><Sparkles size={14}/> AI-powered debugging</div><h1 className="text-3xl font-bold tracking-tight text-slate-900">What are you stuck on?</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Paste an error message or stack trace to get a clear explanation and suggested fix.</p></div>
    <form onSubmit={submit} className="panel overflow-hidden"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Braces size={17} className="text-indigo-600"/> Error details</div><span className="text-xs text-slate-400">{errorMessage.length}/30,000</span></div><div className="p-4 sm:p-6"><label htmlFor="error-message" className="sr-only">Error message or stack trace</label><textarea id="error-message" required maxLength={30000} value={errorMessage} onChange={event => setErrorMessage(event.target.value)} placeholder="Paste your error or stack trace here…" rows={9} className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/70 p-4 font-mono text-[13px] leading-6 text-slate-800 outline-none transition placeholder:font-sans placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"/>{error && <p role="alert" className="mt-3 flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2.5 text-sm text-rose-700"><AlertCircle size={17}/>{error}</p>}<div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><p className="text-xs leading-5 text-slate-400">Remove secrets or private data before submitting.</p><button disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-60">{busy ? <><LoaderCircle size={17} className="animate-spin"/> Analyzing…</> : <>Analyze error <ArrowRight size={17}/></>}</button></div></div></form>
    {busy && <div className="mt-5 flex items-center gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 text-sm text-indigo-700"><LoaderCircle size={18} className="animate-spin"/> Preparing your analysis…</div>}
    <AnalysisResult analysis={analysis}/>
  </>
}
