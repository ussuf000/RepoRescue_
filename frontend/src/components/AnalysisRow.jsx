import { Bookmark, BookmarkCheck, ChevronRight } from 'lucide-react'

export default function AnalysisRow({ analysis, onOpen, onToggleBookmark, bookmarkBusy = false }) {
  return <article className="flex items-start justify-between gap-3 p-4 transition hover:bg-slate-50/70 sm:px-5">
    <button onClick={() => onOpen?.(analysis)} className="min-w-0 flex-1 text-left">
      <div className="mb-2 flex flex-wrap items-center gap-2"><span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">{analysis.errorType || 'Analysis'}</span><span className="text-xs text-slate-400">{analysis.createdAt ? new Date(analysis.createdAt).toLocaleString() : 'Date unavailable'}</span></div>
      <p className="line-clamp-2 whitespace-pre-wrap font-mono text-xs leading-5 text-slate-600">{analysis.errorMessage || 'No error message saved.'}</p>
    </button>
    <div className="flex shrink-0 items-center gap-1">
      {onToggleBookmark && <button aria-label={analysis.isBookmarked ? 'Remove bookmark' : 'Bookmark analysis'} title={analysis.isBookmarked ? 'Remove bookmark' : 'Bookmark analysis'} disabled={bookmarkBusy} onClick={() => onToggleBookmark(analysis)} className="rounded-lg p-2 text-amber-600 hover:bg-amber-50 disabled:opacity-50">{analysis.isBookmarked ? <BookmarkCheck size={17} fill="currentColor"/> : <Bookmark size={17}/>}</button>}
      <button aria-label="View analysis details" onClick={() => onOpen?.(analysis)} className="rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"><ChevronRight size={18}/></button>
    </div>
  </article>
}
