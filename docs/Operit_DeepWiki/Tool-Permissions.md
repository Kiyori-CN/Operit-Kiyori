# 工具权限

## 目的与范围

本文档说明 Operit 的工具权限系统，该系统控制 40 多个 AI 可访问工具中哪些被启用以及它们需要哪些 Android 系统权限。该系统实现了分层权限模型(STANDARD → ACCESSIBILITY → DEBUGGER → ROOT)，逐步解锁更强大的功能。工具权限独立于模型配置([2.3](/AAswordman/Operit/2.3-model-configuration))和功能映射([2.5](/AAswordman/Operit/2.5-conversation-management))，后者决定*哪个* AI 模型处理任务，而非工具*是否*可用。

---

## 权限系统架构

### 高层概览

```
System Prompt Generation

Tool Implementations

Permission Layers

Tool Registry

User Control Layer

ApiPreferences.ENABLE_TOOLS
Global Tools Toggle

ToolPermissionSettingsScreen
Individual Tool Control

AIToolHandler
Central Tool Registry

registerAllTools()
Tool Registration Logic

STANDARD
Basic File/Network Access

ACCESSIBILITY
+ UI Automation

DEBUGGER
+ Shell Commands (Shizuku)

ROOT
+ Elevated System Access

StandardFileSystemTools
StandardUITools
NetworkTools

AccessibilityFileSystemTools
Enhanced UI Tools

DebuggerFileSystemTools
Shell-based Operations

RootShellExecutor
Elevated Commands

SystemPromptConfig.getSystemPrompt()
Dynamic Tool List

ConversationService
Context Building
```

### 系统中的权限流程

```
"Tool Implementation"
"AIToolHandler"
"SystemPromptConfig"
"ConversationService"
"EnhancedAIService"
"ApiPreferences"
"ToolPermissionSettingsScreen"
User
"Tool Implementation"
"AIToolHandler"
"SystemPromptConfig"
"ConversationService"
"EnhancedAIService"
"ApiPreferences"
"ToolPermissionSettingsScreen"
User
alt
[Tools Enabled]
[Tools Disabled]
AI generates response with tool call
alt
[Permission Granted]
[Permission Denied]
Toggle ENABLE_TOOLS
saveEnableTools(boolean)
Send message
prepareConversationHistory()
enableToolsFlow.first()
getSystemPrompt(enableTools=true/false)
Get available tools
System prompt with tool descriptions
System prompt without tools
Prepared history with context
executeTool(toolName, params)
Check permission level
ToolResult(success=true)
ToolResult(success=false, error)
Tool execution result
```

---

## Android 权限级别

工具系统实现了四个逐级提升的权限层级：
级别Android 要求解锁能力风险等级**STANDARD**基础 Android 权限(存储、网络)文件 I/O(Android 路径)、HTTP 请求、简单系统信息低**ACCESSIBILITY**启用无障碍服务UI 节点检查、点击/滑动操作、增强文件访问中**DEBUGGER**Shizuku(ADB over Wireless)Shell 命令执行、系统文件访问、安装/卸载应用高**ROOT**授予 Root 访问权限完全系统控制、受保护文件访问、特权命令严重

### 权限级别实现

```
uses

uses

extends

StandardFileSystemTools

+listFiles(tool: AITool)

+readFileFull(tool: AITool)

+writeFile(tool: AITool)

#isLinuxEnvironment(env: String?)

#handleSpecialFileRead()

AccessibilityFileSystemTools

+listFiles(tool: AITool)

+readFileFull(tool: AITool)

#useAccessibilityForOperation()

DebuggerFileSystemTools

+listFiles(tool: AITool)

#parseDetailedDirectoryListing()

#isOperitInternalPath(path: String)

-executeShellCommand()

LinuxFileSystemTools

-fs: FileSystemProvider

+listFiles(tool: AITool)

+readFileFull(tool: AITool)

#getLinuxFileSystem()

StandardUITools

+tapScreen(tool: AITool)

+swipe(tool: AITool)

+inputText(tool: AITool)

AndroidShellExecutor

+executeShellCommand(cmd: String)

+executeShellCommands(cmds: List)

RootShellExecutor

+executeRootCommand(cmd: String)

+checkRootAccess()
```

---

## 工具注册与权限检查

### 工具注册流程

工具在 `ToolRegistration.kt` 中使用 `AIToolHandler.registerTool()` 方法注册。每个注册指定：

