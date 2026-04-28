import { Router } from 'express'
import axios from 'axios'
import OpenAI from 'openai'
import { db } from '../firebase/client.js'
import { authenticate } from '../middleware/auth.js'
import { problems } from '../data/problems.js'

const router = Router()
const PISTON_URL = process.env.PISTON_API_URL || 'https://emkc.org/api/v2/piston'

// ── Correct Piston language + version map (verified against /runtimes) ──────
const LANG_MAP = {
  python:     { language: 'python',      version: '3.10.0' },
  javascript: { language: 'javascript',  version: '18.15.0', runtime: 'node' },
  java:       { language: 'java',        version: '15.0.2' },
  cpp:        { language: 'c++',         version: '10.2.0', runtime: 'gcc' },
}

// ── POST /api/code/run ────────────────────────────────────────────────────────
router.post('/run', authenticate, async (req, res) => {
  const { code, language, stdin = '' } = req.body
  if (!code || !language) return res.status(400).json({ message: 'code and language required' })
  const lang = LANG_MAP[language]
  if (!lang) return res.status(400).json({ message: `Unsupported language: ${language}` })

  try {
    const pistonPayload = {
      language: lang.language,
      version: lang.version,
      files: [{ content: code }],
      stdin,
      args: [],
      compile_timeout: 10000,
      run_timeout: 8000,
    }
    // Piston requires `runtime` for runtimes with multiple language->runtime mappings
    if (lang.runtime) pistonPayload.runtime = lang.runtime

    const headers = { 'Content-Type': 'application/json' }
    if (process.env.PISTON_API_KEY) {
      headers['Authorization'] = process.env.PISTON_API_KEY
    }

    const { data } = await axios.post(`${PISTON_URL}/execute`, pistonPayload, {
      timeout: 20000,
      headers
    })

    const stdout     = data.run?.stdout     || ''
    const stderr     = data.run?.stderr     || ''
    const compileErr = data.compile?.stderr || ''

    const success = !stderr && !compileErr
    const isCompileError = !!compileErr

    res.json({
      success,
      isCompileError,
      executionTime: data.run?.wall_time ?? null,
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      compileErr: compileErr.trim(),
      // Language info for debugging
      langUsed: lang.language,
      versionUsed: lang.version,
    })

  } catch (err) {
    console.error('Piston error:', err.response?.data || err.message)

    // Graceful fallback: try to simulate with OpenAI
    if (process.env.OPENAI_API_KEY) {
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
        const prompt = `You are a code execution simulator. Simulate running the following ${language} code.
Return ONLY valid JSON with this shape:
{ "success": boolean, "stdout": "string", "stderr": "string", "compileErr": "string" }

Rules:
- If the code has a syntax error, set success=false, compileErr to the error message, stdout/stderr to ""
- If the code runs but produces a runtime error, set success=false, stderr to the error, stdout/stderr to ""
- If the code runs OK, set success=true, stdout to exactly what would print, stderr/compileErr to ""

Code (${language}):
\`\`\`
${code}
\`\`\``

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          max_tokens: 400,
        })

        const raw = completion.choices[0].message.content?.trim() || ''
        let result = { success: false, stdout: '', stderr: 'AI simulation failed', compileErr: '' }
        try {
          const clean = raw.replace(/```json/g, '').replace(/```/g, '').trim()
          result = JSON.parse(clean)
        } catch {
          const match = raw.match(/\{[\s\S]*\}/)
          if (match) result = JSON.parse(match[0])
        }

        return res.json({
          success: result.success ?? false,
          stdout: (result.stdout || '').trim(),
          stderr: (result.stderr || '').trim(),
          compileErr: (result.compileErr || '').trim(),
          isCompileError: !!(result.compileErr),
          executionTime: null,
          aiSimulated: true,
        })
      } catch (aiErr) {
        console.warn('AI simulation error:', aiErr.message)
      }
    }

    // Final fallback
    res.status(503).json({
      success: false,
      stdout: '',
      stderr: `Code execution service is unavailable. Error: ${err.message}`,
      compileErr: '',
      isCompileError: false,
      executionTime: null,
    })
  }
})

