import { Link, useLocation } from 'react-router-dom'
import { Home, BookOpen, Code2, BarChart3, Zap } from 'lucide-react'

const navigationItems = [
  { href: '/',          label: 'Home',       icon: Home },
  { href: '/learn',     label: 'Learn DSA',  icon: BookOpen },
  { href: '/practice',  label: 'Practice',   icon: Code2 },
  { href: '/dashboard', label: 'Dashboard',  icon: BarChart3 },
]

export function LeftSidebar() {
  const { pathname } = useLocation()
  const user = JSON.parse(localStorage.getItem('av_user') || 'null')

  return (
    <aside className="hidden md:flex w-64 flex-col bg-gradient-to-b from-[#0A0F1E] to-[#0F172A] border-r border-white/5 h-screen sticky top-0 z-40">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7B61FF] to-[#F062D0] flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-shadow">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-base font-bold text-white tracking-tight">AlgoVision</span>
            <p className="text-[10px] text-[#F062D0] font-medium">AI Learning Platform</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-[#7B61FF]/20 to-[#F062D0]/10 border border-[#7B61FF]/30 text-white'
                  : 'text-[#64748B] hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-[#7B61FF]' : 'text-[#64748B] group-hover:text-[#7B61FF]'}`} />
              <span className="text-sm font-medium">{item.label}</span>
              {isActive && <span className="ml-auto w-1.5 h-1.5 bg-[#7B61FF] rounded-full" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-white/5 space-y-3">
        {user ? (
          <div className="px-4 py-3 rounded-xl bg-gradient-to-br from-[#7B61FF]/10 to-[#F062D0]/10 border border-[#7B61FF]/20">
            <p className="text-[10px] uppercase tracking-widest text-[#7B61FF] font-semibold mb-1">🔥 Current Streak</p>
            <p className="text-2xl font-bold text-white">32 Days</p>
            <p className="text-xs text-[#94A3B8] mt-0.5">Keep pushing! 💪</p>
          </div>
        ) : (
          <div className="text-center px-2 py-3 rounded-xl bg-white/5 border border-white/10 mb-3">
            <p className="text-[#94A3B8] text-xs font-medium">Log in to track progress and streaks.</p>
          </div>
        )}
        
        {!user && (
          <Link to="/login" className="block">
            <button className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7B61FF] to-[#F062D0] text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20">
              Sign In / Sign Up
            </button>
          </Link>
        )}
      </div>
    </aside>
  )
}
