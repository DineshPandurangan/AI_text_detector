export default function ReferenceCheck({ references }) {
  if (!references || references.length === 0) {
    return (
      <div className="mt-20 bg-black/50 rounded-3xl p-12 text-center">
        <p className="text-3xl text-gray-400">No references detected</p>
      </div>
    )
  }

  return (
    <div className="mt-20 bg-black/60 backdrop-blur rounded-3xl p-12 border border-purple-800">
      <h3 className="text-5xl font-black text-center mb-12 bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
        Reference Validation Results
      </h3>
      <p className="text-center text-2xl mb-10">
        Found: {references.length} • Valid: <span className="text-green-400 font-bold">{references.filter(r => r.valid).length}</span> • Fake: <span className="text-red-400 font-bold">{references.filter(r => !r.valid).length}</span>
      </p>

      <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8">
        {references.map((ref, i) => (
          <div
            key={i}
            className={`p-8 rounded-2xl border-4 shadow-2xl transition-all ${
              ref.valid
                ? 'bg-green-900/70 border-green-500 hover:scale-105'
                : 'bg-red-900/90 border-red-500 animate-pulse'
            }`}
          >
            <p className="font-mono text-sm md:text-base leading-relaxed mb-4 break-all">
              {ref.text}
            </p>
            <div className="mt-4">
              <p className="text-2xl font-bold">
                {ref.valid ? `Valid (${ref.source})` : "FAKE REFERENCE"}
              </p>
              {ref.valid && ref.title && (
                <p className="text-sm mt-3 italic opacity-90">"{ref.title}"</p>
              )}
              {ref.valid && ref.url && (
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-4 px-6 py-3 bg-cyan-600 rounded-xl hover:bg-cyan-500 transition text-lg font-semibold"
                >
                  Open Paper
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}