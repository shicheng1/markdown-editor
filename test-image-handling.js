// 测试图片处理逻辑
const fs = require('fs');
const path = require('path');

// 模拟 pathUtils 函数
function normalizePath(pathStr) {
  return path.normalize(pathStr);
}

function safeJoin(...paths) {
  return path.join(...paths);
}

function getFileName(pathStr) {
  return pathStr.split(/[\\/]/).pop() || 'unknown';
}

function resolveRelativePath(relativePath, baseDir) {
  return safeJoin(baseDir, relativePath);
}

// 测试路径处理
console.log('=== 测试路径处理 ===');

// 测试 Windows 路径
const windowsPath = 'C:\\Users\\test\\image.png';
console.log('Windows 路径:', windowsPath);
console.log('提取文件名:', getFileName(windowsPath));

// 测试 Unix 路径
const unixPath = '/home/test/image.png';
console.log('Unix 路径:', unixPath);
console.log('提取文件名:', getFileName(unixPath));

// 测试混合路径
const mixedPath = 'C:/Users\\test/image.png';
console.log('混合路径:', mixedPath);
console.log('提取文件名:', getFileName(mixedPath));

// 测试相对路径解析
const baseDir = 'C:\\Users\\test\\docs';
const relPath = 'assets/image.png';
console.log('基础目录:', baseDir);
console.log('相对路径:', relPath);
console.log('解析后的路径:', resolveRelativePath(relPath, baseDir));

// 测试目录创建
console.log('\n=== 测试目录创建 ===');
const testDir = path.join(__dirname, 'test-assets');
console.log('测试目录:', testDir);

try {
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
    console.log('目录创建成功');
  } else {
    console.log('目录已存在');
  }
} catch (error) {
  console.error('目录创建失败:', error.message);
}

// 测试文件复制
console.log('\n=== 测试文件复制 ===');
const testFile = path.join(testDir, 'test-image.txt');
try {
  fs.writeFileSync(testFile, 'test content');
  console.log('测试文件创建成功');
  
  const destFile = path.join(testDir, 'test-image-copy.txt');
  fs.copyFileSync(testFile, destFile);
  console.log('文件复制成功');
  
  // 清理测试文件
  fs.unlinkSync(testFile);
  fs.unlinkSync(destFile);
  fs.rmdirSync(testDir);
  console.log('测试文件清理成功');
} catch (error) {
  console.error('文件操作失败:', error.message);
}

// 测试文件名冲突处理
console.log('\n=== 测试文件名冲突处理 ===');
const testDir2 = path.join(__dirname, 'test-assets-2');
try {
  if (!fs.existsSync(testDir2)) {
    fs.mkdirSync(testDir2, { recursive: true });
  }
  
  // 创建测试文件
  const baseFile = path.join(testDir2, 'image.png');
  fs.writeFileSync(baseFile, 'test content');
  console.log('基础文件创建成功');
  
  // 模拟文件名冲突处理
  let fileName = 'image.png';
  let destPath = baseFile;
  let counter = 1;
  const baseName = fileName.replace(/\.[^.]+$/, '');
  const ext = fileName.includes('.') ? '.' + fileName.split('.').pop() : '.png';
  
  while (fs.existsSync(destPath)) {
    fileName = `${baseName}-${counter}${ext}`;
    destPath = path.join(testDir2, fileName);
    counter++;
  }
  
  fs.writeFileSync(destPath, 'test content 2');
  console.log('冲突文件名处理成功，新文件:', fileName);
  
  // 清理测试文件
  fs.unlinkSync(baseFile);
  fs.unlinkSync(destPath);
  fs.rmdirSync(testDir2);
  console.log('测试文件清理成功');
} catch (error) {
  console.error('文件名冲突处理失败:', error.message);
}

console.log('\n=== 测试完成 ===');
