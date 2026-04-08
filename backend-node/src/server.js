require('dotenv').config()
const express = require('express')
const cors = require('cors')
const scanRoutes = require('./routes/scans')
const issueRoutes = require('./routes/issues')
const authRoutes = require('./routes/auth')

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/scan', scanRoutes)
app.use('/api/scans', scanRoutes)
app.use('/api/issues', issueRoutes)
app.use('/api/auth', authRoutes)

app.get('/health', (_, res) => res.json({ status: 'ok' }))

// Global error handler — must be last middleware
app.use((err, req, res, _next) => {
  console.error(err)
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`Node API running on port ${PORT}`))

module.exports = app
