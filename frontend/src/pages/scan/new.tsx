import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

const ATTACKS = [
  { name: 'ZAP Spider + Scan',        icon: '🕷️', desc: 'Crawl all pages then active scan' },
  { name: 'Nikto Web Scan',           icon: '🔍', desc: 'Server vulnerabilities & misconfigs' },
  { name: 'Security Headers Missing', icon: '🛡️', desc: 'CSP, HSTS, X-Frame-Options, etc.' },
  { name: 'Sensitive File Exposure',  icon: '📂', desc: '.env, .git, wp-config, secrets.json' },
  { name: 'XSS (Reflected)',          icon: '⚡', desc: 'Script injection in URL params' },
  { name: 'SQL Injection',            icon: '💉', desc: 'Error-based DB injection (real payloads)' },
  { name: 'XXE Injection',            icon: '📄', desc: 'XML external entity file disclosure' },
  { name: 'CSV Injection',            icon: '📊', desc: 'Formula injection in input fields' },
]

interface Step {
  attack: string
  status: 'pending' | 'running' | 'done' | 'error'
  found: number
  detail?: string
}

interface FakeResult {
  is_fake: boolean
  confidence: number
  verdict: 'ONLINE' | 'OFFLINE' | 'ERROR' | 'FAKE' | 'SUSPICIOUS'
  reasons: string[]
  checks: Record<string, any>
}

