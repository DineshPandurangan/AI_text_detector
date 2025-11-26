import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export default function ExportPDF() {
  const exportToPDF = async () => {
    const element = document.getElementById('result-container')
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#111827'
    })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const width = pdf.internal.pageSize.getWidth()
    const height = (canvas.height * width) / canvas.width
    pdf.addImage(imgData, 'PNG', 0, 0, width, height)
    pdf.save(`AI-Detector-Report-${Date.now()}.pdf`)
  }

  return (
    <button
      onClick={exportToPDF}
      className="fixed bottom-10 right-10 z-50 bg-gradient-to-r from-purple-600 to-pink-600 px-12 py-6 rounded-full text-3xl font-bold shadow-2xl hover:scale-110 transition"
    >
      Export PDF
    </button>
  )
}