import type { NextApiRequest, NextApiResponse } from 'next'

// ── Canonical real domains ────────────────────────────────────────────────────
const CANONICAL: Record<string, string> = {
  sbi: 'sbi.co.in', onlinesbi: 'onlinesbi.sbi', sbicard: 'sbicard.com',
  hdfc: 'hdfcbank.com', icici: 'icicibank.com', axis: 'axisbank.com',
  kotak: 'kotak.com', paytm: 'paytm.com', phonepe: 'phonepe.com',
  google: 'google.com', facebook: 'facebook.com', instagram: 'instagram.com',
  amazon: 'amazon.com', apple: 'apple.com', microsoft: 'microsoft.com',
  paypal: 'paypal.com', netflix: 'netflix.com', youtube: 'youtube.com',
  linkedin: 'linkedin.com', github: 'github.com', twitter: 'twitter.com',
  flipkart: 'flipkart.com', irctc: 'irctc.co.in', whatsapp: 'whatsapp.com',
}

const KNOWN_FAKE = new Set([
  'sbi.com', 'sbionline.com', 'sbi-bank.com', 'sbi-online.com',
  'onlinesbi.com', 'onlinesbi.net', 'sbinetbanking.com',
  'hdfcbank.net', 'hdfc-bank.com', 'icicibank.net',
  'paypal-secure.com', 'paypal-login.com',
  'amazon-login.com', 'amazon-secure.com',
])

const SUSPICIOUS_TLDS = new Set([
  '.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.click',
  '.loan', '.work', '.date', '.racing', '.win', '.download',
  '.stream', '.bid', '.trade', '.icu', '.vip', '.monster',
])

const PHISH_KEYWORDS = [
  'secure', 'login', 'signin', 'account', 'update', 'verify',
  'banking', 'netbanking', 'support', 'alert', 'suspended',
  'recover', 'password', 'credential', 'wallet',
]

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const url: string = (req.body?.url || '').trim()
  if (!url) return res.status(400).json({ error: 'url required' })

  const fullUrl = url.startsWith('http') ? url : 'https://' + url
  let hostname = ''
  try {
    hostname = new URL(fullUrl).hostname.toLowerCase()
  } catch {
    return res.status(200).json({
      is_fake: true, confidence: 80, verdict: 'FAKE',
      reasons: ['Invalid URL format'],
      checks: { has_https: false, ssl_valid: false, redirect_count: 0, status_code: null }
    })
  }

  const domain = hostname.replace('www.', '')
  const parts  = domain.split('.')
  const root   = parts.slice(-2).join('.')
  const tld    = '.' + parts[parts.length - 1]
  const scheme = new URL(fullUrl).protocol.replace(':', '')

  const reasons: string[] = []
  let score = 0

  // 1. Known fake blocklist
  if (KNOWN_FAKE.has(domain) || KNOWN_FAKE.has(root)) {
    score += 80
    reasons.push(`'${domain}' is a known fake/phishing domain`)
  }

  // 2. Canonical domain check
  for (const [brand, canonical] of Object.entries(CANONICAL)) {
    if (domain.includes(brand)) {
      const canonicalClean = canonical.replace('www.', '')
      if (domain === canonicalClean || domain === 'www.' + canonicalClean) {
        score = Math.max(0, score - 10)
        reasons.push(`Domain matches real ${brand.toUpperCase()} site (${canonicalClean}) ✓`)
      } else {
        score += 60
        reasons.push(
          `Contains '${brand}' but is NOT the real ${brand.toUpperCase()} site ` +
          `(real: ${canonicalClean}) — likely impersonation`
        )
      }
      break
    }
  }

  // 3. Suspicious TLD
  if (SUSPICIOUS_TLDS.has(tld)) {
    score += 25
    reasons.push(`Suspicious TLD '${tld}' — commonly used in phishing`)
  }

  // 4. IP address
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
    score += 35
    reasons.push('URL uses a raw IP address instead of a domain name')
  }

  // 5. Phishing keywords
  const kwHits = PHISH_KEYWORDS.filter(k => domain.includes(k))
  if (kwHits.length >= 2) {
    score += 20
    reasons.push(`Multiple phishing keywords in domain: ${kwHits.slice(0, 3).join(', ')}`)
  } else if (kwHits.length === 1) {
    score += 10
    reasons.push(`Phishing keyword '${kwHits[0]}' found in domain`)
  }

  // 6. No HTTPS
  if (scheme !== 'https') {
    score += 15
    reasons.push('No HTTPS — site is not using SSL/TLS encryption')
  }

  score = Math.max(0, Math.min(score, 100))

  let verdict: string
  let is_fake: boolean
  if (score >= 55) {
    verdict = 'FAKE'; is_fake = true
  } else if (score >= 30) {
    verdict = 'SUSPICIOUS'; is_fake = false
  } else {
    verdict = 'ONLINE'; is_fake = false
  }

  if (reasons.length === 0) reasons.push('No suspicious signals detected ✓')

  return res.status(200).json({
    is_fake,
    confidence: score,
    verdict,
    reasons,
    checks: {
      has_https: scheme === 'https',
      ssl_valid: scheme === 'https',
      redirect_count: 0,
      status_code: null,
    }
  })
}
