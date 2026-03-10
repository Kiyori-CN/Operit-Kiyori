# 权限通道

本页面记录了 Operit 中实现不同权限级别 UI 自动化的三通道架构。该系统根据用户授予的 Android 权限级别提供逐步增强的自动化能力。

关于整体 UI 自动化系统和 agent 编排的信息，请参阅 [Phone Agent](/AAswordman/Operit/6.1-phone-agent)。关于工具权限管理和用户审批流程的详细信息，请参阅 [Tool Permissions](/AAswordman/Operit/5.9-tool-permissions)。关于系统级权限配置，请参阅 [Permission System](/AAswordman/Operit/7.1-permission-system)。

---

## 目的与范围

Operit 的 UI 自动化系统支持三个不同的**权限通道**，这些通道决定了可以使用哪些 Android API 来执行点击、滑动、读取屏幕内容和启动应用等 UI 操作：

1. **标准通道** - 使用所有应用都可用的基础 Android API
2. **无障碍通道** - 使用 Android 的 AccessibilityService 进行 UI 树访问和基于节点的交互
3. **调试器通道** - 使用 Shizuku/ADB 执行系统级 UI 自动化命令
4. **Root 通道** - 使用 root shell 访问进行无限制的系统操作(通常不用于 UI 自动化)

每个通道具有不同的能力、前置条件和实现策略。系统会根据用户配置的权限级别自动选择合适的通道，并在执行前验证所有前置条件是否满足。

---

## 架构概览

### 权限级别枚举

系统在 `AndroidPermissionLevel` 中定义了权限级别：
级别常量主要用途标准`STANDARD`基础文件操作，无 UI 自动化无障碍`ACCESSIBILITY`通过 AccessibilityService 进行基于节点的 UI 自动化管理员`ADMIN`为未来使用保留调试器`DEBUGGER`通过 Shizuku/ADB 进行基于命令的 UI 自动化Root`ROOT`完全系统访问(很少需要)

### 通道选择流程

```
STANDARD

ACCESSIBILITY

DEBUGGER

ROOT

Enabled

Disabled

Missing

Missing

Missing

User Configured
Permission Level

Validate Prerequisites

Standard Channel
(No UI Automation)

Accessibility Channel
(AccessibilityService)

Debugger Channel
(Shizuku/ADB)

Root Channel
(Root Shell)

Check Experimental
Virtual Display Flag

Check Provider App
Installed & Enabled

Check Shizuku
Running & Authorized

Check Root
Access Granted

Fallback to Standard

Error: Prerequisites
Not Met

Error: Root
Not Available
```

---

## Standard Channel

### 概览

Standard Channel 是基础实现，**不支持 UI 自动化**。它作为其他实现的基类，处理文件管理和网络请求等非 UI 操作。

### 功能特性

- ❌ 无法读取 UI 层级结构
- ❌ 无法执行点击/滑动手势
- ❌ 无法注入文本输入
- ❌ 无法捕获屏幕截图(不使用 MediaProjection 时)
- ✅ 可以执行文件操作
- ✅ 可以发起网络请求
- ✅ 可以通过 intent 启动应用

### 实现

`StandardUITools` 类提供了返回错误的桩实现用于 UI 操作：

```
«interface»

ToolImplementations

+tap(tool: AITool) : ToolResult

+longPress(tool: AITool) : ToolResult

+swipe(tool: AITool) : ToolResult

+setInputText(tool: AITool) : ToolResult

+pressKey(tool: AITool) : ToolResult

+captureScreenshot(tool: AITool) : Pair

StandardUITools

-context: Context

-operationOverlay: UIOperationOverlay

+getPageInfo(tool: AITool) : ToolResult

+tap(tool: AITool) : ToolResult

+clickElement(tool: AITool) : ToolResult

+runUiSubAgent(tool: AITool) : ToolResult

#captureScreenshotToFile(tool: AITool) : Pair

Returns 'operation not supported'
error for most UI operations
```

大多数 UI 方法返回此错误：

```
"This operation is not supported in the standard version.
Please use the accessibility or debugger version."

```

### 前置条件

无 - 默认对所有应用可用。

---

## Accessibility Channel

### 概览

Accessibility Channel 利用 Android 的 `AccessibilityService` 提供基于节点的 UI 自动化。这是大多数自动化任务的推荐通道，因为它在功能和稳定性之间提供了良好的平衡。