1. **工具名称** - 唯一标识符(例如 `"execute_shell"`、`"list_files"`)
2. **危险检查** - 确定操作是否危险的 Lambda 表达式
3. **描述生成器** - 创建人类可读的描述
4. **执行器** - 实际的工具实现

**带危险检查的注册示例：**

```
// Shell execution - always dangerous
handler.registerTool(
    name = "execute_shell",
    dangerCheck = { true },  // Always returns true for shell commands
    descriptionGenerator = { tool ->
        val command = tool.parameters.find { it.name == "command" }?.value ?: ""
        "执行ADB Shell: $command"
    },
    executor = { tool ->
        val adbTool = ToolGetter.getShellToolExecutor(context)
        adbTool.invoke(tool)
    }
)
```

### 危险检查系统

```
true

false or null

Approved

Denied

Tool Invocation

dangerCheck
lambda

User
Confirmation

Execute Tool

Cancel Execution
```

**危险检查类别：**
检查值含义示例工具`{ true }`始终危险`execute_shell`、`execute_intent`、`install_app``{ false }`从不危险`create_terminal_session`、`calculate`、`sleep``null`不适用`query_memory`、`get_memory_by_title`

---

## 全局工具启用/禁用

### ApiPreferences 存储

全局工具开关通过 Android DataStore 持久化存储在 `ApiPreferences` 中：

```
// Key definition
val ENABLE_TOOLS = booleanPreferencesKey("enable_tools")
const val DEFAULT_ENABLE_TOOLS = true
 
// Flow for observing state
val enableToolsFlow: Flow<Boolean> =
    context.apiDataStore.data.map { preferences ->
        preferences[ENABLE_TOOLS] ?: DEFAULT_ENABLE_TOOLS
    }
 
// Save function
suspend fun saveEnableTools(isEnabled: Boolean) {
    context.apiDataStore.edit { preferences ->
        preferences[ENABLE_TOOLS] = isEnabled
    }
}
```

### 对系统提示词的影响

当全局禁用工具时，系统提示词会被修改以移除工具相关部分：

```
// In SystemPromptConfig.getSystemPrompt()
if (enableTools) {
    if (useToolCallApi) {
        prompt = prompt
            .replace("TOOL_USAGE_GUIDELINES_SECTION", TOOL_USAGE_BRIEF_EN)
            .replace("PACKAGE_SYSTEM_GUIDELINES_SECTION", PACKAGE_SYSTEM_GUIDELINES_TOOL_CALL_EN)
            .replace("AVAILABLE_TOOLS_SECTION", "")
    } else {
        prompt = prompt
            .replace("TOOL_USAGE_GUIDELINES_SECTION", TOOL_USAGE_GUIDELINES_EN)
            .replace("PACKAGE_SYSTEM_GUIDELINES_SECTION", PACKAGE_SYSTEM_GUIDELINES_EN)
            .replace("AVAILABLE_TOOLS_SECTION", availableToolsEn)
    }
} else {
    if (enableMemoryQuery) {
        // Only memory tools available
        prompt = prompt
            .replace("TOOL_USAGE_GUIDELINES_SECTION", TOOL_USAGE_GUIDELINES_EN)
            .replace("PACKAGE_SYSTEM_GUIDELINES_SECTION", "")
            .replace("AVAILABLE_TOOLS_SECTION", MEMORY_TOOLS_EN)
    } else {
        // All tool sections removed
        prompt = prompt
            .replace("TOOL_USAGE_GUIDELINES_SECTION", "")
            .replace("PACKAGE_SYSTEM_GUIDELINES_SECTION", "")
            .replace("AVAILABLE_TOOLS_SECTION", "")
            .replace(BEHAVIOR_GUIDELINES_EN, "")
    }
}
```

---

## 工具权限设置界面

### 设置屏幕导航

工具权限屏幕可从主设置屏幕的"数据和权限"部分访问：

```
// In SettingsScreen.kt
SettingsSection(
    title = stringResource(id = R.string.settings_data_permissions),
    icon = Icons.Default.Security,
    containerColor = cardContainerColor
) {
    CompactSettingsItem(
        title = stringResource(id = R.string.settings_tool_permissions),
        subtitle = stringResource(id = R.string.settings_tool_permissions_subtitle),
        icon = Icons.Default.AdminPanelSettings,
        onClick = navigateToToolPermissions
    )
    // ... other data/permissions items
}
```

### 导航架构

