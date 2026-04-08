import { useState } from 'react'

interface Config { zapBaseUrl: string; burpGraphqlUrl: string; openaiModel: string }
const DEFAULTS: Config = { zapBaseUrl: 'http://localhost:8080', burpGraphqlUrl: '', openaiModel: 'mistralai/mistral-7b-instruct:free' }
const FIELDS = [
  { key: 'zapBaseUrl'     as const, label: 'ZAP Base URL',          placeholder: 'http://localhost:8080',              desc: 'OWASP ZAP daemon address. Default if running via Docker Compose.' },
  { key: 'burpGraphqlUrl' as const, label: 'Burp Suite GraphQL URL', placeholder: 'http://burp-host:1337/graphql',      desc: 'Optional. Burp Suite Pro GraphQL API for extended scanning.' },
  { key: 'openaiModel'    as const, label: 'AI Model',               placeholder: 'mistralai/mistral-7b-instruct:free', desc: 'OpenRouter model for AI fix generation. Free tier: mistral-7b.' },
]

export default function Settings() {
  const [config, setConfig] = useState<Config>(DEFAULTS)
  const [saved, setSaved]   = useState(false)

  function handleSave() {
    localStorage.setItem('omen_config', JSON.stringify(config))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <main className="max-w-2xl mx-auto px-3 sm:px-6 py-4 sm:py-10 space-y-6">
        <div>
          <p className="section-label mb-1">Configuration</p>
          <h1 className="text-2xl font-black text-white">Settings</h1>
          <p className="text-zinc-500 text-sm mt-1">Configure scanner integrations and AI model</p>
        </div>

        <div className="card space-y-6">
          {FIELDS.map(({ key, label, placeholder, desc }) => (
            <div key={key}>
              <label className="block text-xs text-zinc-400 font-semibold uppercase tracking-widest mb-2">{label}</label>
              <input type="text" value={config[key]} placeholder={placeholder}
                onChange={e => { setConfig(p => ({ ...p, [key]: e.target.value })); setSaved(false) }}
                className="input" />
              <p className="text-xs text-zinc-400 mt-1.5">{desc}</p>
            </div>
          ))}
          <div className="pt-2 flex items-center gap-4 border-t border-zinc-900">
            <button onClick={handleSave} className="btn-primary">Save Settings</button>
            {saved && (
              <span className="text-green-400 text-sm flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Saved successfully
              </span>
            )}
          </div>
        </div>

        <div className="bg-white/5 border border-zinc-500/15 rounded-2xl p-5">
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mb-2">Note</p>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Settings are saved locally in your browser. For production, configure environment variables
            in <code className="text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded">.env</code> files instead.
          </p>
        </div>
      </main>
  )
}
