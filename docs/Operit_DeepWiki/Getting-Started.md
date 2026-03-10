# 快速开始

本页面涵盖系统要求、安装过程、初始配置以及开始使用 Operit 所需的权限设置。有关架构细节，请参阅[架构概览](/AAswordman/Operit/1.1-architecture-overview)。有关特定功能的信息，请参阅[核心功能](/AAswordman/Operit/1.2-key-features)。

---

## 系统要求

Operit 需要以下最低规格：
要求规格**操作系统**Android 8.0+ (API Level 26+)**内存**建议 4GB+ RAM**存储空间**200MB+ 可用空间**权限**存储、悬浮窗(用于浮动窗口)

---

## 安装

### 下载 APK

1. 访问官方
2. 下载最新的 APK 文件

> **安全提示：** 仅从官方 GitHub releases 或官方网站下载。第三方来源可能分发经过修改的版本，会危及安全性。

### 安装 APK

1. 在 Android 设置中启用允许安装未知来源的应用(如需要)
2. 找到下载的 APK 文件
3. 点击安装
4. 接受安装提示

---

## 首次启动配置

### 初始设置流程

首次启动时，Operit 会显示配置界面以设置 AI 服务连接。

```
Yes

No

App Launch

Check API Configuration

Configuration
Exists?

Navigate to
AIChatScreen

Show
ConfigurationScreen

User Input:
API Key

onSaveConfig()

ApiPreferences
Save to DataStore

Navigate to
ModelConfigScreen

Advanced Configuration:
- Provider selection
- Endpoint URL
- Model name
```

### API 配置

`ConfigurationScreen` 处理初始 API 设置：

1. **默认配置**(推荐)：

- 在 `OutlinedTextField` 组件中输入您的 API 密钥
- 应用会自动使用默认的 DeepSeek 配置
- 点击保存按钮以持久化配置

2. **自定义配置**：

- 点击"自定义"按钮访问 `ModelConfigScreen`
- 手动配置提供商类型、端点 URL 和模型名称
- 支持多个提供商：OpenAI、Claude、Gemini、本地模型

**关键组件：**

- **输入字段**：使用 `PasswordVisualTransformation` 的 `OutlinedTextField` 用于 API 密钥输入
- **保存操作**：调用 `onSaveConfig()` 回调通过 `ApiPreferences` 持久化
- **导航**：按钮导航至高级 `ModelConfigScreen`

---

## 权限设置

Operit 实现了一个分层权限系统，包含五个级别，每个级别逐步启用更强大的功能。

### 权限级别架构

```
State Management

Permission Management UI

Permission Hierarchy

AndroidPermissionLevel.STANDARD
Basic App Functionality

AndroidPermissionLevel.ACCESSIBILITY
UI Automation via Service

AndroidPermissionLevel.ADMIN
Device Admin Capabilities

AndroidPermissionLevel.DEBUGGER
ADB/Shizuku Integration

AndroidPermissionLevel.ROOT
Superuser Access

PermissionLevelCard
Main Permission UI

PermissionLevelSelector
ScrollableTabRow

ShizukuDemoScreen
Permission Setup Screen

DemoStateManager
Permission State

ShizukuDemoViewModel
UI State Coordinator
```

### 标准权限(必需)

这些权限是基本功能所必需的：
权限用途授权方式**存储**文件操作、聊天历史、工具包设置 → 存储 → 启用"所有文件访问权限"(Android 11+)**悬浮窗**浮动聊天窗口设置 → 显示在其他应用上层**电池优化**后台服务稳定性设置 → 电池 → 不受限制**位置**基于位置的工具(可选)标准 Android 权限对话框
**实现细节：**

- **权限检查**：`DemoStateManager.kt` 中的 `refreshPermissionsAndStatus()`
- **存储权限**：在 Android 11+ 上使用 `Environment.isExternalStorageManager()`
- **悬浮窗权限**：通过 `Settings.canDrawOverlays()` 检查

**导航到设置：**

- 存储：打开 `Settings.ACTION_MANAGE_ALL_FILES_ACCESS_PERMISSION`
- 悬浮窗：打开 `Settings.ACTION_MANAGE_OVERLAY_PERMISSION`
- 电池：打开 `Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`

### 无障碍权限(可选)

通过无障碍服务启用 UI 自动化：

**要求：**

1. 安装无障碍服务提供程序应用(通过 `UIHierarchyManager.launchProviderInstall()`)
2. 在系统设置中启用无障碍服务

**设置流程：**

```
Android System
UIHierarchyManager
ShizukuDemoScreen
User
Android System
UIHierarchyManager
ShizukuDemoScreen
User
Click "Install Provider"
launchProviderInstall(context)
Start Provider APK Installation
Show Installation Dialog
Confirm Installation
Click "Enable Service"
Open Accessibility Settings
Show Accessibility Settings
Enable Operit Service
isAccessibilityServiceEnabled()
Return true
```

**关键组件：**

- **Provider 检查**: `UIHierarchyManager.isProviderAppInstalled()`
- **Service 检查**: `UIHierarchyManager.isAccessibilityServiceEnabled()`
- **安装**: 通过 `UIHierarchyManager.launchProviderInstall()` 打开提供者安装