```
navigateToToolPermissions

parentScreen

navItem

SettingsScreen

ToolPermissionSettingsScreen

OperitRouter

NavItem.ToolPermissions

Screen.ToolPermission
```

### 屏幕定义

ToolPermission 屏幕被定义为一个带有适当导航元数据的次级屏幕：

```
// In OperitScreens.kt
data object ToolPermission :
    Screen(
        parentScreen = Settings,
        navItem = NavItem.Settings,
        titleRes = R.string.screen_title_tool_permissions
    ) {
    @Composable
    override fun Content(
        navController: NavController,
        navigateTo: ScreenNavigationHandler,
        updateNavItem: NavItemChangeHandler,
        onGoBack: () -> Unit,
        // ... other parameters
    ) {
        ToolPermissionSettingsScreen(navigateBack = onGoBack)
    }
}
```

---

## 可用工具列表

系统包含 40 多个工具，按类别和权限级别组织：

### 文件系统工具(STANDARD/DEBUGGER/LINUX)

- `list_files` - 列出目录内容
- `read_file_full` - 读取完整文件内容
- `read_file_part` - 按行范围读取文件
- `write_file` - 将文本写入文件
- `write_file_binary` - 写入二进制数据
- `delete_file` - 删除文件/目录
- `move_file` - 移动或重命名
- `copy_file` - 复制文件(支持跨环境)
- `make_directory` - 创建目录
- `find_files` - 按模式搜索文件
- `grep_code` - 使用正则表达式搜索代码
- `file_exists` - 检查是否存在
- `file_info` - 获取元数据
- `zip_files` / `unzip_files` - 归档操作

### 网络工具(STANDARD)

- `http_request` - 发起 HTTP 请求
- `visit_web` - 访问并解析网页
- `multipart_request` - 上传文件
- `manage_cookies` - Cookie 管理

### 系统工具(STANDARD/DEBUGGER)

- `execute_shell` - 运行 shell 命令(DEBUGGER)
- `create_terminal_session` - 创建持久终端
- `execute_in_terminal_session` - 在会话中运行命令
- `device_info` - 获取设备信息
- `get_system_setting` / `modify_system_setting` - 系统设置
- `install_app` / `uninstall_app` - 应用管理(DEBUGGER)
- `start_app` / `stop_app` - 启动/终止应用
- `execute_intent` - 发送 Android Intent

### UI 自动化工具 (ACCESSIBILITY)

- `get_ui_page` - 捕获 UI 层级结构
- `tap_screen` - 模拟点击
- `swipe` - 模拟滑动手势
- `input_text` - 向字段输入文本
- `press_back` / `press_home` - 导航按钮

### 记忆工具 (STANDARD)

- `query_memory` - 搜索记忆数据库
- `get_memory_by_title` - 检索特定记忆
- `create_memory` - 创建新记忆
- `update_memory` - 更新现有记忆
- `delete_memory` - 删除记忆
- `link_memories` - 创建记忆关联

### 实用工具 (STANDARD)

- `calculate` - 计算数学表达式
- `sleep` - 暂停执行
- `use_package` - 激活 MCP 插件包

---

## 与 AI 服务的集成

### 系统提示词中的工具可用性

`ConversationService` 根据权限动态构建系统提示词，包含或排除工具描述:

```
// In ConversationService.prepareConversationHistory()
val enableTools = apiPreferences.enableToolsFlow.first()
 
val systemPrompt = SystemPromptConfig.getSystemPromptWithCustomPrompts(
    packageManager,
    workspacePath,
    introPrompt,
    thinkingGuidance,
    finalCustomSystemPromptTemplate,
    enableTools,  // Controls tool section inclusion
    enableMemoryQuery,
    hasImageRecognition,
    chatModelHasDirectImage,
    useToolCallApi
)
 
preparedHistory.add(Pair("system", systemPrompt))
```

### Tool Call API 模式

对于支持原生工具调用的提供商(例如 OpenAI 的函数调用)，系统可以在 "Tool Call API" 模式下运行，其中:

1. 工具通过 API 的 `tools` 参数发送，而不是在系统提示词中
2. 系统提示词仅包含简要使用指南
3. 工具调用从结构化 API 响应中解析，而不是从 XML 标签

**Tool Call API 提示词修改:**

