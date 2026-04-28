import { Router } from 'express'
import { db } from '../firebase/client.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// POST /api/progress/quiz
router.post('/quiz', authenticate, async (req, res) => {
  const { topicId, score, total } = req.body
  if (!topicId || score == null || !total)
    return res.status(400).json({ message: 'topicId, score, total required' })

  if (!db) {
    console.warn('⚠️ Firebase unavailable – quiz result not persisted.')
    return res.json({ id: `local_${Date.now()}`, topicId, score, total })
  }

  try {
    const ref = await db.collection('quizResults').add({
      userId: req.user.id, topicId, score, total,
      accuracy: (score / total) * 100,
      createdAt: new Date().toISOString(),
    })
    // Update topic progress step
    await db.collection('topicProgress').doc(`${req.user.id}_${topicId}`).set(
      { userId: req.user.id, topicId, stepReached: 2, updatedAt: new Date().toISOString() },
      { merge: true }
    )
    res.json({ id: ref.id, topicId, score, total })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to save quiz result' })
  }
})

// POST /api/progress/topic
router.post('/topic', authenticate, async (req, res) => {
  const { topicId, stepReached, completed } = req.body
  if (!topicId) return res.status(400).json({ message: 'topicId required' })

  const update = {
    userId: req.user.id, topicId,
    stepReached: stepReached ?? 0,
    completed: completed ?? false,
    completedAt: completed ? new Date().toISOString() : null,
    updatedAt: new Date().toISOString(),
  }

  if (!db) {
    console.warn('⚠️ Firebase unavailable – topic progress not persisted.')
    return res.json(update)
  }

  try {
    const docId = `${req.user.id}_${topicId}`
    await db.collection('topicProgress').doc(docId).set(update, { merge: true })
    res.json(update)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to update progress' })
  }
})

// GET /api/progress/topic/:topicId
router.get('/topic/:topicId', authenticate, async (req, res) => {
  if (!db) return res.json({ stepReached: 0, completed: false })
  try {
    const doc = await db.collection('topicProgress')
      .doc(`${req.user.id}_${req.params.topicId}`).get()
    res.json(doc.exists ? doc.data() : { stepReached: 0, completed: false })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch progress' })
  }
})

// GET /api/progress/all
router.get('/all', authenticate, async (req, res) => {
  if (!db) return res.json({ success: true, data: {} })
  try {
    const snap = await db.collection('topicProgress')
      .where('userId', '==', req.user.id).get()
    const progress = {}
    snap.forEach(doc => {
      const data = doc.data()
      progress[data.topicId] = data
    })
    res.json({ success: true, data: progress })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch all progress' })
  }
})

// GET /api/progress/dashboard
router.get('/dashboard', authenticate, async (req, res) => {
  if (!db) {
    return res.json({
      topicsCompleted: 0,
      problemsSolved: 0,
      avgOptimizationScore: 0,
      totalSubmissions: 0,
      quizAccuracy: [],
      optimizationGrowth: [],
    })
  }
  try {
    const userId = req.user.id

    const [progressSnap, submissionsSnap, quizSnap] = await Promise.all([
      db.collection('topicProgress').where('userId', '==', userId).get(),
      db.collection('submissions').where('userId', '==', userId).get(),
      db.collection('quizResults').where('userId', '==', userId).get(),
    ])

    const topicsCompleted = progressSnap.docs.filter(d => d.data().completed).length
    const submissions = submissionsSnap.docs.map(d => d.data())
      .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
    const quizResults = quizSnap.docs.map(d => d.data())

    const problemsSolved = new Set(submissions.map(s => s.problemId)).size
    const avgOptimizationScore = submissions.length
      ? Math.round(submissions.reduce((a, s) => a + (s.optimizationScore || 0), 0) / submissions.length)
      : 0

    // Quiz accuracy per topic
    const quizByTopic = {}
    quizResults.forEach(r => {
      if (!quizByTopic[r.topicId]) quizByTopic[r.topicId] = []
      quizByTopic[r.topicId].push(r.accuracy)
    })
    const quizAccuracy = Object.entries(quizByTopic).map(([topicId, scores]) => ({
      topicId,
      accuracy: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    }))

    const optimizationGrowth = submissions.map(s => ({
      problem: s.problemId.replace(/-/g, ' '),
      score: s.optimizationScore || 0,
      date: s.createdAt,
    }))

    res.json({
      topicsCompleted,
      problemsSolved,
      avgOptimizationScore,
      totalSubmissions: submissions.length,
      quizAccuracy,
      optimizationGrowth,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch dashboard data' })
  }
})

export default router
