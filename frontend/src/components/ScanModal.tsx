import { useEffect, useRef, useState } from 'react'
import axios from 'axios'

interface Step {
  attack: string
  status: 'pending' | 'running' | 'done' | 'error'
  found: number
}

interface Props {
  scanId: number | null
  isOpen: boolean
  onClose: () => void
}

const ATTACKS = [
  { name: 'ZAP Spider + Scan',        icon: '🕷️', desc: 'Crawl all pages then active scan' },
  { name: 'XSS (Reflected)',          icon: '⚡', desc: 'Script injection in URL params' },
  { name: 'SQL Injection',            icon: '💉', desc: 'Error-based DB injection (real payloads)' },
  { name: 'XXE Injection',            icon: '📄', desc: 'XML external entity file disclosure' },
  { name: 'CSV Injection',            icon: '📊', desc: 'Formula injection in input fields' },
  { name: 'Security Headers Missing', icon: '🛡️', desc: 'CSP, HSTS, X-Frame-Options, etc.' },
  { name: 'Sensitive File Exposure',  icon: '📂', desc: '.env, .git, wp-config, secrets.json' },
]

const HARD_TIMEOUT_MS = 60_000  // 60s max

export default function ScanModal({ scanId, isOpen, onClose }: Props) {
  const [steps, setSteps] = useState<Record<string, Step>>({})
  const [done, setDone] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null)
  const deadlineRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!isOpen || !scanId) return
    setSteps({})
    setDone(false)
    setElapsed(0)

    // elapsed counter
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000)

    // hard timeout — force done after HARD_TIMEOUT_MS
    deadlineRef.current = setTimeout(() => {
      setDone(true)
      clearAll()
    }, HARD_TIMEOUT_MS)

    // poll progress — via Next.js API proxy
    intervalRef.current = setInterval(async () => {
      try {
        const res = await axios.get(`/api/scan/${scanId}/progress`)
        const data: Step[] = res.data
        if (!Array.isArray(data) || data.length === 0) return
        const map: Record<string, Step> = {}
        data.forEach(s => { map[s.attack] = s })
        setSteps(map)

        const allDone = ATTACKS.every(a => {
          const s = map[a.name]
          return s && (s.status === 'done' || s.status === 'error')
        })
        if (allDone) {
          setDone(true)
          clearAll()
        }
      } catch { /* ignore */ }
    }, 1500)

    return clearAll
  }, [isOpen, scanId])

  function clearAll() {
    if (intervalRef.current)  clearInterval(intervalRef.current)
    if (timerRef.current)     clearInterval(timerRef.current)
    if (deadlineRef.current)  clearTimeout(deadlineRef.current)
  }

  if (!isOpen) return null

  const totalFound = Object.values(steps).reduce((s, v) => s + (v.found ?? 0), 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-950 border border-red-900/50 rounded-2xl w-full max-w-md mx-4 shadow-2xl shadow-red-950/40">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-red-900/30">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              {!done && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${done ? 'bg-green-500' : 'bg-red-500'}`} />
            </span>
            <span className="text-sm font-semibold text-zinc-200">
              {done ? 'Scan Complete' : 'Attacking Target...'}
            </span>
          </div>
          <span className="text-xs text-zinc-600">{elapsed}s</span>
        </div>

        {/* Steps */}
        <div className="px-6 py-4 space-y-2">
          {ATTACKS.map(attack => {
            const step = steps[attack.name]
            const status = step?.status ?? 'pending'

            return (
              <div key={attack.name} className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300
                ${status === 'done'    ? 'border-green-900/40 bg-green-950/10' :
                  status === 'running' ? 'border-red-700/50 bg-red-950/15' :
                  status === 'error'   ? 'border-red-900/30 bg-zinc-900/30' :
                                         'border-zinc-800/40 bg-zinc-900/10'}`}>

                {/* icon */}
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {status === 'running' && <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />}
                  {status === 'done'    && <span className="text-green-400 text-sm font-bold">✓</span>}
                  {status === 'error'   && <span className="text-red-500 text-sm">✗</span>}
                  {status === 'pending' && <span className="text-zinc-700 text-sm">○</span>}
                </div>

                {/* text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm font-medium truncate
                      ${status === 'done'    ? 'text-green-400' :
                        status === 'running' ? 'text-red-300' :
                        status === 'error'   ? 'text-red-500' : 'text-zinc-600'}`}>
                      {attack.icon} {attack.name}
                    </span>
                    {status === 'done' && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0
                        ${(step?.found ?? 0) > 0
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : 'bg-zinc-900 text-zinc-500 border border-zinc-700'}`}>
                        {step?.found ?? 0} found
                      </span>
                    )}
                    {status === 'running' && (
                      <span className="text-xs text-red-500 animate-pulse flex-shrink-0">running</span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-700 mt-0.5 truncate">{attack.desc}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5">
          {done ? (
            <div className="space-y-3">
              <div className="text-center text-sm text-zinc-400">
                Found <span className={totalFound > 0 ? 'text-red-400 font-semibold' : 'text-zinc-400'}>{totalFound} issue{totalFound !== 1 ? 's' : ''}</span>
              </div>
              <button onClick={onClose} className="w-full btn-primary py-2.5 text-sm font-semibold">
                View Results
              </button>
            </div>
          ) : (
            <p className="text-center text-xs text-zinc-700">
              All 4 attacks run in parallel · auto-completes in ~10s
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
