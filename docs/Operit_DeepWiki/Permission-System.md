# 权限系统

## 目的与范围

Operit 中的权限系统实现了一个分层权限模型，用于确定 AI 助手可以使用哪些工具和功能。该系统管理五个不同的权限级别，每个级别需要逐步增加的系统访问权限，并提供 UI 组件供用户配置和授予必要的权限。

本页面涵盖权限级别层次结构、状态管理和 UI 组件。有关特定权限通道的实现细节，请参阅：

- [Shizuku Integration](/AAswordman/Operit/7.2-shizuku-integration) - 基于 ADB 的自动化权限通道
- [Root Authorization](/AAswordman/Operit/7.3-root-authorization) - Root 级别系统访问
- [Accessibility Service](/AAswordman/Operit/7.4-accessibility-service) - 基于无障碍的自动化
- [Tool Permissions](/AAswordman/Operit/5.9-tool-permissions) - 按工具权限审批系统

---

## 权限级别层次结构

### AndroidPermissionLevel 枚举

权限系统的核心是 `AndroidPermissionLevel` 枚举，它定义了五个分层级别：
级别描述主要功能要求**STANDARD**基本 Android 权限文件操作、HTTP 请求、intent存储、悬浮窗、电池优化**ACCESSIBILITY**无障碍服务访问UI 树检查、基本自动化无障碍服务已启用、提供者应用已安装**ADMIN**设备管理员权限增强的系统控制设备管理员权限**DEBUGGER**ADB/Shizuku 访问高级 UI 自动化、shell 命令Shizuku 已安装、运行并授权**ROOT**超级用户访问完整系统控制、受保护文件访问设备已 root 并授予 su 权限
每个级别继承所有较低级别的功能。系统在注册工具时强制执行此层次结构 - 需要更高权限级别的工具仅在该级别处于活动状态时可用。

---

## 权限系统架构

### 组件概览

```
Permission Checkers

Wizard Components

Permission Sections

UI Layer

State Layer

AndroidPermissionLevel
Enum Values

androidPermissionPreferences
DataStore Persistence

DemoStateManager
State Coordinator

DemoScreenState
UI State Holder

ShizukuDemoScreen
Main Permission Screen

PermissionLevelCard
Level Selector & Status

PermissionLevelSelector
Tab Navigation

PermissionSectionContainer
Level Content

StandardPermissionSection

AccessibilityPermissionSection

AdminPermissionSection

DebuggerPermissionSection

RootPermissionSection

AccessibilityWizardCard

ShizukuWizardCard

RootWizardCard

OperitTerminalWizardCard

refreshPermissionsAndStatus
Validation Function

ShizukuAuthorizer

RootAuthorizer

UIHierarchyManager
```

**图示：权限系统组件架构**

权限系统采用分层架构：

- **状态层**：管理权限级别选择和偏好持久化
- **UI 层**：提供用于查看和更改权限级别的交互组件
- **权限区块**：显示所需权限的级别特定 UI
- **向导组件**：复杂权限的分步设置指南
- **权限检查器**：验证实际系统权限和组件可用性

---

## 状态管理

### 权限偏好

`androidPermissionPreferences` 对象使用 DataStore 持久化用户的首选权限级别：

```
androidPermissionPreferences.preferredPermissionLevelFlow
    -> StateFlow<AndroidPermissionLevel>

```

此流在 `PermissionLevelCard`中被收集，以维持存储偏好与 UI 状态之间的响应式同步。

### DemoStateManager

`DemoStateManager` 类协调演示/设置屏幕的所有权限相关状态。它维护一个 `DemoScreenState` 数据类，包含以下可变状态：

**权限状态：**

- `isShizukuInstalled`、`isShizukuRunning`、`hasShizukuPermission`
- `isOperitTerminalInstalled`(NodeJS/Python 环境就绪状态)
- `hasStoragePermission`、`hasOverlayPermission`、`hasBatteryOptimizationExemption`
- `hasAccessibilityServiceEnabled`、`isAccessibilityProviderInstalled`
- `hasLocationPermission`
- `isDeviceRooted`、`hasRootAccess`

**UI 控制状态：**

