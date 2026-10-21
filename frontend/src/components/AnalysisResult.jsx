import { useState } from 'react'
import { Check, Code2, Copy, Lightbulb, ScanSearch } from 'lucide-react'

const sections = [
  { key: 'errorType', title: 'Error type', icon: ScanSearch, tone: 'bg-indigo-50 text-indigo-600' },
  { key: 'rootCause', title: 'Root cause', icon: Code2, tone: 'bg-amber-50 text-amber-600' },
  { key: 'solution', title: 'Suggested solution', icon: Lightbulb, tone: 'bg-emerald-50 text-emerald-600' },
]

export default function AnalysisResult({ analysis }) {
  const [copyStatus, setCopyStatus] = useState('')
  if (!analysis) return null
  const fix = analysis.correctedCode || analysis.solution || ''
  async function copyFix() {
    try { await navigator.clipboard.writeText(fix); setCopyStatus('Copied to clipboard') }
    catch { setCopyStatus('Clipboard access failed. Select and copy the text manually.') }
  }
  return <section className="mt-7 animate-in" aria-live="polite">
    <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-emerald-700"><Check size={17} /> Analysis complete</div>
    <div className="grid gap-4 lg:grid-cols-3">
      {sections.map(({ key, title, icon: Icon, tone }) => <article key={key} className="panel p-5">
        <div className="mb-4 flex items-center gap-3">
          <span className={`grid size-9 place-items-center rounded-xl ${tone}`}><Icon size={18} /></span>
          <h3 className="font-semibold text-slate-800">{title}</h3>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">{analysis[key] || 'No details provided.'}</p>
        {key === 'solution' && fix && <button onClick={copyFix} className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Copy size={14}/> Copy Fix</button>}
      </article>)}
    </div>
    {analysis.correctedCode && <div className="panel mt-4 p-5"><h3 className="mb-3 text-sm font-semibold text-slate-700">Corrected code</h3><pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-slate-950 p-4 font-mono text-xs leading-5 text-white">{analysis.correctedCode}</pre></div>}
    {copyStatus && <p role="status" aria-live="polite" className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">{copyStatus}</p>}
    {analysis.errorMessage && <div className="panel mt-4 p-5"><h3 className="mb-2 text-sm font-semibold text-slate-700">Submitted error</h3><pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-950 p-4 font-mono text-xs leading-5 text-slate-200">{analysis.errorMessage}</pre></div>}
  </section>
}
