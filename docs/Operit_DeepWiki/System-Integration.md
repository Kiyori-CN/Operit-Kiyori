# 系统集成

本页面记录了使 Operit 能够访问特权 Android API 并执行高级操作的系统级集成。系统集成层为不同能力级别提供了分层权限模型和专门的授权机制。

## 概述

Operit 的系统集成架构围绕权限级别层次结构构建，该结构决定了哪些工具和能力可用。系统提供多种授权机制，以在保持安全性的同时逐步启用更强大的操作。

**系统集成架构**

```
Tool Execution

System Services

Authorization Mechanisms

Permission Level Management

androidPermissionPreferences
PreferredPermissionLevel

PermissionLevelCard

DemoStateManager

ShizukuAuthorizer

RootAuthorizer

AccessibilityProviderInstaller

Shizuku Service

Root Shell

Accessibility Service

Terminal/TerminalManager

AIToolHandler

Tool Registration
```

系统集成层由五个关键组件组成：
组件用途关键类权限级别定义能力层次结构`AndroidPermissionLevel`Shizuku 集成启用 ADB 级别操作`ShizukuAuthorizer`、`ShizukuInstaller`Root 授权提供超级用户访问`RootAuthorizer`无障碍服务启用 UI 自动化`UIHierarchyManager`、`AccessibilityProviderInstaller`终端系统管理 shell 会话`Terminal`、`TerminalManager`、`MCPSharedSession`

## 权限级别层次结构

Operit 通过 `AndroidPermissionLevel` 枚举实现了分层权限系统。每个级别都建立在前一级别的能力之上，逐步启用更强大的操作。

**权限级别递进**

```
STANDARD

ACCESSIBILITY

ADMIN

DEBUGGER

ROOT
```

### 权限级别定义

等级所需组件功能`STANDARD`存储、悬浮窗、电池、位置权限基本文件操作、悬浮窗口、标准 Android API`ACCESSIBILITY`STANDARD + 无障碍服务已启用UI 自动化、已安装无障碍提供者应用`ADMIN`STANDARD + 设备管理员权限高级系统设置(目前未完全利用)`DEBUGGER`STANDARD + Shizuku 已安装并运行 + 无障碍ADB 级别操作、特权文件系统访问、高级 UI 控制`ROOT`STANDARD + 已授予 Root 访问权限超级用户操作、系统分区修改
当前权限等级存储在 `androidPermissionPreferences` 中，可通过 `PermissionLevelCard` 组件查看/更改。

**权限等级状态管理**

```
AIToolHandler
androidPermissionPreferences
DemoStateManager
PermissionLevelCard
User
AIToolHandler
androidPermissionPreferences
DemoStateManager
PermissionLevelCard
User
"Select permission level"
"Display level requirements"
"Click 'Set as current level'"
"savePreferredPermissionLevel()"
"Level saved"
"onPermissionLevelSet()"
"refreshTools()"
"reset() + registerDefaultTools()"
```

### 权限状态检查

`DemoStateManager` 维护所有权限组件的当前状态：
状态变量检查目的`hasStoragePermission``Environment.isExternalStorageManager()`外部存储访问`hasOverlayPermission``Settings.canDrawOverlays()`悬浮窗口功能`hasBatteryOptimizationExemption``PowerManager.isIgnoringBatteryOptimizations()`后台执行`hasLocationPermission``ACCESS_FINE_LOCATION` 或 `ACCESS_COARSE_LOCATION`位置服务`isAccessibilityProviderInstalled``UIHierarchyManager.isProviderAppInstalled()`UI 自动化提供者`hasAccessibilityServiceEnabled``UIHierarchyManager.isAccessibilityServiceEnabled()`UI 自动化激活`isShizukuInstalled``ShizukuAuthorizer.isShizukuInstalled()`Shizuku 应用存在`isShizukuRunning``ShizukuAuthorizer.isShizukuServiceRunning()`Shizuku 服务运行`hasShizukuPermission``ShizukuAuthorizer.hasShizukuPermission()`Shizuku 权限已授予`isDeviceRooted``RootAuthorizer.isDeviceRooted()`Root 二进制文件存在`hasRootAccess``RootAuthorizer.checkRootStatus()`Root 权限已授予

## Shizuku 集成

Shizuku 提供 ADB 级别的访问权限，无需持续的 ADB 连接。Operit 通过 `ShizukuAuthorizer` 类使用 Shizuku 执行特权系统操作。

### ShizukuAuthorizer 架构

**Shizuku 授权流程**