```
if (useToolCallApi) {
    prompt = prompt
        .replace("TOOL_USAGE_GUIDELINES_SECTION", TOOL_USAGE_BRIEF_EN)
        .replace("PACKAGE_SYSTEM_GUIDELINES_SECTION", PACKAGE_SYSTEM_GUIDELINES_TOOL_CALL_EN)
        .replace("AVAILABLE_TOOLS_SECTION", "")  // Tools sent via API
} else {
    prompt = prompt
        .replace("TOOL_USAGE_GUIDELINES_SECTION", TOOL_USAGE_GUIDELINES_EN)
        .replace("PACKAGE_SYSTEM_GUIDELINES_SECTION", PACKAGE_SYSTEM_GUIDELINES_EN)
        .replace("AVAILABLE_TOOLS_SECTION", availableToolsEn)  // Tools in prompt
}
```

---

## 基于权限的工具实现

### 文件系统工具层级

不同的文件系统工具实现提供逐步增强的能力：

```
Linux Environment

Android Environment

Implementation Selection

android

linux

Standard Android path

Needs elevated access

System path

inherits

inherits

AITool
(Tool Invocation)

environment
parameter?

Path
type?

StandardFileSystemTools
Java File API

AccessibilityFileSystemTools
Enhanced Access

DebuggerFileSystemTools
Shell Commands

LinuxFileSystemTools
FileSystemProvider

SSH Connection

Local Terminal
```

### 路径验证与环境选择

文件系统工具使用 `environment` 参数来确定执行上下文：

```
// In StandardFileSystemTools.listFiles()
override suspend fun listFiles(tool: AITool): ToolResult {
    val path = tool.parameters.find { it.name == "path" }?.value ?: ""
    val environment = tool.parameters.find { it.name == "environment" }?.value
 
    // Delegate to Linux tools if Linux environment specified
    if (isLinuxEnvironment(environment)) {
        return linuxTools.listFiles(tool)
    }

    // Validate Android path
    PathValidator.validateAndroidPath(path, tool.name)?.let { return it }

    // Continue with Android implementation...
}
 
protected fun isLinuxEnvironment(environment: String?): Boolean {
    return environment?.lowercase() == "linux"
}
```

### 基于 Shell 的操作(DEBUGGER 级别)

调试器级别的工具使用 `AndroidShellExecutor` 来运行 shell 命令：

```
// In DebuggerFileSystemTools.listFiles()
override suspend fun listFiles(tool: AITool): ToolResult {
    // ... validation ...

    // Use ls -la command for detailed listing
    val listResult = AndroidShellExecutor.executeShellCommand("ls -la '$normalizedPath'")

    if (listResult.success) {
        val entries = parseDetailedDirectoryListing(listResult.stdout, normalizedPath)
        return ToolResult(
            toolName = tool.name,
            success = true,
            result = DirectoryListingData(path, entries),
            error = ""
        )
    } else {
        return ToolResult(
            toolName = tool.name,
            success = false,
            result = StringResultData(""),
            error = "Failed to list directory: ${listResult.stderr}"
        )
    }
}
```

---

## MCP 包工具权限

MCP(Model Context Protocol)包可以注册继承权限系统的额外工具：

```
// In ToolRegistration.kt
handler.registerTool(
    name = "use_package",
    descriptionGenerator = { tool ->
        val packageName = tool.parameters.find { it.name == "package_name" }?.value ?: ""
        "使用工具包: $packageName"
    },
    executor = { tool ->
        val packageName = tool.parameters.find { it.name == "package_name" }?.value ?: ""
        handler
            .getOrCreatePackageManager()
            .executeUsePackageTool(tool.name, packageName)
    }
)
```

当包被激活时，其工具将变为可用，并受到与内置工具相同的权限检查。包工具在激活后会列在系统提示中。

---

## 总结

工具权限系统提供：

1. **分级访问控制** - 四个权限级别(STANDARD → ACCESSIBILITY → DEBUGGER → ROOT)逐步解锁更强大的能力
2. **全局开关** - 通过 `ApiPreferences.ENABLE_TOOLS` 主开关启用/禁用所有工具
3. **危险检查** - 单个工具可以标记需要用户确认的危险操作
4. **动态系统提示** - 工具可用性通过 `SystemPromptConfig` 反映在 AI 的上下文中
5. **权限感知实现** - 工具类根据可用权限继承和扩展能力
6. **跨环境支持** - 工具可在 Android 和 Linux(Ubuntu 终端)环境中运行
7. **可扩展性** - MCP 包可以注册与权限系统集成的额外工具

该架构确保 AI 驱动的工具执行既强大又安全，具有清晰的权限边界和用户控制。
