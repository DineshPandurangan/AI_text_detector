import { useState } from 'react'
import ResultDisplay from './components/ResultDisplay'
import CompareView from './components/CompareView'
import ExportPDF from './components/ExportPDF'

export default function App() {
  const [result, setResult] = useState(null)
  const [compareMode, setCompareMode] = useState(false)
  const [doc1, setDoc1] = useState(null)
  const [doc2, setDoc2] = useState(null)
  const [loading, setLoading] = useState(false)
  const [text, setText] = useState('')

  const analyzeText = async () => {
    if (!text.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/detect-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      const data = await res.json()
      if (compareMode) {
        if (!doc1) setDoc1(data)
        else setDoc2(data)
      } else {
        setResult(data)
      }
    } catch (e) {
      alert("Backend not running on port 8000")
    } finally {
      setLoading(false)
    }
  }

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await fetch('/api/detect', { method: 'POST', body: form })
      const data = await res.json()
      if (compareMode) {
        if (!doc1) setDoc1(data)
        else setDoc2(data)
      } else {
        setResult(data)
      }
    } catch (e) {
      alert("Upload failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <h1 className="text-6xl md:text-8xl font-black text-center mb-8 bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
          AI Detector Pro
        </h1>
        <p className="text-center text-xl mb-12 text-gray-300">
          Word-level AI detection • Fake reference checker • PDF export • Document comparison
        </p>

        {/* Mode Toggle */}
        <div className="flex justify-center gap-8 mb-12">
          <button
            onClick={() => { setCompareMode(false); setResult(null); setDoc1(null); setDoc2(null); }}
            className={`px-10 py-4 rounded-2xl text-2xl font-bold transition-all ${!compareMode ? 'bg-purple-600 shadow-2xl scale-105' : 'bg-gray-800'}`}
          >
            Single Analysis
          </button>
          <button
            onClick={() => { setCompareMode(true); setResult(null); setDoc1(null); setDoc2(null); }}
            className={`px-10 py-4 rounded-2xl text-2xl font-bold transition-all ${compareMode ? 'bg-purple-600 shadow-2xl scale-105' : 'bg-gray-800'}`}
          >
            Compare Documents
          </button>
        </div>

        {/* Input Grid */}
        <div className="grid lg:grid-cols-2 gap-10 mb-16">
          <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-10 border border-purple-800/50">
            <h2 className="text-4xl font-bold mb-6">Paste Text</h2>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your research paper here..."
              className="w-full h-96 bg-black/60 border border-purple-700 rounded-2xl p-8 text-lg resize-none focus:outline-none focus:border-purple-400 transition"
            />
            <button
              onClick={analyzeText}
              disabled={loading || !text.trim()}
              className="mt-8 w-full py-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-3xl font-bold hover:scale-105 transition disabled:opacity-50"
            >
              {loading ? "Analyzing..." : "Detect AI"}
            </button>
          </div>

          <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-10 border border-purple-800/50 text-center">
            <h2 className="text-4xl font-bold mb-6">
              Upload File {compareMode && <span className="text-purple-400">• Doc {doc1 ? 2 : 1}</span>}
            </h2>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFile}
              className="text-2xl file:mr-8 file:py-6 file:px-12 file:rounded-2xl file:bg-purple-600 file:text-white hover:file:bg-purple-700"
            />
          </div>
        </div>

        {/* Loading & Results */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-20 w-20 border-t-4 border-purple-500"></div>
            <p className="mt-8 text-4xl">Analyzing text & checking references...</p>
          </div>
        )}

        {compareMode && doc1 && doc2 && <CompareView doc1={doc1} doc2={doc2} />}
        {result && !compareMode && (
          <div id="result-container">
            <ResultDisplay result={result} />
            <ExportPDF />
          </div>
        )}
      </div>
    </div>
  )
}