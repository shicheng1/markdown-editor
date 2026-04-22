import { useState, useCallback, useMemo } from 'react'

const DEFAULT_CONTENT = `# 欢迎使用 Markdown 编辑器 ✨

这是一个功能完善的 Markdown 编辑查看器，支持实时预览、语法高亮、导出和主题切换。

## 功能特性

- **实时预览** — 左侧编辑，右侧即时渲染
- **语法高亮** — 代码块支持多种语言高亮
- **主题切换** — 浅色 / 深色 / 跟随系统
- **导出功能** — 支持 PDF 和 HTML 导出

## 代码示例

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
  return { message: \`Welcome to Markdown Editor\` };
}

greet('World');
\`\`\`

\`\`\`python
def fibonacci(n):
    """Generate Fibonacci sequence"""
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

list(fibonacci(10))
\`\`\`

## 表格示例

| 功能 | 状态 | 说明 |
| --- | --- | --- |
| 实时预览 | ✅ | 编辑即预览 |
| 语法高亮 | ✅ | 多语言支持 |
| 导出 PDF | ✅ | 一键导出 |
| 主题切换 | ✅ | 三种模式 |

## 引用

> 好的工具让创作更加专注。
> 
> — Markdown 编辑器

## 任务列表

- [x] 实现实时预览
- [x] 添加语法高亮
- [x] 支持主题切换
- [ ] 添加更多导出格式
- [ ] 支持文件拖拽打开

## 数学公式

行内公式：$E = mc^2$

## 图片

![示例图片](https://via.placeholder.com/600x200/0071e3/ffffff?text=Markdown+Editor)

---

*使用工具栏按钮快速插入 Markdown 语法，或使用键盘快捷键。*
`

export function useMarkdown() {
  const [content, setContent] = useState(DEFAULT_CONTENT)

  const stats = useMemo(() => {
    const lines = content.split('\n')
    const lineCount = lines.length
    const charCount = content.length
    // Count words: split by whitespace, filter empty strings
    const words = content.trim().split(/\s+/).filter(Boolean)
    const wordCount = content.trim() === '' ? 0 : words.length
    return { lineCount, charCount, wordCount }
  }, [content])

  const handleChange = useCallback((value: string) => {
    setContent(value)
  }, [])

  return {
    content,
    setContent,
    handleChange,
    stats
  }
}
