import WordHighlight from './WordHighlight'

export default function HighlightedText({ sentence }) {
  const score = sentence.ai_score
  const isTitle = sentence.is_title

  let bg = "bg-gray-800/70 border-gray-600"
  let border = "border-l-8"
  let textClass = "text-gray-100"

  if (isTitle) {
    bg = "bg-gradient-to-r from-purple-900/90 to-pink-900/90 border-purple-400"
    textClass = "text-white font-bold text-2xl"
  } else if (score > 80) {
    bg = "bg-red-900/90 border-red-500 animate-pulse"
  } else if (score > 60) {
    bg = "bg-orange-900/80 border-orange-500"
  } else if (score > 40) {
    bg = "bg-yellow-900/60 border-yellow-500"
  } else {
    bg = "bg-green-900/60 border-green-500"
  }

  return (
    <div className={`p-8 rounded-2xl ${border} ${bg} transition-all hover:scale-[1.02] shadow-2xl`}>
      {isTitle && <div className="text-purple-300 font-bold mb-3 text-sm uppercase tracking-wider">HEADING / TITLE</div>}
      
      <p className={`text-xl leading-relaxed ${textClass}`}>
        {sentence.words?.map((w, i) => (
          <WordHighlight key={i} word={w} />
        ))}
      </p>

      {!isTitle && (
        <div className="mt-6 text-right">
          <span className="text-4xl font-black text-white">{score.toFixed(1)}%</span>
          <span className="text-lg text-gray-400 ml-2">AI Score</span>
        </div>
      )}
    </div>
  )
}