```
User
"Android System"
"Shizuku Service"
"ShizukuAuthorizer"
"Tool System"
User
"Android System"
"Shizuku Service"
"ShizukuAuthorizer"
"Tool System"
alt
["Permission not granted"]
"Check permission"
"hasShizukuPermission()"
"requestShizukuPermission()"
"Show permission dialog"
"Grant/Deny"
"Permission result"
"Notify state listeners"
"Execute privileged operation"
"Use Shizuku API"
"Execute with ADB privileges"
"Operation result"
"Return result"
"Operation complete"
```

### Shizuku 状态管理

`ShizukuAuthorizer` 维护状态监听器,在 Shizuku 状态变化时通知组件:

```
// Adding state change listener
ShizukuAuthorizer.addStateChangeListener {
    // Called when Shizuku state changes
    refreshStatus()
}
 
// Checking Shizuku status
val isInstalled = ShizukuAuthorizer.isShizukuInstalled(context)
val isRunning = ShizukuAuthorizer.isShizukuServiceRunning()
val hasPermission = ShizukuAuthorizer.hasShizukuPermission()
```

### Shizuku 安装流程

`ShizukuInstaller` 类处理内置和外部 Shizuku 的安装:

**安装流程**

```
Not installed

Installed

Update needed

Up to date

Bundled

Store

Not running

Running

User initiates setup

isShizukuInstalled()

isShizukuUpdateNeeded()

Display ShizukuWizardCard

Installation method

ShizukuInstaller.extractApkFromAssets()

Launch store URL

FileProvider.getUriForFile()

ACTION_VIEW intent

isShizukuServiceRunning()

Launch Shizuku app

requestShizukuPermission()

Setup complete
```

内置 Shizuku 版本信息通过以下方式获取:
方法用途`ShizukuInstaller.getInstalledShizukuVersion()`获取当前已安装的版本代码`ShizukuInstaller.getBundledShizukuVersion()`获取内置 APK 的版本代码`ShizukuInstaller.isShizukuUpdateNeeded()`比较已安装版本与内置版本
来源:

## Root 授权

`RootAuthorizer` 类管理超级用户访问权限，使 Operit 能够以 root 权限执行命令。Root 访问是最高权限级别，必须谨慎使用。

### Root 权限管理

**Root 授权流程**

```
User
"su binary"
"Root Shell Process"
"RootAuthorizer"
"Application"
User
"su binary"
"Root Shell Process"
"RootAuthorizer"
"Application"
"initialize(context)"
"isDeviceRooted()"
"Check for su binary"
"Binary found/not found"
"requestRootPermission()"
"Start root shell"
"Execute 'su'"
"SuperUser prompt"
"Grant/Deny"
"Permission result"
"Shell established"
"Notify state listeners"
"Permission granted"
"executeRootCommand(command)"
"Write command to shell"
"Execute with root"
"Command output"
"Return output"
"Command result"
```

### RootAuthorizer API

`RootAuthorizer` 提供了用于 root 操作的单例接口：

```
// Initialize root authorizer (typically done in Application or ViewModel)
RootAuthorizer.initialize(context)
 
// Check if device has root capability
val isRooted = RootAuthorizer.isDeviceRooted()
 
// Check if app has been granted root access
val hasAccess = RootAuthorizer.checkRootStatus(context)
 
// Request root permission from user
RootAuthorizer.requestRootPermission { granted ->
    if (granted) {
        // Root access granted
    } else {
        // Root access denied
    }
}
 
// Execute command with root privileges
val (success, output) = RootAuthorizer.executeRootCommand("ls -la /data")
```

### Root 状态监控

`RootAuthorizer` 维护组件可以观察的状态流：
状态属性类型用途`isRooted``StateFlow<Boolean>`设备具有 root 能力`hasRootAccess``StateFlow<Boolean>`应用具有 root 权限
可以注册状态变化监听器来响应 root 状态变化：

```
RootAuthorizer.addStateChangeListener {
    // Called when root status changes
    updateUIState()
}
```

### 安全注意事项

Root 操作绕过了 Android 的安全模型，如果使用不当可能导致系统不稳定。已实施以下安全措施：

1. **用户确认**：Root 访问需要用户通过 SuperUser 应用明确授权
2. **命令验证**：危险操作应在执行前进行验证
3. **错误处理**：Root 命令失败会被捕获并报告
4. **状态跟踪**：Root 状态被监控，UI 反映当前状态
5. **监听器清理**：组件销毁时正确移除状态监听器

## 无障碍服务集成

