import express from 'express'
import OpenAI from 'openai'
import dotenv from 'dotenv'
import { topics as staticTopics } from '../data/topics.js'
import { problems as staticProblems } from '../data/problems.js'
import { db } from '../firebase/client.js'
import { authenticate } from '../middleware/auth.js'

dotenv.config()
const router = express.Router()
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'dummy_key_to_prevent_crash' })

// ─────────────────────────────────────────────────────────────────────────────
// Helpers — try Firestore first, fall back to static data arrays
// ─────────────────────────────────────────────────────────────────────────────

async function getTopics() {
  if (!db) return staticTopics
  try {
    const snap = await db.collection('topics').get()
    if (snap.empty) return staticTopics
    return snap.docs.map(d => d.data())
  } catch {
    return staticTopics
  }
}

async function getTopicById(id) {
  if (!db) return staticTopics.find(t => t.id === id) || null
  try {
    const doc = await db.collection('topics').doc(id).get()
    if (doc.exists) return doc.data()
    // fallback
    return staticTopics.find(t => t.id === id) || null
  } catch {
    return staticTopics.find(t => t.id === id) || null
  }
}

async function getProblems(filters = {}) {
  if (!db) {
    let result = [...staticProblems]
    if (filters.topic)      result = result.filter(p => p.topic === filters.topic)
    if (filters.difficulty) result = result.filter(p => p.difficulty.toLowerCase() === filters.difficulty.toLowerCase())
    return result
  }
  try {
    let query = db.collection('problems')
    if (filters.topic)      query = query.where('topic', '==', filters.topic)
    if (filters.difficulty) query = query.where('difficulty', '==', filters.difficulty)
    const snap = await query.get()
    if (snap.empty) {
      // fallback to static data
      let result = [...staticProblems]
      if (filters.topic)      result = result.filter(p => p.topic === filters.topic)
      if (filters.difficulty) result = result.filter(p => p.difficulty.toLowerCase() === filters.difficulty.toLowerCase())
      return result
    }
    return snap.docs.map(d => d.data())
  } catch {
    let result = [...staticProblems]
    if (filters.topic)      result = result.filter(p => p.topic === filters.topic)
    if (filters.difficulty) result = result.filter(p => p.difficulty.toLowerCase() === filters.difficulty.toLowerCase())
    return result
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/topics  — list all topics (summary, no full content)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/topics', async (req, res) => {
  try {
    const all = await getTopics()
    const summary = all.map(({ id, title, difficulty, description, completed, total, color, icon }) => ({
      id, title, difficulty, description, completed, total, color, icon
    }))
    res.json({ success: true, data: summary })
  } catch (err) {
    console.error('Topics fetch error:', err.message)
    res.status(500).json({ success: false, message: 'Failed to fetch topics' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/topics/:id  — full topic with content
// ─────────────────────────────────────────────────────────────────────────────
router.get('/topics/:id', async (req, res) => {
  try {
    const topic = await getTopicById(req.params.id)
    if (!topic) return res.status(404).json({ success: false, message: 'Topic not found' })
    res.json({ success: true, data: topic })
  } catch (err) {
    console.error('Topic fetch error:', err.message)
    res.status(500).json({ success: false, message: 'Failed to fetch topic' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/problems  — list all problems with optional ?topic= ?difficulty=
// ─────────────────────────────────────────────────────────────────────────────
router.get('/problems', async (req, res) => {
  try {
    const { topic, difficulty } = req.query
    const result = await getProblems({ topic, difficulty })
    res.json({ success: true, data: result, total: result.length })
  } catch (err) {
    console.error('Problems fetch error:', err.message)
    res.status(500).json({ success: false, message: 'Failed to fetch problems' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ask-ai  — AI tutor with streaming and conversational history
// ─────────────────────────────────────────────────────────────────────────────
router.post('/ask-ai', authenticate, async (req, res) => {
    const { question, topic, code, history = [] } = req.body

    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: 'Question is required' })
    }

    try {
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('dummy')) {
        // Stream a friendly fallback message so the frontend reader doesn't break
        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
        res.setHeader('Transfer-Encoding', 'chunked')
        res.write('🔧 **AI Tutor is currently in offline mode.**\n\nThe OpenAI API key is missing or invalid. Please check your `.env` file.\n\n### Quick Tips for **' + (topic || 'DSA') + '**:\n- Break the problem into smaller sub-problems.\n- Analyze the time and space complexity of your approach.\n- Use the **Visualize Optimal** feature (after submitting) to see the best approach!')
        return res.end()
      }

      // Find topic context
      const topicData = await getTopicById(topic)
      const context = topicData ? `
Topic Explanation: ${topicData.content?.explanation || ''}
      `.trim() : ''

      const systemPrompt = `You are an expert DSA tutor bot on AlgoVision.
Your goal is to explain concepts clearly, concisely, and with an encouraging tone.
Analyze this student doubt on the topic: **${topic || 'General DSA'}**.

${code ? `### Current Student Code:\n\`\`\`\n${code}\n\`\`\`\n` : ''}

${context ? `### Context for this topic:\n${context}` : ''}

Respond with helpful explanations, patterns, and hints.
Keep it strictly under 300 words. Use Markdown for formatting.
Maintain a conversational tone based on the history provided.`

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.text || msg.content
      })),
      { role: 'user', content: question }
    ]

    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.setHeader('Transfer-Encoding', 'chunked')

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 800,
      stream: true,
    })

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || ''
      if (content) res.write(content)
    }

    res.end()
  } catch (err) {
    console.error('OpenAI Error:', err.message)
    
    // Check if it's a quota or auth error
    const isQuotaError = err.message.includes('429') || err.message.includes('quota')
    const isAuthError = err.message.includes('401') || err.message.includes('api_key')

    if (!res.headersSent) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      res.setHeader('Transfer-Encoding', 'chunked')
      
      if (isQuotaError) {
        res.write('🚀 **AlgoVision Simulated AI (Offline Mode)**\n\n*Note: OpenAI API quota exceeded. Switching to local simulation.*\n\n')
        res.write(`It seems you're asking about **${topic || 'DSA'}**. Here are some general tips:\n`)
        res.write('- Always consider the **Time Complexity** (how many operations) and **Space Complexity** (how much extra memory).\n')
        res.write('- For optimization, think about using **Hash Maps** to store results or **Two Pointers** to reduce nested loops.\n')
        res.write('- Check the **Visualize Optimal** tool in the Practice Arena for a step-by-step best approach!')
      } else if (isAuthError) {
        res.write('🔑 **AI Tutor Configuration Error**\n\nThe OpenAI API key is invalid or missing. Please contact the administrator.')
      } else {
        res.write('⚠️ **AI Tutor encountered an error.** ' + err.message)
      }
      res.end()
    } else {
      res.end('\n\n[Connection interrupted — simulated response unavailable]')
    }
  }
})

export default router
