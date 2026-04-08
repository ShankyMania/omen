import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  try {
    const pythonUrl = process.env.PYTHON_API_URL || 'http://localhost:8000'
    const upstream = await axios.post(`${pythonUrl}/check-fake`, req.body)
    res.status(200).json(upstream.data)
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Fake check failed' })
  }
}
