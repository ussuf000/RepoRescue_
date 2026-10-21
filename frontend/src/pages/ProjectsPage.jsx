import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, ArrowLeft, FolderKanban, LoaderCircle, Pencil, Plus, Save, X } from 'lucide-react'
import { api } from '../lib/api.js'
import AnalysisRow from '../components/AnalysisRow.jsx'
import AnalysisDetailsDialog from '../components/AnalysisDetailsDialog.jsx'

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [projectName, setProjectName] = useState('')
  const [busy, setBusy] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [selectedProject, setSelectedProject] = useState(null)
  const [analyses, setAnalyses] = useState([])
  const [analysisBusy, setAnalysisBusy] = useState(false)
  const [selectedAnalysis, setSelectedAnalysis] = useState(null)
  const [renaming, setRenaming] = useState('')
  const [renameValue, setRenameValue] = useState('')
  const closeAnalysis = useCallback(() => setSelectedAnalysis(null), [])

  const load = useCallback(async () => {
    setBusy(true); setError('')
    try { const data = await api('/api/projects'); setProjects(data.projects || []) }
    catch (reason) { setError(reason.message) }
    finally { setBusy(false) }
  }, [])
  useEffect(() => { load() }, [load])

  async function createProject(event) {
    event.preventDefault(); setSaving(true); setError('')
    try {
      const data = await api('/api/projects', { method: 'POST', body: JSON.stringify({ name: projectName }) })
      setProjects(current => [data.project, ...current]); setProjectName('')
    } catch (reason) { setError(reason.message) }
    finally { setSaving(false) }
  }

  async function openProject(project) {
    setSelectedProject(project); setAnalysisBusy(true); setAnalyses([]); setError('')
    try { const data = await api(`/api/projects/${project._id}/analyses`); setAnalyses(data.analyses || []) }
    catch (reason) { setError(reason.message) }
    finally { setAnalysisBusy(false) }
  }

  async function saveRename(project) {
    setSaving(true); setError('')
    try {
      const data = await api(`/api/projects/${project._id}`, { method: 'PATCH', body: JSON.stringify({ name: renameValue }) })
      setProjects(current => current.map(item => item._id === project._id ? { ...item, ...data.project } : item))
      if (selectedProject?._id === project._id) setSelectedProject(current => ({ ...current, ...data.project }))
      setRenaming('')
    } catch (reason) { setError(reason.message) }
    finally { setSaving(false) }
  }

  async function toggleBookmark(item) {
    const bookmarked = !item.isBookmarked
    try {
      await api(`/api/bookmarks/${item._id}`, { method: bookmarked ? 'POST' : 'DELETE' })
      setAnalyses(current => current.map(entry => entry._id === item._id ? { ...entry, isBookmarked: bookmarked } : entry))
    } catch (reason) { setError(reason.message) }
  }

  return <>
    <div className="mb-7"><div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-violet-600"><FolderKanban size={15}/> Workspace</div><h1 className="text-3xl font-bold tracking-tight text-slate-900">Projects</h1><p className="mt-2 text-sm text-slate-500">Group analyses by the codebases you work on.</p></div>
    {error && <p role="alert" className="mb-4 flex gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700"><AlertCircle size={17}/>{error}</p>}
    {!selectedProject ? <>
      <form onSubmit={createProject} className="panel mb-5 flex flex-col gap-3 p-4 sm:flex-row"><label htmlFor="project-name" className="sr-only">New project name</label><input id="project-name" required maxLength={80} value={projectName} onChange={event => setProjectName(event.target.value)} placeholder="e.g. API service" className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"/><button disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">{saving ? <LoaderCircle size={17} className="animate-spin"/> : <Plus size={17}/>} Create project</button></form>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{busy ? <div className="panel col-span-full flex items-center justify-center gap-2 p-14 text-sm text-slate-500"><LoaderCircle size={18} className="animate-spin"/> Loading projects…</div> : projects.length ? projects.map(project => <article key={project._id} className="panel p-5"><div className="flex items-start justify-between gap-3"><button onClick={() => openProject(project)} className="flex min-w-0 flex-1 items-start gap-3 text-left"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-600"><FolderKanban size={19}/></span><span className="min-w-0"><span className="block truncate font-semibold text-slate-800">{project.name}</span><span className="mt-1 block text-xs text-slate-400">{project.analysisCount || 0} analyses</span></span></button><button aria-label={`Rename ${project.name}`} onClick={() => { setRenaming(project._id); setRenameValue(project.name) }} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><Pencil size={16}/></button></div>{renaming === project._id && <div className="mt-4 flex gap-2"><input autoFocus maxLength={80} value={renameValue} onChange={event => setRenameValue(event.target.value)} className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"/><button aria-label="Save project name" onClick={() => saveRename(project)} disabled={saving} className="rounded-lg bg-indigo-600 p-2 text-white disabled:opacity-50"><Save size={16}/></button><button aria-label="Cancel rename" onClick={() => setRenaming('')} className="rounded-lg border border-slate-200 p-2 text-slate-600"><X size={16}/></button></div>}<button onClick={() => openProject(project)} className="mt-5 text-xs font-semibold text-indigo-600 hover:text-indigo-700">View project analyses →</button></article>) : <div className="panel col-span-full px-6 py-16 text-center"><h2 className="font-semibold text-slate-800">No projects yet</h2><p className="mt-1 text-sm text-slate-500">Create a project, then assign new analyses to it.</p></div>}</section>
    </> : <>
      <button onClick={() => { setSelectedProject(null); setError('') }} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"><ArrowLeft size={17}/> All projects</button>
      <section className="panel overflow-hidden"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-semibold text-slate-900">{selectedProject.name}</h2><p className="mt-1 text-xs text-slate-400">Analyses assigned to this project</p></div></div>{analysisBusy ? <div className="flex items-center justify-center gap-2 p-12 text-sm text-slate-500"><LoaderCircle size={18} className="animate-spin"/> Loading project analyses…</div> : analyses.length ? <div className="divide-y divide-slate-100">{analyses.map(item => <AnalysisRow key={item._id} analysis={item} onOpen={setSelectedAnalysis} onToggleBookmark={toggleBookmark}/>)}</div> : <div className="px-6 py-14 text-center"><h3 className="font-semibold text-slate-800">No analyses in this project</h3><p className="mt-1 text-sm text-slate-500">Choose this project in Code Analyzer when you submit an analysis.</p></div>}</section>
    </>}
    {selectedAnalysis && <AnalysisDetailsDialog analysis={selectedAnalysis} onClose={closeAnalysis}/>}
  </>
}
