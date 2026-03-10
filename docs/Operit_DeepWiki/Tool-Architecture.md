# 工具架构

本文档说明了 Operit 工具系统的架构,包括核心组件(`AIToolHandler`、`ToolRegistration`)、数据结构(`AITool`、`ToolResult`、`ToolResultData`)以及执行流程。该工具系统提供了 40 多个按类别组织的内置功能,并通过 JavaScript 和 MCP 插件支持扩展性。

有关特定工具类别和实现的信息，请参阅 [文件系统工具](/AAswordman/Operit/5.2-file-system-tools)、[网络工具](/AAswordman/Operit/5.3-network-tools)、[系统工具](/AAswordman/Operit/5.4-system-tools)、[终端和 Shell 工具](/AAswordman/Operit/5.5-terminal-and-shell-tools)。有关 JavaScript 扩展性，请参阅 [JavaScript 工具桥接](/AAswordman/Operit/5.6-javascript-tools-bridge)。有关工具包和 MCP 插件，请参阅 [包系统](/AAswordman/Operit/5.7-package-system) 和 [MCP 插件系统](/AAswordman/Operit/5.8-mcp-plugin-system)。有关权限管理，请参阅 [工具权限](/AAswordman/Operit/5.9-tool-permissions)。

---

## 核心组件

### AIToolHandler

`AIToolHandler` 是负责管理工具注册、执行和权限检查的中央执行引擎。它维护所有可用工具的注册表并协调它们的执行。

**主要职责：**

- 通过 `registerTool()` 进行工具注册
- 通过 `executeTool()` 进行工具执行
- 权限检查和用户批准协调
- 包管理器集成
- 结果编组

该处理器使用 Android `Context` 初始化，并与 `ToolPermissionSystem` 集成以实现用户批准流程。

---

### ToolRegistration

所有内置工具都在位于 `ToolRegistration.kt` 的集中函数 `registerAllTools()` 中注册。该文件包含按类别组织的 40 多个工具注册。

**注册模式：**

每个工具使用以下模式注册：

```
handler.registerTool(
    name = "tool_name",
    dangerCheck = { tool -> /* returns Boolean or null */ },
    descriptionGenerator = { tool -> /* returns String */ },
    executor = { tool -> /* returns ToolResult */ }
)
```

**参数：**

- `name`：工具的唯一标识符
- `dangerCheck`：可选的 lambda，返回 `true`(危险)、`false`(安全)或 `null`(使用默认权限系统)
- `descriptionGenerator`：从工具参数生成人类可读描述的 lambda
- `executor`：执行工具并返回 `ToolResult` 的挂起 lambda

**注册示例：**

```
handler.registerTool(
    name = "calculate",
    descriptionGenerator = { tool ->
        val expression = tool.parameters.find { it.name == "expression" }?.value ?: ""
        s(R.string.toolreg_calculate_desc, expression)
    },
    executor = { tool ->
        val expression = tool.parameters.find { it.name == "expression" }?.value ?: ""
        val result = ToolGetter.getCalculator().evalExpression(expression)
        ToolResult(
            toolName = tool.name,
            success = true,
            result = StringResultData("Calculation result: $result")
        )
    }
)
```

---

## 工具数据结构

### AITool

```
contains

AITool

+String name

+List<ToolParameter> parameters

ToolParameter

+String name

+String value
```

**图示：AITool 结构**

`AITool` 表示来自 AI 的工具调用请求。它包含：

- `name`：工具标识符(例如 `"list_files"`、`"calculate"`)
- `parameters`：包含名称-值对的 `ToolParameter` 对象列表

---

### ToolParameter

一个简单的数据类，表示单个参数：
字段类型描述`name``String`参数名称（例如 `"path"`、`"expression"`）`value``String`参数值（字符串形式）

---

## 工具结果系统

### ToolResult

`ToolResult` 数据类封装了工具执行的结果：
字段类型描述`toolName``String`已执行工具的名称`success``Boolean`执行是否成功`result``ToolResultData`结构化结果数据`error``String?`失败时的错误消息

---

### ToolResultData 层次结构