- `showShizukuWizard`、`showOperitTerminalWizard`、`showRootWizard`、`showAccessibilityWizard`
- `isRefreshing`、`isLoading`

### 状态刷新流程

```
UIHierarchyManager
RootAuthorizer
ShizukuAuthorizer
refreshPermissionsAndStatus
DemoStateManager
ShizukuDemoViewModel
ShizukuDemoScreen
UIHierarchyManager
RootAuthorizer
ShizukuAuthorizer
refreshPermissionsAndStatus
DemoStateManager
ShizukuDemoViewModel
ShizukuDemoScreen
par
[Parallel Permission Checks]
refreshStatus()
refreshStatus()
setRefreshing(true)
Call validation function
Check Shizuku status
Installation/running/permission
Check Root status
Device rooted/access granted
Check Accessibility
Provider installed/service enabled
Update all state values
setRefreshing(false)
StateFlow emission
Recompose with new state
```

**图示：权限状态刷新序列**

刷新过程在 `Dispatchers.IO`上异步运行，以避免在可能较慢的权限检查期间阻塞 UI 线程。

---

## 权限验证

### 权限检查实现

函数 `refreshPermissionsAndStatus` 执行全面的权限验证：

**Shizuku 验证**：

```
isShizukuInstalled = ShizukuAuthorizer.isShizukuInstalled(context)
isShizukuRunning = ShizukuAuthorizer.isShizukuServiceRunning()
hasShizukuPermission = if (installed && running) {
    ShizukuAuthorizer.hasShizukuPermission()
} else false

```

**存储权限**：

- Android R+：`Environment.isExternalStorageManager()`
- R 之前版本：检查 `READ_EXTERNAL_STORAGE` 和 `WRITE_EXTERNAL_STORAGE`

**无障碍验证**：

```
isProviderInstalled = UIHierarchyManager.isProviderAppInstalled(context)
if (isProviderInstalled) {
    UIHierarchyManager.bindToService(context)
}
hasAccessibilityServiceEnabled =
    UIHierarchyManager.isAccessibilityServiceEnabled(context)

```

**Root 验证**(通过 RootAuthorizer)：

- `RootAuthorizer.isDeviceRooted()` - 检查 su 二进制文件是否存在
- `RootAuthorizer.checkRootStatus()` - 尝试执行特权命令

---

## 权限 UI 系统

### PermissionLevelCard 组件

`PermissionLevelCard` 是权限管理的主要 UI 组件。它提供：

1. **基于标签的级别选择**：`PermissionLevelSelector` 将所有五个权限级别显示为可滚动的标签
2. **视觉描述**：展示每个级别功能的动画内容
3. **权限状态显示**：每个所需权限的实时状态指示器
4. **操作按钮**：直接链接到系统设置以授予权限
5. **级别激活**：将当前查看的级别设置为活动状态的按钮

```
Permission Content

Status Controls

Description

Level Selection

Header Section

PermissionLevelCard

Title & Icon

HorizontalDivider

PermissionLevelSelector
ScrollableTabRow

AnimatedContent
PermissionLevelVisualDescription

Status Box

Set as Current Button

Check Icon (if active)

Refresh Button

AnimatedContent

PermissionSectionContainer

PermissionStatusItem(s)
```

**图示：PermissionLevelCard 组件层次结构**

### 权限级别部分

每个权限级别都有一个专用的部分组件来显示所需权限：

**StandardPermissionSection**：

- 存储权限
- 悬浮窗权限
- 电池优化豁免
- 位置权限
- OperitTerminal(NodeJS/Python 环境)

**AccessibilityPermissionSection**：

- 所有标准权限
- 无障碍提供程序应用安装
- 无障碍服务已启用
- 提供程序应用更新检查

**DebuggerPermissionSection**：

- 所有标准权限
- Shizuku 安装
- Shizuku 运行中
- Shizuku 权限已授予

**RootPermissionSection**：

- 所有标准权限
- 设备已 Root
- Root 访问权限已授予

每个部分使用 `PermissionStatusItem` 来显示单个权限，包含：

- 颜色编码的状态指示器(已授予为主色，未授予为错误色)
- 权限名称
- 状态文本("已授予" / "未授予")
- 点击处理器以打开相关系统设置

