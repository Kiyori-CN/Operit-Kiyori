# 架构概览

## 目的和范围

本文档提供了 Operit 架构的高层概述,描述了主要子系统的组织结构及其交互方式。它涵盖了三层架构(UI、服务、数据)、委托模式实现以及整个代码库中使用的核心架构模式。

有关特定子系统的详细信息:

- AI 服务集成和提供者:参见 [Enhanced AI Service](/AAswordman/Operit/2.1-enhanced-ai-service) 和 [AI Service Providers](/AAswordman/Operit/2.2-ai-service-providers)
- 工具系统实现:参见 [Tool Architecture](/AAswordman/Operit/5.1-tool-architecture)
- 聊天系统组件:参见 [Chat UI Architecture](/AAswordman/Operit/3.1-chat-ui-architecture)
- 数据持久化策略:参见 [Database Architecture](/AAswordman/Operit/8.1-database-architecture)

---

## 三层架构

Operit 遵循三层架构,将表示层、业务逻辑和数据管理之间的关注点分离。

### 高层系统组织

```
Tool Ecosystem

Data Management Layer

Core Services Layer

User Interface Layer

MainActivity

AIChatScreen

FloatingChatService
(Foreground Service)

Settings Screens

ToolboxScreen

ChatViewModel

ChatServiceCore

EnhancedAIService

AIToolHandler

MultiServiceManager

AppDatabase
(Room)

ChatHistoryManager

ApiPreferences
(DataStore)

ModelConfigManager

PackageManager

ToolRegistration

StandardFileSystemTools

Terminal

PhoneAgent

JsToolManager
```

---

## 用户界面层

UI 层使用 Jetpack Compose 构建，遵循 MVVM 模式。它由屏幕、组件和导航逻辑组成。

### 核心 UI 组件

组件用途关键文件`MainActivity`应用程序入口点，导航宿主MainActivity.kt`OperitApp`根可组合项，抽屉导航，布局选择`AIChatScreen`主要聊天界面`ChatScreenContent`消息列表和交互区域`FloatingChatService`悬浮聊天窗口服务FloatingChatService.kt`SettingsScreen`配置管理界面`ToolboxScreen`工具和实用程序访问

### 屏幕导航系统

```
OperitApp

OperitRouter

Screen
(sealed class)

NavController

Screen.AIChat

Screen.Settings

Screen.Packages

Screen.Toolbox

Screen.Terminal
```

导航系统使用密封类 `Screen` 定义所有可用屏幕及其父级关系和关联的 `NavItem` 用于抽屉高亮显示。

---

## 核心服务层

服务层实现业务逻辑并协调 UI 层与数据层之间的交互。它使用委托模式来分离关注点。

### 聊天服务架构

```
Core Services

Service Delegates

ChatViewModel

MessageCoordinationDelegate

MessageProcessingDelegate

ChatHistoryDelegate

ApiConfigDelegate

AttachmentDelegate

TokenStatisticsDelegate

UiStateDelegate

ChatServiceCore

EnhancedAIService

ChatHistoryManager
```

### 委托模式实现

`ChatViewModel` 使用七个专门的委托来管理聊天功能的不同方面：
委托职责关键方法`MessageCoordinationDelegate`协调消息流，处理摘要`sendMessage()`, `triggerSummarization()``MessageProcessingDelegate`处理流式响应，管理工具调用`processStreamingResponse()`, `handleToolCall()``ChatHistoryDelegate`管理聊天持久化和检索`loadChat()`, `saveCurrentChat()`, `addMessageToChat()``ApiConfigDelegate`管理 API 配置和 AI 服务初始化`updateApiKey()`, `saveApiSettings()``AttachmentDelegate`处理文件附件和上下文注入`addAttachment()`, `removeAttachment()``TokenStatisticsDelegate`跟踪令牌使用量和成本`updateCumulativeStatistics()``UiStateDelegate`管理 UI 相关状态(错误、提示)`showErrorMessage()`, `showToast()`

