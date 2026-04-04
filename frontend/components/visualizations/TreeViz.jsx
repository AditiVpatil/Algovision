import { useState } from 'react'
import { Play, SkipForward, RotateCcw } from 'lucide-react'

/*  Simple tree: 
        4
      2   6
    1  3 5  7
  Inorder: 1,2,3,4,5,6,7
*/
const TREE = {
  val: 4, id: 4,
  left: {
    val: 2, id: 2,
    left:  { val: 1, id: 1, left: null, right: null },
    right: { val: 3, id: 3, left: null, right: null },
  },
  right: {
    val: 6, id: 6,
    left:  { val: 5, id: 5, left: null, right: null },
    right: { val: 7, id: 7, left: null, right: null },
  },
}

function inorderSteps(node, steps = []) {
  if (!node) return steps
  inorderSteps(node.left, steps)
  steps.push({ visitId: node.id, msg: `Visit node ${node.val}` })
  inorderSteps(node.right, steps)
  return steps
}

function TreeNode({ node, visitedIds, currentId }) {
  if (!node) return <div className="w-10" />
  const isCurrent = node.id === currentId
  const isVisited = visitedIds.includes(node.id)

  return (
    <div className="flex flex-col items-center">
      <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold font-mono transition-all duration-400 ${
        isCurrent
          ? 'border-[#F062D0] bg-[#F062D0]/20 text-[#F062D0] shadow-lg shadow-pink-500/40 scale-125'
          : isVisited
          ? 'border-[#10B981] bg-[#10B981]/20 text-[#10B981]'
          : 'border-white/20 bg-white/5 text-[#94A3B8]'
      }`}>
        {node.val}
      </div>
      {(node.left || node.right) && (
        <div className="flex gap-8 mt-4 relative">
          {/* connector lines */}
          <svg className="absolute -top-4 left-0 w-full h-4 overflow-visible pointer-events-none">
            {node.left && <line x1="50%" y1="0" x2="25%" y2="100%" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />}
            {node.right && <line x1="50%" y1="0" x2="75%" y2="100%" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />}
          </svg>
          <TreeNode node={node.left}  visitedIds={visitedIds} currentId={currentId} />
          <TreeNode node={node.right} visitedIds={visitedIds} currentId={currentId} />
        </div>
      )}
    </div>
  )
}

export function TreeViz() {
  const steps = [{ visitId: -1, msg: 'Press Next to start Inorder traversal (L → Root → R)' }, ...inorderSteps(TREE)]
  const [step, setStep]   = useState(0)
  const [visited, setVisited] = useState([])

  const current = steps[step]

  const next = () => {
    if (step >= steps.length - 1) return
    const ns = step + 1
    setStep(ns)
    if (steps[ns].visitId !== -1) setVisited(v => [...v, steps[ns].visitId])
  }

  const reset = () => { setStep(0); setVisited([]) }

  const play = async () => {
    for (let i = step + 1; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 800))
      setStep(i)
      if (steps[i].visitId !== -1) setVisited(v => [...v, steps[i].visitId])
    }
  }

  const order = visited.map(id => {
    const find = (n) => {
      if (!n) return null
      if (n.id === id) return n.val
      return find(n.left) || find(n.right)
    }
    return find(TREE)
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={play} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#7B61FF] to-[#F062D0] text-white text-sm font-medium hover:opacity-90">
          <Play className="w-4 h-4" /> Auto Play
        </button>
        <button onClick={next} disabled={step >= steps.length - 1} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 disabled:opacity-40">
          <SkipForward className="w-4 h-4" /> Next
        </button>
        <button onClick={reset} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10">
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
        <span className="ml-auto text-xs text-[#64748B]">Step {step}/{steps.length - 1}</span>
      </div>

      {/* Tree */}
      <div className="flex justify-center py-6 px-4 bg-white/[0.02] rounded-2xl border border-white/5 overflow-x-auto">
        <TreeNode node={TREE} visitedIds={visited} currentId={current.visitId} />
      </div>

      {/* Traversal order */}
      {order.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-xs text-[#64748B] mr-1">Inorder:</span>
          {order.map((v, i) => (
            <span key={i} className="px-2 py-0.5 rounded-lg bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] text-xs font-mono">
              {v}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10">
        <span className="text-[#7B61FF] text-sm">→</span>
        <span className="text-xs font-mono text-[#94A3B8]">{current.msg}</span>
      </div>
    </div>
  )
}
