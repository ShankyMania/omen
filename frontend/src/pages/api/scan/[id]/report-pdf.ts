import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  const PYTHON = process.env.PYTHON_API_URL ?? 'http://localhost:8000'
  try {
    const upstream = await axios.get(`${PYTHON}/scan/${id}/report`, {
      responseType: 'arraybuffer',
    })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="omen-scan-${id}.pdf"`)
    res.status(200).send(Buffer.from(upstream.data))
  } catch {
    res.status(500).json({ error: 'Failed to generate PDF' })
  }
}