Operit 的无障碍服务集成通过 `UIHierarchyManager` 和 `AccessibilityProviderInstaller` 类实现 UI 自动化。该系统需要单独的无障碍提供程序应用才能运行。

### 无障碍架构

**无障碍服务集成**

```
Android System

Accessibility Provider App

Operit Main App

Install/Update

bindToService()

AIDL Interface

UIHierarchyManager

AccessibilityProviderInstaller

Tool System
AccessibilityFileSystemTools

Provider APK
(Separate app)

Accessibility Service

AIDL Service Binder

Accessibility Framework

App UI Elements
```

### UIHierarchyManager API

`UIHierarchyManager` 提供与无障碍提供程序交互的方法:
方法用途`isProviderAppInstalled(context)`检查提供程序应用是否已安装`isAccessibilityServiceEnabled(context)`检查服务是否在设置中启用`bindToService(context)`建立与提供程序的 AIDL 连接`launchProviderInstall(context)`启动提供程序应用安装

### AccessibilityProviderInstaller

`AccessibilityProviderInstaller` 管理提供程序应用的生命周期:

**提供程序安装流程**

```
"Android PackageManager"
"UIHierarchyManager"
"AccessibilityProviderInstaller"
"PermissionLevelCard"
User
"Android PackageManager"
"UIHierarchyManager"
"AccessibilityProviderInstaller"
"PermissionLevelCard"
User
alt
["Not installed or update needed"]
"Setup accessibility"
"getInstalledVersion()"
"Query package info"
"Version code"
"getBundledVersion()"
"Bundled version"
"isUpdateNeeded()"
"Update available"
"Install/Update provider"
"launchProviderInstall()"
"Extract and install APK"
"ACTION_VIEW with APK URI"
"Install prompt"
"Install"
"Enable accessibility service"
"Service enabled"
"bindToService()"
```

### 版本管理

安装程序跟踪已安装和捆绑的提供程序版本:

```
val installedVersion = AccessibilityProviderInstaller.getInstalledVersion(context)
val bundledVersion = AccessibilityProviderInstaller.getBundledVersion(context)
val updateNeeded = AccessibilityProviderInstaller.isUpdateNeeded(context)
 
if (updateNeeded) {
    UIHierarchyManager.launchProviderInstall(context)
}
```

### 无障碍状态跟踪

系统跟踪两个独立状态以实现完整的无障碍功能:
状态检查 方法需求Provider 已安装`UIHierarchyManager.isProviderAppInstalled()`Provider APK 已安装服务已启用`UIHierarchyManager.isAccessibilityServiceEnabled()`用户已在设置中启用
两个状态都必须为 true 才能实现完整的无障碍功能。`AccessibilityWizardCard` 引导用户完成设置过程。

## Terminal 系统

`Terminal` 单例提供对嵌入式 Ubuntu 24 环境的访问，用于执行 shell 命令和管理持久会话。该系统对于 MCP 插件执行和高级工具功能至关重要。

### Terminal 架构

**Terminal 系统组件**

```
Terminal Service

Terminal Management Layer

Application Layer

Terminal
(Singleton)

MCPSharedSession

File System Tools
MCP Deployer

TerminalManager

Session Management

State Flows

Ubuntu 24 Environment

Bash Shell

Node.js, Python, etc.
```

### Terminal 单例 API

`Terminal` 类为 `TerminalManager` 提供了简化的接口：

```
// Get Terminal instance
val terminal = Terminal.getInstance(context)
 
// Initialize terminal environment
val initialized = terminal.initialize()
 
// Create new session
val sessionId = terminal.createSession("session-name")
 
// Execute command and wait for completion
val output = terminal.executeCommand(sessionId, "ls -la")
 
// Execute command with streaming output
terminal.executeCommandFlow(sessionId, "npm install").collect { event ->
    println(event.outputChunk)
    if (event.isCompleted) {
        // Command finished
    }
}
 
// Send input to interactive session
terminal.sendInput(sessionId, "y\n")
 
// Send interrupt signal (Ctrl+C)
terminal.sendInterruptSignal(sessionId)
 
// Switch to different session
terminal.switchToSession(sessionId)
 
// Close session
terminal.closeSession(sessionId)
```

### 会话管理

**Terminal 会话生命周期**