### 架构

```
Android System

Provider App Process

Main App Process

Creates

Binds to

AIDL IPC

Gets nodes from

Queries

Performs actions

ToolGetter

AccessibilityUITools
(extends StandardUITools)

OperitAccessibilityService
(AccessibilityService)

UIHierarchyManager

IAccessibilityProvider
(AIDL Interface)

Accessibility Framework

Window Manager
```

### 功能特性

- ✅ 读取完整 UI 层级结构(无障碍节点)
- ✅ 通过 ID、类名或边界点击元素
- ✅ 在输入框中设置文本
- ✅ 执行基于坐标的点击
- ✅ 滚动和滑动手势
- ✅ 按下系统按键(返回、主页等)
- ✅ 检测应用和 Activity 变化
- ⚠️ 屏幕截图需要 MediaProjection 权限

### 双进程架构

Accessibility Channel 使用**双进程架构**将 `AccessibilityService` 与主应用隔离：

1. **主应用进程** (`com.ai.assistance.operit`)

- 包含 UI 自动化工具
- 绑定到提供者服务
- 发出自动化命令

2. **提供者应用进程** (`com.ai.assistance.operit.provider`)

- 托管 AccessibilityService
- 拥有系统级 UI 访问权限
- 执行自动化命令

这种分离是必需的，因为：

- AccessibilityService 必须在单独的包中运行以获得系统信任
- 防止主应用崩溃影响服务
- 允许独立更新提供者

### 前置条件

要求检查位置安装提供者应用已安装`UIHierarchyManager.isProviderAppInstalled()`通过捆绑的 APK 或 Play Store提供者应用版本兼容`AccessibilityProviderInstaller.isUpdateNeeded()`如果过期则自动提示AccessibilityService 已启用检查系统设置用户必须在设置 → 无障碍中启用

### 实现模式

Accessibility Channel 重写 `StandardUITools` 方法以提供实际实现：

```
Android
AccessibilityService
Provider App
(AIDL)
AccessibilityUITools
ActionHandler
PhoneAgent
Android
AccessibilityService
Provider App
(AIDL)
AccessibilityUITools
ActionHandler
PhoneAgent
Execute Tap(x, y)
tap(tool)
performTap(x, y)
dispatchGesture()
Result
ToolResult
ToolResult
ToolResult
```

---

## Debugger Channel (Shizuku/ADB)

### 概述

Debugger Channel 使用 **Shizuku** 执行 ADB 级别的命令，无需 USB 连接。这提供了最强大的 UI 自动化能力，包括用于并行自动化的虚拟显示支持。

### 架构

```
Shower Server (Optional)

Shizuku Service

Operit App

Requires for
virtual screen

Execute commands

Creates via Shizuku

UI Automator
Commands

Virtual Display
Creation

PhoneAgent

ActionHandler

DebuggerUITools
(extends StandardUITools)

ShizukuAuthorizer

Shizuku API

System Server
(ADB Authority)

ShowerController

WebSocket Server

Display Capture
(h264 stream)

Android UI
Framework

Display Service
```

### 功能特性

- ✅ 执行 `uiautomator` 命令进行 UI 自动化
- ✅ 创建和管理虚拟显示器
- ✅ 通过系统 API 捕获屏幕截图
- ✅ 执行高权限操作(安装 APK 等)
- ✅ 在多个虚拟屏幕上并行自动化
- ✅ 基于坐标和元素的交互
- ✅ 完整的系统 UI 树访问

### 虚拟显示器支持

Debugger Channel 通过 Shower 服务器独特地支持**虚拟显示器**：

```
Automation on

Automation on

Automation on

Managed by

Managed by

Monitored by

Agent 'wechat_1'

Agent 'taobao_1'

Agent 'default'
(Main Screen)

Virtual Display
displayId=2

Virtual Display
displayId=3

Main Display
displayId=0

Shower Server
(Shizuku-launched)
```

这使得并行自动化成为可能，不同的代理可以同时在独立的虚拟屏幕上操作而互不干扰。

### 前置要求

要求检查方法说明已安装 Shizuku 应用`ShizukuInstaller.getInstalledShizukuVersion()`可从内置 APK 自动安装Shizuku 服务正在运行`ShizukuAuthorizer.isShizukuServiceRunning()`用户必须通过 Shizuku 应用启动已授予 Shizuku 权限`ShizukuAuthorizer.hasShizukuPermission()`首次使用时自动请求已启用实验性标志`DisplayPreferencesManager.isExperimentalVirtualDisplayEnabled()`虚拟显示器所需

