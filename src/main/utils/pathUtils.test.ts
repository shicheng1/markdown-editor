import { normalizePath, safeJoin, getFileName, ensureCorrectSeparators, resolveRelativePath } from './pathUtils'
import { sep } from 'path'

// 测试路径处理函数
describe('Path Utils', () => {
  // 测试规范化路径
  test('normalizePath should normalize paths correctly', () => {
    // Windows路径
    expect(normalizePath('C:\\Users\\test\\..\\docs')).toBe('C:\\Users\\docs')
    // Unix路径
    expect(normalizePath('/home/test/../docs')).toBe('/home/docs')
  })

  // 测试安全连接路径
  test('safeJoin should join paths correctly', () => {
    // 测试Windows路径
    expect(safeJoin('C:\\Users', 'test', 'docs')).toContain('C:\\Users\\test\\docs')
    // 测试Unix路径
    expect(safeJoin('/home', 'test', 'docs')).toBe('/home/test/docs')
  })

  // 测试获取文件名
  test('getFileName should extract filename correctly', () => {
    // Windows路径
    expect(getFileName('C:\\Users\\test\\file.txt')).toBe('file.txt')
    // Unix路径
    expect(getFileName('/home/test/file.txt')).toBe('file.txt')
    // 混合路径
    expect(getFileName('C:\\Users/test/file.txt')).toBe('file.txt')
  })

  // 测试确保正确的分隔符
  test('ensureCorrectSeparators should use correct separators', () => {
    const testPath = 'C:/Users\\test/docs'
    const result = ensureCorrectSeparators(testPath)
    expect(result).toBe(`C:${sep}Users${sep}test${sep}docs`)
  })

  // 测试解析相对路径
  test('resolveRelativePath should resolve relative paths correctly', () => {
    // Windows路径
    expect(resolveRelativePath('..\\docs\\file.txt', 'C:\\Users\\test')).toContain('C:\\Users\\docs\\file.txt')
    // Unix路径
    expect(resolveRelativePath('../docs/file.txt', '/home/test')).toBe('/home/docs/file.txt')
  })

  // 测试各种Windows路径场景
  test('should handle various Windows path scenarios', () => {
    // 绝对路径
    const absPath = 'C:\\Program Files\\App\\data.txt'
    expect(getFileName(absPath)).toBe('data.txt')
    
    // 相对路径
    const relPath = '..\\..\\docs\\report.md'
    const baseDir = 'C:\\Users\\test\\projects\\app'
    const resolved = resolveRelativePath(relPath, baseDir)
    expect(resolved).toContain('C:\\Users\\docs\\report.md')
    
    // 混合斜杠
    const mixedPath = 'C:/Users\\test/docs\\file.txt'
    expect(getFileName(mixedPath)).toBe('file.txt')
  })
})
