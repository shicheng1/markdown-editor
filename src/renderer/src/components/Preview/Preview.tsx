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
  const [allFailed, setAllFailed] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  
  const handleError = () => {
    if (currentIndexRef.current < paths.length - 1) {
      currentIndexRef.current += 1
      // 直接修改img元素的src属性，避免重新渲染组件
      if (imgRef.current) {
        imgRef.current.src = paths[currentIndexRef.current]
      }
    } else {
      // 当所有路径都失败时，更新状态以触发重新渲染
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
      ref={imgRef}
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
                      // 使用Set去重，确保每个路径只尝试一次
                      const pathsSet = new Set<string>()
                      const imageName = src.split('/').pop() || src.split('\\').pop() || 'image.png'
                      
                      // 辅助函数：添加路径到Set中
                      const addPath = (path: string) => {
                        if (path && !pathsSet.has(path)) {
                          pathsSet.add(path)
                        }
                      }
                      
                      // 辅助函数：生成正确格式的file://路径
                      const createFileUrl = (basePath: string, relativePath: string) => {
                        let normalizedPath = basePath.replace(/[\\]/g, '/')
                        let normalizedRelative = relativePath.replace(/[\\]/g, '/')
                        
                        // 确保路径分隔符正确
                        if (!normalizedPath.endsWith('/') && !normalizedRelative.startsWith('/')) {
                          normalizedPath += '/'
                        } else if (normalizedPath.endsWith('/') && normalizedRelative.startsWith('/')) {
                          normalizedRelative = normalizedRelative.substring(1)
                        }
                        
                        // 生成正确的file:// URL格式
                        if (normalizedPath.match(/^[a-zA-Z]:\//)) {
                          // Windows路径
                          return `file:///${normalizedPath}${normalizedRelative}`
                        } else {
                          // 其他路径
                          return `file://${normalizedPath}${normalizedRelative}`
                        }
                      }
                      
                      // 1. 尝试相对路径（最基本的情况）
                      addPath(src)
                      
                      // 2. 尝试当前目录相对路径
                      addPath(`./${src}`)
                      
                      // 3. 尝试文档目录（最可能成功的路径）
                      if (effectiveDocDir) {
                        addPath(createFileUrl(effectiveDocDir, src))
                        // 尝试文档目录下的assets文件夹
                        addPath(createFileUrl(effectiveDocDir, `assets/${imageName}`))
                      }
                      
                      // 4. 尝试默认文档目录
                      if (documentsDir && documentsDir !== effectiveDocDir) {
                        addPath(createFileUrl(documentsDir, src))
                        // 尝试默认文档目录下的assets文件夹
                        addPath(createFileUrl(documentsDir, `assets/${imageName}`))
                      }
                      
                      // 5. 尝试当前目录下的assets文件夹
                      addPath(`./assets/${imageName}`)
                      
                      // 6. 尝试上级目录相对路径
                      addPath(`../${src}`)
                      addPath(`../assets/${imageName}`)
                      
                      // 7. 尝试上上级目录相对路径
                      addPath(`../../${src}`)
                      addPath(`../../assets/${imageName}`)
                      
                      // 转换Set为数组并返回
                      return Array.from(pathsSet)
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