### Shizuku 初始化

Shizuku 必须通过以下两种方法之一启动：

1. **无线 ADB**(无需 USB，无需 Root)

- 启用开发者选项和无线调试
- 通过配对码连接
- Shizuku 保持连接

2. **Root**(适用于已 Root 设备)

- Shizuku 自动以 root 权限启动
- 最可靠的方法

---

## Root 通道

### 概述

Root 通道使用 root shell 访问来执行最高权限操作。然而，它**很少用于 UI 自动化**，因为 Debugger 通道提供了等效的功能而无需 root 权限。

### 功能

- ✅ 以 root 身份执行任何 shell 命令
- ✅ 修改系统文件
- ✅ 安装/卸载系统应用
- ✅ 访问受保护的系统 API
- ⚠️ 通常不用于 UI 自动化(优先使用 Debugger 通道)

### 架构

```
Check su binary

If exists

Execute with
UID 0

Root Command Request

RootAuthorizer

su binary

Root Shell Session

System Command
(Full Privileges)
```

### 前置条件

需求检查方法说明设备已 Root`RootAuthorizer.isDeviceRooted()`检查 `su` 二进制文件Root 权限已授予`RootAuthorizer.checkRootStatus()`应用必须请求 root 访问权限

---

## 通道选择与验证

### 用户配置

用户在**权限级别卡片**中配置其首选权限级别：

```
Selects level

Saves

Read by

Returns

User

PermissionLevelCard
(UI Component)

androidPermissionPreferences
(DataStore)

ToolGetter.getUITools()

StandardUITools
AccessibilityUITools
or DebuggerUITools
```

### 运行时验证

在执行 UI 自动化之前，系统会验证前置条件：

```
RootAuthorizer
ShizukuAuthorizer
androidPermissionPreferences
resolvePrivilegedExecutionState
PhoneAgent
RootAuthorizer
ShizukuAuthorizer
androidPermissionPreferences
resolvePrivilegedExecutionState
PhoneAgent
alt
[Debugger Level]
[Root Level]
[Standard/Accessibility]
Check prerequisites
getPreferredPermissionLevel()
DEBUGGER
Check experimental flag
isShizukuServiceRunning()
true
hasShizukuPermission()
true
✅ Debugger available
checkRootStatus()
true/false
✅/❌ Root status
✅ No special checks
```

### 降级行为

如果前置条件未满足：
选定级别缺失前置条件降级行为ACCESSIBILITY提供程序未安装/启用❌ 错误 - 用户必须安装/启用DEBUGGERShizuku 未运行/授权❌ 错误并提供说明DEBUGGER实验性标志已禁用降级至 STANDARD(无 UI 自动化)ROOTRoot 不可用❌ 错误 - 无法继续

---

## 实现类

### 类层次结构

```
«interface»

ToolImplementations

+tap(tool: AITool) : ToolResult

+longPress(tool: AITool) : ToolResult

+swipe(tool: AITool) : ToolResult

+setInputText(tool: AITool) : ToolResult

+pressKey(tool: AITool) : ToolResult

+captureScreenshot(tool: AITool) : Pair

StandardUITools

#context: Context

#operationOverlay: UIOperationOverlay

+tap(tool: AITool) : ToolResult

+runUiSubAgent(tool: AITool) : ToolResult

#captureScreenshotToFile() : Pair

AccessibilityUITools

-providerBinder: IAccessibilityProvider

+tap(tool: AITool) : ToolResult

+clickElement(tool: AITool) : ToolResult

+getPageInfo(tool: AITool) : ToolResult

+setInputText(tool: AITool) : ToolResult

DebuggerUITools

-shizukuAuthorizer: ShizukuAuthorizer

+tap(tool: AITool) : ToolResult

+executeUIAutomatorCommand() : ToolResult

+captureViaShizuku() : Pair
```

### ToolGetter 工厂

`ToolGetter` 类根据用户偏好选择合适的实现：

