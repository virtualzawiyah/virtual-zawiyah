'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { 
  Upload, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  FileSpreadsheet, 
  Loader2, 
  Info,
  Calendar,
  User,
  History
} from 'lucide-react'

interface ImportLog {
  id: string
  file_name: string
  file_url: string
  month_year: string
  records_imported: number
  status: 'pending' | 'completed' | 'failed'
  error_message: string | null
  created_at: string
  uploader: { full_name: string } | { full_name: string }[] | null
}

export default function AdminExcelImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [logs, setLogs] = useState<ImportLog[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // API responses state
  const [result, setResult] = useState<{
    imported: number
    failed: number
    errors: string[]
  } | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('student_status_import_logs')
        .select(`
          id,
          file_name,
          file_url,
          month_year,
          records_imported,
          status,
          error_message,
          created_at,
          uploader:profiles!uploaded_by(full_name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setLogs(data as unknown as ImportLog[] || [])
    } catch (err) {
      console.error('Error fetching import logs:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('')
    setSuccessMsg('')
    setResult(null)
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0]
      if (!selected.name.endsWith('.xlsx') && !selected.name.endsWith('.xls')) {
        setErrorMsg('Please select a valid Excel file (.xlsx or .xls)')
        setFile(null)
        return
      }
      setFile(selected)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setErrorMsg('Please select an Excel file to upload.')
      return
    }

    setSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')
    setResult(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        throw new Error('No active admin session found. Please login again.')
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('uploaded_by', session.user.id)

      const response = await fetch('/api/excel-import', {
        method: 'POST',
        body: formData
      })

      const resData = await response.json()
      if (!response.ok) {
        throw new Error(resData.error || 'Failed to process spreadsheet import.')
      }

      setResult({
        imported: resData.imported || 0,
        failed: resData.failed || 0,
        errors: resData.errors || []
      })

      if (resData.failed > 0) {
        if (resData.imported > 0) {
          setSuccessMsg(`Import partially successful. Imported ${resData.imported} student status records, but ${resData.failed} failed.`)
        } else {
          setErrorMsg(`Failed to import records. All ${resData.failed} records had validation errors.`)
        }
      } else {
        setSuccessMsg(`Import successful! Updated all ${resData.imported} student status records.`)
      }

      setFile(null)
      // Refresh historical logs
      await fetchLogs()
    } catch (err) {
      const error = err as Error
      console.error('Upload handler failed:', error)
      setErrorMsg(error.message || 'An error occurred during submission.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Bulk Student Status Import</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Upload an Excel spreadsheet to bulk update student statuses (e.g. active, trial, suspended, left).
        </p>
      </div>

      {errorMsg && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>{errorMsg}</div>
        </div>
      )}

      {successMsg && (
        <div className="flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400">
          <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
          <div>{successMsg}</div>
        </div>
      )}

      {/* Result Diagnostics */}
      {result && (result.imported > 0 || result.failed > 0) && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-emerald-400" /> Import Summary Diagnostics
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
              <span className="block text-2xl font-black text-emerald-400">{result.imported}</span>
              <span className="text-xs uppercase tracking-wider text-zinc-400">Successfully Imported</span>
            </div>
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-center">
              <span className="block text-2xl font-black text-red-400">{result.failed}</span>
              <span className="text-xs uppercase tracking-wider text-zinc-400">Validation Failures</span>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-red-400">Detailed Verification Failures:</h4>
              <div className="max-h-60 overflow-y-auto rounded-xl border border-red-500/15 bg-black/40 p-4 font-mono text-xs text-red-300 divide-y divide-red-500/10">
                {result.errors.map((err, idx) => (
                  <div key={idx} className="py-1.5 first:pt-0 last:pb-0">{err}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Upload form card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md h-fit space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Upload className="h-5 w-5 text-emerald-400" /> Excel File Upload
          </h2>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/15 bg-black/20 p-6 text-center hover:border-emerald-500/50 hover:bg-black/35 transition-all">
              <input
                type="file"
                required
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              <FileSpreadsheet className={`h-12 w-12 ${file ? 'text-emerald-400 scale-110' : 'text-zinc-500 group-hover:text-emerald-400'} transition-all mb-3`} />
              {file ? (
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white truncate max-w-[200px]">{file.name}</p>
                  <p className="text-[10px] text-zinc-400">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-zinc-300">Click to browse or drag & drop</p>
                  <p className="text-xs text-zinc-500 mt-1">Supports .xlsx and .xls formats</p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting || !file}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-semibold text-white transition-all duration-150 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing Spreadsheet...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload & Sync Statuses
                </>
              )}
            </button>
          </form>

          {/* Template format specs */}
          <div className="rounded-xl border border-white/5 bg-black/10 p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Info className="h-4 w-4 text-emerald-400" /> Spreadsheet Specifications
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Your Excel sheet must contain a header row on the first tab with exactly these columns:
            </p>
            <div className="overflow-x-auto rounded-lg border border-white/5 bg-black/25">
              <table className="w-full text-left text-[11px] border-collapse font-mono">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.01] text-zinc-500 font-bold">
                    <th className="p-2">Header Name</th>
                    <th className="p-2">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-zinc-300">
                  <tr>
                    <td className="p-2 font-semibold text-white">student_email</td>
                    <td className="p-2">Email of student profile</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-semibold text-white">student_status</td>
                    <td className="p-2">trial, active, suspended_temporary, suspended_forever, left</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-semibold text-white">reason</td>
                    <td className="p-2">Reason for modification</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Historical Logs List */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="h-5 w-5 text-emerald-400" /> Import History & Audit Log
          </h2>

          {loading ? (
            <div className="flex py-12 justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-sm">
              No previous import log data found in database.
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => {
                const uploadDate = new Date(log.created_at).toLocaleString()
                const uploaderName = Array.isArray(log.uploader) 
                  ? log.uploader[0]?.full_name 
                  : log.uploader?.full_name || 'System / Admin'

                return (
                  <div key={log.id} className="rounded-xl border border-white/5 bg-black/20 p-4 space-y-3 hover:bg-black/30 transition-all">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2 text-xs">
                      <div>
                        <p className="font-bold text-white flex items-center gap-1.5">
                          <FileSpreadsheet className="h-4 w-4 text-emerald-400" /> {log.file_name}
                        </p>
                        <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {uploadDate}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          log.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' :
                          log.status === 'failed' ? 'bg-red-500/10 text-red-400 border border-red-500/15' :
                          'bg-yellow-500/10 text-yellow-400 border border-yellow-500/15'
                        }`}>
                          {log.status === 'completed' ? <CheckCircle2 className="h-3 w-3" /> :
                           log.status === 'failed' ? <XCircle className="h-3 w-3" /> :
                           <Loader2 className="h-3 w-3 animate-spin" />}
                          {log.status}
                        </span>
                        <span className="bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                          <User className="h-3 w-3" /> {uploaderName}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Records Successfully Updated:</span>
                      <span className="font-bold text-emerald-400">{log.records_imported}</span>
                    </div>

                    {log.error_message && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 block">Verification Failures:</span>
                        <div className="max-h-28 overflow-y-auto rounded-lg border border-red-500/10 bg-black/30 p-2.5 font-mono text-[10px] text-red-300 whitespace-pre-line leading-relaxed">
                          {log.error_message}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
