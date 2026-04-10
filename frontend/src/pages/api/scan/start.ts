import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

// Increase Vercel function timeout to 60s (max on hobby plan)
export const config = { api: { responseLimit: false } }
export const maxDuration = 60

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  try {
    const upstream = await axios.post(
      `${process.env.API_URL}/api/scan/start`,
      req.body,
      { timeout: 55000 } // 55s timeout — gives Railway time to wake up
    )
    res.status(200).json(upstream.data)
  } catch (e: any) {
    console.error('Scan start error:', e?.message)
    res.status(e?.response?.status || 500).json({
      error: 'Failed to start scan — backend may be waking up, please try again in 30 seconds'
    })
  }
}
