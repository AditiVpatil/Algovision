import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, ChevronRight } from 'lucide-react'

export function ArrayViz({ initialArray = [5, 2, 8, 1, 9, 3, 7, 4], mode = 'traverse' }) {
  const [arr] = useState(initialArray)
  const [current, setCurrent] = useState(-1)
  const [visited, setVisited] = useState([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [step, setStep] = useState(0)
  const [log, setLog] = useState('Press Play to start array traversal')
  const intervalRef = useRef(null)

  const reset = () => {
    clearInterval(intervalRef.current)
    setIsPlaying(false)
    setCurrent(-1)
    setVisited([])
    setStep(0)
    setLog('Press Play to start array traversal')
  }

  useEffect(() => {
    if (!isPlaying) { clearInterval(intervalRef.current); return }
    intervalRef.current = setInterval(() => {
      setStep((prev) => {
        const next = prev + 1
        if (next >= arr.length) {
          clearInterval(intervalRef.current)
          setIsPlaying(false)
          setCurrent(-1)
          setLog('✅ Traversal complete! Visited all ' + arr.length + ' elements.')
          return prev
        }
        setCurrent(next)
        setVisited((v) => [...v, next])
        setLog(`→ Visiting index ${next}: value = ${arr[next]}`)
        return next
      })
    }, 700)
    return () => clearInterval(intervalRef.current)
  }, [isPlaying, arr])

  const maxVal = Math.max(...arr)

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsPlaying((p) => !p)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#7B61FF] to-[#F062D0] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={reset}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
        <span className="ml-auto text-xs text-[#64748B] font-mono">Step {step}/{arr.length}</span>
      </div>

      {/* Bars */}
      <div className="flex items-end justify-center gap-2 h-48 px-4 bg-white/[0.02] rounded-2xl border border-white/5 py-4">
        {arr.map((val, i) => (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <span className="text-[10px] font-mono text-[#94A3B8]">{val}</span>
            <div
              className={`w-full rounded-t-lg transition-all duration-500 ${
                current === i
                  ? 'bg-gradient-to-t from-[#F062D0] to-[#FF8CDB] shadow-lg shadow-pink-500/40'
                  : visited.includes(i)
                  ? 'bg-gradient-to-t from-[#10B981] to-[#34D399]'
                  : 'bg-gradient-to-t from-[#7B61FF]/60 to-[#9B8FFF]/60'
              }`}
              style={{ height: `${(val / maxVal) * 120}px` }}
            />
            <span className={`text-[10px] font-mono ${current === i ? 'text-[#F062D0] font-bold' : 'text-[#64748B]'}`}>
              [{i}]
            </span>
          </div>
        ))}
      </div>

      {/* Legend + Log */}
      <div className="flex flex-wrap gap-3 text-xs">
        {[
          { color: 'from-[#7B61FF]/60 to-[#9B8FFF]/60', label: 'Unvisited' },
          { color: 'from-[#F062D0] to-[#FF8CDB]', label: 'Current' },
          { color: 'from-[#10B981] to-[#34D399]', label: 'Visited' },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded bg-gradient-to-r ${l.color}`} />
            <span className="text-[#94A3B8]">{l.label}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
        <ChevronRight className="w-3.5 h-3.5 text-[#7B61FF] flex-shrink-0" />
        <span className="text-xs font-mono text-[#94A3B8]">{log}</span>
      </div>
    </div>
  )
}
