import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AnimatedBackground } from '@/components/animated-background'
import {
  Layers, Search, GitBranch, Network, Box, Zap,
  ArrowRight, BookOpen, Sparkles, ChevronRight, Lock
} from 'lucide-react'

import { API_BASE_URL } from '@/src/config'
import { motion } from 'framer-motion'

const iconMap = { Layers, Search, GitBranch, Network, Box, Zap }

const diffConfig = {
  Easy: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400', border: 'border-emerald-500/20' },
  Medium: { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-400', border: 'border-amber-500/20' },
  Hard: { bg: 'bg-rose-500/10', text: 'text-rose-400', dot: 'bg-rose-400', border: 'border-rose-500/20' },
}

// Fallback data if API is offline
const fallback = [
  { id: 'arrays', title: 'Arrays', difficulty: 'Easy', description: 'Master array manipulation, traversal, and common interview patterns.', completed: 3, total: 12, icon: 'Layers', color: 'from-violet-500 to-purple-600' },
  { id: 'binary-search', title: 'Binary Search', difficulty: 'Easy', description: 'Efficiently search sorted arrays by halving the search space each step.', completed: 2, total: 8, icon: 'Search', color: 'from-cyan-500 to-blue-600' },
  { id: 'linked-list', title: 'Linked Lists', difficulty: 'Medium', description: 'Singly and doubly linked lists, pointer manipulation, classic problems.', completed: 1, total: 14, icon: 'GitBranch', color: 'from-pink-500 to-rose-600' },
  { id: 'trees', title: 'Trees & BST', difficulty: 'Medium', description: 'Binary trees, DFS/BFS traversals, BST operations and recursion.', completed: 0, total: 16, icon: 'Network', color: 'from-emerald-500 to-green-600' },
  { id: 'graphs', title: 'Graphs', difficulty: 'Hard', description: 'BFS, DFS, Dijkstra, topological sort and shortest path algorithms.', completed: 0, total: 20, icon: 'Box', color: 'from-orange-500 to-red-600' },
  { id: 'dynamic-programming', title: 'Dynamic Programming', difficulty: 'Hard', description: 'Memoization, tabulation, and common DP patterns for interviews.', completed: 0, total: 18, icon: 'Zap', color: 'from-amber-500 to-yellow-600' },
]

export default function LearnPage() {
  const [topics, setTopics] = useState(fallback)
  const [activeTab, setActiveTab] = useState('All')
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState({})
  const tabs = ['All', 'Easy', 'Medium', 'Hard']

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const tr = await fetch(`${API_BASE_URL}/topics`)
        const td = await tr.json()
        if (td.data?.length) setTopics(td.data)

        const token = localStorage.getItem('av_token')
        if (token) {
          const pr = await fetch(`${API_BASE_URL}/progress/all`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          const pd = await pr.json()
          if (pd.success) setProgress(pd.data)
        }
      } catch (err) {
        console.error('Fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const enriched = topics.map(t => ({
    ...t,
    completed: progress[t.id]?.completed ? t.total : (progress[t.id]?.stepReached || 0), // Simple logic: if completed, show total, else show step
    percent: progress[t.id]?.completed ? 100 : (progress[t.id]?.stepReached ? Math.round((progress[t.id].stepReached / t.total) * 100) : 0)
  }))

  const filtered = enriched.filter(t => activeTab === 'All' || t.difficulty === activeTab)

  return (
    <div className="min-h-screen relative bg-[#07111C]">
      <AnimatedBackground />

      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative pt-16 pb-20 px-4 sm:px-6"
      >
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-[#94A3B8] mb-5">
              <Sparkles className="w-3.5 h-3.5 text-[#7B61FF]" />
              {topics.length} topics · Visual & Interactive
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
              <span className="text-white">Learn </span>
              <span className="bg-gradient-to-r from-[#7B61FF] to-[#F062D0] bg-clip-text text-transparent">DSA</span>
            </h1>
            <p className="text-[#94A3B8] max-w-xl mx-auto text-base leading-relaxed">
              Pick a topic, follow interactive lessons, and track your progress — one concept at a time.
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${activeTab === tab
                  ? 'bg-gradient-to-r from-[#7B61FF] to-[#F062D0] text-white shadow-lg shadow-purple-500/20'
                  : 'bg-white/5 border border-white/10 text-[#94A3B8] hover:bg-white/10 hover:text-white'
                  }`}
              >{tab}</button>
            ))}
          </div>

          {/* Topics grid */}
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 rounded-2xl bg-white/5 border border-white/5 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((topic) => {
                const diff = diffConfig[topic.difficulty] || diffConfig.Easy
                const Icon = iconMap[topic.icon] || Layers
                const pct = Math.round((topic.completed / topic.total) * 100)
                const isLocked = topic.difficulty === 'Hard' && topic.completed === 0

                return (
                  <Link key={topic.id} to={`/learn/${topic.id}`} className="group block">
                    <div className="relative bg-[#0c1a27] border border-white/5 rounded-2xl p-6 h-full flex flex-col transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_28px_rgba(123,97,255,0.2)] hover:border-[#7B61FF]/30">
                      {/* Top row */}
                      <div className="flex justify-between items-start mb-5">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${topic.color || 'from-violet-500 to-purple-600'} flex items-center justify-center shadow-lg`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border ${diff.bg} ${diff.text} ${diff.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
                          {topic.difficulty}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#7B61FF] group-hover:to-[#F062D0] transition-all">
                        {topic.title}
                      </h3>
                      <p className="text-[#94A3B8] text-sm leading-relaxed flex-1 mb-5">{topic.description}</p>

                      <div className="flex items-center gap-3 text-xs text-[#64748B] mb-4">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{topic.completed}/{topic.total} lessons</span>
                        {isLocked && <Lock className="w-3.5 h-3.5 ml-auto text-[#F59E0B]" />}
                      </div>

                      {/* Progress */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-[#64748B]">Progress</span>
                          <span className={`font-bold ${pct > 0 ? 'text-white' : 'text-[#64748B]'}`}>{pct}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${topic.color || 'from-[#7B61FF] to-[#F062D0]'} rounded-full transition-all duration-700`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-[#0A0F1E] to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />
                      
                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="flex items-center gap-2 group-hover:text-white transition-colors">
                          <span className="text-sm font-bold bg-gradient-to-r from-[#7B61FF] to-[#F062D0] bg-clip-text text-transparent group-hover:text-white">
                            {pct > 0 ? 'Continue' : 'Start Learning'}
                          </span>
                          <ArrowRight className="w-4 h-4 text-[#7B61FF] group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </div>
                        {isLocked ? (
                          <Lock className="w-4 h-4 text-amber-500/50" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#7B61FF] transition-all">
                            <ChevronRight className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Bottom breadcrumb */}
          <div className="mt-16 text-center">
            <p className="text-[#64748B] text-sm">
              Complete topics to unlock harder ones •{' '}
              <Link to="/practice" className="text-[#7B61FF] hover:underline">Go to Practice →</Link>
            </p>
          </div>
        </div>
      </motion.main>
    </div>
  )
}
