# 工具系统

工具系统是一个可扩展的能力框架，为 AI 提供 40 多种原生操作，涵盖文件管理、系统控制、网络操作、UI 自动化等。该系统使 AI 能够通过将自然语言意图转换为参数化工具调用、通过权限控制的处理器执行这些调用并返回结构化结果来执行具体操作。

有关特定工具实现的信息，请参阅 [File System Tools](/AAswordman/Operit/5.2-file-system-tools)、[System Tools](/AAswordman/Operit/5.3-network-tools)、[Network Tools](/AAswordman/Operit/5.4-system-tools) 和 [UI Automation](/AAswordman/Operit/6-ui-automation)。有关使用自定义插件扩展系统的信息，请参阅 [MCP Plugin System](/AAswordman/Operit/5.6-javascript-tools-bridge)。

---

## 系统架构

工具系统作为注册-执行管道运行，工具在启动时注册一次，通过系统提示词暴露给 AI，并根据需要在权限验证后执行。

### 工具生态系统概览

```
Result Data

Permission Layers

JavaScript Bridge

Native Tool Categories

Core Registry

AI Integration Layer

generates prompt with
tool descriptions

parses tool calls

execute(tool)

registers tools

manages

manages

manages

manages

manages

returns to

controls access to

SystemPromptConfig

EnhancedAIService

ToolExecutionManager

AIToolHandler
(Singleton)

ToolRegistration
registerAllTools()

PackageManager
(MCP Extensions)

File System Tools
StandardFileSystemTools
LinuxFileSystemTools
DebuggerFileSystemTools

System Tools
ShellExecutor
IntentExecutor
DeviceInfo

Network Tools
HttpTools
WebVisitTool
CookieManager

UI Tools
StandardUITools
PhoneAgent
ActionHandler

JsTools API
Tools.Files
Tools.Net
Tools.System
Tools.UI

JavaScript Engine

STANDARD → ACCESSIBILITY
→ DEBUGGER → ROOT

ToolResultData
FileContentData
DirectoryListingData
HttpResponseData
UIPageResultData
```

---

## 工具注册与生命周期

### 注册阶段

所有工具通过 `registerAllTools()` 函数在 `ToolRegistration.kt` 中集中注册。每个工具注册指定：
组件类型说明**name**`String`唯一标识符(例如 `"read_file"`、`"http_request"`)**descriptionGenerator**`(AITool) -> String`生成人类可读的操作描述**dangerCheck**`((AITool) -> Boolean)?`可选的危险操作判断谓词**executor**`suspend (AITool) -> ToolResult`核心执行逻辑

```
for each tool category

stores in

App Initialization

registerAllTools()
ToolRegistration.kt

AIToolHandler
singleton instance

Registered Tool Map
name → executor
```

**注册模式示例：**

注册使用一致的模式：

1. 工具名称与系统提示词中暴露的名称匹配
2. 描述生成器创建上下文操作摘要
3. 执行器使用 `runBlocking(Dispatchers.IO)` 包装实际实现

---

### 执行流程

```
ToolResult
Tool Executor
AIToolHandler
ToolExecutionManager
AI Model Response
ToolResult
Tool Executor
AIToolHandler
ToolExecutionManager
AI Model Response
alt
[Tool requires permission not granted]
[Permission granted]
XML tool call
<tool name='read_file'>...
execute(AITool)
Check permissions
Check danger flag
ToolResult(success=false)
invoke(tool)
Perform operation
ToolResult(success=true, result=data)
Structured result
Feed back as user message
```

**工具参数结构：**

工具接收一个包含以下内容的 `AITool` 对象：

- `name: String` - 工具标识符
- `parameters: List<ToolParameter>` - 命名参数，每个参数包含 `name: String` 和 `value: String`

- 上下文中的图表 2(数据流架构)

---

## 工具分类与实现

### 文件系统工具层次结构

文件系统工具使用三层继承模型来支持不同的环境和权限级别：

```
inherits

inherits

inherits

Java File API
File.readText()

FileSystemProvider
SSH/Terminal

AndroidShellExecutor
cat, ls -la

StandardFileSystemTools
(Android File API)

LinuxFileSystemTools
(SSH/Terminal FS)

DebuggerFileSystemTools
(Shell Commands)

AccessibilityFileSystemTools
(ContentProvider Access)

Android Filesystem

Linux Filesystem

Shell Access
```

