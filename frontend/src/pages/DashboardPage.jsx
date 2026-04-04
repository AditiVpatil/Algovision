import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AnimatedBackground } from '@/components/animated-background'
import {
  BarChart3, CheckCircle2, Flame, Clock, Trophy,
  ArrowRight, BookOpen, Zap, TrendingUp, Target
} from 'lucide-react'

const topicsMap = {
  'arrays': 'Arrays', 'binary-search': 'Binary Search', 'linked-list': 'Linked List',
  'trees': 'Trees & BST', 'graphs': 'Graphs', 'dynamic-programming': 'Dynamic Programming',
}

export default function DashboardPage() {
  const [progress, setProgress] = useState({})
  const [solved, setSolved] = useState([])

  useEffect(() => {
    try {
      setProgress(JSON.parse(localStorage.getItem('av_progress') || '{}'))
      setSolved(JSON.parse(localStorage.getItem('av_solved') || '[]'))
    } catch { }
  }, [])

  const completedTopics = Object.values(progress).filter(Boolean).length
  const totalTopics = Object.keys(topicsMap).length
  const topicPct = Math.round((completedTopics / totalTopics) * 100)

  const recentTopics = Object.entries(progress)
    .filter(([, done]) => done)
    .slice(0, 3)
    .map(([id]) => ({ id, label: topicsMap[id] || id }))

  return (
    <div className="min-h-screen relative bg-[#07111C]">
      <AnimatedBackground />

      <main className="relative pt-12 pb-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="mb-10">
            <p className="text-[#94A3B8] text-sm mb-2">Welcome back 👋</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
              Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7B61FF] to-[#F062D0]">Dashboard</span>
            </h1>
          </div>

          {/* Stats grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {[
              { label: 'Problems Solved', val: solved.length, badge: '+2 today', icon: CheckCircle2, grad: 'from-[#F062D0] to-[#E848EF]', badgeColor: 'text-[#10B981] bg-[#10B981]/10' },
              { label: 'Day Streak', val: '32', badge: 'Personal best!', icon: Flame, grad: 'from-[#F59E0B] to-[#D97706]', badgeColor: 'text-[#EC4899] bg-[#EC4899]/10' },
              { label: 'Topics Covered', val: `${completedTopics}/${totalTopics}`, badge: `${topicPct}% done`, icon: BookOpen, grad: 'from-[#3B82F6] to-[#1D4ED8]', badgeColor: 'text-[#60A5FA] bg-[#3B82F6]/10' },
              { label: 'Global Rank', val: '#1,247', badge: '+156 spots', icon: Trophy, grad: 'from-[#7B61FF] to-[#6366F1]', badgeColor: 'text-[#F59E0B] bg-[#F59E0B]/10' },
            ].map((c) => (
              <div key={c.label} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all hover:-translate-y-0.5">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.grad} flex items-center justify-center shadow-lg`}>
                    <c.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${c.badgeColor}`}>{c.badge}</span>
                </div>
                <p className="text-[#94A3B8] text-xs mb-1">{c.label}</p>
                <p className="text-3xl font-bold text-white">{c.val}</p>
              </div>
            ))}
          </div>

          {/* Two-col layout */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">

            {/* Progress by topic */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-5 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#7B61FF]" /> Topic Progress
              </h3>
              <div className="space-y-4">
                {Object.entries(topicsMap).map(([id, label]) => {
                  const done = !!progress[id]
                  const pct = done ? 100 : 0
                  return (
                    <div key={id}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-[#94A3B8]">{label}</span>
                        <span className={done ? 'text-[#10B981] font-semibold' : 'text-[#64748B]'}>
                          {done ? 'Complete ✓' : 'Not started'}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${done ? 'bg-gradient-to-r from-[#10B981] to-[#34D399]' : 'bg-white/5'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
              <Link to="/learn" className="mt-5 flex items-center gap-2 text-[#7B61FF] text-sm font-semibold hover:text-[#F062D0] transition-colors">
                Continue Learning <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Activity + Quick actions */}
            <div className="space-y-5">
              {/* Study time */}
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#F062D0]" /> Weekly Activity
                </h3>
                <div className="flex items-end gap-2 h-20">
                  {[30, 60, 45, 80, 55, 90, 70].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-[#7B61FF] to-[#F062D0] opacity-80 hover:opacity-100 transition-opacity"
                        style={{ height: `${h}%` }}
                      />
                      <span className="text-[10px] text-[#64748B]">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[#64748B] text-xs mt-3 text-center">48h total this week</p>
              </div>

              {/* Quick actions */}
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-3">
                <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#F59E0B]" /> Quick Actions
                </h3>
                {[
                  { label: 'Continue Learning', to: '/learn', icon: BookOpen, color: 'from-[#7B61FF] to-[#F062D0]' },
                  { label: 'Practice Problems', to: '/practice', icon: Target, color: 'from-[#10B981] to-[#34D399]' },
                ].map((a) => (
                  <Link key={a.label} to={a.to} className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r ${a.color} text-white text-sm font-semibold hover:opacity-90 transition-opacity`}>
                    <a.icon className="w-4 h-4" />
                    {a.label}
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Daily challenge */}
          <div className="bg-gradient-to-br from-[#7B61FF]/10 to-[#F062D0]/10 border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-[#F59E0B]" />
                <span className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider">Daily Challenge</span>
              </div>
              <h3 className="text-white font-bold text-lg mb-1">Longest Palindromic Substring</h3>
              <p className="text-[#94A3B8] text-sm">Medium • +50 XP reward</p>
            </div>
            <Link to="/practice">
              <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7B61FF] to-[#F062D0] text-white font-semibold text-sm hover:opacity-90 transition-opacity whitespace-nowrap flex items-center gap-2">
                <Target className="w-4 h-4" /> Attempt Now
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
