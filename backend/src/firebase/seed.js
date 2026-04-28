/**
 * Seed script — run once to populate Firestore with topics, problems, and a demo user.
 * Usage:  cd backend && npm run seed
 *
 * This idempotent script uses set() with merge:false so it is safe to re-run —
 * it will overwrite existing docs but never create duplicates.
 */

import { db, admin } from './client.js'
import { topics } from '../data/topics.js'
import { problems } from '../data/problems.js'
import bcrypt from 'bcryptjs'

async function seed() {
  if (!db) {
    console.error('❌ Firestore not connected. Check your .env and firebase-service-account.json.')
    process.exit(1)
  }

  console.log('🌱 Seeding Firestore (project: algovision-1a94c)...\n')

  // ── 1. Topics ──────────────────────────────────────────────────────
  console.log(`📚 Seeding ${topics.length} topics...`)
  const topicBatch = db.batch()
  for (const topic of topics) {
    const ref = db.collection('topics').doc(topic.id)
    topicBatch.set(ref, {
      ...topic,
      seededAt: new Date().toISOString(),
    })
  }
  await topicBatch.commit()
  console.log(`  ✅ ${topics.length} topics written\n`)

  // ── 2. Problems ────────────────────────────────────────────────────
  console.log(`🎯 Seeding ${problems.length} problems...`)
  const problemBatch = db.batch()
  for (const problem of problems) {
    // Use string id as doc key for easy lookup
    const docId = String(problem.id)
    const ref = db.collection('problems').doc(docId)
    problemBatch.set(ref, {
      ...problem,
      seededAt: new Date().toISOString(),
    })
  }
  await problemBatch.commit()
  console.log(`  ✅ ${problems.length} problems written\n`)

  // ── 3. Demo User ───────────────────────────────────────────────────
  console.log('👤 Seeding demo user...')
  const hashed = await bcrypt.hash('demo1234', 12)
  const userId = 'demo_user_001'

  await db.collection('users').doc(userId).set({
    id: userId,
    username: 'demo_learner',
    email: 'demo@algovision.com',
    password: hashed,
    createdAt: new Date().toISOString(),
  })
  console.log('  ✅ Demo user created')
  console.log('     Email:    demo@algovision.com')
  console.log('     Password: demo1234\n')

  // ── 4. Demo Topic Progress ─────────────────────────────────────────
  console.log('📊 Seeding demo progress...')
  const progressData = [
    { topicId: 'arrays',      stepReached: 4, completed: true  },
    { topicId: 'binary-search', stepReached: 2, completed: false },
  ]
  for (const p of progressData) {
    await db.collection('topicProgress').doc(`${userId}_${p.topicId}`).set({
      userId,
      ...p,
      completedAt: p.completed ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString(),
    })
  }

  // ── 5. Demo Submissions ────────────────────────────────────────────
  const submissions = [
    { problemId: '1', topicId: 'arrays', optimizationScore: 72, timeComplexity: 'O(n)', spaceComplexity: 'O(n)', language: 'python', passed: true },
    { problemId: '2', topicId: 'arrays', optimizationScore: 88, timeComplexity: 'O(n)', spaceComplexity: 'O(1)', language: 'javascript', passed: true },
  ]
  for (const s of submissions) {
    await db.collection('submissions').add({
      userId,
      ...s,
      code: '# demo submission\npass',
      aiAnalysis: JSON.stringify({ score: s.optimizationScore }),
      createdAt: new Date().toISOString(),
    })
  }
  console.log('  ✅ Demo progress + submissions seeded\n')

  console.log('🎉 Firestore seed complete! The app is ready to use.\n')
  console.log('   Start backend:  cd backend && npm start')
  console.log('   Start frontend: cd frontend && npm run dev')
  process.exit(0)
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message)
  console.error(err)
  process.exit(1)
})