```
«abstract»

ToolResultData

+toString() : String

+toJson() : String

StringResultData

+String value

FileContentData

+String path

+String content

+Long size

+String env

DirectoryListingData

+String path

+List<FileEntry> entries

+String env

HttpResponseData

+String url

+Int statusCode

+String statusMessage

+Map<String,String> headers

+String content

UIPageResultData

+String packageName

+String activityName

+SimplifiedUINode uiElements

TerminalCommandResultData

+String command

+String output

+Int exitCode

+String sessionId

+Boolean timedOut
```

**图示：ToolResultData 类型层次结构**

`ToolResultData` 是一个密封类，拥有 30 多个针对不同工具结果类型的专用实现。所有子类都必须实现 `toString()` 以提供人类可读的输出。

**常见结果类型：**
类型用途关键字段`StringResultData`简单文本结果`value``FileContentData`文件读取操作`path`、`content`、`size`、`env``DirectoryListingData`目录列表`path`、`entries`、`env``HttpResponseData`HTTP 响应`url`、`statusCode`、`headers`、`content``UIPageResultData`UI 信息`packageName`、`activityName`、`uiElements``TerminalCommandResultData`终端执行`command`、`output`、`exitCode`、`sessionId``FileOperationData`文件操作`operation`、`path`、`successful`、`details`、`env`
**环境感知结果：**

许多结果类型包含 `env` 字段(默认为 `"android"`)以指示执行环境：

- `"android"` - Android 文件系统 / 应用环境
- 自定义环境名称(例如 `"ubuntu"`、`"termux"`)用于 Linux/SSH 环境

---

## 工具注册和执行流程

```
ToolResult
Tool Executor
ToolPermissionSystem
AIToolHandler
AI Service
ToolResult
Tool Executor
ToolPermissionSystem
AIToolHandler
AI Service
alt
[Tool not found]
alt
[User denied]
alt
[Dangerous operation]
executeTool(AITool)
Lookup registered tool
ToolResult(success=false, error)
Generate description
Check danger level
Request user approval
Denied
ToolResult(success=false, error)
Execute tool
Process parameters
Perform operation
Create ToolResult
Return result
ToolResult(success, data)
```

**图示：工具执行流程**

---

### 工具注册流程

工具在应用初始化期间通过 `registerAllTools()` 函数进行注册：

```
Application Start

AIToolHandler Initialization

registerAllTools(handler, context)

Register File Tools

Register Network Tools

Register System Tools

Register UI Tools

Register Terminal Tools

Register Memory Tools

Register Workflow Tools

Register Chat Tools

Tool Registry Complete
```

**图示：工具注册流程**

**已注册的工具类别：**

1. **内部工具**(不在提示词中暴露)：

- `execute_shell` - Shell 命令执行
- `close_all_virtual_displays` - 虚拟显示管理
- 终端会话工具(`create_terminal_session`、`execute_in_terminal_session` 等)
- Web 会话工具(`start_web`、`stop_web`、`web_navigate` 等)

2. **记忆工具**：

- `query_memory`、`get_memory_by_title`
- `create_memory`、`update_memory`、`delete_memory`
- `link_memories`、`query_memory_links`、`update_memory_link`、`delete_memory_link`
- `update_user_preferences`

3. **系统工具**：

- `use_package`、`package_proxy`
- `calculate`
- `visit_web`
- `sleep`
- `execute_intent`、`send_broadcast`
- `device_info`
- `trigger_tasker_event`

4. **工作流工具**：

- `get_all_workflows`、`create_workflow`、`get_workflow`
- `update_workflow`、`patch_workflow`、`delete_workflow`
- `trigger_workflow`

5. **聊天管理工具**：

- `start_chat_service`、`stop_chat_service`
- `create_new_chat`、`list_chats`、`switch_chat`、`delete_chat`
- `find_chat`、`agent_status`
- `send_message_to_ai`、`get_chat_messages`
- `list_character_cards`

---

### 危险检查机制

工具可以通过 `dangerCheck` 参数指定危险级别：

**危险检查选项：**
返回值行为`true`始终危险，需要用户批准`false`始终安全，无需批准`null`基于工具名称和参数使用默认权限系统
**示例：**

