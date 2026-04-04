import { useState } from 'react'
import { CheckCircle2, XCircle, ChevronRight, RotateCcw, HelpCircle } from 'lucide-react'

export function QuickQuiz({ questions = [], onComplete }) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [score, setScore] = useState(0)
  const [isFinished, setIsFinished] = useState(false)

  const handleSelect = (idx) => {
    if (showFeedback) return
    setSelected(idx)
  }

  const handleCheck = () => {
    if (selected === null) return
    const isCorrect = selected === questions[current].answer
    if (isCorrect) setScore(s => s + 1)
    setShowFeedback(true)
  }

  const handleNext = () => {
    const isCorrect = selected === questions[current]?.answer
    const finalScore = score + (isCorrect ? 1 : 0)

    if (current + 1 < questions.length) {
      setCurrent(c => c + 1)
      setSelected(null)
      setShowFeedback(false)
    } else {
      setIsFinished(true)
      if (onComplete) onComplete(finalScore)
    }
  }

  const reset = () => {
    setCurrent(0)
    setSelected(null)
    setShowFeedback(false)
    setScore(0)
    setIsFinished(false)
  }

  if (isFinished) {
    return (
      <div className="text-center py-10 animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-gradient-to-br from-[#7B61FF] to-[#F062D0] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/20">
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Quiz Completed!</h3>
        <p className="text-[#94A3B8] mb-6">You scored {score} out of {questions.length} questions correctly.</p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors text-sm font-semibold"
        >
          <RotateCcw className="w-4 h-4" /> Try Again
        </button>
      </div>
    )
  }

  const q = questions[current]
  if (!q) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-[#7B61FF]">
          <HelpCircle className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Quick Question {current + 1}/{questions.length}</span>
        </div>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div key={i} className={`w-8 h-1 rounded-full ${i <= current ? 'bg-[#7B61FF]' : 'bg-white/10'}`} />
          ))}
        </div>
      </div>

      <h3 className="text-lg font-bold text-white leading-relaxed">{q.question}</h3>

      <div className="grid gap-3">
        {q.options.map((opt, i) => {
          const isSelected = selected === i
          const isCorrect = i === q.answer
          let borderClass = 'border-white/10 hover:border-[#7B61FF]/50 bg-white/5'
          
          if (showFeedback) {
            if (isCorrect) borderClass = 'border-emerald-500/50 bg-emerald-500/10'
            else if (isSelected) borderClass = 'border-rose-500/50 bg-rose-500/10'
            else borderClass = 'border-white/5 opacity-50'
          } else if (isSelected) {
            borderClass = 'border-[#7B61FF] bg-[#7B61FF]/10'
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={showFeedback}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-center justify-between group ${borderClass}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-lg border flex items-center justify-center text-xs font-bold ${
                  isSelected ? 'bg-[#7B61FF] border-[#7B61FF] text-white' : 'border-white/20 text-[#64748B] group-hover:border-[#7B61FF]/50'
                }`}>
                  {String.fromCharCode(65 + i)}
                </div>
                <span className={`text-sm ${isSelected ? 'text-white font-medium' : 'text-[#94A3B8]'}`}>{opt}</span>
              </div>
              {showFeedback && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              {showFeedback && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-500" />}
            </button>
          )
        })}
      </div>

      {showFeedback && (
        <div className="p-4 rounded-xl bg-[#7B61FF]/5 border border-[#7B61FF]/10 animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-xs text-[#CBD5E1] leading-relaxed">
            <span className="font-bold text-[#7B61FF]">Explanation: </span>
            {q.explanation}
          </p>
        </div>
      )}

      <div className="flex justify-end pt-4">
        {!showFeedback ? (
          <button
            onClick={handleCheck}
            disabled={selected === null}
            className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-gradient-to-r from-[#7B61FF] to-[#F062D0] text-white text-sm font-bold shadow-lg shadow-purple-500/20 hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            Check Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-[#7B61FF] text-white text-sm font-bold hover:bg-[#6D52EE] transition-colors"
          >
            {current + 1 < questions.length ? 'Next Question' : 'Finish Quiz'}
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
