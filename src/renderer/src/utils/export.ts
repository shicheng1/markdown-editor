import { useReactToPrint } from 'react-to-print'

export async function exportHTML(previewRef: React.RefObject<HTMLDivElement | null>): Promise<void> {
  if (!previewRef.current || !window.electronAPI) return

  const content = previewRef.current.innerHTML

  const htmlDocument = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Export</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 15px;
      line-height: 1.75;
      color: #1d1d1f;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 32px;
    }
    h1, h2, h3, h4, h5, h6 { margin-top: 1.5em; margin-bottom: 0.75em; font-weight: 600; line-height: 1.3; }
    h1 { font-size: 2em; padding-bottom: 0.3em; border-bottom: 1px solid #e5e5ea; }
    h2 { font-size: 1.5em; padding-bottom: 0.25em; border-bottom: 1px solid #e5e5ea; }
    h3 { font-size: 1.25em; }
    p { margin: 0 0 1em 0; }
    a { color: #0071e3; text-decoration: none; }
    a:hover { text-decoration: underline; }
    strong { font-weight: 600; }
    em { font-style: italic; }
    del { text-decoration: line-through; color: #6e6e73; }
    ul, ol { margin: 0 0 1em 0; padding-left: 2em; }
    li { margin-bottom: 0.25em; }
    blockquote { margin: 0 0 1em 0; padding: 0.5em 1em; border-left: 3px solid #0071e3; background: rgba(0, 113, 227, 0.04); color: #6e6e73; border-radius: 0 4px 4px 0; }
    code { font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace; font-size: 0.875em; background: #f5f5f7; border-radius: 4px; padding: 2px 6px; }
    pre { margin: 0 0 1em 0; padding: 16px; background: #f5f5f7; border-radius: 8px; overflow-x: auto; border: 1px solid #e5e5ea; }
    pre code { display: block; padding: 0; background: none; border-radius: 0; font-size: 0.85em; line-height: 1.6; }
    table { width: 100%; border-collapse: collapse; margin: 0 0 1em 0; }
    th { background: #f5f5f7; font-weight: 600; text-align: left; padding: 10px 14px; border-bottom: 2px solid #e5e5ea; }
    td { padding: 8px 14px; border-bottom: 1px solid #e5e5ea; }
    tr:last-child td { border-bottom: none; }
    tr:nth-child(even) { background: #f9f9fb; }
    hr { margin: 2em 0; border: none; height: 1px; background: #e5e5ea; }
    img { max-width: 100%; height: auto; border-radius: 8px; }
    .table-wrapper { overflow-x: auto; margin: 0 0 1em 0; }
  </style>
</head>
<body>
  <div class="markdown-preview">
    ${content}
  </div>
</body>
</html>`

  const result = await window.electronAPI.dialog.saveFile({
    title: '导出 HTML',
    defaultPath: 'document.html',
    filters: [{ name: 'HTML 文件', extensions: ['html'] }]
  })

  if (!result.canceled && result.filePath) {
    await window.electronAPI.fs.writeFile(result.filePath, htmlDocument)
  }
}

export async function exportPDF(previewRef: React.RefObject<HTMLDivElement | null>): Promise<void> {
  if (!previewRef.current || !window.electronAPI) return

  try {
    const { default: jsPDF } = await import('jspdf')
    const { default: html2canvas } = await import('html2canvas')

    const element = previewRef.current

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--preview-bg').trim() || '#ffffff'
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = pdfWidth - 20
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    let heightLeft = imgHeight
    let position = 10

    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
    heightLeft -= pdfHeight - 20

    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 10
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
      heightLeft -= pdfHeight - 20
    }

    const result = await window.electronAPI.dialog.saveFile({
      title: '导出 PDF',
      defaultPath: 'document.pdf',
      filters: [{ name: 'PDF 文件', extensions: ['pdf'] }]
    })

    if (!result.canceled && result.filePath) {
      // Use ArrayBuffer for binary-safe PDF writing
      const pdfArrayBuffer = pdf.output('arraybuffer')
      await window.electronAPI.fs.writeBinaryFile(result.filePath, pdfArrayBuffer)
    }
  } catch (error) {
    console.error('PDF export error:', error)
  }
}

export async function exportMarkdown(content: string): Promise<void> {
  if (!window.electronAPI) return

  const result = await window.electronAPI.dialog.saveFile({
    title: '导出 Markdown',
    defaultPath: 'document.md',
    filters: [{ name: 'Markdown 文件', extensions: ['md', 'markdown'] }]
  })

  if (!result.canceled && result.filePath) {
    await window.electronAPI.fs.writeFile(result.filePath, content)
  }
}

export function usePrint(previewRef: React.RefObject<HTMLDivElement | null>): () => void {
  const handlePrint = useReactToPrint({
    contentRef: previewRef,
    documentTitle: 'Markdown Document'
  })

  return handlePrint
}
