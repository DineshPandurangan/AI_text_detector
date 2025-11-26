import HighlightedText from './HighlightedText'
import ReferenceCheck from './ReferenceCheck'
import ExportPDF from './ExportPDF'

export default function ResultDisplay({ result }) {
  if (result.error) {
    return <div className="text-red-400 text-center text-4xl mt-20">{result.error}</div>
  }

  const isAI = result.overall_ai_probability > 60

  return (
    <div id="result-container" className="mt-16 space-y-12">
      {/* Overall Score */}
      <div className={`text-center py-16 rounded-3xl border-8 ${isAI ? 'bg-red-900/70 border-red-500' : 'bg-green-900/70 border-green-500'}`}>
        <h2 className="text-6xl md:text-8xl font-black mb-6">
          {isAI ? "Likely AI-Generated" : "Likely Human-Written"}
        </h2>
        <div className="text-9xl font-black bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          {result.overall_ai_probability}%
        </div>
        <p className="text-3xl mt-6 text-gray-300">
          Human: {result.overall_human_probability}%
        </p>
      </div>

      {/* Sentence Analysis */}
      <div className="space-y-8">
        {result.sentence_analysis?.map((sentence) => (
          <HighlightedText key={sentence.id} sentence={sentence} />
        ))}
      </div>

      {/* References */}
      {result.references && <ReferenceCheck references={result.references} />}

      {/* Export Button */}
      <ExportPDF />
    </div>
  )
}