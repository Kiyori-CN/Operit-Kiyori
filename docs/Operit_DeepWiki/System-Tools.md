# 系统工具

## 用途与范围

系统工具为 AI 提供与 Android 系统操作、应用管理、设备信息和系统设置交互的能力。本页面记录了管理应用程序、读取/修改系统设置、访问通知和位置、执行 shell 命令以及与 Tasker 等外部自动化系统集成的工具。

文件操作请参阅 [文件系统工具](/AAswordman/Operit/5.2-file-system-tools)。网络操作请参阅 [网络工具](/AAswordman/Operit/5.4-system-tools)。UI 自动化功能请参阅 [UI 自动化](/AAswordman/Operit/6-ui-automation)。

## 系统工具架构

```
Android System APIs

Tool Executors

System Tools Categories

Tool Registry

AIToolHandler

ToolRegistration

App Management Tools
install_app, uninstall_app
start_app, stop_app
list_installed_apps

Settings Tools
get_system_setting
modify_system_setting

Device Information
device_info

Notifications & Location
get_notifications
get_device_location

Terminal & Shell
create_terminal_session
execute_in_terminal_session
execute_shell

Intent System
execute_intent

Tasker Integration
trigger_tasker_event

Utility Tools
sleep

AndroidShellExecutor

TerminalCommandExecutor

DeviceInfoToolExecutor

IntentToolExecutor

PackageManager

Settings.System/Global/Secure

NotificationManager

LocationManager

ActivityManager
```

## 工具注册与执行流程

所有系统工具都在 `ToolRegistration.registerAllTools()` 中使用 AIToolHandler 的注册 API 进行注册。每个工具指定：

- **名称**：唯一标识符(例如 `"install_app"`)
- **描述生成器**：用于创建人类可读描述的函数
- **危险检查**：用于标记危险操作的可选函数
- **执行器**：执行操作的挂起函数

```
Tool Executors

Tool Call XML

Yes

No

Approved

AI Model

Tool Parser

AIToolHandler

Danger Check?

User Confirmation

Tool Executor

ToolResult

App Management

Settings Tools

Device Tools

Shell/Terminal
```

## 应用管理工具

应用管理工具与 Android 的 PackageManager 交互，用于安装、卸载、启动、停止和列出应用程序。

### 工具清单

工具名称参数危险检查描述`install_app``path`：APK 文件路径始终从 APK 文件安装 Android 应用程序`uninstall_app``package_name`：包标识符始终通过包名卸载应用程序`start_app``package_name`：包标识符`activity`：可选的 activity 名称否启动应用程序`stop_app``package_name`：包标识符是强制停止应用程序`list_installed_apps``include_system`：布尔值(默认：false)否列出所有已安装的应用程序

### 注册示例

应用管理工具注册时带有特定的危险检查。例如，`install_app` 和 `uninstall_app` 始终需要用户确认：

```
handler.registerTool(
    name = "install_app",
    dangerCheck = { true }, // Always dangerous
    descriptionGenerator = { tool ->
        val path = tool.parameters.find { it.name == "path" }?.value ?: ""
        "安装应用: $path"
    },
    executor = { tool ->
        val appTool = ToolGetter.getAppManagementTools(context)
        appTool.installApp(tool)
    }
)
```

### 结果类型

应用操作返回 `AppOperationData`：

```
@Serializable
data class AppOperationData(
    val operationType: String,
    val packageName: String,
    val success: Boolean,
    val details: String = ""
) : ToolResultData()
```

应用列表返回 `AppListData`：

## 系统设置工具

系统设置工具允许通过 Settings API 读取和修改 Android 系统设置。设置被组织为三个命名空间：`system`、`secure` 和 `global`。

### 可用工具

工具名称参数返回类型`get_system_setting``setting`: 设置键`namespace`: `system`/`secure`/`global``SystemSettingData``modify_system_setting``setting`: 设置键`value`: 新值`namespace`: 设置命名空间`SystemSettingData`

### 常用设置

**System 命名空间**(用户可配置)：

- `screen_brightness`: 显示屏亮度(0-255)
- `screen_brightness_mode`: 自动亮度(0=手动，1=自动)
- `volume_system`、`volume_ring`、`volume_music`: 音频音量

**安全命名空间**(每用户，限制更严格)：

- `android_id`: 唯一设备标识符
- `accessibility_enabled`: 无障碍服务状态
- `location_mode`: 位置服务模式

