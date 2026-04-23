import React, { forwardRef, useState, useEffect, memo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github.css'
import '../../assets/styles/markdown.css'
import './Preview.css'

// ImageWithFallback component defined outside to avoid recreation on each render
const ImageWithFallback = memo(({ paths, alt, src, ...imgProps }: { paths: string[]; alt: string; src: string; [key: string]: any }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [allFailed, setAllFailed] = useState(false)
  
  const handleError = () => {
    if (currentIndex < paths.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      setAllFailed(true)
    }
  }
  
  if (allFailed) {
    return (
      <div style={{ 
        width: '200px', 
        height: '100px', 
        backgroundColor: '#f0f0f0', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        border: '1px solid #ccc'
      }}>
        <span style={{ color: '#666', fontSize: '12px' }}>
          图片未找到: {src}
        </span>
      </div>
    )
  }
  
  return (
    <img 
      src={paths[currentIndex]} 
      alt={alt || ''} 
      loading="lazy" 
      onError={handleError}
      style={{ display: 'block' }}
      {...imgProps} 
    />
  )
})

interface PreviewProps {
  content: string
  docDir?: string
}

const Preview = forwardRef<HTMLDivElement, PreviewProps>(({ content, docDir }, ref) => {
  const [defaultDir, setDefaultDir] = useState<string>('')
  const [documentsDir, setDocumentsDir] = useState<string>('')

  useEffect(() => {
    // Always get default directory as fallback
    window.electronAPI?.fs.getDefaultDir().then(result => {
      if (result?.dir) {
        setDefaultDir(result.dir)
        setDocumentsDir(result.dir)
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
                    // Generate all possible paths upfront
                    const possiblePaths = []
                    const imageName = src.split('/').pop() || src.split('\\').pop() || 'image.png'
                    
                    // Try with effectiveDocDir if available (most likely to work)
                    if (effectiveDocDir) {
                      // Handle Windows paths properly
                      let fullPath = effectiveDocDir
                      // Convert backslashes to forward slashes
                      fullPath = fullPath.replace(/[\\]/g, '/')
                      // For Windows paths like C:/Users/...
                      if (fullPath.match(/^[a-zA-Z]:\//)) {
                        // For Windows, file:// URLs should be in the format file:///C:/path/to/file
                        possiblePaths.push(`file:///${fullPath}/${src.replace(/[\\]/g, '/')}`)
                      } else {
                        // For other paths
                        possiblePaths.push(`file:///${fullPath}/${src.replace(/[\\]/g, '/')}`)
                      }
                    }
                    
                    // Try with absolute path to documents directory
                    if (documentsDir) {
                      // Handle Windows paths properly
                      let docFullPath = documentsDir
                      // Convert backslashes to forward slashes
                      docFullPath = docFullPath.replace(/[\\]/g, '/')
                      // For Windows paths like C:/Users/...
                      if (docFullPath.match(/^[a-zA-Z]:\//)) {
                        // For Windows, file:// URLs should be in the format file:///C:/path/to/file
                        possiblePaths.push(`file:///${docFullPath}/${src.replace(/[\\]/g, '/')}`)
                      } else {
                        // For other paths
                        possiblePaths.push(`file:///${docFullPath}/${src.replace(/[\\]/g, '/')}`)
                      }
                    }
                    
                    // Try direct assets path with absolute path
                    if (documentsDir) {
                      let docFullPath = documentsDir
                      docFullPath = docFullPath.replace(/[\\]/g, '/')
                      if (docFullPath.match(/^[a-zA-Z]:\//)) {
                        possiblePaths.push(`file:///${docFullPath}/assets/${imageName}`)
                      }
                    }
                    
                    // Try assets directory in the same folder as the document
                    if (effectiveDocDir) {
                      let assetsPath = effectiveDocDir
                      assetsPath = assetsPath.replace(/[\\]/g, '/')
                      if (assetsPath.match(/^[a-zA-Z]:\//)) {
                        possiblePaths.push(`file:///${assetsPath}/assets/${imageName}`)
                      }
                    }
                    
                    // Try relative path
                    possiblePaths.push(src)
                    
                    // Try with current directory (relative path)
                    possiblePaths.push(`./${src}`)
                    
                    // Try with assets directory in current directory
                    possiblePaths.push(`./assets/${imageName}`)
                    
                    // Try with absolute path using C drive (common Windows path)
                    possiblePaths.push(`file:///C:/Users/User/Documents/assets/${imageName}`)
                    
                    return <ImageWithFallback paths={possiblePaths} alt={alt || ''} src={src} {...props} />
                  }
                  return <img src={src} alt={alt || ''} loading="lazy" style={{ display: 'block' }} {...props} />
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
