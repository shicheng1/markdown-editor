import { forwardRef, useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github.css'
import '../../assets/styles/markdown.css'
import './Preview.css'

interface PreviewProps {
  content: string
  docDir?: string
}

const Preview = forwardRef<HTMLDivElement, PreviewProps>(({ content, docDir }, ref) => {
  const [defaultDir, setDefaultDir] = useState<string>('')

  useEffect(() => {
    // Always get default directory as fallback
    window.electronAPI?.fs.getDefaultDir().then(result => {
      if (result?.dir) {
        setDefaultDir(result.dir)
      }
    })
  }, [])

  const effectiveDocDir = docDir || defaultDir

  return (
    <div className="preview-container" ref={ref}>
      <div className="preview-content">
        {content ? (
          <div className="markdown-preview">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeHighlight]}
              components={{
                a: ({ href, children, ...props }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                    {children}
                  </a>
                ),
                img: ({ src, alt, ...props }) => {
                  if (src && !src.startsWith('http') && !src.startsWith('data:') && !src.startsWith('file://')) {
                    // Try relative path first
                    const relativeUrl = src
                    // Also try with file:// protocol for local files
                    let fileUrl = src
                    if (effectiveDocDir) {
                      const fullPath = `${effectiveDocDir.replace(/\\/g, '/')}/${src.replace(/\\/g, '/')}`
                      fileUrl = `file:///${fullPath}`
                    }
                    // Use a fallback image that shows the path if loading fails
                    return (
                      <img 
                        src={fileUrl} 
                        alt={alt || ''} 
                        loading="lazy" 
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='100' viewBox='0 0 200 100'%3E%3Crect width='200' height='100' fill='%23f0f0f0'/%3E%3Ctext x='10' y='50' font-family='Arial' font-size='12' fill='%23666'%3EImage not found: ${encodeURIComponent(src)}%3C/text%3E%3C/svg%3E`
                          target.style.display = 'block'
                        }} 
                        {...props} 
                      />
                    )
                  }
                  return <img src={src} alt={alt || ''} loading="lazy" {...props} />
                },
                table: ({ children, ...props }) => (
                  <div className="table-wrapper">
                    <table {...props}>{children}</table>
                  </div>
                )
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="preview-empty">
            <div className="preview-empty-icon">📝</div>
            <p>开始输入 Markdown 内容以预览</p>
          </div>
        )}
      </div>
    </div>
  )
})

Preview.displayName = 'Preview'

export default Preview