**全局命名空间**(设备范围)：

- `airplane_mode_on`: 飞行模式状态
- `stay_on_while_plugged_in`: 充电时屏幕超时

### 结果结构

```
@Serializable
data class SystemSettingData(
    val namespace: String,
    val setting: String,
    val value: String
) : ToolResultData() {
    override fun toString(): String {
        return "$namespace.$setting 的当前值是: $value"
    }
}
```

## 设备信息工具

`device_info` 工具收集全面的设备信息，包括硬件规格、系统版本、内存、存储、电池状态和网络连接。

### 工具规范

**工具名称**：`device_info`**参数**：无**结果类型**：`DeviceInfoResultData`

### 结果结构

```
@Serializable
data class DeviceInfoResultData(
    val deviceId: String,
    val model: String,
    val manufacturer: String,
    val androidVersion: String,
    val sdkVersion: Int,
    val screenResolution: String,
    val screenDensity: Float,
    val totalMemory: String,
    val availableMemory: String,
    val totalStorage: String,
    val availableStorage: String,
    val batteryLevel: Int,
    val batteryCharging: Boolean,
    val cpuInfo: String,
    val networkType: String,
    val additionalInfo: Map<String, String> = emptyMap()
) : ToolResultData()
```

### 信息类别

类别字段说明**设备标识**`deviceId`、`model`、`manufacturer`硬件识别信息**系统版本**`androidVersion`、`sdkVersion`操作系统版本信息**显示**`screenResolution`、`screenDensity`屏幕规格**内存**`totalMemory`、`availableMemory`RAM 信息**存储**`totalStorage`、`availableStorage`内部存储容量**电池**`batteryLevel`、`batteryCharging`电源状态**处理器**`cpuInfo`CPU 详细信息**网络**`networkType`连接类型(WiFi/移动网络/无)

## 通知与位置工具

### 通知访问

**工具名称**：`get_notifications`**参数**：

- `limit`：要检索的最大通知数量(默认：10)
- `include_ongoing`：包含持续性通知（如音乐播放器）（默认：false）

**结果类型**：`NotificationData`

该工具需要通知监听器权限，并从系统通知管理器检索活动通知。

### 位置服务

**工具名称**：`get_device_location`**参数**：

- `high_accuracy`：使用 GPS 获取高精度位置(默认：false)
- `timeout`：最大等待时间（秒）（默认：10）

**结果类型**：`LocationData`

位置检索需要 `ACCESS_FINE_LOCATION` 或 `ACCESS_COARSE_LOCATION` 权限。高精度模式使用 GPS，低精度模式使用基于网络的定位。

## 终端与 Shell 执行

终端和 shell 工具提供对 Android 系统和 Ubuntu 环境的命令行访问。提供两种不同的执行模式：

### Shell 执行 vs 终端会话

```
Terminal Sessions (Linux Environment)

create_terminal_session

TerminalManager

Terminal Session

Ubuntu 24 Environment

execute_in_terminal_session

close_terminal_session

TerminalCommandResultData

Shell Execution (execute_shell)

execute_shell

AndroidShellExecutor

Shizuku Shell Command

Root Shell Command

ADBResultData
```

### Shell 工具(`execute_shell`)

使用 Shizuku 或 Root 权限执行一次性 shell 命令。

**参数**：

- `command`：要执行的 shell 命令

**结果**：包含命令输出、退出码的 `ADBResultData`

```
@Serializable
data class ADBResultData(
    val command: String,
    val output: String,
    val exitCode: Int
) : ToolResultData()
```

**注册**：

### 终端会话工具

终端会话提供对 Ubuntu 24 环境的持久访问，并保留会话状态。
工具参数说明`create_terminal_session``session_name`: 可选标识符创建或获取命名终端会话`execute_in_terminal_session``session_id`: 会话标识符`command`: 要执行的命令在特定会话中执行命令`close_terminal_session``session_id`: 会话标识符关闭并清理终端会话
**结果类型**: `TerminalCommandResultData`

```
@Serializable
data class TerminalCommandResultData(
    val command: String,
    val output: String,
    val exitCode: Int,
    val sessionId: String
) : ToolResultData()
```

### 终端架构

终端会话由 `TerminalManager` 管理，提供以下功能：

- **会话持久化**：会话在命令之间保持活动状态
- **环境变量**：同一会话中的命令继承环境
- **工作目录**：会话内保留当前目录
- **Ubuntu 集成**：完全访问 Ubuntu 24 文件系统和软件包