```
// Always dangerous - shell commands
handler.registerTool(
    name = "execute_shell",
    dangerCheck = { true },  // Always requires approval
    // ...
)
 
// Never dangerous - information query
handler.registerTool(
    name = "get_all_workflows",
    dangerCheck = { false },  // No approval needed
    // ...
)
 
// Context-dependent - memory operations
handler.registerTool(
    name = "query_memory",
    dangerCheck = null,  // Use default system
    // ...
)
```

---

### 描述生成

每个工具提供一个 `descriptionGenerator` lambda，根据传入的实际参数创建人类可读的描述：

**模式：**

```
descriptionGenerator = { tool ->
    val param1 = tool.parameters.find { it.name == "param1" }?.value ?: ""
    val param2 = tool.parameters.find { it.name == "param2" }?.value

    when {
        !param2.isNullOrBlank() -> "Action with $param1 and $param2"
        else -> "Action with $param1"
    }
}
```

**示例：**

```
handler.registerTool(
    name = "execute_in_terminal_session",
    descriptionGenerator = { tool ->
        val command = tool.parameters.find { it.name == "command" }?.value ?: ""
        val sessionId = tool.parameters.find { it.name == "session_id" }?.value
        s(R.string.toolreg_execute_in_terminal_session_desc, sessionId ?: "", command)
    },
    // ...
)
```

该描述在权限请求期间和执行日志中显示给用户。

---

## 工具模式系统

```
AI Provider Integration

Schema Definition

SystemToolPromptCategory

ToolPrompt

ToolParameterSchema

OpenAI Function Format

Anthropic Tools Format

Google Functions Format
```

**图示：工具模式架构**

工具模式在 `SystemToolPromptsInternal.kt` 中定义，作为 Operit 与 AI 提供商之间的接口契约。每个工具包含：

**ToolPrompt 结构：**
字段类型描述`name``String`工具标识符`description``String`面向 AI 的自然语言描述`parametersStructured``List<ToolParameterSchema>`参数定义
**ToolParameterSchema 结构：**
字段类型描述`name``String`参数名称`type``String`类型：`"string"`, `"integer"`, `"boolean"`, `"number"``description``String`参数用途`required``Boolean`参数是否必需`default``String?`省略时的默认值
**模式示例：**

```
ToolPrompt(
    name = "web_click",
    description = "Click an element by snapshot ref.",
    parametersStructured = listOf(
        ToolParameterSchema(
            name = "session_id",
            type = "string",
            description = "optional, web session id",
            required = false
        ),
        ToolParameterSchema(
            name = "ref",
            type = "string",
            description = "required, exact target element ref from web_snapshot output",
            required = true
        ),
        ToolParameterSchema(
            name = "button",
            type = "string",
            description = "optional, left/right/middle",
            required = false,
            default = "left"
        )
    )
)
```

---

## 工具分类概览

Operit 提供 40+ 个内置工具，按以下类别组织：
类别工具数量示例详情**文件系统**15+`list_files`、`read_file`、`write_file`、`grep_code`[文件系统工具](/AAswordman/Operit/5.2-file-system-tools)**网络**12+`http_request`、`visit_web`、`start_web`、`web_click`[网络工具](/AAswordman/Operit/5.3-network-tools)**系统**10+`execute_intent`、`device_info`、`install_app`、`toast`[系统工具](/AAswordman/Operit/5.4-system-tools)**终端**6`create_terminal_session`、`execute_in_terminal_session`[终端工具](/AAswordman/Operit/5.5-terminal-and-shell-tools)**UI 自动化**8+`get_page_info`、`tap`、`click_element`、`run_ui_subagent`[UI 自动化](/AAswordman/Operit/6-ui-automation)**记忆**10+`query_memory`、`create_memory`、`link_memories`记忆系统**工作流**7`create_workflow`、`trigger_workflow`、`get_workflow`工作流系统**聊天**10+`create_new_chat`、`switch_chat`、`send_message_to_ai`聊天管理**计算**1`calculate`数学表达式求值**FFmpeg**3`ffmpeg_execute`、`ffmpeg_convert`媒体处理

