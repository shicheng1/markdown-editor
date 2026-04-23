# Markdown Editor - 图片预览问题修复 - 实现计划

## [x] Task 1: 修复React无限更新错误
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 修改ImageWithFallback组件，使用useRef代替useState来跟踪状态
  - 使用useMemo缓存possiblePaths数组的计算
  - 确保组件渲染稳定，无无限更新错误
- **Acceptance Criteria Addressed**: AC-3, AC-4
- **Test Requirements**:
  - `programmatic` TR-1.1: 插入图片后编辑器不应出现React无限更新错误
  - `human-judgment` TR-1.2: 编辑器在插入图片后保持响应，无变白或崩溃
- **Notes**: 重点关注组件渲染逻辑，避免每次渲染都创建新的状态或数组

## [x] Task 2: 解决Electron本地文件加载限制
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - 在主进程中注册自定义协议'safe-file'
  - 修改Preview组件中的路径处理，使用safe-file://协议
  - 确保Electron能够安全加载本地图片文件
- **Acceptance Criteria Addressed**: AC-2, AC-4
- **Test Requirements**:
  - `programmatic` TR-2.1: 图片路径应使用safe-file://协议
  - `human-judgment` TR-2.2: 图片应在预览面板中正常显示，无加载错误
- **Notes**: 自定义协议需要在app.whenReady()中注册

## [x] Task 3: 修复Windows路径处理
- **Priority**: P0
- **Depends On**: Task 2
- **Description**:
  - 改进路径处理逻辑，正确处理Windows反斜杠路径
  - 确保路径转换正确，避免路径格式错误
  - 测试各种Windows路径场景
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `programmatic` TR-3.1: Windows路径应被正确转换为safe-file:// URL
  - `programmatic` TR-3.2: 包含空格和特殊字符的路径应被正确处理
- **Notes**: 重点关注路径分隔符和URL编码问题

## [x] Task 4: 解决C盘权限问题
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - 修改getDefaultDir函数，使用应用的用户数据目录
  - 确保图片保存到安全的位置，无权限限制
  - 测试图片保存功能
- **Acceptance Criteria Addressed**: AC-1, AC-5
- **Test Requirements**:
  - `programmatic` TR-4.1: 图片应被保存到用户数据目录
  - `programmatic` TR-4.2: 无权限错误，图片保存成功
- **Notes**: 用户数据目录通常具有正确的读写权限

## [x] Task 5: 优化图片路径生成
- **Priority**: P1
- **Depends On**: Task 2, Task 3
- **Description**:
  - 优化possiblePaths数组的生成逻辑
  - 避免重复路径，提高图片找到的概率
  - 增加路径生成的可靠性
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `programmatic` TR-5.1: 生成的路径应包含多种可能的图片位置
  - `human-judgment` TR-5.2: 图片预览成功率应显著提高
- **Notes**: 可以添加更多路径尝试，提高图片找到的概率

## [x] Task 6: 测试和验证
- **Priority**: P1
- **Depends On**: Task 1, Task 2, Task 3, Task 4, Task 5
- **Description**:
  - 测试所有修复功能
  - 验证图片插入和预览功能
  - 确保编辑器稳定性
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-4, AC-5
- **Test Requirements**:
  - `programmatic` TR-6.1: 所有功能测试通过
  - `human-judgment` TR-6.2: 编辑器使用体验良好
- **Notes**: 测试各种场景，包括不同类型的图片和路径