// ── Website Availability Modal ────────────────────────────────────────────────
function FakeModal({ result, url, onProceed, onCancel }: {
  result: FakeResult; url: string; onProceed: () => void; onCancel: () => void
}) {
  const isOffline = result.verdict === 'OFFLINE' || result.verdict === 'FAKE'
  const isError   = result.verdict === 'ERROR' || result.verdict === 'SUSPICIOUS'
  const isOnline  = result.verdict === 'ONLINE'

  const borderCls = isOffline ? 'border-red-500/50'   : isError ? 'border-amber-500/50' : 'border-green-500/50'
  const barCls    = isOffline ? 'bg-red-500'           : isError ? 'bg-amber-500'        : 'bg-green-500'
  const titleCls  = isOffline ? 'text-red-400'         : isError ? 'text-amber-400'      : 'text-green-400'
  const bgGlow    = isOffline ? 'bg-red-500/5'         : isError ? 'bg-amber-500/5'      : 'bg-green-500/5'
  const icon      = isOffline ? '🚫'                   : isError ? '⚠️'                  : '✅'
  const title     = result.verdict === 'FAKE'       ? 'Fake Website'       :
                    result.verdict === 'SUSPICIOUS'  ? 'Suspicious Website' :
                    result.verdict === 'OFFLINE'     ? 'Fake Website'       :
                    result.verdict === 'ERROR'       ? 'Server Error'       : 'Website Online'

  if (isOnline) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-4">
      <div className={`w-full max-w-md bg-zinc-950 border ${borderCls} rounded-3xl shadow-2xl overflow-hidden`}>
        <div className={`h-1 w-full ${barCls}`} />

        <div className={`${bgGlow} p-6 space-y-5`}>
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0
              ${isOffline ? 'bg-red-500/10' : isError ? 'bg-amber-500/10' : 'bg-green-500/10'}`}>
              {icon}
            </div>
            <div className="min-w-0">
              <h2 className={`text-xl font-black uppercase tracking-widest ${titleCls}`}>{title}</h2>
              <p className="text-zinc-500 text-xs mt-0.5 truncate">{url}</p>
            </div>
          </div>

          {/* Message */}
          <div className={`rounded-xl p-4 border ${isOffline ? 'bg-red-500/5 border-red-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
            <ul className="space-y-2">
              {result.reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-300">
                  <span className={`mt-0.5 flex-shrink-0 font-bold ${titleCls}`}>
                    {isOffline ? '✗' : '!'}
                  </span>
                  <span className="leading-snug">{r}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Mini checks */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'HTTPS',     val: result.checks.has_https ? 'Yes' : 'No',   ok: result.checks.has_https },
              { label: 'SSL',       val: result.checks.ssl_valid  ? 'Valid' : 'N/A', ok: result.checks.ssl_valid },
              { label: 'HTTP Code', val: result.checks.status_code ? String(result.checks.status_code) : '—', ok: !isOffline },
            ].map(({ label, val, ok }) => (
              <div key={label} className="bg-zinc-900/60 rounded-xl p-3 text-center border border-zinc-800/50">
                <p className="text-xs text-zinc-500 mb-1">{label}</p>
                <p className={`text-sm font-bold ${ok ? 'text-green-400' : 'text-red-400'}`}>{val}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 text-sm font-semibold hover:bg-zinc-900 transition-colors">
              Cancel
            </button>
            {isOffline ? (
              <button disabled
                className="flex-1 py-2.5 rounded-xl bg-red-500/10 text-red-500 text-sm font-semibold cursor-not-allowed border border-red-500/20">
                Fake Website
              </button>
            ) : (
              <button onClick={onProceed}
                className="flex-1 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-sm font-semibold transition-colors border border-amber-500/20">
                Scan Anyway
              </button>
            )}
          </div>

          {isOffline && (
            <p className="text-xs text-red-500/60 text-center -mt-2">
              This website does not exist or cannot be reached.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function NewScan() {
  const router = useRouter()
  const [url, setUrl]           = useState('')
  const [scanId, setScanId]     = useState<number | null>(null)
  const [steps, setSteps]       = useState<Record<string, Step>>({})
  const [scanning, setScanning] = useState(false)
  const [done, setDone]         = useState(false)
  const [elapsed, setElapsed]   = useState(0)
  const [error, setError]       = useState('')
  const [checking, setChecking] = useState(false)
  const [fakeResult, setFakeResult] = useState<FakeResult | null>(null)
  const [pendingUrl, setPendingUrl] = useState('')

  const pollRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const failsRef = useRef(0)

  // Pre-fill URL from query param
  useEffect(() => {
    if (router.query.url) setUrl(decodeURIComponent(router.query.url as string))
  }, [router.query.url])

  function stopPolling() {
    if (pollRef.current)  clearInterval(pollRef.current)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  async function handleSubmit() {
    if (!url.trim()) { setError('Enter a target URL'); return }
    setError('')
    setChecking(true)
    setPendingUrl(url.trim())

    // Wake up Railway backends in background
    axios.get('/api/warmup').catch(() => {})

    try {
      const res = await axios.post('/api/check-fake', { url: url.trim() })
      const data: FakeResult = res.data
      // Only show popup if site is OFFLINE or ERROR — skip popup if ONLINE
      if (data.verdict === 'ONLINE') {
        await launchScan(url.trim())
      } else {
        setFakeResult(data)
      }
    } catch {
      // If check itself fails, just scan anyway
      await launchScan(url.trim())
    } finally {
      setChecking(false)
    }
  }

  async function handleProceed() {
    setFakeResult(null)
    await launchScan(pendingUrl)
  }

  async function launchScan(target: string) {
    setScanning(true); setDone(false); setElapsed(0); failsRef.current = 0
    const init: Record<string, Step> = {}
    ATTACKS.forEach(a => { init[a.name] = { attack: a.name, status: 'pending', found: 0 } })
    setSteps(init)
    try {
      const res = await axios.post('/api/scan/start', { target_url: target })
      const id: number = res.data.scan_id
      setScanId(id)
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
      pollRef.current  = setInterval(async () => {
        try {
          const r = await axios.get(`/api/scan/${id}/progress`)
          const data: Step[] = r.data
          failsRef.current = 0
          if (!Array.isArray(data) || data.length === 0) return
          const map: Record<string, Step> = {}
          data.forEach((s: Step) => { map[s.attack] = s })
          setSteps(map)
          const allDone = ATTACKS.every(a => { const s = map[a.name]; return s && (s.status === 'done' || s.status === 'error') })
          if (allDone) { setDone(true); setScanning(false); stopPolling() }
        } catch {
          if (++failsRef.current > 15) { setError('Lost connection to scanner.'); setScanning(false); stopPolling() }
        }
      }, 1000)
    } catch {
      setError('Failed to start scan — backend is waking up, please wait 30 seconds and try again.')
      setScanning(false); setSteps({})
    }
  }

  useEffect(() => () => stopPolling(), [])

  const totalFound = Object.values(steps).reduce((s, v) => s + (v.found ?? 0), 0)
  const doneCount  = Object.values(steps).filter(s => s.status === 'done' || s.status === 'error').length
  const progress   = Math.round((doneCount / ATTACKS.length) * 100)

  return (
    <>
      {fakeResult && (
        <FakeModal result={fakeResult} url={pendingUrl} onProceed={handleProceed} onCancel={() => { setFakeResult(null); setPendingUrl('') }} />
      )}
      <main className="max-w-2xl mx-auto px-3 sm:px-6 py-4 sm:py-10 space-y-6">
        <div>
          <p className="section-label mb-1">Scanner</p>
          <h1 className="text-2xl font-black text-white">New Scan</h1>
          <p className="text-zinc-500 text-sm mt-1">Runs ZAP, Nikto, and 6 targeted attacks — takes 1–10 minutes</p>
        </div>

        {/* URL input */}
        <div className="card space-y-4">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Target URL</label>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <input type="url" placeholder="https://target.example.com" value={url}
                disabled={scanning || checking}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !scanning && !checking && handleSubmit()}
                className="input pl-11 disabled:opacity-50" />
            </div>
            <button onClick={handleSubmit} disabled={scanning || checking}
              className="btn-primary px-5 disabled:opacity-40 whitespace-nowrap flex items-center gap-2">
              {checking ? (
                <><span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />Checking...</>
              ) : scanning ? (
                <><span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />Scanning...</>
              ) : (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>Scan</>
              )}
            </button>
          </div>
          {error && (
            <p className="text-red-400 text-xs flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </p>
          )}
          {checking && (
            <p className="text-xs text-amber-400/80 flex items-center gap-1.5">
              <span className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin inline-block" />
              Checking if this website is fake or phishing...
            </p>
          )}
        </div>

        {/* Live scan panel */}
        {(scanning || done) && Object.keys(steps).length > 0 && (
          <div className="card space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  {!done && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-200 opacity-75" />}
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${done ? 'bg-green-400' : 'bg-zinc-200'}`} />
                </span>
                <span className="text-sm font-bold text-zinc-200">
                  {done ? 'Scan Complete' : `Scanning... (${doneCount}/${ATTACKS.length})`}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-600">
                <span>{elapsed}s</span>
                {scanId && <span className="text-zinc-700">#{scanId}</span>}
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-700 ${done ? 'bg-green-500' : 'bg-white'}`}
                style={{ width: `${progress}%` }} />
            </div>

            {/* Attack rows */}
            <div className="space-y-2">
              {ATTACKS.map(attack => {
                const step   = steps[attack.name]
                const status = step?.status ?? 'pending'
                const found  = step?.found ?? 0
                const detail = step?.detail ?? ''
                return (
                  <div key={attack.name}
                    className={`flex items-center gap-3 px-3 sm:px-4 py-3 rounded-xl border transition-all duration-300
                      ${status === 'done'    ? 'border-green-500/20 bg-green-500/5' :
                        status === 'running' ? 'border-zinc-500/30 bg-white/5 shadow-sm shadow-white/10' :
                        status === 'error'   ? 'border-red-500/20 bg-red-500/5' :
                                               'border-zinc-900/50 bg-transparent'}`}>
                    {/* Status icon */}
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                      {status === 'running' && <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />}
                      {status === 'done'    && <div className="w-4 h-4 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center"><span className="text-green-400 text-[10px] font-black">✓</span></div>}
                      {status === 'error'   && <div className="w-4 h-4 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center"><span className="text-red-400 text-[10px]">✗</span></div>}
                      {status === 'pending' && <div className="w-4 h-4 rounded-full border border-zinc-800" />}
                    </div>
                    <span className="text-base flex-shrink-0">{attack.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold leading-tight
                        ${status === 'done'    ? 'text-green-400' :
                          status === 'running' ? 'text-zinc-200' :
                          status === 'error'   ? 'text-red-400' : 'text-zinc-400'}`}>
                        {attack.name}
                      </p>
                      <p className="text-xs text-zinc-400 leading-tight mt-0.5 truncate">
                        {status === 'running' && detail ? detail : attack.desc}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {status === 'running' && <span className="text-xs text-zinc-300 animate-pulse font-mono">running</span>}
                      {status === 'done' && (
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold font-mono
                          ${found > 0 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'}`}>
                          {found > 0 ? `${found} found` : 'clean'}
                        </span>
                      )}
                      {status === 'pending' && <span className="text-xs text-zinc-500 font-mono">waiting</span>}
                      {status === 'error'   && <span className="text-xs text-red-500 font-mono">error</span>}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Done footer */}
            {done && (
              <div className="pt-4 border-t border-zinc-900 flex items-center justify-between">
                <span className="text-sm">
                  {totalFound > 0
                    ? <><span className="text-red-400 font-bold">{totalFound}</span><span className="text-zinc-400"> issue{totalFound !== 1 ? 's' : ''} found in {elapsed}s</span></>
                    : <span className="text-zinc-500">No issues found · {elapsed}s</span>}
                </span>
                <button onClick={() => router.push('/reports')} className="btn-primary text-sm px-5 py-2">
                  View Report →
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  )
}
