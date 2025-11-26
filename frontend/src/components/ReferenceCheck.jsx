export default function ReferenceCheck({ references }) {
  if (!references || references.length === 0) {
    return <div className="text-center text-4xl text-gray-400 mt-20">No references detected</div>
  }

  const apis = ["Crossref", "OpenAlex", "PubMed", "arXiv"]

  return (
    <div className="mt-20 bg-black/80 rounded-3xl p-12 border-4 border-purple-600">
      <h3 className="text-7xl font-black text-center mb-12 bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
        Final Reference Validation Report
      </h3>

      <div className="space-y-12">
        {references.map((ref, i) => (
          <div key={i} className={`p-10 rounded-3xl border-4 shadow-2xl ${ref.valid ? 'bg-green-900/90 border-green-500' : 'bg-red-900/90 border-red-500 animate-pulse'}`}>
            <p className="font-mono text-sm leading-relaxed mb-6 opacity-90 break-all">{ref.text}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {apis.map(api => {
                const c = ref.checks[api]
                if (!c.checked) {
                  return <div key={api} className="text-center p-4 bg-gray-800/80 rounded-xl text-gray-500 text-sm">Not applicable</div>
                }
                return (
                  <div key={api} className={`p-5 rounded-xl text-center font-bold ${c.passed ? 'bg-green-700' : 'bg-red-800'}`}>
                    <div className="text-lg">{api}</div>
                    <div className="text-2xl">{c.passed ? "PASSED" : "FAILED"}</div>
                    <div className="text-xs mt-2 opacity-80">{c.note}</div>
                    {c.passed && c.url && <a href={c.url} target="_blank" className="block mt-2 text-cyan-300 underline text-xs">Open</a>}
                  </div>
                )
              })}
            </div>

            <div className="text-center">
              <p className={`text-5xl font-black ${ref.valid ? 'text-green-400' : 'text-red-400'}`}>
                {ref.verdict}
              </p>
              <p className="text-xl mt-4 text-yellow-300 font-medium">{ref.reason}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}