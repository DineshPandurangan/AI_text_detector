import { useState, useEffect, useRef } from 'react'
import ExportPDF from './components/ExportPDF'
import CompareView from './components/CompareView'
import ResultDisplay from './components/ResultDisplay'

function App() {
  const [result, setResult] = useState(null)
  const [compareMode, setCompareMode] = useState(false)
  const [doc1, setDoc1] = useState(null)
  const [doc2, setDoc2] = useState(null)
  const [loading, setLoading] = useState(false)
  const [textInput, setTextInput] = useState('')
  const [fileInput, setFileInput] = useState(null)

  const debounceRef = useRef(null)

  // Debounced text analysis
  useEffect(() => {
    if (!textInput.trim() || textInput.length < 50) {
      setResult(null)
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/detect-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: textInput })
        })
        const data = await res.json()
        if (!data.error) setResult(data)
      } catch (err) {
        console.error("Analysis failed:", err)
      } finally {
        setLoading(false)
      }
    }, 800) // 800ms delay after user stops typing
  }, [textInput])

  // File analysis
  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setFileInput(file)
    setLoading(true)

    const form = new FormData()
    form.append('file', file)

    try {
      const res = await fetch('/api/detect', { method: 'POST', body: form })
      const data = await res.json()

      if (compareMode) {
        if (!doc1) setDoc1(data)
        else if (!doc2) setDoc2(data)
      } else {
        setResult(data)
      }
    } catch (err) {
      alert("File analysis failed")
    } finally {
      setLoading(false)
    }
  }

  const resetCompare = () => {
    setCompareMode(true)
    setDoc1(null)
    setDoc2(null)
    setResult(null)
    setTextInput('')
    setFileInput(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white py-10">
      <div className="container mx-auto px-6 max-w-7xl">

        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            AI Detector Pro
          </h1>
          <p className="mt-4 text-xl text-gray-300">Detect AI text • Word-level highlights • Export & Compare</p>

          <div className="mt-10 flex justify-center gap-6 flex-wrap">
            <button
              onClick={() => { setCompareMode(false); setDoc1(null); setDoc2(null); setResult(null); }}
              className={`px-10 py-4 rounded-2xl text-xl font-bold transition-all ${!compareMode ? 'bg-purple-600 shadow-lg scale-105' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              Single Analysis
            </button>
            <button
              onClick={resetCompare}
              className={`px-10 py-4 rounded-2xl text-xl font-bold transition-all ${compareMode ? 'bg-purple-600 shadow-lg scale-105' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              Compare Two Documents
            </button>
          </div>
        </header>

        {/* Input Section */}
        <div className="grid lg:grid-cols-2 gap-10 mb-12">
          {/* Text Input */}
          <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-8 border border-purple-800/50">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              Paste Text {textInput.length > 0 && <span className="text-sm text-gray-400">({textInput.length} chars)</span>}
            </h2>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Start typing or paste your text here... (Analysis starts automatically after 50 characters)"
              className="w-full h-80 bg-black/60 border border-purple-700 rounded-2xl p-6 text-lg resize-none focus:outline-none focus:border-purple-400 transition"
            />
            {textInput.length > 0 && textInput.length < 50 && (
              <p className="mt-4 text-yellow-400 text-center">Keep typing... ({50 - textInput.length} more characters needed)</p>
            )}
          </div>

          {/* File Upload */}
          <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-8 border border-purple-800/50 text-center">
            <h2 className="text-3xl font-bold mb-6">
              Upload Document {compareMode && <span className="text-purple-400">• Doc {doc1 ? 2 : 1}</span>}
            </h2>
            <div className="border-4 border-dashed border-purple-600 rounded-3xl p-16 hover:bg-purple-900/20 transition-all cursor-pointer">
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="text-8xl mb-6">Upload</div>
                <p className="text-2xl text-gray-300">PDF • DOCX • TXT</p>
                <p className="mt-6 text-purple-400 text-lg">
                  {fileInput ? fileInput.name : "Click or drop file here"}
                </p>
              </label>
            </div>
            {fileInput && (
              <button
                onClick={() => { setFileInput(null); document.getElementById('file-upload').value = '' }}
                className="mt-6 text-red-400 hover:text-red-300"
              >
                Clear file
              </button>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500"></div>
            <p className="mt-6 text-3xl">Analyzing content...</p>
          </div>
        )}

        {/* Results */}
        {compareMode && doc1 && doc2 && <CompareView doc1={doc1} doc2={doc2} />}
        {result && !compareMode && !loading && (
          <div id="result-container" className="relative">
            <ResultDisplay result={result} />
            <ExportPDF />
          </div>
        )}

        {/* Footer */}
        <footer className="text-center mt-20 text-gray-500">
          <p>Advanced AI detection with word-level highlighting • Built with Vite + FastAPI</p>
        </footer>
      </div>
    </div>
  )
}

export default App