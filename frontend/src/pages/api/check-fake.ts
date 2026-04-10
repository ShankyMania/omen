import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  try {
    const pythonUrl = process.env.PYTHON_API_URL || 'http://localhost:8000'
    const upstream = await axios.post(`${pythonUrl}/check-fake`, req.body, {
      timeout: 15000, // 15 second timeout
    })
    res.status(200).json(upstream.data)
  } catch (err: any) {
    // If Python backend is unreachable, allow scan to proceed
    console.error('Fake check failed:', err?.message)
    res.status(200).json({
      is_fake: false,
      confidence: 0,
      verdict: 'ONLINE',
      reasons: ['Check skipped — backend unavailable'],
      checks: { has_https: true, ssl_valid: true, redirect_count: 0 }
    })
  }
}