**注册**:

**JavaScript API**:

## Intent 系统集成

`execute_intent` 工具支持通过编程方式与 Android 的 Intent 系统交互，允许 AI 启动活动、服务和广播。

### 工具规范

**工具名称**：`execute_intent`**危险检查**：始终必需(强大的系统能力)

### 参数

参数类型必需说明`action`字符串否Intent 动作(例如 `android.intent.action.VIEW`)`package`字符串否目标包名`component`字符串否完整组件名(包名/类名)`data_uri`字符串否Intent 的数据 URI`type`字符串否Intent 类型：`activity`、`service` 或 `broadcast`(默认：`activity`)`extras`字符串否额外键值对的 JSON 字符串`flags`字符串否Intent 标志(逗号分隔)`categories`字符串否Intent 类别(逗号分隔)

### Intent 类型行为

**Activity**：启动 Android 活动(UI 界面)

- 使用 `startActivity()` 并带有 `FLAG_ACTIVITY_NEW_TASK`
- 示例：打开浏览器、查看图片、分享内容

**Service**：启动 Android 服务(后台任务)

- 在 API 26+ 上使用 `startService()` 或 `startForegroundService()`
- 示例：启动媒体播放、触发同步

**Broadcast**：发送广播 Intent

- 使用 `sendBroadcast()`
- 示例：触发系统事件、通知接收器

### 注册与描述

描述生成器提供上下文感知的描述：

```
handler.registerTool(
    name = "execute_intent",
    dangerCheck = { true }, // Always dangerous
    descriptionGenerator = { tool ->
        val action = tool.parameters.find { it.name == "action" }?.value
        val packageName = tool.parameters.find { it.name == "package" }?.value
        val component = tool.parameters.find { it.name == "component" }?.value
        val type = tool.parameters.find { it.name == "type" }?.value ?: "activity"
 
        when {
            !component.isNullOrBlank() -> "执行Intent: 组件 $component (${type})"
            !packageName.isNullOrBlank() && !action.isNullOrBlank() ->
                "执行Intent: $action (包: $packageName, 类型: ${type})"
            !action.isNullOrBlank() -> "执行Intent: $action (类型: ${type})"
            else -> "执行Android Intent (类型: ${type})"
        }
    },
    executor = { tool ->
        val intentTool = ToolGetter.getIntentToolExecutor(context)
        runBlocking(Dispatchers.IO) { intentTool.invoke(tool) }
    }
)
```

### JavaScript API

```
Tools.System.intent({
    action: "android.intent.action.VIEW",
    data_uri: "https://example.com",
    type: "activity"
});
```

## Tasker 集成

`trigger_tasker_event` 工具提供与 Tasker（一款流行的 Android 自动化应用）的集成，支持 AI 触发的自动化工作流。

### 工具规范

**工具名称**：`trigger_tasker_event`**用途**：向 Tasker 发送自定义事件以触发任务和配置文件

### 参数

所有参数都是可选的，并以键值对形式传递给 Tasker：

- `task_type`：事件类型标识符(推荐但可选)
- `arg1`、`arg2`、...、`argN`：传递给 Tasker 的任意参数

### 注册

```
handler.registerTool(
    name = "trigger_tasker_event",
    descriptionGenerator = { tool ->
        val taskType = tool.parameters.find { it.name == "task_type" }?.value ?: ""
        val args = tool.parameters.filter { it.name.startsWith("arg") }
            .joinToString(",") { it.value }
        "触发Tasker事件: $taskType ($args)"
    },
    executor = { tool ->
        val params = tool.parameters.associate { it.name to it.value }
        val taskType = params["task_type"]
        if (taskType.isNullOrBlank()) {
            ToolResult(
                toolName = tool.name,
                success = false,
                result = StringResultData(""),
                error = "缺少必需参数: task_type"
            )
        } else {
            val args = params.filterKeys { it != "task_type" }
            try {
                context.triggerAIAgentAction(taskType, args)
                ToolResult(
                    toolName = tool.name,
                    success = true,
                    result = StringResultData("Triggered Tasker event: $taskType")
                )
            } catch (e: Exception) {
                ToolResult(
                    toolName = tool.name,
                    success = false,
                    result = StringResultData(""),
                    error = "Failed to trigger Tasker event: ${e.message}"
                )
            }
        }
    }
)
```

### 实现