// ── POST /api/code/analyze ────────────────────────────────────────────────────
router.post('/analyze', authenticate, async (req, res) => {
  const { code, language, problemId, topicId, problemDescription } = req.body
  if (!code || !language) return res.status(400).json({ message: 'code and language required' })

  // --- Build detailed prompt ---
  const prompt = `You are an expert DSA coach analyzing a student's ${language} solution.

PROBLEM: ${problemDescription || 'A DSA problem'}

STUDENT CODE (${language}):
\`\`\`${language}
${code}
\`\`\`

Analyze the code and respond with ONLY a valid JSON object — no markdown, no extra text:
{
  "score": <integer 0-100, optimization percentage>,
  "timeComplexity": "<student's time complexity, e.g. O(N^2)>",
  "spaceComplexity": "<student's space complexity, e.g. O(N)>",
  "optimalTimeComplexity": "<best achievable time complexity for this problem>",
  "optimalSpaceComplexity": "<best achievable space complexity for this problem>",
  "currentApproach": "<1-2 sentence description of what the student did>",
  "improvements": ["<specific improvement 1>", "<specific improvement 2>", "<specific improvement 3>"],
  "optimizedCode": "<full working ${language} code of the OPTIMAL approach — COMPLETE code, not a snippet>",
  "optimizedApproachName": "<name of the optimal algorithm, e.g. Hash Map, Two Pointers, Sliding Window>",
  "encouragement": "<1 short encouraging sentence>"
}

Score rubric:
- 90-100: Near-optimal (same complexity as best known)
- 70-89: Good but a small improvement possible
- 40-69: Correct but inefficient (e.g. O(N^2) vs O(N))
- 0-39: Brute force or incorrect approach

IMPORTANT: optimizedCode MUST be a complete, runnable ${language} program (include main/print statements).`

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' })

  try {
    if (!process.env.OPENAI_API_KEY) throw new Error('OpenAI key not set')

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2500,
      temperature: 0.2,
      response_format: { type: 'json_object' }, // Force JSON mode
    })

    const raw = completion.choices[0].message.content?.trim() || '{}'
    let analysis
    try {
      analysis = JSON.parse(raw)
    } catch {
      const match = raw.match(/\{[\s\S]*\}/)
      analysis = match ? JSON.parse(match[0]) : null
    }

    if (!analysis) throw new Error('Could not parse AI response')

    // Ensure all required fields exist
    analysis.score              = Math.max(0, Math.min(100, analysis.score || 50))
    analysis.timeComplexity     = analysis.timeComplexity     || 'Unknown'
    analysis.spaceComplexity    = analysis.spaceComplexity    || 'Unknown'
    analysis.optimalTimeComplexity  = analysis.optimalTimeComplexity  || 'Unknown'
    analysis.optimalSpaceComplexity = analysis.optimalSpaceComplexity || 'Unknown'
    analysis.improvements       = analysis.improvements       || []
    analysis.optimizedCode      = analysis.optimizedCode      || ''
    analysis.encouragement      = analysis.encouragement      || 'Keep going!'
    analysis.passed             = analysis.score >= 70

    // Save to Firestore (non-blocking)
    if (db) {
      db.collection('submissions').add({
        userId: req.user.id,
        topicId: topicId || 'unknown',
        problemId: String(problemId || 'unknown'),
        code, language,
        optimizationScore: analysis.score,
        timeComplexity: analysis.timeComplexity,
        spaceComplexity: analysis.spaceComplexity,
        optimalTimeComplexity: analysis.optimalTimeComplexity,
        optimalSpaceComplexity: analysis.optimalSpaceComplexity,
        aiAnalysis: JSON.stringify(analysis),
        passed: analysis.score >= 70,
        createdAt: new Date().toISOString(),
      }).catch(e => console.error('Firestore save failed:', e.message))
    }

    res.json(analysis)
  } catch (err) {
    const { code, language, problemId, topicId, testResults = [] } = req.body
    
    const problem = problems.find(p => String(p.id) === String(problemId))
    const title = problem?.title || ''
    const optimal = problem?.optimal || { time: 'O(N)', space: 'O(N)', approach: 'Efficient Approach' }

    // 1. Smarter Starter Detection
    const cleanCode = code.replace(/\/\/.*|\/\*[\s\S]*?\*\/|#.*/g, '').trim();
    const hasLogic = cleanCode.split('\n').filter(line => line.trim()).length > 10;

    if (!hasLogic && cleanCode.length < 100) {
      return res.json({
        score: 0, passed: false, encouragement: 'Please implement the solution logic first!',
        timeComplexity: '—', spaceComplexity: '—', optimizedCode: '// Implement logic'
      });
    }

    // 2. Test-Driven Accuracy
    const passCount = testResults.filter(r => r.passed).length;
    const totalTests = testResults.length;
    const passRatio = totalTests > 0 ? passCount / totalTests : 0;
    
    // 3. Complexity Heuristics
    const hasNestedLoop = /for.*\n.*for|while.*\n.*while|for.*\{[\s\S]*for/.test(code);
    const hasHashMap = /dict|HashMap|map\[|object|Map\(|Set\(|\{\}/i.test(code);
    
    let baseScore = Math.round(passRatio * 70);
    let complexityBonus = 0;

    if (optimal.time === 'O(N)') {
       if (!hasNestedLoop) complexityBonus += 15;
       if (hasHashMap) complexityBonus += 15;
    } else if (optimal.time === 'O(log N)') {
       if (code.includes('/ 2') || code.includes('>> 1')) complexityBonus += 30;
    }

    const finalScore = Math.min(100, baseScore + complexityBonus);
    
    const mockAnalysis = {
      score: finalScore,
      passed: finalScore >= 70 && passRatio > 0.5,
      timeComplexity: hasNestedLoop ? 'O(N²)' : optimal.time,
      spaceComplexity: hasHashMap ? 'O(N)' : 'O(1)',
      optimalTimeComplexity: optimal.time,
      optimalSpaceComplexity: optimal.space,
      currentApproach: passRatio === 1 
        ? `Correct solution! You passed ${passCount}/${totalTests} tests.` 
        : `Your solution passed ${passCount}/${totalTests} tests but needs ${passRatio === 0 ? 'to be implemented' : 'fixing'}.`,
      improvements: passRatio < 1 
        ? ['Debug your solution to pass all test cases.', 'Check edge cases like empty input or single elements.']
        : [`Try to reach ${optimal.time} if you haven't already.`, `Focus on ${optimal.approach} for better performance.`],
      optimizedCode: optimal.code || `// Optimal implementation: ${optimal.approach}`,
      optimizedApproachName: optimal.approach,
      encouragement: finalScore >= 90 ? '🏆 Perfect! You hit the optimal target.' : 'Keep going! You are almost there.'
    }

    if (db) {
      db.collection('submissions').add({
        userId: req.user.id || 'anonymous',
        problemId: String(problemId),
        optimizationScore: finalScore,
        passed: mockAnalysis.passed,
        createdAt: new Date().toISOString(),
      }).catch(() => {});
    }

    res.json(mockAnalysis)
  }
})

export default router
