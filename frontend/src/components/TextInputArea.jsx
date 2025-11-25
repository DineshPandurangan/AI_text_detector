import { useState } from 'react'

export default function TextInputArea({ onAnalyze, loading }) {
  const [text, setText] = useState('')

  const handleSubmit = () => {
    if (text.trim()) onAnalyze(text.trim())
  }

  return (
    <div className="bg-black/40 backdrop-blur rounded-3xl p-8 border border-purple-500">
      <h2 className="text-3xl font-bold mb-6">Paste Your Text</h2>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste any text here to check if it's AI-generated..."
        className="w-full h-96 bg-black/60 border border-purple-700 rounded-xl p-6 text-lg resize-none focus:outline-none focus:border-purple-400"
      />
      <button
        onClick={handleSubmit}
        disabled={loading || !text.trim()}
        className="mt-6 w-full py-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-xl hover:scale-105 transition disabled:opacity-50"
      >
        {loading ? "Analyzing..." : "Detect AI Text"}
      </button>
    </div>
  )
}