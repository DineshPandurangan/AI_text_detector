import HighlightedText from './HighlightedText'

export default function CompareView({ doc1, doc2 }) {
  return (
    <div className="grid lg:grid-cols-2 gap-10 mt-10">
      <div className="bg-black/50 rounded-3xl p-8">
        <h3 className="text-3xl font-bold text-cyan-400 mb-6">Document 1</h3>
        <div className="text-6xl font-black">{doc1.overall_ai_probability}% AI</div>
        {doc1.sentence_analysis?.map(s => <HighlightedText key={s.id} sentence={s} />)}
      </div>
      <div className="bg-black/50 rounded-3xl p-8">
        <h3 className="text-3xl font-bold text-pink-400 mb-6">Document 2</h3>
        <div className="text-6xl font-black">{doc2.overall_ai_probability}% AI</div>
        {doc2.sentence_analysis?.map(s => <HighlightedText key={s.id} sentence={s} />)}
      </div>
    </div>
  )
}