import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Search, Bell, Zap, LogOut } from 'lucide-react'

export function Navbar() {
  const { pathname } = useLocation()
  const pageTitle = {
    '/': 'Home',
    '/learn': 'Learn DSA',
    '/practice': 'Practice',
    '/dashboard': 'Dashboard',
  }[pathname] || 'AlgoVision'

  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('av_user') || 'null')

  const handleLogout = () => {
    localStorage.removeItem('av_token')
    localStorage.removeItem('av_user')
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-30 backdrop-blur-xl bg-[#0A0F1E]/80 border-b border-white/5 h-16">
      <div className="max-w-full mx-auto px-6 h-full flex items-center justify-between gap-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7B61FF] to-[#F062D0] flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold text-white">AlgoVision</span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-sm">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl border bg-white/5 border-white/10 hover:border-[#7B61FF]/40 transition-all">
            <Search className="w-4 h-4 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search topics, problems..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-[#64748B] outline-none"
            />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {user ? (
            <>
              <button className="relative text-[#64748B] hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#F062D0] rounded-full" />
              </button>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded-full border border-white/5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#7B61FF] to-[#F062D0] flex items-center justify-center text-white text-xs font-bold uppercase">
                     {user.username?.[0] || user.email[0]}
                  </div>
                  <span className="text-sm font-medium text-white hidden sm:block pr-2">
                     {user.username || user.email.split('@')[0]}
                  </span>
                </div>
                <button onClick={handleLogout} className="text-[#64748B] hover:text-rose-400 transition-colors p-2" title="Log out">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-white hover:text-[#7B61FF] transition-colors">
                 Log in
              </Link>
              <Link to="/login" className="px-5 py-2 text-sm font-bold bg-gradient-to-r from-[#7B61FF] to-[#F062D0] text-white rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap shadow-lg shadow-purple-500/20">
                 Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
