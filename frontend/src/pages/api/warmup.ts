import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

// Ping both backends to wake them up before scanning
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const nodeUrl   = process.env.API_URL          || 'http://localhost:4000'
  const pythonUrl = process.env.PYTHON_API_URL   || 'http://localhost:8000'

  const results = await Promise.allSettled([
    axios.get(`${nodeUrl}/health`,   { timeout: 30000 }),
    axios.get(`${pythonUrl}/health`, { timeout: 30000 }),
  ])

  res.status(200).json({
    node:   results[0].status === 'fulfilled' ? 'ok' : 'waking',
    python: results[1].status === 'fulfilled' ? 'ok' : 'waking',
  })
}
