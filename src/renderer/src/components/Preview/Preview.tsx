import React, { forwardRef, useState, useEffect, memo, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github.css'
import '../../assets/styles/markdown.css'
import './Preview.css'

// ImageWithFallback component defined outside to avoid recreation on each render
const ImageWithFallback = memo(({ paths, alt, src, ...imgProps }: { paths: string[]; alt: string; src: string; [key: string]: any }) => {
  const currentIndexRef = useRef(0)
  const allFailedRef = useRef(false)
  
  const handleError = () => {
    if (currentIndexRef.current < paths.length - 1) {
      currentIndexRef.current += 1
      // 重新渲染组件以尝试下一个路径
      forceUpdate()
    } else {
      allFailedRef.current = true
      forceUpdate()
    }
  }
  
  // 简单的forceUpdate实现
  const [, forceUpdate] = useState({})
  
  if (allFailedRef.current) {
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
      src={paths[currentIndexRef.current]} 
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
                    // 使用useMemo缓存路径计算，避免每次渲染都重新创建数组
                    const possiblePaths = React.useMemo(() => {
                      console.log('处理图片路径:', src)
                      const paths = []
                      const imageName = src.split('/').pop() || src.split('\\').pop() || 'image.png'
                      console.log('图片名称:', imageName)
                      
                      // Try with effectiveDocDir if available (most likely to work)
                      console.log('effectiveDocDir:', effectiveDocDir)
                      console.log('documentsDir:', documentsDir)
                      if (effectiveDocDir) {
                        // Handle Windows paths properly
                        let fullPath = effectiveDocDir
                        // Convert backslashes to forward slashes
                        fullPath = fullPath.replace(/[\\]/g, '/')
                        // For Windows paths like C:/Users/...
                        if (fullPath.match(/^[a-zA-Z]:\//)) {
                          // For Windows, file:// URLs should be in the format file:///C:/path/to/file
                          const filePath = `safe-file://${fullPath}/${src.replace(/[\\]/g, '/')}`
                          paths.push(filePath)
                          console.log('添加路径1:', filePath)
                        } else {
                          // For other paths
                          const filePath = `safe-file://${fullPath}/${src.replace(/[\\]/g, '/')}`
                          paths.push(filePath)
                          console.log('添加路径2:', filePath)
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
                          const filePath = `safe-file://${docFullPath}/${src.replace(/[\\]/g, '/')}`
                          paths.push(filePath)
                          console.log('添加路径3:', filePath)
                        } else {
                          // For other paths
                          const filePath = `safe-file://${docFullPath}/${src.replace(/[\\]/g, '/')}`
                          paths.push(filePath)
                          console.log('添加路径4:', filePath)
                        }
                      }
                      
                      // Try direct assets path with absolute path
                      if (documentsDir) {
                        let docFullPath = documentsDir
                        docFullPath = docFullPath.replace(/[\\]/g, '/')
                        if (docFullPath.match(/^[a-zA-Z]:\//)) {
                          const filePath = `safe-file://${docFullPath}/assets/${imageName}`
                          paths.push(filePath)
                          console.log('添加路径5:', filePath)
                        }
                      }
                      
                      // Try assets directory in the same folder as the document
                      if (effectiveDocDir) {
                        let assetsPath = effectiveDocDir
                        assetsPath = assetsPath.replace(/[\\]/g, '/')
                        if (assetsPath.match(/^[a-zA-Z]:\//)) {
                          const filePath = `safe-file://${assetsPath}/assets/${imageName}`
                          paths.push(filePath)
                          console.log('添加路径6:', filePath)
                        }
                      }
                      
                      // Try relative path
                      paths.push(src)
                      console.log('添加路径7:', src)
                      
                      // Try with current directory (relative path)
                      paths.push(`./${src}`)
                      console.log('添加路径8:', `./${src}`)
                      
                      // Try with assets directory in current directory
                      paths.push(`./assets/${imageName}`)
                      console.log('添加路径9:', `./assets/${imageName}`)
                      
                      // Try with absolute path using C drive (common Windows path)
                      paths.push(`safe-file://C:/Users/User/Documents/assets/${imageName}`)
                      console.log('添加路径10:', `safe-file://C:/Users/User/Documents/assets/${imageName}`)
                      
                      console.log('所有可能路径:', paths)
                      return paths
                    }, [src, effectiveDocDir, documentsDir])
                    
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