### EnhancedAIService 架构

`EnhancedAIService` 提供了一个统一的接口来访问多个 AI 提供商，并管理对话上下文、工具执行和文件绑定。

```
AI Providers

Service Components

EnhancedAIService

MultiServiceManager

ConversationService

FileBindingService

ToolExecutionManager

AIServiceFactory

OpenAIService

ClaudeService

GeminiService

MNNService/LlamaService
```

主要特性：

- **功能特定服务**：不同的 AI 模型可用于不同的功能(CHAT、SUMMARY、TRANSLATION、UI_CONTROLLER 等)，通过 `MultiServiceManager` 实现
- **对话管理**：`ConversationService` 处理历史记录准备、上下文附加和偏好设置注入
- **文件绑定**：`FileBindingService` 使用基于 diff 的补丁处理代码编辑
- **工具执行**：`ToolExecutionManager` 编排工具调用并管理执行流程

---

## 数据管理层

数据层采用混合方法，结合 Room 数据库用于结构化数据、DataStore 用于偏好设置以及基于文件的存储用于复杂对象。

### 数据持久化策略

```
Repository Layer

File-Based Storage

DataStore Preferences

Room Database

AppDatabase

ChatDao

MessageDao

ChatEntity

MessageEntity

ApiPreferences

UserPreferencesManager

ModelConfigManager

FunctionalConfigManager

Character Cards
(JSON)

Tool Packages
(.toolpkg)

Memory Vault

ChatHistoryManager

CharacterCardManager

PackageManager
```

### 数据存储概览

存储类型用途关键类数据格式Room聊天消息、元数据`AppDatabase`、`ChatDao`、`MessageDao`SQLite 表DataStore用户偏好设置、API 设置、模型配置`ApiPreferences`、`UserPreferencesManager`Proto/Preferences文件角色卡片、工具包、记忆`CharacterCardManager`、`PackageManager`JSON、ZIP

### 响应式数据流

所有数据源都暴露 `StateFlow` 流以实现响应式 UI 更新：

```
// From ChatHistoryManager
val chatHistory: StateFlow<List<ChatMessage>>
val chatHistories: StateFlow<List<ChatHistory>>
Â 
// From ApiPreferences
val apiKey: Flow<String>
val modelName: Flow<String>
Â 
// From ModelConfigManager
val modelConfig: StateFlow<ModelConfigData?>
```

---

## 工具生态系统

工具系统提供 40 多种功能，按类别组织，支持渐进式权限级别和 JavaScript 扩展性。

### 工具系统架构

```
Extensibility

Tool Categories

Tool Registration

ToolRegistration
(40+ built-in tools)

AIToolHandler
(singleton)

ToolPermissionSystem

StandardFileSystemTools
DebuggerFileSystemTools
LinuxFileSystemTools

StandardUITools
PhoneAgent

Terminal
TerminalManager

AndroidShellExecutor
IntentTools

MemoryManager

HttpTools

PackageManager

JsToolManager

V8 JavaScript Engine

MCPRepository
```

### 渐进式权限模型

工具支持四个权限级别，具有逐步增强的功能：
级别通道功能示例工具标准Android API基本文件操作、意图`list_files`、`read_file`、`execute_intent`无障碍AccessibilityServiceUI 树访问、元素交互`get_ui_tree`、`click_element`调试器ADB/Shizuku Shell 命令、系统文件访问`execute_shell`、`write_system_file`RootRoot shell完整系统访问`root_execute`
权限系统使用 `ToolPermissionSystem` 在执行危险操作前请求用户批准。

### 工具注册与执行流程

```
Tool Implementation
ToolPermissionSystem
AIToolHandler
EnhancedAIService
Tool Implementation
ToolPermissionSystem
AIToolHandler
EnhancedAIService
alt
[Permission Granted]
[Permission Denied]
executeTool(AITool)
checkPermission(toolName)
Allowed
execute(parameters)
ToolResult
ToolResult
RequestApproval
awaitUserApproval()
Approved/Denied
```

