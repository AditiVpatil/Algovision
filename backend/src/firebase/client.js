import admin from 'firebase-admin'
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config()

const __dirname = dirname(fileURLToPath(import.meta.url))
// Project root = 2 levels up from src/firebase/
const PROJECT_ROOT = resolve(__dirname, '../..')

let db = null

function initFirebase() {
  if (admin.apps.length > 0) {
    db = admin.firestore()
    return db
  }

  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
  const projectId = process.env.FIREBASE_PROJECT_ID

  if (!serviceAccountPath || !projectId) {
    console.warn(
      '⚠️  Missing Firebase config (FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_PROJECT_ID in .env). Firebase will be bypassed.'
    )
    db = null
    return null
  }

  // Resolve relative to project root (backend/) so ./firebase-service-account.json works
  const absolutePath = resolve(PROJECT_ROOT, serviceAccountPath)

  if (!existsSync(absolutePath)) {
    console.warn(`⚠️  Firebase service account file not found at "${absolutePath}". Firebase will be bypassed.`)
    db = null
    return null
  }

  try {
    const serviceAccount = JSON.parse(readFileSync(absolutePath, 'utf8'))

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId,
    })

    db = admin.firestore()
    console.log(`✅ Firestore connected → project: ${projectId}`)
    return db
  } catch (err) {
    console.error(
      `❌ Could not initialize Firebase from "${absolutePath}".\n` +
      `   Error: ${err.message}`
    )
    db = null
    return null
  }
}

// Initialize on import
initFirebase()

export { db, admin }
export default db
