import { useState } from 'react'
import { Play, ChevronRight, SkipForward, RotateCcw } from 'lucide-react'

const DEFAULT_ARR = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
const TARGET = 7

function buildSteps(arr, target) {
  const steps = []
  let left = 0, right = arr.length - 1
  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    steps.push({ left, right, mid, found: arr[mid] === target, eliminated: [] })
    if (arr[mid] === target) break
    else if (arr[mid] < target) left = mid + 1
    else right = mid - 1
  }
  if (left > right) steps.push({ left, right, mid: -1, notFound: true })
  return steps
}

export function BinarySearchViz({ arr = DEFAULT_ARR, target = TARGET }) {
  const steps = buildSteps(arr, target)
  const [step, setStep] = useState(0)
  const current = steps[Math.min(step, steps.length - 1)]

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1))
  const reset = () => setStep(0)
  const play = async () => {
    for (let i = step + 1; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 600))
      setStep(i)
    }
  }

  const eliminated = []
  for (let i = 0; i < step; i++) {
    const s = steps[i]
    if (s.mid < steps[Math.min(i + 1, steps.length - 1)].left) {
      for (let j = 0; j <= s.mid; j++) eliminated.push(j)
    } else {
      for (let j = s.mid; j < arr.length; j++) eliminated.push(j)
    }
  }

  const getColor = (i) => {
    if (current.found && i === current.mid) return 'border-[#10B981] bg-[#10B981]/20 text-[#10B981] shadow-lg shadow-green-500/30 scale-110'
    if (current.notFound) return 'border-rose-500/30 bg-rose-500/10 text-rose-400'
    if (i === current.mid) return 'border-[#F062D0] bg-[#F062D0]/20 text-[#F062D0] shadow-lg shadow-pink-500/30 scale-110'
    if (i === current.left || i === current.right) return 'border-[#7B61FF] bg-[#7B61FF]/20 text-[#7B61FF]'
    if (i < current.left || i > current.right) return 'border-white/5 bg-white/[0.02] text-[#334155]'
    return 'border-white/10 bg-white/5 text-[#94A3B8]'
  }

  const stepInfo = () => {
    if (current.notFound) return { icon: '❌', text: `Target ${target} not found in array` }
    if (current.found) return { icon: '✅', text: `Found ${target} at index ${current.mid}!` }
    const dir = arr[current.mid] < target ? 'right half' : 'left half'
    return { icon: '🔍', text: `mid=${current.mid}, arr[mid]=${arr[current.mid]} ${arr[current.mid] < target ? '<' : '>'} ${target} → search ${dir}` }
  }

  const info = stepInfo()

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={play} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#7B61FF] to-[#F062D0] text-white text-sm font-medium hover:opacity-90">
          <Play className="w-4 h-4" /> Auto Play
        </button>
        <button onClick={next} disabled={step >= steps.length - 1} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 disabled:opacity-40">
          <SkipForward className="w-4 h-4" /> Next Step
        </button>
        <button onClick={reset} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10">
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
        <div className="ml-auto flex items-center gap-2 text-xs text-[#64748B]">
          <span>Target: <span className="text-[#F062D0] font-bold">{target}</span></span>
          <span>Step {step + 1}/{steps.length}</span>
        </div>
      </div>

      {/* Array cells */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
        {arr.map((val, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className={`w-11 h-11 rounded-xl border-2 flex items-center justify-center text-sm font-bold font-mono transition-all duration-400 ${getColor(i)}`}>
              {val}
            </div>
            <span className="text-[10px] text-[#475569] font-mono">[{i}]</span>
          </div>
        ))}
      </div>

      {/* Pointer labels */}
      <div className="flex items-center gap-3 flex-wrap text-xs">
        {[
          { color: 'text-[#7B61FF]', bg: 'bg-[#7B61FF]/10 border-[#7B61FF]/30', label: 'left / right pointer' },
          { color: 'text-[#F062D0]', bg: 'bg-[#F062D0]/10 border-[#F062D0]/30', label: 'mid (comparing)' },
          { color: 'text-[#10B981]', bg: 'bg-[#10B981]/10 border-[#10B981]/30', label: 'found!' },
          { color: 'text-[#334155]', bg: 'bg-white/[0.02] border-white/5', label: 'eliminated' },
        ].map((l) => (
          <div key={l.label} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border ${l.bg}`}>
            <span className={`font-medium ${l.color}`}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Step log */}
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10">
        <span className="text-base">{info.icon}</span>
        <span className="text-xs font-mono text-[#94A3B8]">{info.text}</span>
      </div>
    </div>
  )
}