该集成在 `triggerAIAgentAction()` 扩展函数中实现：

这会发送一个 Tasker 可以监听的广播 intent，实现 Operit AI 与 Tasker 自动化配置文件之间的双向通信。

### JavaScript API

```
Tools.Tasker.triggerEvent({
    task_type: "ai_request",
    arg1: "parameter_value",
    arg2: "another_value"
});
```

## 实用工具

### Sleep Tool

`sleep` 工具在工具执行序列中引入延迟。

**工具名称**：`sleep`**参数**：

- `duration_ms`：睡眠持续时间(毫秒)，范围限制为 0-10000ms

**用途**：主要用于在操作之间为 UI 更新或系统状态变化留出时间。

```
handler.registerTool(
    name = "sleep",
    descriptionGenerator = { tool ->
        val durationMs = tool.parameters.find { it.name == "duration_ms" }
            ?.value?.toIntOrNull() ?: 1000
        "休眠 ${durationMs}毫秒"
    },
    executor = { tool ->
        val durationMs = tool.parameters.find { it.name == "duration_ms" }
            ?.value?.toIntOrNull() ?: 1000
        val limitedDuration = durationMs.coerceIn(0, 10000) // Max 10 seconds
 
        runBlocking(Dispatchers.IO) {
            delay(limitedDuration.toLong())
        }
 
        ToolResult(
            toolName = tool.name,
            success = true,
            result = StringResultData("Slept for ${limitedDuration}ms")
        )
    }
)
```

**JavaScript API**:

## TypeScript 定义中的系统工具

TypeScript 定义文件为使用系统工具的 MCP 包提供类型安全接口：

### System 命名空间类型定义

```
export interface ToolResultMap {
    // System operations
    'sleep': SleepResultData;
    'get_system_setting': SystemSettingData;
    'modify_system_setting': SystemSettingData;
    'install_app': AppOperationData;
    'uninstall_app': AppOperationData;
    'list_installed_apps': AppListData;
    'start_app': AppOperationData;
    'stop_app': AppOperationData;
    'device_info': DeviceInfoResultData;
    'get_notifications': NotificationData;
    'get_device_location': LocationData;
    'trigger_tasker_event': string;
}
```

### JavaScript 桥接定义

`Tools.System` 命名空间向用 JavaScript/TypeScript 编写的 MCP 包暴露所有系统工具，提供统一的 API 接口。

## 带危险检查的工具执行流程

系统工具实现了一个安全模型，危险操作需要用户确认：

```
Tool Executor
User Interface
Danger Check
AIToolHandler
Tool Parser
AI Model
Tool Executor
User Interface
Danger Check
AIToolHandler
Tool Parser
AI Model
alt
[Approved]
[Denied]
alt
[Dangerous Operation]
[Safe Operation]
Tool call XML
executeTool(AITool)
Check if dangerous
Request user confirmation
User approves/denies
Execute tool
ToolResult
Error: User denied
Execute tool
ToolResult
Return result
```

### 危险检查实现

工具将危险检查注册为 lambda 函数：

```
handler.registerTool(
    name = "modify_system_setting",
    dangerCheck = { true }, // Always requires confirmation
    // ...
)
 
handler.registerTool(
    name = "get_system_setting",
    dangerCheck = null, // No confirmation needed
    // ...
)
```

### 危险系统工具

以下系统工具始终需要用户确认：

- `execute_shell`：Shell 命令执行
- `execute_in_terminal_session`：终端命令执行
- `modify_system_setting`：修改系统设置
- `install_app`：安装应用程序
- `uninstall_app`：卸载应用程序
- `stop_app`：强制停止应用程序
- `execute_intent`：执行任意 intent

## 权限要求

系统工具根据其功能具有不同的权限要求：
工具类别所需权限权限级别**应用管理**`REQUEST_INSTALL_PACKAGES``DELETE_PACKAGES`标准/调试器**系统设置**`WRITE_SETTINGS``WRITE_SECURE_SETTINGS`标准/调试器**Shell 执行**Shizuku 授权或 Root 访问调试器/Root**通知**`BIND_NOTIFICATION_LISTENER_SERVICE`无障碍**位置**`ACCESS_FINE_LOCATION` 或 `ACCESS_COARSE_LOCATION`标准**Intent 执行**因 intent 目标而异标准+
有关权限级别和管理的更多信息，请参阅 [权限系统](/AAswordman/Operit/8.1-database-architecture)。
