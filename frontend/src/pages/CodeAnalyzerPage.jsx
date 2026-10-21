import { useEffect, useState } from 'react'
import { AlertCircle, ArrowRight, Braces, LoaderCircle, Sparkles } from 'lucide-react'
import { api } from '../lib/api.js'
import AnalysisResult from '../components/AnalysisResult.jsx'

const languages = ['Auto detect', 'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'Go', 'Rust', 'PHP', 'Ruby', 'Other']

export default function CodeAnalyzerPage({ preferences }) {
  const [errorMessage, setErrorMessage] = useState('')
  const [codeSnippet, setCodeSnippet] = useState('')
  const [language, setLanguage] = useState(preferences?.language || 'Auto detect')
  const [projectId, setProjectId] = useState('')
  const [projects, setProjects] = useState([])
  const [analysis, setAnalysis] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { api('/api/projects').then(data => setProjects(data.projects || [])).catch(reason => setError(`Could not load projects: ${reason.message}`)) }, [])

  async function submit(event) {
    event.preventDefault(); setError(''); setAnalysis(null)
    if (!errorMessage.trim()) { setError('Enter the error message to analyze.'); return }
    setBusy(true)
    try {
      const data = await api('/api/analysis', { method: 'POST', body: JSON.stringify({ errorMessage: errorMessage.trim(), codeSnippet: codeSnippet.trim(), language: language === 'Auto detect' ? '' : language, ...(projectId ? { projectId } : {}) }) })
      setAnalysis(data.analysis)
    } catch (reason) { setError(reason.message) }
    finally { setBusy(false) }
  }

  return <>
    <div className="mb-8"><div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700"><Sparkles size={14}/> AI code analyzer</div><h1 className="text-3xl font-bold tracking-tight text-slate-900">Find your way to a fix</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Share an error and the relevant snippet for a focused root cause and suggested fix.</p></div>
    <form onSubmit={submit} className="panel overflow-hidden">
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4 text-sm font-semibold text-slate-700"><Braces size={17} className="text-indigo-600"/> Analysis input</div>
      <div className="space-y-5 p-4 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Programming language</span><select value={language} onChange={event => setLanguage(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100">{languages.map(item => <option key={item}>{item}</option>)}</select></label><label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Project <span className="font-normal text-slate-400">(optional)</span></span><select value={projectId} onChange={event => setProjectId(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"><option value="">No project</option>{projects.map(project => <option key={project._id} value={project._id}>{project.name}</option>)}</select></label></div>
        <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Error message <span className="text-rose-500">*</span></span><textarea value={errorMessage} onChange={event => setErrorMessage(event.target.value)} required maxLength={30000} rows={4} placeholder="Paste the error message or stack trace…" className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/70 p-4 font-mono text-[13px] leading-6 text-slate-800 outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"/><span className="mt-1 block text-right text-xs text-slate-400">{errorMessage.length}/30,000</span></label>
        <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Code snippet <span className="font-normal text-slate-400">(optional)</span></span><textarea value={codeSnippet} onChange={event => setCodeSnippet(event.target.value)} maxLength={30000} rows={8} spellCheck="false" placeholder="Paste only the relevant code. Submitted code is analyzed as text and is never executed." className="w-full resize-y rounded-xl border border-slate-200 bg-slate-950 p-4 font-mono text-[13px] leading-6 text-white outline-none placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-200"/><span className="mt-1 block text-right text-xs text-slate-400">{codeSnippet.length}/30,000</span></label>
        {error && <p role="alert" className="flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2.5 text-sm text-rose-700"><AlertCircle size={17} className="mt-0.5 shrink-0"/>{error}</p>}
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><p className="text-xs leading-5 text-slate-400">Remove credentials and private data before submitting.</p><button disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-60">{busy ? <><LoaderCircle size={17} className="animate-spin"/> Analyzing…</> : <>Analyze code <ArrowRight size={17}/></>}</button></div>
      </div>
    </form>
    {busy && <div className="mt-5 flex items-center gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 text-sm text-indigo-700"><LoaderCircle size={18} className="animate-spin"/> Reviewing your error and code…</div>}
    <AnalysisResult analysis={analysis}/>
  </>
}
