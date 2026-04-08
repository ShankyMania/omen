import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const upstream = await axios.get(`${process.env.API_URL}/api/issues`)
    res.status(200).json(upstream.data)
  } catch (e: any) {
    res.status(e?.response?.status || 500).json({ error: 'Failed to fetch issues' })
  }
}
