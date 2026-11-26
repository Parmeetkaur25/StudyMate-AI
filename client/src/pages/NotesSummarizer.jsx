import { useEffect, useRef, useState } from 'react'
import { UploadCloud, Loader2, Trash2, ArrowLeft, FileText, BookOpen, Key, Edit3 } from 'lucide-react'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import { inputCls } from '../components/ui/Input'
import api, { getErrorMessage } from '../services/api'

const MAX_MB  = 5
const ALLOWED = ['.pdf', '.txt', '.md']

export default function NotesSummarizer() {
  const [notes, setNotes]           = useState([])
  const [current, setCurrent]       = useState(null)
  const [file, setFile]             = useState(null)
  const [title, setTitle]           = useState('')
  const [uploading, setUploading]   = useState(false)
  const [loadingList, setLoadingList] = useState(true)
  const [error, setError]           = useState('')
  const [info, setInfo]             = useState('')
  const fileRef = useRef(null)

  const loadList = () => api.get('/notes').then((r) => setNotes(r.data.notes))

  useEffect(() => {
    loadList().catch((e) => setError(getErrorMessage(e))).finally(() => setLoadingList(false))
  }, [])

  const pickFile = (e) => {
    setError('')
    const f = e.target.files[0]
    if (!f) return setFile(null)
    const ext = f.name.slice(f.name.lastIndexOf('.')).toLowerCase()
    if (!ALLOWED.includes(ext)) { setError('Only PDF, TXT or MD files are allowed'); e.target.value = ''; return setFile(null) }
    if (f.size > MAX_MB * 1024 * 1024) { setError(`File is too large (max ${MAX_MB} MB)`); e.target.value = ''; return setFile(null) }
    setFile(f)
  }

  const upload = async (e) => {
    e.preventDefault()
    if (!file) return setError('Please choose a file first')
    setError(''); setInfo(''); setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      if (title.trim()) fd.append('title', title.trim())
      const res = await api.post('/notes/upload', fd)
      setCurrent(res.data.note)
      if (res.data.truncated) setInfo('Document was very long — only the first part was summarized.')
      setFile(null); setTitle('')
      if (fileRef.current) fileRef.current.value = ''
      loadList()
    } catch (err) { setError(getErrorMessage(err)) }
    finally { setUploading(false) }
  }

  const open   = async (id) => { setError(''); setInfo(''); try { setCurrent((await api.get(`/notes/${id}`)).data.note) } catch (e) { setError(getErrorMessage(e)) } }
  const remove = async (id) => {
    if (!window.confirm('Delete this summary?')) return
    try { await api.delete(`/notes/${id}`); if (current?._id === id) setCurrent(null); loadList() }
    catch (e) { setError(getErrorMessage(e)) }
  }

  /* ── Detail view ─────────────────────────────── */
  if (current) {
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        <button
          onClick={() => setCurrent(null)}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#2563eb] hover:text-[#1d4ed8] transition"
        >
          <ArrowLeft size={15} /> Back to notes
        </button>

        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#dbeafe] text-[#2563eb]">
            <FileText size={20} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-[#0f172a]">{current.title}</h2>
            <p className="mt-0.5 text-xs text-[#9ca3af]">{current.originalFileName} · {current.extractedChars.toLocaleString()} characters read</p>
          </div>
        </div>

        {info && (
          <div className="rounded-xl border border-[#fde68a] bg-[#fefce8] px-4 py-3 text-sm text-[#92400e]">{info}</div>
        )}

        <Card className="p-6">
          <div className="mb-3 flex items-center gap-2">
            <BookOpen size={15} className="text-[#2563eb]" />
            <h3 className="text-sm font-semibold text-[#111827]">Summary</h3>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#374151]">{current.summary}</p>
        </Card>

        <Card className="p-6">
          <div className="mb-3 flex items-center gap-2">
            <Key size={15} className="text-[#4338ca]" />
            <h3 className="text-sm font-semibold text-[#111827]">Key points</h3>
          </div>
          <ul className="space-y-2.5">
            {current.keyPoints.map((p, i) => (
              <li key={i} className="flex gap-3 text-sm text-[#374151]">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e0e7ff] text-[10px] font-bold text-[#4338ca]">{i + 1}</span>
                {p}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="bg-[#f0f7ff] border-[#bfdbfe] p-6">
          <div className="mb-3 flex items-center gap-2">
            <Edit3 size={15} className="text-[#2563eb]" />
            <h3 className="text-sm font-semibold text-[#111827]">Revision notes</h3>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#374151]">{current.revisionNotes}</p>
        </Card>
      </div>
    )
  }

  /* ── List / upload view ──────────────────────── */
  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-[#0f172a]">Smart Notes Summarizer</h2>
        <p className="mt-0.5 text-sm text-[#6b7280]">Upload PDF, TXT or MD files (max {MAX_MB} MB) and get AI-powered summaries instantly.</p>
      </div>

      {error && <div className="rounded-xl border border-[#fca5a5] bg-[#fff1f2] px-4 py-3 text-sm text-[#b91c1c]">{error}</div>}

      <Card className="max-w-2xl p-6">
        <h3 className="mb-4 text-sm font-semibold text-[#111827]">Upload your notes</h3>
        <form onSubmit={upload} className="space-y-4">

          {/* Drop zone */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#374151]">File</label>
            <div className="mt-1">
              {file ? (
                <div className="flex items-center gap-3 rounded-xl border border-[#bfdbfe] bg-[#eff6ff] px-4 py-3">
                  <FileText size={17} className="shrink-0 text-[#2563eb]" />
                  <span className="flex-1 truncate text-sm font-medium text-[#1d4ed8]">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = '' }}
                    className="shrink-0 text-[#93c5fd] hover:text-[#ef4444] transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[#e5e7eb] bg-[#fafafa] px-6 py-10 transition hover:border-[#93c5fd] hover:bg-[#f0f7ff]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dbeafe] text-[#2563eb]">
                    <UploadCloud size={22} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-[#374151]">Click to upload or drag and drop</p>
                    <p className="mt-0.5 text-xs text-[#9ca3af]">PDF, TXT, MD — up to {MAX_MB} MB</p>
                  </div>
                  <input ref={fileRef} type="file" accept=".pdf,.txt,.md" onChange={pickFile} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#374151]">
              Title <span className="font-normal normal-case text-[#9ca3af]">(optional)</span>
            </label>
            <input className={inputCls} maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. DBMS Unit 3 notes" />
          </div>

          <button
            disabled={uploading || !file}
            className="flex items-center gap-2 rounded-xl bg-[#2563eb] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1d4ed8] hover:shadow-md disabled:opacity-60"
          >
            {uploading ? <Loader2 size={15} className="animate-spin" /> : <UploadCloud size={15} />}
            {uploading ? 'Reading and summarizing…' : 'Upload & summarize'}
          </button>
        </form>
      </Card>

      {/* Previous summaries */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-[#111827]">Previous summaries</h3>
        {loadingList ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-[#2563eb]" size={22} />
          </div>
        ) : notes.length === 0 ? (
          <EmptyState icon={FileText} title="No summaries yet" message="Upload your first file to get an AI-powered summary." />
        ) : (
          <Card className="divide-y divide-[#f9fafb] p-0 overflow-hidden">
            {notes.map((n) => (
              <div key={n._id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#fafafa] transition-colors">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#dbeafe]">
                  <FileText size={15} className="text-[#2563eb]" />
                </div>
                <button onClick={() => open(n._id)} className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-medium text-[#111827]">{n.title}</p>
                  <p className="mt-0.5 text-xs text-[#9ca3af]">{new Date(n.createdAt).toLocaleString()}</p>
                </button>
                <button
                  onClick={() => remove(n._id)}
                  className="shrink-0 rounded-lg p-1.5 text-[#d1d5db] transition hover:bg-[#fff1f2] hover:text-[#ef4444]"
                  aria-label="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  )
}
