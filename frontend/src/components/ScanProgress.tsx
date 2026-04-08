import { ScanStatus } from '@/types'

interface Props { status: ScanStatus }

const statusColor: Record<string, string> = {
  pending: 'bg-zinc-600',
  running: 'bg-red-600',
  completed: 'bg-green-600',
  failed: 'bg-red-900',
}

export default function ScanProgress({ status }: Props) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-zinc-400">Scan #{status.scan_id}</span>
        <span className={`text-xs px-2 py-0.5 rounded font-semibold ${statusColor[status.status]} text-white uppercase tracking-widest`}>
          {status.status}
        </span>
      </div>
      <div className="w-full bg-zinc-900 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${statusColor[status.status]}`}
          style={{ width: `${status.progress}%` }}
        />
      </div>
      <p className="text-xs text-zinc-600 mt-2">{status.message || `${status.progress}% complete`}</p>
    </div>
  )
}
