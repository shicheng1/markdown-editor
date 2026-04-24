import React, { forwardRef, useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github.css'
import '../../assets/styles/markdown.css'
import './Preview.css'

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

interface PreviewProps {
  content: string
  docDir?: string
}

const Preview = forwardRef(function Preview(props, ref) {
  const content = props.content || ''
  const docDir = props.docDir || ''
  
  const [defaultDir, setDefaultDir] = useState('')
  const [documentsDir, setDocumentsDir] = useState('')

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

  // 创建自定义的img组件
  const CustomImage = function CustomImage(props) {
    const src = props.src
    const alt = props.alt || ''
    const imgProps = { ...props }
    delete imgProps.src
    delete imgProps.alt
    
    const imgRef = useRef(null)
    const currentIndexRef = useRef(0)
    const imageName = src.split('/').pop() || src.split('\\').pop() || 'image.png'
    
    // 只在组件初始化时计算路径
    const pathsRef = useRef(() => {
      const paths = []
      
      // 优先尝试文档目录
      if (effectiveDocDir) {
        paths.push(createSafeFileUrl(effectiveDocDir, src))
        paths.push(createSafeFileUrl(effectiveDocDir, `assets/${imageName}`))
      }
      
      // 然后尝试默认目录
      if (documentsDir && documentsDir !== effectiveDocDir) {
        paths.push(createSafeFileUrl(documentsDir, src))
        paths.push(createSafeFileUrl(documentsDir, `assets/${imageName}`))
      }
      
      // 最后尝试一些相对路径
      paths.push(src)
      paths.push(`./${src}`)
      paths.push(`./assets/${imageName}`)
      
      return paths
    }())

    const handleError = () => {
      if (currentIndexRef.current < pathsRef.current.length - 1) {
        currentIndexRef.current += 1
        if (imgRef.current) {
          imgRef.current.src = pathsRef.current[currentIndexRef.current]
        }
      }
    }

    if (src.startsWith('http') || src.startsWith('data:') || src.startsWith('file://')) {
      return <img src={src} alt={alt} loading="lazy" style={{ display: 'block' }} {...imgProps} />
    }

    return (
      <img 
        ref={imgRef}
        src={pathsRef.current[0]}
        alt={alt}
        loading="lazy"
        onError={handleError}
        style={{ display: 'block' }}
        {...imgProps}
      />
    )
  }

  return (
    <div className="preview-container" ref={ref}>
      <div className="preview-content">
        {content ? (
          <div className="markdown-preview">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeHighlight]}
              components={{
                a: function A(props) {
                  const href = props.href
                  const children = props.children
                  const aProps = { ...props }
                  delete aProps.href
                  delete aProps.children
                  return (
                    <a href={href} target="_blank" rel="noopener noreferrer" {...aProps}>
                      {children}
                    </a>
                  )
                },
                img: CustomImage,
                table: function Table(props) {
                  const children = props.children
                  const tableProps = { ...props }
                  delete tableProps.children
                  return (
                    <div className="table-wrapper">
                      <table {...tableProps}>{children}</table>
                    </div>
                  )
                }
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
