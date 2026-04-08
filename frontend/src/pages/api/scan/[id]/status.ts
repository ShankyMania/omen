import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  try {
    const upstream = await axios.get(`${process.env.API_URL}/api/scan/${id}/status`)
    res.status(200).json(upstream.data)
  } catch (e: any) {
    res.status(e?.response?.status || 500).json({ error: 'Failed to get scan status' })
  }
}
