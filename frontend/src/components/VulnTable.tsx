import React, { useState } from 'react'
import { Vulnerability } from '@/types'

interface Props { vulns: Vulnerability[]; showFix?: boolean }

function SeverityBadge({ score }: { score: number }) {
  if (score >= 9) return <span className="badge-critical">Critical</span>
  if (score >= 7) return <span className="badge-high">High</span>
  if (score >= 4) return <span className="badge-medium">Medium</span>
  return <span className="badge-low">Low</span>
}

export default function VulnTable({ vulns, showFix = false }: Props) {
  const [expanded, setExpanded] = useState<number | null>(null)

  if (vulns.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-3">✅</div>
        <p className="text-zinc-400 text-sm font-medium">No vulnerabilities found.</p>
      </div>
    )
  }

  return (
    <>
      {/* ── Desktop table (md+) ── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-zinc-800">
              <th className="pb-3 pr-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Issue</th>
              <th className="pb-3 pr-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">URL</th>
              <th className="pb-3 pr-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Param</th>
              <th className="pb-3 pr-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">CVSS</th>
              <th className="pb-3 pr-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Severity</th>
              {showFix && <th className="pb-3 text-xs font-bold text-zinc-400 uppercase tracking-widest">AI Fix</th>}
            </tr>
          </thead>
          <tbody>
            {vulns.map(v => (
              <React.Fragment key={v.vuln_id}>
                <tr className="border-b border-zinc-900 hover:bg-zinc-900/40 cursor-pointer transition-colors"
                  onClick={() => setExpanded(expanded === v.vuln_id ? null : v.vuln_id)}>
                  <td className="py-3 pr-4 font-semibold text-white">{v.issue}</td>
                  <td className="py-3 pr-4 text-zinc-400 max-w-xs truncate text-xs">{v.url}</td>
                  <td className="py-3 pr-4 text-zinc-400 text-xs font-mono">{v.param || '—'}</td>
                  <td className="py-3 pr-4 text-zinc-300 font-mono text-xs">{v.cvss_score}</td>
                  <td className="py-3 pr-4"><SeverityBadge score={v.cvss_score} /></td>
                  {showFix && <td className="py-3">{v.ai_fix ? <span className="text-zinc-300 text-xs font-semibold">View ▼</span> : <span className="text-zinc-600 text-xs">—</span>}</td>}
                </tr>
                {expanded === v.vuln_id && v.ai_fix && (
                  <tr className="bg-zinc-900/60">
                    <td colSpan={showFix ? 6 : 5} className="px-4 py-4">
                      <p className="text-xs text-zinc-400 mb-2 font-bold uppercase tracking-widest">AI-Suggested Fix</p>
                      <pre className="text-xs text-green-400 bg-black/60 rounded-xl p-4 overflow-x-auto whitespace-pre-wrap border border-zinc-800">{v.ai_fix}</pre>
                      {v.cve_id && <p className="text-xs text-zinc-600 mt-2">CVE: <a href={`https://nvd.nist.gov/vuln/detail/${v.cve_id}`} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-white underline">{v.cve_id}</a></p>}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Mobile card list (< md) ── */}
      <div className="md:hidden space-y-3">
        {vulns.map(v => (
          <div key={v.vuln_id}
            className="border border-zinc-800 rounded-xl overflow-hidden cursor-pointer hover:border-zinc-700 transition-colors"
            onClick={() => setExpanded(expanded === v.vuln_id ? null : v.vuln_id)}>
            <div className="p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="text-sm font-bold text-white leading-snug flex-1">{v.issue}</p>
                <SeverityBadge score={v.cvss_score} />
              </div>
              <p className="text-xs text-zinc-500 truncate mb-1">{v.url}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-zinc-500 font-mono">CVSS {v.cvss_score}</span>
                {v.param && <span className="text-xs text-zinc-500 font-mono">param: {v.param}</span>}
                {showFix && v.ai_fix && <span className="text-xs text-zinc-400 font-semibold ml-auto">AI Fix ▼</span>}
              </div>
            </div>
            {expanded === v.vuln_id && v.ai_fix && (
              <div className="px-4 pb-4 border-t border-zinc-800 bg-zinc-950/60">
                <p className="text-xs text-zinc-400 mb-2 mt-3 font-bold uppercase tracking-widest">AI-Suggested Fix</p>
                <pre className="text-xs text-green-400 bg-black/60 rounded-xl p-3 overflow-x-auto whitespace-pre-wrap border border-zinc-800">{v.ai_fix}</pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