### 调试器权限(可选 - 高级)

通过 Shizuku 集成启用 ADB 级别的自动化：

**设置步骤：**

1. 安装 Shizuku 应用(提供捆绑的 APK)
2. 启动 Shizuku 服务(通过 ADB 或无线调试)
3. 授予 Shizuku 权限给 Operit

**实现方式：**

```
Shizuku Setup Flow

false

true

false

true

false

true

ShizukuAuthorizer.isShizukuInstalled()

Install Shizuku:
- From assets
- From store

ShizukuAuthorizer.isShizukuServiceRunning()

Show Start Instructions:
- ADB method
- Wireless debugging

ShizukuAuthorizer.hasShizukuPermission()

ShizukuAuthorizer.requestShizukuPermission()

Ready for Debugger-level Tools
```

**Shizuku 安装：**

- **捆绑 APK**：通过 `ShizukuInstaller.extractApkFromAssets()` 提取
- **版本检查**：`ShizukuInstaller.isShizukuUpdateNeeded()` 检查更新
- **权限请求**：`ShizukuAuthorizer.requestShizukuPermission()`

### Root 权限(可选 - 专家级)

启用超级用户级别的操作：

**设置流程：**

1. 设备必须已 root(推荐使用 Magisk)
2. 在提示时授予 root 访问权限
3. Operit 通过 `RootAuthorizer` 验证访问权限

**Root 授权流程：**

- **Root 检测**：`RootAuthorizer.isDeviceRooted()` 检查 su 二进制文件
- **权限请求**：`RootAuthorizer.requestRootPermission()`
- **命令执行**：`RootAuthorizer.executeRootCommand()`

---

## 环境设置(可选)

对于 MCP 插件和技能市场等高级功能，Ubuntu 24 终端环境需要 NodeJS 和 Python。

### 终端环境

Operit 包含一个内置的 Ubuntu 24 终端(`Terminal` 服务)，提供完整的 Linux 环境。

**终端服务架构：**

```
Environment Verification

MCPSharedSession
Shared Terminal Session

Check: command -v pnpm

Check: command -v python

Check: command -v pip

Session Management

createSession(title)

Return sessionId

executeCommand(sessionId, command)

Terminal Initialization

Terminal.getInstance(context)

TerminalManager
Internal Service

initializeEnvironment()
```

**核心 API：**

- **初始化**：`Terminal.initialize()`
- **会话创建**：`Terminal.createSession(title)` 返回会话 ID
- **命令执行**：`Terminal.executeCommand(sessionId, command)` 返回输出

### NodeJS 和 Python 设置

系统检查所需的环境组件：

**环境验证流程：**

```
Terminal Service
MCPSharedSession
DemoStateManager
Terminal Service
MCPSharedSession
DemoStateManager
isPnpmInstalled = path.contains("pnpm")
isPythonInstalled = hasPython && hasPip
isNodejsPythonEnvironmentReady =
isPnpmInstalled && isPythonInstalled
getOrCreateSharedSession(context)
createSession("mcp-shared")
Return sessionId
Return sessionId
executeCommand(sessionId, "command -v pnpm")
Return pnpm path or empty
executeCommand(sessionId, "command -v python")
Check python/python3
executeCommand(sessionId, "command -v pip")
Check pip/pip3
```

**验证实现：**

- **共享会话**：`MCPSharedSession.getOrCreateSharedSession()` 创建/复用会话
- **pnpm 检查**：执行 `command -v pnpm` 并检查输出
- **Python 检查**：尝试 `python` 和 `python3` 两者
- **pip 检查**：验证 `pip` 和 `pip3` 的可用性

**环境状态：**
The `DemoStateManager` maintains environment status:

- `isPnpmInstalled`: MutableState<Boolean>
- `isPythonInstalled`: MutableState<Boolean>
- `isNodejsPythonEnvironmentReady`: MutableState<Boolean>

**安装说明：**
如果环境组件缺失，`OperitTerminalWizardCard` 提供安装指导：

- 通过权限设置屏幕访问
- 显示每个组件的状态
- 提供手动安装的命令

---

## 验证

完成设置后，验证安装：

### 权限验证

导航到权限设置屏幕(可从主菜单访问)：

1. 检查所需权限显示绿色对勾
2. 验证所选权限级别符合您的需求
3. 使用刷新按钮更新状态

**状态刷新：**

- **手动刷新**：点击 `PermissionLevelCard` 中的刷新图标
- **自动刷新**：Shizuku 状态变化触发自动刷新

### 配置验证

确保 API 配置已保存：

1. 导航到设置 → 模型配置
2. 验证 API 密钥已配置(显示为星号)
3. 检查已选择模型

### 首次聊天测试

1. 导航到主聊天屏幕
2. 发送测试消息
3. 验证 AI 正确响应

---

## 后续步骤

完成初始设置后：

- **了解架构**：查看[架构概览]了解系统设计细节
- **探索功能**：查看[核心功能]了解各项能力
- **配置 AI 模型**：查看[模型配置]了解高级设置
- **设置工具**：查看[工具系统]了解工具生态文档