---

## 设置向导系统

### 向导架构

系统提供上下文相关的设置向导，当所需权限未被授予时显示。向导根据以下条件显示：

- 当前显示的权限级别
- 权限授予状态
- 组件安装状态
- 可用更新

```
Wizard Cards

Wizard Display Logic

true

true

true

true

ShizukuDemoScreen

Need Setup
Guide?

needOperitTerminalSetupGuide
!isNodejsPythonEnvironmentReady

needShizukuSetupGuide
Level==DEBUGGER && (!installed || !running || !permission)

needRootSetupGuide
Level==ROOT && !hasRootAccess

needAccessibilitySetupGuide
Level==ACCESSIBILITY && (!installed || !enabled)

OperitTerminalWizardCard

AccessibilityWizardCard

ShizukuWizardCard

RootWizardCard
```

**图示：设置向导显示逻辑**

### 向导卡片功能

每个向导卡片提供：

**AccessibilityWizardCard**：

- 提供程序应用安装按钮，带版本检查
- 无障碍设置链接
- 有新版本可用时的更新通知
- 可折叠的分步说明

**ShizukuWizardCard**：

- 从 Play Store / 官方网站安装
- 安装捆绑的 APK(带 FileProvider URI 生成)
- 启动 Shizuku 应用
- 请求 Shizuku 权限
- 更新检查，带版本比较
- 设置文档链接

**RootWizardCard**：

- 设备 root 状态显示
- Root 权限请求按钮
- 教程链接到 root 指南

**OperitTerminalWizardCard**:

- 环境就绪状态(pnpm 和 pip/python)
- 导航到终端设置界面
- 可折叠的配置说明

---

## 权限级别切换

### 级别变更流程

```
AIToolHandler
androidPermissionPreferences
PermissionLevelCard
PermissionLevelSelector
User
AIToolHandler
androidPermissionPreferences
PermissionLevelCard
PermissionLevelSelector
User
alt
[Level != Current Active]
[Level == Current Active]
Select different level tab
onLevelSelected(newLevel)
Update displayedPermissionLevel
Trigger AnimatedContent transition
Show "Set as Current" button
Click "Set as Current"
savePreferredPermissionLevel(level)
StateFlow emission
onPermissionLevelSet callback
refreshTools() - re-register tools
Show "Current level in use" indicator
```

**图示：权限级别变更序列**

当用户更改权限级别时，系统会：

1. 更新 `displayedPermissionLevel` 状态变量
2. 触发描述和权限部分的 `AnimatedContent` 过渡动画
3. 如果显示的级别与当前激活级别不同，则显示"设为当前"按钮
4. 激活时，通过 `androidPermissionPreferences.savePreferredPermissionLevel()` 持久化到 DataStore
5. 调用 `onPermissionLevelSet` 回调 ，触发工具重新注册

---

## 状态变化监听器

### 实时状态同步

系统注册监听器以监听动态权限状态变化：

**Shizuku 状态监听器**：

```
DisposableEffect(Unit) {
    val shizukuListener: () -> Unit = {
        scope.launch(Dispatchers.IO) { viewModel.refreshStatus(context) }
    }
    ShizukuAuthorizer.addStateChangeListener(shizukuListener)
    onDispose { ShizukuAuthorizer.removeStateChangeListener(shizukuListener) }
}
```

**Root 状态监听器**：

```
RootAuthorizer.addStateChangeListener(rootListener)
```

这些监听器确保 UI 在以下情况下自动刷新：

- Shizuku 服务启动/停止
- Shizuku 权限被授予/撤销
- Root 访问权限获得/丢失
- 外部系统状态发生变化

---

## 工具集成

### 基于权限的工具注册

`AIToolHandler` 在权限级别变更时重新注册所有工具，这确保只有与当前权限级别兼容的工具可用：

```
fun refreshTools(context: Context) {
    AppLogger.d("ShizukuDemoViewModel", "Refreshing all registered tools")
    toolHandler.reset()
    toolHandler.registerDefaultTools()
    // Toast notification for user feedback
}
```

工具注册时带有权限级别要求，处理器根据活动的 `AndroidPermissionLevel` 过滤工具。此集成详见。
