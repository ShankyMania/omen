import Link from 'next/link'
import { useRouter } from 'next/router'

function OmenLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 5 L90 20 L90 55 C90 75 70 92 50 98 C30 92 10 75 10 55 L10 20 Z"
        fill="#0f172a" stroke="#06b6d4" strokeWidth="3.5" />
      <path d="M28 38 L22 18 L38 30 Z" fill="#06b6d4" />
      <path d="M72 38 L78 18 L62 30 Z" fill="#06b6d4" />
      <path d="M30 37 L25 22 L37 31 Z" fill="#0a1628" />
      <path d="M70 37 L75 22 L63 31 Z" fill="#0a1628" />
      <ellipse cx="50" cy="58" rx="22" ry="20" fill="#111827" />
      <ellipse cx="41" cy="54" rx="5" ry="6" fill="#06b6d4" />
      <ellipse cx="59" cy="54" rx="5" ry="6" fill="#06b6d4" />
      <ellipse cx="41" cy="55" rx="2" ry="4" fill="#000" />
      <ellipse cx="59" cy="55" rx="2" ry="4" fill="#000" />
      <path d="M48 62 L50 60 L52 62 L50 64 Z" fill="#06b6d4" />
      <line x1="28" y1="61" x2="44" y2="63" stroke="#06b6d4" strokeWidth="1" opacity="0.6" />
      <line x1="28" y1="65" x2="44" y2="65" stroke="#06b6d4" strokeWidth="1" opacity="0.6" />
      <line x1="72" y1="61" x2="56" y2="63" stroke="#06b6d4" strokeWidth="1" opacity="0.6" />
      <line x1="72" y1="65" x2="56" y2="65" stroke="#06b6d4" strokeWidth="1" opacity="0.6" />
      <path d="M47 64 Q50 67 53 64" stroke="#06b6d4" strokeWidth="1.5" fill="none" />
    </svg>
  )
}

const NAV_LINKS = [
  {
    href: '/',
    label: 'Home',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    href: '/scan/new',
    label: 'New Scan',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    href: '/reports',
    label: 'Reports',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

export default function Header() {
  const router = useRouter()

  return (
    <header className="bg-[#0a0f1e]/95 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-md group-hover:bg-cyan-500/30 transition-all" />
            <OmenLogo />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-[0.2em] text-white uppercase leading-none">
              OMEN
            </span>
            <span className="text-[9px] text-cyan-500/70 tracking-widest uppercase leading-none mt-0.5">
              Vulnerability Scanner
            </span>
          </div>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {NAV_LINKS.map(({ href, label, icon }) => {
            const active = router.pathname === href ||
              (href === '/scan/new' && router.pathname.startsWith('/scan'))
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200
                  ${active
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
              >
                <span className={active ? 'text-cyan-400' : 'text-slate-600'}>{icon}</span>
                <span className="hidden sm:inline">{label}</span>
              </Link>
            )
          })}

          {/* Scan CTA */}
          <Link
            href="/scan/new"
            className="ml-2 flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 text-sm font-bold px-4 py-2 rounded-xl transition-all duration-200 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/30"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Scan</span>
          </Link>
        </nav>
      </div>
    </header>
  )
}