---

## JavaScript 桥接集成

```
Native Layer

Bridge Layer

JavaScript Context

JavaScript Tool Code

Tools.* API

V8 Engine

JsToolManager

Polyfill Injection

AIToolHandler

Tool Executors
```

**图示：JavaScript 桥接架构**

JavaScript 桥接允许工具包通过 polyfill 的 `Tools` API 调用原生工具。该桥接在 `JsTools.kt` 中定义，提供按命名空间组织的工具访问。

**API 命名空间：**
命名空间用途示例方法`Tools.Files`文件操作`list()`, `read()`, `write()`, `find()``Tools.Net`网络操作`httpGet()`, `httpPost()`, `visit()`, `startWeb()``Tools.System`系统操作`sleep()`, `toast()`, `intent()`, `shell()``Tools.UI`UI 自动化`tap()`, `setText()`, `clickElement()``Tools.Memory`内存操作`query()`, `create()`, `update()`, `link()``Tools.Workflow`工作流操作`create()`, `trigger()`, `getAll()``Tools.FFmpeg`媒体处理`execute()`, `convert()`, `info()`
**JavaScript 工具调用示例：**

```
// In a tool package
const files = Tools.Files.list("/sdcard/Download");
const content = Tools.Files.read("/sdcard/test.txt");
const result = Tools.calc("2 + 2 * 3");
```

polyfill 将这些调用转换为 `toolCall("list_files", {...})`，从而调用原生的 `AIToolHandler`。

---

## 辅助工具

### UI 工具可见性管理

一个辅助函数封装了 UI 工具执行时的浮动窗口可见性控制：

```
suspend fun executeUiToolWithVisibility(
    tool: AITool,
    showStatusIndicator: Boolean = true,
    delayMs: Long = 50,
    action: suspend (AITool) -> ToolResult
): ToolResult
```

此函数：

1. 隐藏浮动聊天窗口
2. 可选地显示状态指示器
3. 执行 UI 工具
4. 恢复浮动窗口可见性

**用法：**

```
executor = { tool ->
    executeUiToolWithVisibility(tool) { t ->
        // Execute UI operation
        performTap(x, y)
    }
}
```

---

### 环境格式化

辅助函数格式化环境信息以用于面向用户的消息：

```
fun formatEnvInfo(environment: String?): String {
    return if (!environment.isNullOrBlank() && environment != "android") {
        s(R.string.toolreg_env_info, environment)
    } else {
        ""
    }
}
```

这确保跨环境操作能够清楚地指示正在操作的环境。

---

## TypeScript 类型定义

为了工具包开发，在 `examples/types/` 中提供了完整的 TypeScript 定义：

**关键类型文件：**
文件用途`results.d.ts`所有 30+ 种结果类型的结果数据类型定义`tool-types.d.ts`将工具名称映射到其结果类型`core.d.ts`基础 `toolCall()` 函数签名
**使用示例：**

```
import { DirectoryListingData, FileContentData } from './results';
import { ToolResultMap } from './tool-types';
 
// Type-safe tool calls
const listing: DirectoryListingData =
    toolCall("list_files", { path: "/sdcard" }).data;
 
const content: FileContentData =
    toolCall("read_file", { path: "/sdcard/test.txt" }).data;
```

---

## 总结

Operit 工具架构提供：

1. **集中注册**：所有工具通过 `ToolRegistration.kt` 中的 `registerAllTools()` 注册
2. **灵活执行**：`AIToolHandler` 协调执行并进行权限检查
3. **结构化结果**：30+ 种专用 `ToolResultData` 类型，带有 `toString()` 以提高可读性
4. **安全控制**：三级危险检查(`true`、`false`、`null`)
5. **跨环境**：环境感知工具支持 Android 和 Linux 上下文
6. **JavaScript 桥接**：基于 V8 的桥接允许工具包调用原生工具
7. **类型安全**：为工具包开发提供 TypeScript 定义

该系统在功能强大(40+ 种能力)、安全(权限控制)和可扩展性(JavaScript/MCP 插件)之间取得平衡。
