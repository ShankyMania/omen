import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  const NODE = process.env.API_URL ?? 'http://localhost:4000'
  try {
    const upstream = await axios.get(`${NODE}/api/scan/${id}/results`)
    res.status(200).json(upstream.data)
  } catch (e: any) {
    res.status(e?.response?.status || 500).json({ error: 'Failed to get results' })
  }
}