---

## 配置与系统提示词

系统使用动态配置管理来控制 AI 行为和工具可用性。

### 配置层级

```
Runtime Layer

Prompt Generation Layer

User Settings Layer

ApiPreferences
(API keys, endpoints)

ModelConfigManager
(model parameters)

FunctionalConfigManager
(functionâ†’model mapping)

SystemPromptConfig

FunctionalPrompts

SystemToolPrompts

EnhancedAIService

ConversationService
```

### 系统提示词组成

系统提示词由 `SystemPromptConfig.getSystemPrompt()` 根据以下内容动态生成：

1. **功能类型**：针对 CHAT、SUMMARY、TRANSLATION、UI_CONTROLLER 使用不同的提示词
2. **工具可用性**：仅在提示词中包含已启用的工具
3. **激活的包**：已激活的工具包会将其工具添加到提示词中
4. **用户偏好**：自定义设置，如思考模式、内存查询等
5. **工作区上下文**：当前工作区路径和环境

```
// Key configuration parameters
val enableTools: Boolean
val enableMemoryQuery: Boolean
val enableThinkingMode: Boolean
val toolVisibility: Map<String, Boolean>
val workspacePath: String?
```

---

## 包和扩展性系统

包系统允许用户通过基于 JavaScript 的工具包和 MCP 插件扩展 Operit 的能力。

### 包架构

```
Execution Runtime

Package Management

Package Sources

Built-in Packages
(assets/)

User Packages
(.toolpkg files)

MCP Plugins
(servers)

PackageManager
(singleton)

PackageLoader

SubpackageManager

V8 JavaScript Engine

JsToolManager

PackageToolExecutor

MCPStarter
```

### 包类型

类型格式执行方式使用场景Legacy PackageJS/HJSON 文件V8 引擎简单的 JavaScript 工具ToolPkg Container带清单的 ZIPV8 引擎复杂的多工具包Subpackages条件激活V8 引擎功能门控工具MCP Plugin服务器进程IPC/Stdio外部工具服务器

### 工具包结构

一个 `.toolpkg` 文件是一个包含以下内容的 ZIP 归档：

- `manifest.json`：包元数据和工具定义
- `index.js`：主要工具实现
- `resources/`：额外资源
- `subpackages/`：可选的条件工具

`PackageManager` 在启动时加载包，并提供 `use_package` 工具用于运行时激活。

---

## 横切模式

整个代码库中一致使用了几种架构模式。

### 关键模式

模式用途实现**委托模式**在 ViewModel 和 Service 中分离关注点`ChatViewModel` 使用 7 个委托**仓储模式**抽象数据访问`ChatHistoryManager`、`ModelConfigManager`**单例模式**管理共享资源`AIToolHandler`、`PackageManager`、`EnhancedAIService`**状态流模式**响应式 UI 更新所有数据源暴露 `StateFlow`**策略模式**运行时算法选择`AIServiceFactory`、权限通道

### 依赖注入

应用程序通过构造函数参数和延迟初始化使用手动依赖注入：

```
// Lazy singleton initialization
private val toolHandler = AIToolHandler.getInstance(context)
private val apiPreferences by lazy { ApiPreferences.getInstance(context) }
Â 
// Constructor injection in delegates
MessageProcessingDelegate(
    context = context,
    coroutineScope = viewModelScope,
    getEnhancedAiService = { enhancedAiService },
    getChatHistory = { chatId -> chatHistoryDelegate.getChatHistory(chatId) }
)
```

### 协程使用

异步操作使用 Kotlin 协程配合适当的调度器：

- `Dispatchers.Main`：UI 更新
- `Dispatchers.IO`：文件/网络操作
- `Dispatchers.Default`：CPU 密集型工作

后台服务使用 `SupervisorJob()` 以确保子任务失败不会取消整个作用域。
