import Link from 'next/link'

const FEATURES = [
  { icon: '🕷️', title: 'ZAP Spider + Active Scan',  desc: 'Full crawl and active attack via OWASP ZAP' },
  { icon: '🔍', title: 'Nikto Web Scanner',          desc: 'Detect misconfigs, outdated software & dangerous files' },
  { icon: '🛡️', title: 'Security Headers',           desc: 'CSP, HSTS, X-Frame-Options and 5 more checks' },
  { icon: '📂', title: 'Sensitive File Exposure',    desc: '.env, .git, wp-config, SSH keys and 45+ paths' },
  { icon: '⚡', title: 'Reflected XSS',              desc: '1000+ payloads across all URL parameters' },
  { icon: '💉', title: 'SQL Injection',              desc: 'Error-based detection with real Burp payloads' },
  { icon: '📄', title: 'XXE Injection',              desc: 'File disclosure via XML external entities' },
  { icon: '📊', title: 'CSV Injection',              desc: 'Spreadsheet formula injection in input fields' },
]

const STATS = [
  { value: '8',     label: 'Attack Modules' },
  { value: '1000+', label: 'XSS Payloads'   },
  { value: 'AI',    label: 'Fix Generation'  },
  { value: 'PDF',   label: 'Auto Reports'    },
]

