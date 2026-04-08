const router = require('express').Router()
const db = require('../config/db')

// GET /api/issues — all vulns across all scans
router.get('/', (req, res) => {
  const { min_severity } = req.query
  try {
    let sql = 'SELECT v.*, s.target FROM vulnerabilities v LEFT JOIN scans s ON s.scan_id = v.scan_id WHERE 1=1'
    const params = []
    if (min_severity) {
      sql += ' AND v.cvss_score >= ?'
      params.push(Number(min_severity))
    }
    sql += ' ORDER BY v.cvss_score DESC LIMIT 500'
    const rows = db.all(sql, params)
    res.json(rows)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to fetch issues' })
  }
})

module.exports = router
