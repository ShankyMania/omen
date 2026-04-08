const router = require('express').Router()
const axios  = require('axios')
const db     = require('../config/db')

const PYTHON_API = process.env.PYTHON_API_URL || 'http://localhost:8000'

// GET /api/scans — list recent scans with vuln counts + duration
router.get('/', (req, res) => {
  try {
    const rows = db.all(`
      SELECT s.scan_id, s.target, s.status, s.duration_s, s.created_at,
             COUNT(v.id) AS vuln_count
      FROM scans s
      LEFT JOIN vulnerabilities v ON v.scan_id = s.scan_id
      GROUP BY s.scan_id
      ORDER BY s.scan_id DESC
      LIMIT 50
    `)
    res.json(rows)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to fetch scans' })
  }
})

// POST /api/scan/start
router.post('/start', async (req, res) => {
  const { target_url } = req.body
  if (!target_url) return res.status(400).json({ error: 'target_url required' })
  try {
    const scanId = db.insert(
      'INSERT INTO scans (target, status) VALUES (?, ?)',
      [target_url, 'pending']
    )
    // fire-and-forget to Python
    axios.post(`${PYTHON_API}/scan`, { target_url, scan_id: scanId })
      .catch(err => {
        console.error(`Python trigger failed for scan ${scanId}:`, err.message)
        db.run('UPDATE scans SET status = ? WHERE scan_id = ?', ['failed', scanId])
      })
    res.json({ scan_id: scanId, status: 'pending' })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to start scan' })
  }
})

// GET /api/scan/:id/status
router.get('/:id/status', (req, res) => {
  try {
    const scanId = parseInt(req.params.id, 10)
    if (isNaN(scanId)) return res.status(400).json({ error: 'Invalid scan id' })
    const row = db.get(
      'SELECT scan_id, status, duration_s, created_at FROM scans WHERE scan_id = ?',
      [scanId]
    )
    if (!row) return res.status(404).json({ error: 'Scan not found' })
    const progress = row.status === 'completed' ? 100
                   : row.status === 'running'   ? 50
                   : row.status === 'failed'     ? 0 : 10
    res.json({ ...row, progress })
  } catch (e) {
    res.status(500).json({ error: 'Failed to get scan status' })
  }
})

// GET /api/scan/:id/results
router.get('/:id/results', (req, res) => {
  try {
    const scanId = parseInt(req.params.id, 10)
    if (isNaN(scanId)) return res.status(400).json({ error: 'Invalid scan id' })
    const vulns = db.all(
      'SELECT * FROM vulnerabilities WHERE scan_id = ? ORDER BY cvss_score DESC',
      [scanId]
    )
    res.json(vulns)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to get results' })
  }
})

module.exports = router
