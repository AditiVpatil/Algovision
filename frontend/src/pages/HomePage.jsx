import { Link } from 'react-router-dom'
import { AnimatedBackground } from '@/components/animated-background'
import { Navbar } from '@/components/navbar'
import {
  Sparkles, BarChart3, Trophy, Play, ArrowRight,
  Zap, Eye, Target, Cpu, CircleCheck, Flame, Brain
} from 'lucide-react'

const features = [
  { icon: Cpu, title: 'AI Adaptive Learning', description: 'Personalized learning paths powered by AI that adapt to your pace and style', gradient: 'from-[#7B61FF] to-[#C084FC]' },
  { icon: Eye, title: 'Visual Algorithm Animations', description: 'Watch algorithms come to life with step-by-step interactive visualizations', gradient: 'from-[#F062D0] to-[#F472B6]' },
  { icon: BarChart3, title: 'Performance Tracking', description: 'Monitor your progress with detailed analytics and optimization scores', gradient: 'from-[#10B981] to-[#34D399]' },
  { icon: Trophy, title: 'Gamified Progress', description: 'Earn badges, unlock achievements, and compete on leaderboards', gradient: 'from-[#F59E0B] to-[#FBBF24]' },
]

const stats = [
  { value: '50+', label: 'DSA Topics' },
  { value: '200+', label: 'Practice Problems' },
  { value: '10K+', label: 'Active Learners' },
  { value: '95%', label: 'Success Rate' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen relative flex flex-col">
      <AnimatedBackground />

      {/* Top Navbar — only on homepage */}
      <div className="relative z-20">
        <Navbar />
      </div>

      {/* Hero */}
      <section className="relative pt-16 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
              <Sparkles className="w-4 h-4 text-[#7B61FF]" />
              <span className="text-sm text-[#94A3B8]">AI-Powered Learning Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Master DSA with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7B61FF] to-[#F062D0]">
                AI, Storytelling
              </span>{' '}
              &amp; Visual Learning
            </h1>

            <p className="text-lg text-[#94A3B8] mb-10 max-w-2xl mx-auto">
              Transform complex algorithms into intuitive visual stories. Learn data structures
              the way your brain naturally understands them.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/learn">
                <button className="h-14 px-8 bg-gradient-to-r from-[#7B61FF] to-[#F062D0] hover:opacity-90 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-[#7B61FF]/25 flex items-center gap-2 group">
                  <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Start Learning
                </button>
              </Link>
              <Link to="/practice">
                <button className="h-14 px-8 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-xl transition-all duration-300 flex items-center gap-2 group font-semibold">
                  Continue Practice
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </div>

          {/* Hero viz */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent z-10 pointer-events-none" />
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 max-w-4xl mx-auto overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
                <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                <div className="w-3 h-3 rounded-full bg-[#10B981]" />
                <span className="ml-4 text-sm text-[#64748B]">bubble_sort.visualization</span>
              </div>
              <div className="flex items-end justify-center gap-2 h-48 py-4">
                {[64, 34, 25, 12, 22, 11, 90, 45, 67, 33].map((value, index) => (
                  <div key={index} className="relative group" style={{ height: `${value * 2}px` }}>
                    <div
                      className="w-8 sm:w-10 rounded-t-lg bg-gradient-to-t from-[#7B61FF] to-[#F062D0] transition-all duration-300 group-hover:from-[#F062D0] group-hover:to-[#7B61FF]"
                      style={{ height: '100%' }}
                    />
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-[#64748B]">{value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex items-center justify-center gap-4 text-sm text-[#94A3B8]">
                <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-[#F59E0B]" />Bubble Sort</span>
                <span className="w-px h-4 bg-white/10" />
                <span>Time: O(n²)</span>
                <span className="w-px h-4 bg-white/10" />
                <span>Space: O(1)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Cards */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-10">Your Progress</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Problems Solved', val: '247', badge: '+12 today', badgeColor: 'text-[#10B981] bg-[#10B981]/10', icon: CircleCheck, grad: 'from-[#F062D0] to-[#E848EF]' },
              { label: 'Day Streak', val: '32', badge: 'Personal best!', badgeColor: 'text-[#EC4899] bg-[#EC4899]/10', icon: Flame, grad: 'from-[#F59E0B] to-[#D97706]' },
              { label: 'Study Time', val: '48h', badge: 'This week', badgeColor: 'text-[#F062D0] bg-[#F062D0]/10', icon: Zap, grad: 'from-[#3B82F6] to-[#1D4ED8]' },
              { label: 'Global Rank', val: '#1,247', badge: '+156 positions', badgeColor: 'text-[#F59E0B] bg-[#F59E0B]/10', icon: Trophy, grad: 'from-[#7B61FF] to-[#6366F1]' },
            ].map((c) => (
              <div key={c.label} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.grad} flex items-center justify-center`}>
                    <c.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${c.badgeColor}`}>{c.badge}</span>
                </div>
                <p className="text-[#94A3B8] text-sm mb-1">{c.label}</p>
                <p className="text-4xl font-bold text-white">{c.val}</p>
              </div>
            ))}
          </div>

          {/* Daily Challenge */}
          <div className="backdrop-blur-xl bg-gradient-to-br from-[#7B61FF]/20 to-[#F062D0]/10 border border-white/10 rounded-2xl p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-[#F59E0B]" />
                  <span className="text-sm font-semibold text-[#F59E0B]">Daily Challenge</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Longest Palindromic Substring</h3>
                <p className="text-[#94A3B8] mb-4">Given a string, find the longest palindromic substring. Can you solve it in O(n) time?</p>
                <div className="flex gap-4 text-sm text-[#94A3B8]">
                  <span className="flex items-center gap-1.5"><BarChart3 className="w-4 h-4 text-[#F062D0]" />Medium</span>
                  <span className="flex items-center gap-1.5"><Trophy className="w-4 h-4 text-[#F59E0B]" />+50 XP</span>
                </div>
              </div>
              <Link to="/practice">
                <button className="px-8 h-12 bg-gradient-to-r from-[#7B61FF] to-[#F062D0] hover:opacity-90 text-white font-semibold rounded-xl flex items-center gap-2 transition-all whitespace-nowrap">
                  <Target className="w-5 h-5" /> Attempt Now
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 border-y border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#7B61FF] to-[#F062D0] mb-2">{s.value}</div>
              <div className="text-[#94A3B8] text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Why Learn with AlgoVision?</h2>
            <p className="text-[#94A3B8] max-w-2xl mx-auto">Our platform combines cutting-edge AI with proven learning methodologies to help you master algorithms faster than ever.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="group backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-[#94A3B8] text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="backdrop-blur-xl bg-gradient-to-br from-[#7B61FF]/20 to-[#F062D0]/10 border border-white/10 rounded-3xl p-8 sm:p-12 text-center">
            <Brain className="w-16 h-16 text-[#7B61FF] mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Transform Your Learning?</h2>
            <p className="text-[#94A3B8] mb-8 max-w-xl mx-auto">Join thousands of students who have already mastered DSA with our AI-powered visual learning approach.</p>
            <Link to="/learn">
              <button className="h-14 px-10 bg-gradient-to-r from-[#7B61FF] to-[#F062D0] hover:opacity-90 text-white font-semibold rounded-xl flex items-center gap-2 mx-auto transition-all">
                <Target className="w-5 h-5" />Start Your Journey
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#7B61FF]" />
            <span className="text-white font-semibold">AlgoVision</span>
          </div>
          <p className="text-[#64748B] text-sm">2024 AlgoVision. Learn DSA Visually.</p>
        </div>
      </footer>
    </div>
  )
}
