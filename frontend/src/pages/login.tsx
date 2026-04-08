import { useState, FormEvent } from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function Login() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await axios.post('/api/auth/login', { username, password })
      localStorage.setItem('token', res.data.token)
      router.push('/dashboard')
    } catch {
      setError('Invalid credentials. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-white/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage: 'linear-gradient(#06b6d4 1px, transparent 1px), linear-gradient(90deg, #06b6d4 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-950 border border-zinc-800 mb-4 shadow-xl">
            <svg width="36" height="36" viewBox="0 0 100 100" fill="none">
              <path d="M50 5 L90 20 L90 55 C90 75 70 92 50 98 C30 92 10 75 10 55 L10 20 Z" fill="#0f172a" stroke="#06b6d4" strokeWidth="3.5" />
              <path d="M28 38 L22 18 L38 30 Z" fill="#06b6d4" />
              <path d="M72 38 L78 18 L62 30 Z" fill="#06b6d4" />
              <ellipse cx="50" cy="58" rx="22" ry="20" fill="#111827" />
              <ellipse cx="41" cy="54" rx="5" ry="6" fill="#06b6d4" />
              <ellipse cx="59" cy="54" rx="5" ry="6" fill="#06b6d4" />
              <ellipse cx="41" cy="55" rx="2" ry="4" fill="#000" />
              <ellipse cx="59" cy="55" rx="2" ry="4" fill="#000" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-white tracking-widest uppercase">OMEN</h1>
          <p className="text-zinc-500 text-sm mt-1">Intelligent Vulnerability Scanner</p>
        </div>

        {/* Card */}
        <div className="card">
          <h2 className="text-lg font-bold text-white mb-6">Sign In</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-zinc-400 uppercase tracking-widest font-bold mb-2">Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} required
                className="input" placeholder="your username" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 uppercase tracking-widest font-bold mb-2">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="input" placeholder="••••••••" />
            </div>
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full btn-primary py-3 mt-2 flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-500 mt-5">
          <Link href="/" className="text-zinc-400 hover:text-zinc-300 transition-colors">← Back to Home</Link>
        </p>
      </div>
    </div>
  )
}
