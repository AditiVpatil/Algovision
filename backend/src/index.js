import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'

import dsaRoutes from './routes/dsa.js'
import authRoutes from './routes/auth.js'
import codeRoutes from './routes/code.js'
import progressRoutes from './routes/progress.js'

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '10mb' }))

// Routes
app.use('/api', dsaRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/code', codeRoutes)
app.use('/api/progress', progressRoutes)

// Health check
app.get('/api/health', (_, res) =>
  res.json({ status: 'ok', ts: new Date().toISOString() })
)

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`\n🚀 AlgoVision API  →  http://localhost:${PORT}`)
  console.log(`👤 Auth          →  /api/auth`)
  console.log(`📚 Topics        →  /api/topics`)
  console.log(`🎯 Problems      →  /api/problems`)
  console.log(`💻 Code Run      →  /api/code/run`)
  console.log(`🤖 AI Tutor      →  POST /api/ask-ai\n`)
})
