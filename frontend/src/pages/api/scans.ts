import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const upstream = await axios.get(`${process.env.API_URL}/api/scans`)
    res.status(200).json(upstream.data)
  } catch {
    res.status(200).json([])
  }
}