**关键文件工具：**
工具名称参数返回类型用途`list_files``path`, `environment?``DirectoryListingData`列出目录内容`read_file``path`, `environment?``FileContentData`读取文件（有大小限制）`read_file_full``path`, `environment?`, `text_only?``FileContentData`读取完整文件`read_file_part``path`, `start_line`, `end_line?``FilePartContentData`读取指定行范围`write_file``path`, `content`, `append?``FileOperationData`写入文本文件`read_file_binary``path`, `environment?``BinaryFileContentData`读取二进制文件（Base64编码）`apply_file``path`, `content``FileApplyResultData`AI辅助文件合并
**Environment 参数：**

`environment` 参数用于在 Android (`"android"`) 和 Linux (`"linux"`) 文件系统之间切换：

当 `environment="linux"` 时，路径将在由 PRoot 管理的 Ubuntu 终端环境中解析。

**特殊文件处理：**

系统自动处理特殊文件类型：

对于图像文件，系统支持多种读取模式：

1. **OCR 模式**(默认)：通过 MLKit 提取文本
2. **Intent 模式**：使用后端图像识别模型，需用户提供意图
3. **直接图像模式**：为支持视觉的聊天模型返回图像链接

---

### 系统工具

系统工具提供设备控制、应用管理和 shell 执行功能：

```
System Tools Category

Shell Execution
execute_shell

Terminal Sessions
create_terminal_session
execute_in_terminal_session

App Management
install_app
uninstall_app
start_app
stop_app

System Settings
get_system_setting
modify_system_setting

Device Info
device_info
get_notifications
get_device_location

Intent Execution
execute_intent
```

**终端会话管理：**

终端系统支持持久化会话以实现多命令工作流：

每个会话在命令之间保持状态，支持以下工作流：

```
1. create_terminal_session(name="build_session")
2. execute_in_terminal_session(session_id, "cd /project")
3. execute_in_terminal_session(session_id, "make build")
4. close_terminal_session(session_id)

```

---

### 网络工具

网络工具处理 HTTP 请求、网页抓取和 cookie 管理：
工具名称主要功能`http_request`完整的 HTTP 客户端，支持自定义请求头、请求体、方法`visit_web`智能网页抓取，支持链接提取`multipart_request`通过 multipart/form-data 上传文件`manage_cookies`按域名进行 cookie 增删改查操作
**Web Visit 工具链接跟踪：**

`visit_web` 工具生成唯一的 `visitKey` 并为提取的链接分配编号，以便后续导航：

---

## 结构化结果数据

所有工具通过密封的 `ToolResultData` 类返回包含结构化数据的 `ToolResult` 对象。这使得类型安全的结果处理和丰富的 UI 渲染成为可能。

### 结果数据类型系统

```
result: ToolResultData

ToolResult
success: Boolean
error: String

ToolResultData
(sealed class)

Basic Types
StringResultData
BooleanResultData
IntResultData

File Types
FileContentData
DirectoryListingData
FilePartContentData
BinaryFileContentData

Network Types
HttpResponseData
VisitWebResultData

System Types
DeviceInfoResultData
SystemSettingData
AppOperationData

UI Types
UIPageResultData
UIActionResultData
SimplifiedUINode
```

**关键结果数据类：**

**FileContentData：**

```
data class FileContentData(
    val path: String,
    val content: String,
    val size: Long
) : ToolResultData()
```

**DirectoryListingData：**

```
data class DirectoryListingData(
    val path: String,
    val entries: List<FileEntry>
) : ToolResultData() {
    data class FileEntry(
        val name: String,
        val isDirectory: Boolean,
        val size: Long,
        val permissions: String,
        val lastModified: String
    )
}
```

**HttpResponseData：**

```
data class HttpResponseData(
    val url: String,
    val statusCode: Int,
    val statusMessage: String,
    val headers: Map<String, String>,
    val contentType: String,
    val content: String,
    val contentBase64: String? = null,
    val size: Int,
    val cookies: Map<String, String> = emptyMap()
) : ToolResultData()
```

所有结果数据类都实现了 `toString()` 方法，用于生成 AI 可读的文本表示，同时保留结构化字段以供程序化访问。

---

## JavaScript 工具桥接

JavaScript 桥接通过 `Tools` 全局命名空间中的流式 API 将原生工具暴露给 MCP 包。

### API 结构

```
Tools (Global Object)

Tools.Files
list, read, write
delete, copy, move
zip, unzip, find

Tools.Net
httpGet, httpPost
visit, uploadFile
cookies.get/set/clear

Tools.System
sleep, getSetting
installApp, startApp
shell, terminal
intent

Tools.UI
getPageInfo, tap
clickElement, setText
swipe, pressKey
runSubAgent

Tools.Memory
query, getByTitle
create, update
delete, link
```

**JavaScript API 设计：**