```
// Simplified from ToolGetter.kt
fun getUITools(context: Context): ToolImplementations {
    val level = androidPermissionPreferences.getPreferredPermissionLevel()
    return when (level) {
        AndroidPermissionLevel.ACCESSIBILITY -> {
            if (UIHierarchyManager.isProviderAppInstalled(context) &&
                UIHierarchyManager.isAccessibilityServiceEnabled(context)) {
                AccessibilityUITools(context)
            } else {
                StandardUITools(context) // Fallback
            }
        }
        AndroidPermissionLevel.DEBUGGER -> {
            if (ShizukuAuthorizer.isShizukuServiceRunning() &&
                ShizukuAuthorizer.hasShizukuPermission()) {
                DebuggerUITools(context)
            } else {
                StandardUITools(context) // Fallback
            }
        }
        AndroidPermissionLevel.ROOT -> {
            // Root tools implementation (if available)
            RootUITools(context)
        }
        else -> StandardUITools(context)
    }
}
```

---

## 各通道的权限前置条件

### Manifest 声明

所有通道都需要在 `AndroidManifest.xml` 中声明特定权限：
通道必需权限可选权限Standard`INTERNET`、`ACCESS_NETWORK_STATE``READ_EXTERNAL_STORAGE`、`WRITE_EXTERNAL_STORAGE`Accessibility所有 Standard 权限 + 无额外权限(提供者应用需具有 AccessibilityService)`SYSTEM_ALERT_WINDOW`(用于悬浮窗)Debugger所有 Standard 权限 + `moe.shizuku.manager.permission.API_V23``FOREGROUND_SERVICE_MEDIA_PROJECTION`Root所有 Standard 权限 + 无(root 访问在运行时授予)无

### 运行时权限检查

```
Root Channel

Check Device Rooted

Check Root Permission

Debugger Channel

Check Shizuku Installed

Check Shizuku Running

Check Shizuku Permission

Check Experimental Flag

Accessibility Channel

Check Provider App Installed

Check Provider Version

Check Service Enabled

Standard Channel

✅ No special checks
```

---

## 通道对比表

## 功能StandardAccessibilityDebuggerRoot**UI 层级访问**❌✅ 完整树结构✅ 完整树结构✅ 完整树结构**坐标点击**❌✅ 通过手势✅ 通过 uiautomator✅ 通过 input 命令**元素点击**❌✅ 通过节点✅ 通过选择器✅ 通过选择器**文本输入**❌✅ IME 注入✅ Input 命令✅ Input 命令**截图**⚠️ 需要 MediaProjection⚠️ 需要 MediaProjection✅ 系统 API✅ Screencap**虚拟显示**❌❌✅ Shower 服务器✅ Display 服务**并行自动化**❌❌✅ 多代理⚠️ 受限**配置复杂度**无中等(安装提供者)中高(Shizuku 配置)高(设备 root)**稳定性**N/A高中等中等**推荐用途**非 UI 任务通用 UI 自动化高级/并行自动化系统修改

## 代码流程示例

### 示例 1：通过 Accessibility 通道执行点击操作

```
AccessibilityService
ProviderApp
AccessibilityUITools
ActionHandler
PhoneAgent
User
AccessibilityService
ProviderApp
AccessibilityUITools
ActionHandler
PhoneAgent
User
"Tap on coordinates (100, 200)"
executeAgentAction(Tap)
tap(tool)
performTap(100, 200) [AIDL]
dispatchGesture(path)
Gesture dispatched
ToolResult(success=true)
ToolResult
Action completed
```

### 示例 2：虚拟显示创建(Debugger 通道)

```
DisplayManager
ShizukuService
ShizukuAuthorizer
ShowerController
PhoneAgent
DisplayManager
ShizukuService
ShizukuAuthorizer
ShowerController
PhoneAgent
ensureDisplay(agentId, width, height, dpi)
Check if running
✅ Running
Start Shower server [via Shizuku]
Server started
Create virtual display
createVirtualDisplay(width, height, dpi)
displayId=2
displayId=2
Store agentId -> displayId mapping
✅ Display ready
```

---

## 总结

权限通道系统为 UI 自动化提供了**灵活的分层方法**：

- **Standard**：非 UI 操作的安全基线
- **Accessibility**：推荐用于大多数 UI 自动化任务，稳定且功能丰富
- **Debugger**：用于并行自动化和虚拟显示的高级通道，需要 Shizuku 设置
- **Root**：最高权限但在 UI 自动化中很少需要

系统会自动验证前置条件，并在不满足要求时提供清晰的错误消息，引导用户完成必要的设置步骤。
