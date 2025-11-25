import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export default function ExportPDF({ result }) {
  const exportToPDF = async () => {
    const element = document.getElementById('result-container')
    const canvas = await html2canvas(element)
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const width = pdf.internal.pageSize.getWidth()
    const height = (canvas.height * width) / canvas.width
    pdf.addImage(imgData, 'PNG', 0, 0, width, height)
    pdf.save(`AI-Report-${Date.now()}.pdf`)
  }

  return (
    <button
      onClick={exportToPDF}
      className="fixed bottom-8 right-8 bg-purple-600 hover:bg-purple-700 px-8 py-4 rounded-full text-xl font-bold shadow-2xl z-50"
    >
      Export PDF
    </button>
  )
}