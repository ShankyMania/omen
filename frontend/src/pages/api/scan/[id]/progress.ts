import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  try {
    const upstream = await axios.get(
      `${process.env.PYTHON_API_URL ?? 'http://localhost:8000'}/scan/${id}/progress`
    )
    res.status(200).json(upstream.data)
  } catch {
    res.status(200).json([])
  }
}
