import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'

function OmenLogo() {
  return (
    <svg width="36" height="40" viewBox="0 0 100 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="100" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#e4e4e7" />
          <stop offset="50%"  stopColor="#a1a1aa" />
          <stop offset="100%" stopColor="#52525b" />
        </linearGradient>
      </defs>
      <path d="M50 4 L92 20 L92 60 C92 83 72 99 50 107 C28 99 8 83 8 60 L8 20 Z" fill="#111" />
      <path d="M50 4 L92 20 L92 60 C92 83 72 99 50 107 C28 99 8 83 8 60 L8 20 Z"
        fill="none" stroke="url(#sg)" strokeWidth="2.5" />
      <path d="M28 40 L18 14 L42 32 Z" fill="#111" stroke="url(#sg)" strokeWidth="1.8" />
      <path d="M72 40 L82 14 L58 32 Z" fill="#111" stroke="url(#sg)" strokeWidth="1.8" />
      <ellipse cx="50" cy="64" rx="26" ry="24" fill="#0d0d0d" />
      <ellipse cx="39" cy="59" rx="7" ry="8" fill="#e4e4e7" opacity="0.9" />
      <ellipse cx="61" cy="59" rx="7" ry="8" fill="#e4e4e7" opacity="0.9" />
      <ellipse cx="39" cy="60" rx="3" ry="6" fill="#000" />
      <ellipse cx="61" cy="60" rx="3" ry="6" fill="#000" />
      <ellipse cx="37" cy="57" rx="1.2" ry="1.5" fill="white" opacity="0.9" />
      <ellipse cx="59" cy="57" rx="1.2" ry="1.5" fill="white" opacity="0.9" />
      <path d="M47.5 68 L50 65.5 L52.5 68 L50 70.5 Z" fill="#a1a1aa" />
      <path d="M45 70.5 Q50 75 55 70.5" stroke="#71717a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <line x1="20" y1="67" x2="42" y2="69" stroke="#71717a" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="20" y1="71" x2="42" y2="71" stroke="#71717a" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="80" y1="67" x2="58" y2="69" stroke="#71717a" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="80" y1="71" x2="58" y2="71" stroke="#71717a" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

const NAV = [
  { href: '/',          label: 'Home',      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
  { href: '/dashboard', label: 'Dashboard', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
  { href: '/scan/new',  label: 'New Scan',  icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> },
  { href: '/reports',   label: 'Reports',   icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
  { href: '/settings',  label: 'Settings',  icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
]

// ── Shared nav content (used in both sidebar and drawer) ──────────────────────
function NavContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const router = useRouter()
  return (
    <>
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest px-3 mb-3">
          Navigation
        </p>
        {NAV.map(({ href, label, icon }) => {
          const active = router.pathname === href ||
            (href === '/scan/new' && router.pathname.startsWith('/scan'))
          return (
            <Link key={href} href={href}
              onClick={onLinkClick}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-semibold transition-all duration-150 group
                ${active
                  ? 'text-white border border-zinc-700'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60 border border-transparent'
                }`}
              style={active ? { backgroundColor: '#1e1e24' } : {}}>
              <span className={`flex-shrink-0 ${active ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                {icon}
              </span>
              <span>{label}</span>
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 pb-5 pt-3" style={{ borderTop: '1px solid #2a2a32' }}>
        <Link href="/scan/new" onClick={onLinkClick}
          className="flex items-center justify-center gap-2 w-full bg-white hover:bg-zinc-200 text-black font-extrabold py-3 rounded-xl text-sm transition-all shadow-lg shadow-white/5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          New Scan
        </Link>
        <p className="text-center text-[10px] text-zinc-700 mt-3 font-medium">OMEN v0.1.0</p>
      </div>
    </>
  )
}

// ── Logo + title header (shared) ──────────────────────────────────────────────
function SidebarHeader() {
  return (
    <Link href="/" className="flex items-center gap-3 px-5 py-5 group"
      style={{ borderBottom: '1px solid #2a2a32' }}>
      <div className="relative flex-shrink-0">
        <div className="absolute inset-0 bg-zinc-400/10 rounded-full blur-md group-hover:bg-zinc-400/20 transition-all" />
        <OmenLogo />
      </div>
      <div>
        <p className="text-base font-black tracking-[0.2em] text-white uppercase leading-none">OMEN</p>
        <p className="text-[10px] text-zinc-500 tracking-widest uppercase mt-0.5 leading-none font-semibold">
          Vulnerability Scanner
        </p>
      </div>
    </Link>
  )
}

// ── Desktop sidebar (hidden on mobile) ───────────────────────────────────────
export function DesktopSidebar() {
  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 flex-col z-40"
      style={{ backgroundColor: '#0e0e12', borderRight: '1px solid #2a2a32' }}>
      <SidebarHeader />
      <NavContent />
    </aside>
  )
}

// ── Mobile top bar + slide-in drawer ─────────────────────────────────────────
export function MobileNav() {
  const [open, setOpen] = useState(false)

  // Close on route change
  const router = useRouter()
  useEffect(() => { setOpen(false) }, [router.pathname])

  // Prevent body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14"
        style={{ backgroundColor: '#0e0e12', borderBottom: '1px solid #2a2a32' }}>
        <Link href="/" className="flex items-center gap-2.5">
          <OmenLogo />
          <span className="text-base font-black tracking-[0.2em] text-white uppercase">OMEN</span>
        </Link>
        <button onClick={() => setOpen(o => !o)}
          className="w-10 h-10 flex items-center justify-center rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
          aria-label="Toggle menu">
          {open ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </header>

      {/* Backdrop */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)} />
      )}

      {/* Slide-in drawer */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-screen w-72 z-50 flex flex-col transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ backgroundColor: '#0e0e12', borderRight: '1px solid #2a2a32' }}>
        <SidebarHeader />
        <NavContent onLinkClick={() => setOpen(false)} />
      </aside>
    </>
  )
}

// ── Default export (used in _app.tsx) ─────────────────────────────────────────
export default function Sidebar() {
  return (
    <>
      <DesktopSidebar />
      <MobileNav />
    </>
  )
}
