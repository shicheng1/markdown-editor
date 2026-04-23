import { join, normalize, sep } from 'path'

/**
 * 规范化路径，确保路径格式正确
 * @param path 输入路径
 * @returns 规范化后的路径
 */
export function normalizePath(path: string): string {
  return normalize(path)
}

/**
 * 安全地连接路径，确保路径格式正确
 * @param paths 路径片段
 * @returns 连接后的路径
 */
export function safeJoin(...paths: string[]): string {
  return join(...paths)
}

/**
 * 从路径中提取文件名
 * @param path 输入路径
 * @returns 文件名
 */
export function getFileName(path: string): string {
  return path.split(/[\\/]/).pop() || 'unknown'
}

/**
 * 确保路径使用正确的分隔符
 * @param path 输入路径
 * @returns 使用正确分隔符的路径
 */
export function ensureCorrectSeparators(path: string): string {
  return path.replace(/[\\/]/g, sep)
}

/**
 * 转换相对路径为绝对路径
 * @param relativePath 相对路径
 * @param baseDir 基础目录
 * @returns 绝对路径
 */
export function resolveRelativePath(relativePath: string, baseDir: string): string {
  return safeJoin(baseDir, relativePath)
}