```
Shell
Session
TerminalManager
Terminal
Client
Shell
Session
TerminalManager
Terminal
Client
loop
["Command execution"]
"createSession(title)"
"createNewSession()"
"Create TerminalSession"
"Start bash process"
"Shell initialized"
"Session ready"
"Return sessionId"
"sessionId"
"executeCommand(sessionId, cmd)"
"sendCommandToSession()"
"Write to shell"
"Execute command"
"Output chunk"
"CommandExecutionEvent"
"commandEvents flow"
"Collect output"
"Command complete"
"isCompleted = true"
"Final event"
"Full output"
"closeSession(sessionId)"
"closeSession()"
"Destroy session"
"Terminate process"
```

### 终端状态流

`Terminal` 从 `TerminalManager` 暴露了几个状态流：
流类型用途`commandEvents``SharedFlow<CommandExecutionEvent>`流式传输命令输出`directoryEvents``SharedFlow<SessionDirectoryEvent>`目录变更通知`terminalState``StateFlow<TerminalState>`整体终端状态`currentSessionId``StateFlow<String?>`活动会话 ID`currentDirectory``StateFlow<String>`当前工作目录`sessions``StateFlow<List<TerminalSession>>`所有活动会话

### MCPSharedSession

`MCPSharedSession` 对象管理 MCP 插件的共享终端会话，以避免创建重复会话：

```
// Get or create shared session
val sessionId = MCPSharedSession.getOrCreateSharedSession(context)
 
// Check if shared session exists
val hasSession = MCPSharedSession.hasActiveSession()
 
// Get current session ID without creating
val currentId = MCPSharedSession.getCurrentSessionId()
 
// Clear session reference (doesn't close session)
MCPSharedSession.clearSession()
```

**共享会话使用模式**

```
getOrCreateSharedSession()

getOrCreateSharedSession()

First call: createSession()

Subsequent calls: return cached ID

executeCommand(sessionId)

executeCommand(sessionId)

MCP Plugin Deployer

MCP Plugin Starter

MCPSharedSession

Terminal

Shared Session
ID: mcp-shared
```

共享会话方法确保：

- 为多个 MCP 插件初始化单个会话
- 使用 `Mutex` 实现线程安全的会话创建
- 减少资源使用
- MCP 操作之间的环境一致性

## 悬浮窗服务

Operit 提供了一个悬浮聊天窗口服务，允许用户从任何应用程序访问 AI 助手。此功能与 Android 的系统警告窗口功能集成。

```
Floating UI

System Services

Operit Main App

MainActivity

Floating Chat Manager

System Alert Window Service

Floating Chat Service

Floating Chat Window

AI Service Instance
```

悬浮窗服务支持：

- 从任何应用程序访问 AI 助手
- 捕获屏幕内容以实现上下文感知
- 无需切换应用即可执行 AI 驱动的操作

此服务需要用户授予 `SYSTEM_ALERT_WINDOW` 权限。

## 跨应用集成

Operit 可以通过多种方法与其他应用集成，包括 intent、无障碍服务和直接 API 调用。这使得广泛的跨应用功能成为可能。

```
Target Applications

Integration Methods

Operit

AI Assistant

Core Tools

Android Intents

UI Automation

Shizuku Commands

Termux Scripts

SMS/Messaging Apps

Phone App

Calendar App

QQ Messenger

Other Applications
```

跨应用功能示例：

- 使用 UI 自动化通过 QQ 发送消息
- 通过系统 intent 设置闹钟和提醒
- 通过拨号器 intent 拨打电话
- 通过消息 intent 发送短信
- 自动化与各种应用的交互

## 安全性与权限

Operit 的系统集成功能需要大量权限和安全考虑。应用实现了适当的权限处理和安全检查。

关键安全考虑：

1. **权限请求**：Operit 在运行时正确请求所有必需的权限
2. **权限验证**：操作在执行前验证权限
3. **安全存储**：敏感数据被安全存储
4. **用户确认**：关键操作需要用户确认
5. **错误处理**：健壮的错误处理防止安全问题

应用包含权限向导，引导用户完成 Shizuku、Termux 和其他关键权限的授予过程。

## 相关页面

- 有关 Shizuku 特定功能的详细信息，请参阅 [Shizuku 集成](/AAswordman/Operit/5.1-tool-architecture)
- 有关 Termux 特定功能的详细信息，请参阅 [Termux 集成](/AAswordman/Operit/5.2-file-system-tools)
- 有关 UI 自动化功能的详细信息，请参阅 [UI 自动化](/AAswordman/Operit/5.3-network-tools)
- 有关工具系统架构的信息，请参阅 [工具系统](/AAswordman/Operit/4-user-interface)
- 有关扩展集成功能的 MCP 插件信息，请参阅 [MCP 插件系统](/AAswordman/Operit/4.3-theme-system)
