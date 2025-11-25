import HighlightedText from './HighlightedText'

export default function ResultDisplay({ result }) {
  if (result.error) return null

  const isAI = result.overall_ai_probability > 60

  return (
    <div className="mt-16 animate-fade-in">
      <div class-grow className={`text-center p-10 rounded-3xl border-4 ${isAI ? 'bg-red-900/60 border-red-500' : 'bg-green-900/60 border-green-500'}`}>
        <h2 className="text-5xl font-black mb-6">
          {isAI ? "Likely AI-Generated" : "Likely Human-Written"}
        </h2>
        <div className="text-9xl font-black bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          {result.overall_ai_probability}%
        </div>
        <p className="text-3xl mt-4">AI • {result.overall_human_probability}% Human</p>
      </div>

      <div className="mt-12">
        <h3 className="text-4xl font-bold text-center mb-8">Sentence Analysis</h3>
        <div className="bg-black/40 rounded-2xl p-8 max-h-screen overflow-y-auto space-y-4">
          {result.sentence_analysis.map((s) => (
            <HighlightedText key={s.id} sentence={s} />
          ))}
        </div>
      </div>

      <div className="mt-10 flex justify-center gap-8 flex-wrap text-lg">
        <div className="flex items-center gap-3"><div className="w-8 h-8 bg-red-600 rounded"></div> 80%+ AI</div>
        <div className="flex items-center gap-3"><div className="w-8 h-8 bg-orange-600 rounded"></div> 60–80%</div>
        <div className="flex items-center gap-3"><div className="w-8 h-8 bg-yellow-600 rounded"></div> 40–60%</div>
        <div className="flex items-center gap-3"><div className="w-8 h-8 bg-green-600 rounded"></div> Human</div>
      </div>
    </div>
  )
}