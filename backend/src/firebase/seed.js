/**
 * Seed script — run once to populate Firestore with demo data.
 * Usage:  cd backend && npm run seed
 */
import { db } from './client.js'
import bcrypt from 'bcryptjs'

async function seed() {
  console.log('🌱 Seeding Firestore...\n')

  // ── 1. Demo User ────────────────────────────────────────────────
  const hashed = await bcrypt.hash('demo1234', 12)
  const userId = 'demo_user_001'

  await db.collection('users').doc(userId).set({
    id: userId,
    username: 'demo_learner',
    email: 'demo@neurodsa.com',
    password: hashed,
    createdAt: new Date().toISOString(),
  })
  console.log('✅ Demo user created')
  console.log('   Email:    demo@neurodsa.com')
  console.log('   Password: demo1234\n')

  // ── 2. Topic Progress ───────────────────────────────────────────
  const progressData = [
    { topicId: 'arrays',     stepReached: 3, completed: true  },
    { topicId: 'sorting',    stepReached: 2, completed: false },
    { topicId: 'searching',  stepReached: 1, completed: false },
    { topicId: 'stack-queue',stepReached: 0, completed: false },
  ]

  for (const p of progressData) {
    await db.collection('topicProgress').doc(`${userId}_${p.topicId}`).set({
      userId,
      ...p,
      completedAt: p.completed ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString(),
    })
  }
  console.log('✅ Topic progress seeded')

  // ── 3. Quiz Results ─────────────────────────────────────────────
  const quizData = [
    { topicId: 'arrays',    score: 3, total: 4, accuracy: 75   },
    { topicId: 'sorting',   score: 2, total: 3, accuracy: 66.7 },
    { topicId: 'searching', score: 2, total: 2, accuracy: 100  },
  ]

  for (const q of quizData) {
    await db.collection('quizResults').add({
      userId,
      ...q,
      createdAt: new Date().toISOString(),
    })
  }
  console.log('✅ Quiz results seeded')

  // ── 4. Submissions ──────────────────────────────────────────────
  const submissions = [
    { problemId: 'max-element',      topicId: 'arrays',    optimizationScore: 55,  yourComplexity: 'O(n²)',    language: 'python'     },
    { problemId: 'reverse-array',    topicId: 'arrays',    optimizationScore: 72,  yourComplexity: 'O(n)',     language: 'python'     },
    { problemId: 'max-element',      topicId: 'arrays',    optimizationScore: 88,  yourComplexity: 'O(n)',     language: 'python'     },
    { problemId: 'bubble-sort-impl', topicId: 'sorting',   optimizationScore: 80,  yourComplexity: 'O(n²)',    language: 'javascript' },
    { problemId: 'binary-search',    topicId: 'searching', optimizationScore: 92,  yourComplexity: 'O(log n)', language: 'python'     },
  ]

  for (const s of submissions) {
    await db.collection('submissions').add({
      userId,
      ...s,
      code: '# sample submission\npass',
      passed: s.optimizationScore >= 70,
      createdAt: new Date().toISOString(),
    })
  }
  console.log('✅ Submissions seeded')

  console.log('\n🎉 Firestore seed complete!')
  process.exit(0)
}

seed().catch(err => {
  console.error('Seed failed:', err.message)
  process.exit(1)
})