// ── Big SVG Logo ──────────────────────────────────────────────────────────────
function BigLogo() {
  return (
    <svg width="220" height="240" viewBox="0 0 100 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sh1" x1="0" y1="0" x2="100" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#e4e4e7" />
          <stop offset="45%"  stopColor="#a1a1aa" />
          <stop offset="100%" stopColor="#52525b" />
        </linearGradient>
        <linearGradient id="sh2" x1="100" y1="0" x2="0" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#71717a" />
          <stop offset="100%" stopColor="#27272a" />
        </linearGradient>
        <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="1" />
          <stop offset="100%" stopColor="#d4d4d8" stopOpacity="0.7" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="softglow">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Shield outer chrome border */}
      <path d="M50 4 L92 20 L92 60 C92 83 72 99 50 107 C28 99 8 83 8 60 L8 20 Z"
        fill="url(#sh2)" />
      {/* Shield inner body */}
      <path d="M50 9 L87 23 L87 60 C87 80 69 95 50 102 C31 95 13 80 13 60 L13 23 Z"
        fill="#0a0a0a" />
      {/* Chrome edge highlight */}
      <path d="M50 4 L92 20 L92 60 C92 83 72 99 50 107"
        stroke="url(#sh1)" strokeWidth="1.5" fill="none" opacity="0.6" />
      <path d="M50 4 L8 20 L8 60 C8 83 28 99 50 107"
        stroke="#3f3f46" strokeWidth="1" fill="none" opacity="0.4" />

      {/* Cat ears */}
      <path d="M28 40 L18 14 L42 32 Z" fill="#111" stroke="url(#sh1)" strokeWidth="1.8" />
      <path d="M72 40 L82 14 L58 32 Z" fill="#111" stroke="url(#sh1)" strokeWidth="1.8" />
      {/* Inner ear */}
      <path d="M30 39 L22 18 L40 31 Z" fill="#1a1a1a" />
      <path d="M70 39 L78 18 L60 31 Z" fill="#1a1a1a" />

      {/* Cat face */}
      <ellipse cx="50" cy="64" rx="26" ry="24" fill="#0d0d0d" />

      {/* Eyes with glow */}
      <ellipse cx="39" cy="59" rx="7" ry="8" fill="url(#eyeGlow)" filter="url(#glow)" />
      <ellipse cx="61" cy="59" rx="7" ry="8" fill="url(#eyeGlow)" filter="url(#glow)" />
      {/* Pupils */}
      <ellipse cx="39" cy="60" rx="3" ry="6" fill="#000" />
      <ellipse cx="61" cy="60" rx="3" ry="6" fill="#000" />
      {/* Eye shine */}
      <ellipse cx="37" cy="57" rx="1.2" ry="1.5" fill="white" opacity="0.9" />
      <ellipse cx="59" cy="57" rx="1.2" ry="1.5" fill="white" opacity="0.9" />

      {/* Nose */}
      <path d="M47.5 68 L50 65.5 L52.5 68 L50 70.5 Z" fill="#a1a1aa" />

      {/* Mouth */}
      <path d="M45 70.5 Q50 75 55 70.5" stroke="#71717a" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Whiskers */}
      <line x1="20" y1="67" x2="42" y2="69" stroke="#71717a" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="20" y1="71" x2="42" y2="71" stroke="#71717a" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="80" y1="67" x2="58" y2="69" stroke="#71717a" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="80" y1="71" x2="58" y2="71" stroke="#71717a" strokeWidth="1.2" strokeLinecap="round" />

      {/* Fur detail lines */}
      <path d="M38 75 Q42 80 46 78" stroke="#2a2a2a" strokeWidth="1" fill="none" />
      <path d="M62 75 Q58 80 54 78" stroke="#2a2a2a" strokeWidth="1" fill="none" />

      {/* Bottom shield chrome */}
      <path d="M20 85 Q50 102 80 85" stroke="url(#sh1)" strokeWidth="1" fill="none" opacity="0.4" />
    </svg>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#111113' }}>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[92vh] flex items-center">

        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Subtle grid */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '70px 70px' }} />
          {/* Silver radial glow behind logo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(161,161,170,0.06) 0%, transparent 70%)' }} />
          {/* Top edge glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-1 opacity-30"
            style={{ background: 'linear-gradient(90deg, transparent, #a1a1aa, transparent)' }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12 lg:py-20 w-full relative">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-24">

            {/* ── Left: Text ── */}
            <div className="flex-1 text-center lg:text-left">
              {/* Status badge */}
              <div className="inline-flex items-center gap-2.5 mb-8 px-4 py-2 rounded-full border"
                style={{ backgroundColor: '#1a1a1f', borderColor: '#2e2e38' }}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-30" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                </span>
                <span className="text-xs font-bold text-zinc-300 tracking-widest uppercase">
                  AI-Powered DAST Scanner
                </span>
              </div>

              {/* Main headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-[1.0] tracking-tight mb-6">
                <span className="text-white">Hunt</span>
                <br />
                <span style={{ background: 'linear-gradient(135deg, #e4e4e7 0%, #a1a1aa 50%, #71717a 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Vulnerabilities
                </span>
                <br />
                <span className="text-white">Like a</span>{' '}
                <span style={{ background: 'linear-gradient(135deg, #ffffff 0%, #d4d4d8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Predator
                </span>
              </h1>

              <p className="text-zinc-300 text-lg leading-relaxed mb-10 max-w-lg font-medium">
                OMEN runs 8 attack modules — ZAP, Nikto, XSS, SQLi, XXE and more —
                then uses AI to generate code fixes for every vulnerability found.
              </p>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/scan/new"
                  className="flex items-center justify-center gap-2.5 bg-white hover:bg-zinc-200 text-black font-extrabold px-8 py-4 rounded-2xl text-base transition-all shadow-2xl shadow-white/10 hover:shadow-white/20">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Start Scanning
                </Link>
                <Link href="/dashboard"
                  className="flex items-center justify-center gap-2.5 font-bold px-8 py-4 rounded-2xl text-base transition-all text-zinc-300 hover:text-white border"
                  style={{ borderColor: '#2e2e38', backgroundColor: '#1a1a1f' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#52525b')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#2e2e38')}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  View Dashboard
                </Link>
              </div>

              {/* Stats row */}
              <div className="flex flex-wrap gap-6 mt-10 justify-center lg:justify-start">
                {STATS.map(({ value, label }) => (
                  <div key={label}>
                    <p className="text-2xl font-black text-white">{value}</p>
                    <p className="text-xs text-zinc-500 font-semibold uppercase tracking-widest mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: Big Logo — hidden on small mobile, shown md+ ── */}
            <div className="hidden sm:flex flex-shrink-0 flex-col items-center gap-6">
              {/* Outer ring */}
              <div className="relative">
                {/* Animated ring */}
                <div className="absolute inset-0 rounded-full animate-spin"
                  style={{
                    width: '320px', height: '320px',
                    background: 'conic-gradient(from 0deg, transparent 0%, rgba(161,161,170,0.15) 25%, transparent 50%, rgba(161,161,170,0.08) 75%, transparent 100%)',
                    animationDuration: '8s',
                  }} />
                {/* Static outer ring */}
                <div className="rounded-full flex items-center justify-center"
                  style={{
                    width: '320px', height: '320px',
                    background: 'radial-gradient(circle at 30% 30%, rgba(161,161,170,0.08) 0%, rgba(0,0,0,0) 60%)',
                    border: '1px solid rgba(161,161,170,0.12)',
                  }}>
                  {/* Inner ring */}
                  <div className="rounded-full flex items-center justify-center"
                    style={{
                      width: '240px', height: '240px',
                      background: 'radial-gradient(circle at 35% 35%, rgba(161,161,170,0.06) 0%, transparent 70%)',
                      border: '1px solid rgba(161,161,170,0.08)',
                    }}>
                    {/* Logo container */}
                    <div className="relative flex items-center justify-center"
                      style={{
                        width: '170px', height: '170px',
                        background: 'radial-gradient(circle, rgba(161,161,170,0.05) 0%, transparent 70%)',
                        borderRadius: '50%',
                      }}>
                      <BigLogo />
                    </div>
                  </div>
                </div>

                {/* Floating badges around logo */}
                <div className="absolute top-6 -right-4 px-3 py-1.5 rounded-full text-xs font-bold text-white border"
                  style={{ backgroundColor: '#1a1a1f', borderColor: '#3f3f46' }}>
                  🛡️ 8 Modules
                </div>
                <div className="absolute bottom-10 -left-6 px-3 py-1.5 rounded-full text-xs font-bold text-white border"
                  style={{ backgroundColor: '#1a1a1f', borderColor: '#3f3f46' }}>
                  🤖 AI Fixes
                </div>
                <div className="absolute bottom-4 right-0 px-3 py-1.5 rounded-full text-xs font-bold text-white border"
                  style={{ backgroundColor: '#1a1a1f', borderColor: '#3f3f46' }}>
                  📄 PDF Reports
                </div>
              </div>

              {/* OMEN wordmark under logo */}
              <div className="text-center">
                <p className="text-4xl font-black tracking-[0.35em] uppercase"
                  style={{ background: 'linear-gradient(135deg, #e4e4e7 0%, #a1a1aa 50%, #71717a 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  OMEN
                </p>
                <p className="text-xs text-zinc-600 tracking-[0.2em] uppercase font-semibold mt-1">
                  Vulnerability Scanner
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, #2e2e38, transparent)' }} />

      {/* ── Features grid ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-16 lg:py-20">
        <div className="text-center mb-14">
          <p className="section-label mb-3">Attack Modules</p>
          <h2 className="text-4xl font-black text-white">8 Scanners. One Platform.</h2>
          <p className="text-zinc-400 text-base mt-3 max-w-lg mx-auto font-medium">
            Every scan runs all modules sequentially with live per-module progress tracking
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(({ icon, title, desc }) => (
            <div key={title}
              className="rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1 group cursor-default"
              style={{ backgroundColor: '#1a1a1f', border: '1px solid #2a2a32' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#52525b')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#2a2a32')}>
              <div className="text-2xl mb-3">{icon}</div>
              <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-zinc-300 transition-colors">{title}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed font-medium">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ borderTop: '1px solid #1e1e24', backgroundColor: 'rgba(26,26,31,0.4)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-16 lg:py-20">
          <div className="text-center mb-14">
            <p className="section-label mb-3">Workflow</p>
            <h2 className="text-4xl font-black text-white">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            {[
              { step: '01', title: 'Enter URL',       desc: "Paste any web URL. OMEN checks if it's reachable first, then starts the full scan.", icon: '🌐' },
              { step: '02', title: 'Live Scanning',   desc: '8 attack modules run sequentially. Watch real-time progress per module on the scan page.', icon: '⚡' },
              { step: '03', title: 'AI Fix + Report', desc: 'Every vulnerability gets an AI-generated code fix. Download a full PDF report instantly.', icon: '🤖' },
            ].map(({ step, title, desc, icon }, i) => (
              <div key={step} className="relative">
                {i < 2 && (
                  <div className="hidden sm:block absolute top-8 left-full w-full h-px z-0"
                    style={{ background: 'linear-gradient(90deg, #3f3f46, transparent)' }} />
                )}
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-5 shadow-lg"
                    style={{ backgroundColor: '#1a1a1f', border: '1px solid #2e2e38' }}>
                    {icon}
                  </div>
                  <div className="text-xs font-bold text-zinc-500 tracking-widest mb-2 uppercase">Step {step}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed font-medium">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-8 py-16 lg:py-20 text-center">
        <div className="relative rounded-3xl p-14 overflow-hidden"
          style={{ backgroundColor: '#1a1a1f', border: '1px solid #2e2e38' }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(161,161,170,0.06) 0%, transparent 60%)' }} />
          <div className="relative">
            <div className="text-5xl mb-5">🛡️</div>
            <h2 className="text-4xl font-black text-white mb-3">Ready to hunt?</h2>
            <p className="text-zinc-400 text-base mb-10 font-medium">Takes 1–10 minutes. No setup required.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/scan/new"
                className="flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-black font-extrabold px-10 py-4 rounded-2xl text-base transition-all shadow-xl shadow-white/10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Start a New Scan
              </Link>
              <Link href="/dashboard"
                className="flex items-center justify-center gap-2 font-bold px-10 py-4 rounded-2xl text-base transition-all text-zinc-300 hover:text-white border"
                style={{ borderColor: '#3f3f46' }}>
                View Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid #1e1e24' }} className="py-8">
        <p className="text-center text-xs text-zinc-700 font-medium tracking-wide">
          OMEN — Intelligent Web Vulnerability Scanner &nbsp;·&nbsp; Next.js · FastAPI · OWASP ZAP · Mistral AI
        </p>
      </footer>
    </div>
  )
}
