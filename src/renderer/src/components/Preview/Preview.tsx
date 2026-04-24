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
  const [, forceUpdate] = useState({})
  
  // 当paths变化时，重置状态
  useEffect(() => {
    currentIndexRef.current = 0
    allFailedRef.current = false
  }, [paths])
  
  const handleError = () => {
    if (currentIndexRef.current < paths.length - 1) {
      currentIndexRef.current += 1
      forceUpdate({})
    } else {
      allFailedRef.current = true
      forceUpdate({})
    }
  }
  
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

// 辅助函数：生成正确格式的safe-file://路径
const createSafeFileUrl = (basePath: string, relativePath: string) => {
  let normalizedPath = basePath.replace(/[\\]/g, '/')
  let normalizedRelative = relativePath.replace(/[\\]/g, '/')
  
  // 确保路径分隔符正确
  if (!normalizedPath.endsWith('/') && !normalizedRelative.startsWith('/')) {
    normalizedPath += '/'
  } else if (normalizedPath.endsWith('/') && normalizedRelative.startsWith('/')) {
    normalizedRelative = normalizedRelative.substring(1)
  }
  
  // 生成正确的safe-file:// URL格式
  if (normalizedPath.match(/^[a-zA-Z]:\//)) {
    // Windows路径
    return `safe-file://${normalizedPath}${normalizedRelative}`
  } else {
    // 其他路径
    return `safe-file://${normalizedPath}${normalizedRelative}`
  }
}

// 辅助函数：生成可能的图片路径数组
const generatePossiblePaths = (src: string, effectiveDocDir: string, documentsDir: string) => {
  // 使用Set去重，确保每个路径只尝试一次
  const pathsSet = new Set<string>()
  const imageName = src.split('/').pop() || src.split('\\').pop() || 'image.png'
  
  // 辅助函数：添加路径到Set中
  const addPath = (path: string) => {
    if (path && !pathsSet.has(path)) {
      pathsSet.add(path)
    }
  }
  
  // 1. 尝试相对路径（最基本的情况）
  addPath(src)
  
  // 2. 尝试当前目录相对路径
  addPath(`./${src}`)
  
  // 3. 尝试文档目录（最可能成功的路径）
  if (effectiveDocDir) {
    addPath(createSafeFileUrl(effectiveDocDir, src))
    // 尝试文档目录下的assets文件夹
    addPath(createSafeFileUrl(effectiveDocDir, `assets/${imageName}`))
  }
  
  // 4. 尝试默认文档目录
  if (documentsDir && documentsDir !== effectiveDocDir) {
    addPath(createSafeFileUrl(documentsDir, src))
    // 尝试默认文档目录下的assets文件夹
    addPath(createSafeFileUrl(documentsDir, `assets/${imageName}`))
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
                    const possiblePaths = generatePossiblePaths(src, effectiveDocDir, documentsDir)
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
