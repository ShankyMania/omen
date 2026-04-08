import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import axios from 'axios'
import VulnTable from '@/components/VulnTable'
import { Vulnerability } from '@/types'

interface ScanMeta {
  scan_id: number; target: string; status: string
  duration_s: number; created_at: string; vuln_count: number
}

function timeSince(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}
function fmtDur(s: number) {
  if (!s || s <= 0) return null
  if (s < 60) return `${Number(s).toFixed(1)}s`
  return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`
}

function StatCard({ label, value, color, icon, sub }: {
  label: string; value: number; color: string; icon: string; sub?: string
}) {
  return (
    <div className="card-sm flex items-center gap-4 hover:border-zinc-800 transition-colors">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black text-white">{value}</p>
        <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-zinc-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const router = useRouter()
  const [vulns, setVulns]     = useState<Vulnerability[]>([])
  const [scans, setScans]     = useState<ScanMeta[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      axios.get('/api/issues').then(r => setVulns(r.data)).catch(() => {}),
      axios.get('/api/scans').then(r => setScans(r.data)).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  const critical = vulns.filter(v => v.cvss_score >= 9).length
  const high     = vulns.filter(v => v.cvss_score >= 7 && v.cvss_score < 9).length
  const medium   = vulns.filter(v => v.cvss_score >= 4 && v.cvss_score < 7).length
  const low      = vulns.filter(v => v.cvss_score < 4).length
  const completed = scans.filter(s => s.status === 'completed').length
  const targets   = new Set(scans.map(s => { try { return new URL(s.target).hostname } catch { return s.target } })).size

  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-5 sm:space-y-8">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="section-label mb-1">Overview</p>
            <h1 className="text-2xl font-black text-white">Dashboard</h1>
            {scans[0] && <p className="text-xs text-zinc-400 mt-1">Last scan {timeSince(scans[0].created_at)}</p>}
          </div>
          <button
            onClick={() => router.push('/scan/new')}
            className="btn-primary flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            New Scan
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-zinc-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Severity cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Critical" value={critical} icon="🔴" color="bg-red-500/10" />
              <StatCard label="High"     value={high}     icon="🟠" color="bg-orange-500/10" />
              <StatCard label="Medium"   value={medium}   icon="🟡" color="bg-amber-500/10" />
              <StatCard label="Low"      value={low}      icon="⚪" color="bg-zinc-800/30" />
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Vulnerabilities" value={vulns.length} icon="⚠️" color="bg-white/10" />
              <StatCard label="Scans Run"             value={scans.length} icon="🔍" color="bg-blue-500/10" />
              <StatCard label="Targets Scanned"       value={targets}      icon="🌐" color="bg-violet-500/10" />
              <StatCard label="Completed"             value={completed}    icon="✅" color="bg-green-500/10" />
            </div>

            {/* Recent scans */}
            {scans.length > 0 && (
              <div className="card">
                <div className="flex items-center justify-between mb-5">
                  <p className="section-label">Recent Scans</p>
                  <Link href="/reports" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                    View all →
                  </Link>
                </div>
                <div className="space-y-2">
                  {scans.slice(0, 6).map(scan => (
                    <div key={scan.scan_id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between py-3 px-4 rounded-xl bg-zinc-900/30 hover:bg-zinc-900/60 transition-colors border border-zinc-900/50 gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          scan.status === 'completed' ? 'bg-green-400' :
                          scan.status === 'running'   ? 'bg-zinc-200 animate-pulse' :
                          scan.status === 'failed'    ? 'bg-red-500' : 'bg-slate-600'
                        }`} />
                        <span className="text-sm text-white font-medium truncate">{scan.target}</span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 flex-wrap">
                        {scan.vuln_count > 0 && (
                          <span className="text-xs text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded-full">
                            {scan.vuln_count} vulns
                          </span>
                        )}
                        <span className="text-xs text-zinc-600">{timeSince(scan.created_at)}</span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold
                          ${scan.status === 'completed' ? 'text-green-400 bg-green-500/10' :
                            scan.status === 'running'   ? 'text-zinc-300 bg-white/10' :
                            scan.status === 'failed'    ? 'text-red-400 bg-red-500/10' :
                                                          'text-zinc-500 bg-zinc-900'}`}>
                          {scan.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vuln table */}
            <div className="card">
              <div className="flex items-center justify-between mb-5">
                <p className="section-label">
                  All Vulnerabilities
                  {vulns.length > 0 && <span className="ml-2 text-zinc-400 normal-case font-normal">({vulns.length})</span>}
                </p>
              </div>
              <VulnTable vulns={vulns} />
            </div>
          </>
        )}
      </main>
  )
}
