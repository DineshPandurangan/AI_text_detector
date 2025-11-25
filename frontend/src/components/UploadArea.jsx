export default function UploadArea({ onUpload, loading }) {
  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) onUpload(file)
  }

  const handleChange = (e) => {
    if (e.target.files[0]) onUpload(e.target.files[0])
  }

  return (
    <div
      className="bg-black/40 backdrop-blur rounded-3xl p-8 border border-purple-500 text-center"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <h2 className="text-3xl font-bold mb-6">Or Upload File</h2>
      <input type="file" accept=".pdf,.docx,.txt" onChange={handleChange} className="hidden" id="upload" />
      <label htmlFor="upload" className="cursor-pointer">
        <div className="text-9xl mb-6">Upload</div>
        <p className="text-2xl text-gray-300">PDF, DOCX, or TXT</p>
        <p className="mt-4 text-purple-400">Click or drop file here</p>
      </label>
      {loading && <div className="mt-8 text-2xl">Processing file...</div>}
    </div>
  )
}