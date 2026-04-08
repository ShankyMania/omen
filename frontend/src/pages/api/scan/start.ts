import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  try {
    const upstream = await axios.post(`${process.env.API_URL}/api/scan/start`, req.body)
    res.status(200).json(upstream.data)
  } catch (e: any) {
    res.status(e?.response?.status || 500).json({ error: 'Failed to start scan' })
  }
}
