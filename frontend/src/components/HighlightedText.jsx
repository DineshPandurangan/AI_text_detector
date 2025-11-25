import WordHighlight from './WordHighlight'

export default function HighlightedText({ sentence }) {
  const score = sentence.ai_score
  const isTitle = sentence.is_title

  let bg = "bg-gray-800/70 border-gray-600"
  if (isTitle) bg = "bg-gradient-to-r from-purple-900 to-pink-900 border-purple-400"
  else if (score > 80) bg = "bg-red-900/90 border-red-500"
  else if (score > 60) bg = "bg-orange-900/80 border-orange-500"
  else if (score > 40) bg = "bg-yellow-900/60 border-yellow-500"
  else bg = "bg-green-900/60 border-green-500"

  return (
    <div className={`p-6 mb-4 rounded-xl border-l-8 ${bg} transition hover:scale-[1.02]`}>
      {isTitle && <div className="text-purple-300 font-bold mb-2">HEADING</div>}
      <p className="text-lg leading-relaxed">
        {sentence.words?.map((w, i) => <WordHighlight key={i} word={w} />)}
      </p>
      {!isTitle && (
        <div className="mt-3 text-right">
          <span className="text-2xl font-bold text-white">{score.toFixed(0)}% AI</span>
        </div>
      )}
    </div>
  )
}