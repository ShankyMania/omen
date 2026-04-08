const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../config/db')

router.post('/register', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Missing credentials' })
  try {
    const hash = await bcrypt.hash(password, 10)
    const userId = await db.insert('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, hash])
    res.json({ user_id: userId })
  } catch (e) {
    res.status(400).json({ error: 'Email already exists' })
  }
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Missing credentials' })
  try {
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email])
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })
    const token = jwt.sign({ userId: user.user_id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '8h' })
    res.json({ token })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
