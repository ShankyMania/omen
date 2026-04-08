import { useEffect, useState } from 'react'
import axios from 'axios'

interface ScanMeta {
  scan_id: number; target: string; status: string
  duration_s: number; created_at: string; vuln_count: number
}
interface Vuln {
  id: number; scan_id: number; url: string; param: string
  issue: string; severity: number; cvss_score: number | string
  evidence: string; source: string
}

function score(v: Vuln) { return parseFloat(String(v.cvss_score ?? 0)) }
function timeSince(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}
function fmtDuration(s: number) {
  const n = parseFloat(String(s ?? 0))
  if (!n || n <= 0) return null
  return n < 60 ? `${n.toFixed(1)}s` : `${Math.floor(n / 60)}m ${Math.round(n % 60)}s`
}
function SeverityBadge({ s }: { s: number }) {
  if (s >= 9) return <span className="badge-critical">Critical</span>
  if (s >= 7) return <span className="badge-high">High</span>
  if (s >= 4) return <span className="badge-medium">Medium</span>
  return <span className="badge-low">Low</span>
}

export default function Reports() {
  const [scans, setScans]       = useState<ScanMeta[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [vulns, setVulns]       = useState<Vuln[]>([])
  const [loadingScans, setLS]   = useState(true)
  const [loadingVulns, setLV]   = useState(false)
  const [downloading, setDL]    = useState(false)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [showList, setShowList] = useState(true) // mobile: toggle between list and detail

  useEffect(() => {
    axios.get('/api/scans').then(r => {
      setScans(r.data)
      if (r.data.length > 0) pickScan(r.data[0].scan_id)
    }).finally(() => setLS(false))
  }, [])

  async function pickScan(id: number) {
    setSelected(id); setLV(true); setVulns([]); setExpanded(null)
    setShowList(false) // on mobile, switch to detail view
    try { const r = await axios.get(`/api/scan/${id}/results`); setVulns(r.data) }
    catch { setVulns([]) }
    finally { setLV(false) }
  }

  async function downloadPDF(scanId: number) {
    setDL(true)
    try {
      const r = await axios.get(`/api/scan/${scanId}/report-pdf`, { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([r.data], { type: 'application/pdf' }))
      const a = document.createElement('a'); a.href = url; a.download = `omen-scan-${scanId}.pdf`; a.click()
      URL.revokeObjectURL(url)
    } catch { alert('PDF failed.') } finally { setDL(false) }
  }

  function downloadJSON(scanId: number) {
    const blob = new Blob([JSON.stringify(vulns, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `omen-scan-${scanId}.json`; a.click()
    URL.revokeObjectURL(url)
  }

  const sel      = scans.find(s => s.scan_id === selected)
  const critical = vulns.filter(v => score(v) >= 9).length
  const high     = vulns.filter(v => score(v) >= 7 && score(v) < 9).length
  const medium   = vulns.filter(v => score(v) >= 4 && score(v) < 7).length
  const low      = vulns.filter(v => score(v) < 4).length
  const duration = fmtDuration(sel?.duration_s ?? 0)
  const bySource = vulns.reduce((acc, v) => { const k = v.source || 'Unknown'; acc[k] = (acc[k] || 0) + 1; return acc }, {} as Record<string, number>)

  return (
    <main className="px-3 sm:px-6 py-4 sm:py-8 max-w-7xl mx-auto">

      {/* ── Mobile: toggle tabs ── */}
      <div className="flex md:hidden gap-2 mb-4">
        <button onClick={() => setShowList(true)}
          className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${showList ? 'bg-white text-black' : 'text-zinc-400 border border-zinc-800'}`}>
          Scans List
        </button>
        <button onClick={() => setShowList(false)} disabled={!selected}
          className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${!showList ? 'bg-white text-black' : 'text-zinc-400 border border-zinc-800'} disabled:opacity-40`}>
          Report Detail
        </button>
      </div>

      <div className="flex gap-5">

        {/* ── Scan list ── */}
        <div className={`${showList ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-56 lg:w-64 flex-shrink-0 space-y-1.5`}>
          <p className="section-label mb-3">Scans</p>
          {loadingScans ? (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          ) : scans.length === 0 ? (
            <p className="text-zinc-500 text-sm">No scans yet.</p>
          ) : scans.map(scan => (
            <button key={scan.scan_id} onClick={() => pickScan(scan.scan_id)}
              className={`w-full text-left px-3 py-3 rounded-xl border transition-all ${selected === scan.scan_id ? 'border-zinc-600 bg-zinc-900' : 'border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/40'}`}>
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${scan.status === 'completed' ? 'bg-green-400' : scan.status === 'running' ? 'bg-white animate-pulse' : 'bg-zinc-600'}`} />
                <span className="text-xs text-white font-bold">Scan #{scan.scan_id}</span>
                {scan.vuln_count > 0 && <span className="ml-auto text-xs text-red-400 font-bold">{scan.vuln_count}</span>}
              </div>
              <p className="text-xs text-zinc-500 truncate mt-0.5">{scan.target}</p>
              <p className="text-xs text-zinc-600 mt-0.5">{timeSince(scan.created_at)}{fmtDuration(scan.duration_s) ? ` · ${fmtDuration(scan.duration_s)}` : ''}</p>
            </button>
          ))}
        </div>

        {/* ── Report detail ── */}
        <div className={`${!showList ? 'flex' : 'hidden'} md:flex flex-col flex-1 min-w-0 space-y-4`}>
          {!selected ? (
            <div className="card flex items-center justify-center py-20">
              <p className="text-zinc-500 text-sm">Select a scan from the list</p>
            </div>
          ) : (
            <>
              {/* Header card */}
              <div className="card space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="section-label">Scan #{selected} Report</p>
                    <p className="text-white text-base font-bold mt-1 break-all">{sel?.target}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      {sel?.created_at && <span className="text-xs text-zinc-500">{timeSince(sel.created_at)}</span>}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase
                        ${sel?.status === 'completed' ? 'text-green-400 bg-green-500/10' : sel?.status === 'running' ? 'text-white bg-zinc-800' : 'text-zinc-500 bg-zinc-900'}`}>
                        {sel?.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => downloadJSON(selected!)} disabled={loadingVulns}
                      className="text-xs px-3 py-2 rounded-lg border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors disabled:opacity-40">
                      ↓ JSON
                    </button>
                    <button onClick={() => downloadPDF(selected!)} disabled={downloading || loadingVulns}
                      className="btn-primary text-xs px-4 py-2 disabled:opacity-40">
                      {downloading ? 'Generating...' : '↓ PDF'}
                    </button>
                  </div>
                </div>

                {/* Timing */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-800">
                  {[{ icon: '⏱', label: 'Scan Duration', val: duration ?? '—' }, { icon: '🎯', label: 'Total Issues', val: String(vulns.length) }].map(({ icon, label, val }) => (
                    <div key={label} className="rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3 flex items-center gap-3">
                      <span className="text-xl">{icon}</span>
                      <div><p className="text-lg font-black text-white">{val}</p><p className="text-xs text-zinc-500 uppercase tracking-widest">{label}</p></div>
                    </div>
                  ))}
                </div>

                {/* Severity */}
                {!loadingVulns && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Critical', val: critical, color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/20' },
                      { label: 'High',     val: high,     color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
                      { label: 'Medium',   val: medium,   color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/20' },
                      { label: 'Low',      val: low,      color: 'text-zinc-300',   bg: 'bg-zinc-800 border-zinc-700' },
                    ].map(({ label, val, color, bg }) => (
                      <div key={label} className={`rounded-xl border p-3 text-center ${bg}`}>
                        <p className={`text-3xl font-black ${color}`}>{val}</p>
                        <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mt-1">{label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Attack breakdown */}
              {!loadingVulns && Object.keys(bySource).length > 0 && (
                <div className="card">
                  <p className="section-label mb-3">Findings by Attack Type</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(bySource).sort((a, b) => b[1] - a[1]).map(([src, cnt]) => (
                      <div key={src} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800">
                        <span className="text-xs text-zinc-300 font-semibold">{src}</span>
                        <span className="text-sm font-black text-white">{cnt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Findings */}
              <div className="card">
                <p className="section-label mb-4">Findings {!loadingVulns && `(${vulns.length})`}</p>
                {loadingVulns ? (
                  <div className="flex justify-center py-10">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : vulns.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-zinc-500 text-sm">No vulnerabilities found for this scan.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {vulns.map((v, i) => {
                      const s = score(v)
                      return (
                        <div key={i}
                          className={`border rounded-xl overflow-hidden cursor-pointer transition-all ${expanded === i ? 'border-zinc-600 bg-zinc-900/60' : 'border-zinc-800 hover:border-zinc-700'}`}
                          onClick={() => setExpanded(expanded === i ? null : i)}>
                          <div className="flex items-center gap-3 px-4 py-3">
                            <SeverityBadge s={s} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-white truncate">{v.issue}</p>
                              <p className="text-xs text-zinc-500 truncate mt-0.5">{v.url}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-xs text-zinc-400 font-mono hidden sm:inline">{s.toFixed(1)}</span>
                              <span className="text-xs text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 hidden sm:inline">{v.source || 'FastScan'}</span>
                              <span className="text-zinc-500 text-xs">{expanded === i ? '▲' : '▼'}</span>
                            </div>
                          </div>
                          {expanded === i && (
                            <div className="px-4 pb-4 pt-2 border-t border-zinc-800 bg-zinc-950/60 space-y-2">
                              {v.param && <div className="flex flex-col sm:flex-row gap-1 sm:gap-3"><span className="text-xs text-zinc-500 sm:w-20 flex-shrink-0 font-semibold">Parameter</span><code className="text-xs text-red-300 bg-black/50 rounded px-2 py-0.5 break-all">{v.param}</code></div>}
                              <div className="flex flex-col sm:flex-row gap-1 sm:gap-3"><span className="text-xs text-zinc-500 sm:w-20 flex-shrink-0 font-semibold">URL</span><span className="text-xs text-zinc-300 break-all">{v.url}</span></div>
                              {v.evidence && <div className="flex flex-col sm:flex-row gap-1 sm:gap-3"><span className="text-xs text-zinc-500 sm:w-20 flex-shrink-0 font-semibold">Evidence</span><code className="text-xs text-green-400 bg-black rounded px-2 py-1 break-all flex-1 border border-zinc-800">{v.evidence}</code></div>}
                              <div className="flex gap-3"><span className="text-xs text-zinc-500 w-20 flex-shrink-0 font-semibold">CVSS</span><span className="text-xs text-zinc-300 font-mono">{s.toFixed(1)} / 10.0</span></div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
