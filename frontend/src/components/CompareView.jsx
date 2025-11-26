import HighlightedText from './HighlightedText'

export default function CompareView({ doc1, doc2 }) {
  return (
    <div className="grid lg:grid-cols-2 gap-12 mt-20">
      <div className="bg-black/50 rounded-3xl p-10">
        <h3 className="text-5xl font-bold text-cyan-400 mb-8">Document 1 — {doc1.overall_ai_probability}% AI</h3>
        {doc1.sentence_analysis?.map(s => <HighlightedText key={s.id} sentence={s} />)}
      </div>
      <div className="bg-black/50 rounded-3xl p-10">
        <h3 className="text-5xl font-bold text-pink-400 mb-8">Document 2 — {doc2.overall_ai_probability}% AI</h3>
        {doc2.sentence_analysis?.map(s => <HighlightedText key={s.id} sentence={s} />)}
      </div>
    </div>
  )
}