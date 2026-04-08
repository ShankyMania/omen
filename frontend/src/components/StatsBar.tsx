import { Vulnerability } from '@/types'

interface Props { vulns: Vulnerability[] }

export default function StatsBar({ vulns }: Props) {
  const critical = vulns.filter(v => v.cvss_score >= 9).length
  const high = vulns.filter(v => v.cvss_score >= 7 && v.cvss_score < 9).length
  const medium = vulns.filter(v => v.cvss_score >= 4 && v.cvss_score < 7).length
  const low = vulns.filter(v => v.cvss_score < 4).length

  const stats = [
    { label: 'Critical', count: critical, cls: 'text-red-500' },
    { label: 'High', count: high, cls: 'text-orange-400' },
    { label: 'Medium', count: medium, cls: 'text-yellow-400' },
    { label: 'Low', count: low, cls: 'text-zinc-400' },
    { label: 'Total', count: vulns.length, cls: 'text-red-600' },
  ]

  return (
    <div className="grid grid-cols-5 gap-4">
      {stats.map(s => (
        <div key={s.label} className="card text-center">
          <p className={`text-3xl font-bold ${s.cls}`}>{s.count}</p>
          <p className="text-xs text-zinc-600 mt-1 uppercase tracking-widest">{s.label}</p>
        </div>
      ))}
    </div>
  )
}