`JsTools.kt` 文件生成包装原生工具调用的 JavaScript 代码：

**示例：带选项的文件读取**

JavaScript API 支持简单调用和基于选项对象的调用模式：

```
// Simple form
await Tools.Files.read("/sdcard/test.txt");
 
// Options form with intent for image recognition
await Tools.Files.read({
    path: "/sdcard/photo.jpg",
    environment: "android",
    intent: "What objects are in this image?",
    direct_image: false
});
```

这对应于原生的 `read_file_full` 工具，参数从选项对象映射而来。

**TypeScript 定义：**

系统提供完整的 TypeScript 定义，以确保包开发中的类型安全：

---

## AI 集成

### 系统提示词生成

`SystemPromptConfig` 动态生成工具描述并将其注入到 AI 的系统提示词中：

```
replace
AVAILABLE_TOOLS_SECTION

replace
ACTIVE_PACKAGES_SECTION

replace
WEB_WORKSPACE_GUIDELINES_SECTION

SystemPromptConfig
getSystemPrompt()

SYSTEM_PROMPT_TEMPLATE
with placeholders

SystemToolPrompts
generateToolsPromptEn/Cn()

PackageManager
getImportedPackages()

WorkspaceUtils
getWorkspacePath()

Complete System Prompt
```

**工具使用指南注入：**

**条件工具包含：**

系统支持三种模式：

1. **完整工具模式** (`enableTools=true`)：所有原生 + 包工具
2. **仅记忆模式** (`enableTools=false, enableMemoryQuery=true`)：仅记忆操作
3. **无工具模式** (`enableTools=false, enableMemoryQuery=false`)：纯对话

**工具调用 API 模式：**

对于支持原生工具调用 API 的提供商(OpenAI、Claude)，系统可以使用结构化工具定义而非 XML 解析：

在此模式下，工具描述通过 API 的 `tools` 字段发送，而非嵌入提示词中。

---

## 权限系统

工具执行由权限层级管理，根据授予的 Android 权限控制访问。

### 权限级别

```
grant Accessibility

grant Shizuku

grant Root

STANDARD
Basic file access
Network operations

ACCESSIBILITY
+ UI control
+ Screen reading

DEBUGGER
+ Shizuku shell
+ System apps

ROOT
+ Root shell
+ All system access
```

**工具权限分配：**

工具根据其功能被分配到不同的权限级别。例如：
工具权限级别原因`read_file`STANDARD使用 Java File API`click_element`ACCESSIBILITY需要无障碍服务`execute_shell`DEBUGGER需要 Shizuku/Shell(大多数 UI 工具)ACCESSIBILITY屏幕读取 + 输入注入
**危险检查机制：**

工具可以在权限级别之外实现动态危险检查：

此示例展示了 `click_element` 通过检查资源 ID 或类名中的关键词（如"send"、"pay"、"delete"）来执行基于内容的危险检测。

---

## 通过 MCP 包扩展

系统支持可以注册自定义工具的 JavaScript/TypeScript 插件。完整文档请参阅 [MCP 插件系统](/AAswordman/Operit/5.6-javascript-tools-bridge)。

**包工具注册：**

MCP 包在其元数据中定义工具，并使用 JavaScript Tools API 实现它们：

包系统提供：

- 通过 JSON 元数据注册工具
- 在隔离的 JavaScript 上下文中执行
- 通过 `Tools.*` API 访问原生功能
- 通过 `getEnv()` 支持环境变量
- 通过 `complete()` 回调支持 async/await

---

## 总结

工具系统提供了一个全面的、权限控制的能力框架，包括：

- **40+ 原生工具**，涵盖文件操作、系统控制、网络和 UI 自动化
- **结构化结果类型**，实现 AI 与工具之间的丰富数据交换
- **JavaScript 桥接**，允许 MCP 包扩展功能
- **多环境支持**，适用于 Android 和 Linux 文件系统操作
- **权限感知执行**，具有四级访问控制
- **AI 集成**，通过动态系统提示词生成

有关特定工具类别的实现细节，请参阅子页面：[工具架构](/AAswordman/Operit/5.1-tool-architecture)、[文件系统工具](/AAswordman/Operit/5.2-file-system-tools)、[系统工具](/AAswordman/Operit/5.3-network-tools)、[网络工具](/AAswordman/Operit/5.4-system-tools)、[JavaScript 工具桥接](/AAswordman/Operit/5.5-terminal-and-shell-tools)、[MCP 插件系统](/AAswordman/Operit/5.6-javascript-tools-bridge) 和 [工具权限](/AAswordman/Operit/5.7-package-system)。
