# 核心 AI 服务

## 目的与范围

核心 AI 服务层为 Operit 中的所有 AI 交互提供基础。该层处理与各种 AI 提供商(OpenAI、Claude、Gemini、本地模型等)的通信，管理对话上下文，生成动态系统提示，并协调工具执行。它充当用户界面功能与底层 AI API 之间的抽象层。

有关使用这些服务的聊天系统的信息，请参阅 [Chat System](/AAswordman/Operit/3-chat-system)。有关工具执行和注册的详细信息，请参阅 [Tool System](/AAswordman/Operit/5-tool-system)。有关 UI 特定组件，请参阅 [User Interface](/AAswordman/Operit/4-user-interface)。

---

## 架构概览

核心 AI 服务层遵循模块化架构，具有清晰的关注点分离：

**组件架构**

```
Data Models

Configuration & State

Provider Abstraction

Service Layer

Core Orchestration

uses

configured by

manages

uses

EnhancedAIService
(Singleton)

MultiServiceManager
(Function-based routing)

ConversationService
(History & Summary)

FileBindingService
(Code Patching)

SystemPromptConfig
(Prompt Generation)

AIServiceFactory
(Provider Creation)

AIService Interface

OpenAIProvider

ClaudeProvider

GeminiProvider

MNNProvider

LlamaProvider

ModelConfigManager
(Config Persistence)

ModelConfigData
(Config Schema)

FunctionalConfigManager
(Function→Config Mapping)

ApiPreferences
(User Settings)

FunctionType
(CHAT, SUMMARY, etc.)

ModelParameter
(Typed Parameters)

AITool
(Tool Invocation)
```

---

## EnhancedAIService：中央协调器

`EnhancedAIService` 是 Operit 中所有 AI 操作的主要入口点。它协调多个组件，提供具有自动摘要、工具执行和对话管理等高级功能的统一 AI 体验。

### 单例和每个聊天的实例

该服务支持两种实例化模式：
方法用途生命周期`getInstance(context)`全局操作(摘要、翻译)应用程序生命周期`getChatInstance(context, chatId)`特定聊天操作聊天会话生命周期
**关键实现细节：**

```
Per-Instance Components

Instance Management

INSTANCE
(Volatile Singleton)

CHAT_INSTANCES
(ConcurrentHashMap)

multiServiceManager
(AI Services)

conversationService
(History Management)

fileBindingService
(File Patching)

toolHandler
(Tool Execution)

packageManager
(Tool Packages)
```

### 核心消息处理流程

`sendMessage` 方法是 AI 交互的主要接口：

**消息流程图**

```
Stream<String>
AIService
MultiServiceManager
ConversationService
InputProcessor
EnhancedAIService
Client
Stream<String>
AIService
MultiServiceManager
ConversationService
InputProcessor
EnhancedAIService
Client
loop
[For each chunk]
Tool detection & execution
Summarization checks
sendMessage(message, params)
processUserInput(message)
processedInput
prepareConversationHistory()
preparedHistory (with system prompt)
getServiceForFunction(functionType)
aiService
getModelParametersForFunction()
modelParameters
sendMessage(context, preparedHistory, params)
responseStream
content chunk
emit(chunk)
processStreamCompletion()
```

### 自动摘要

EnhancedAIService 实现了智能对话摘要以管理 token 限制：
触发条件配置默认值Token 阈值`summaryTokenThreshold`最大值的 70%消息数量`summaryMessageCountThreshold`16 条消息最大上下文模式`enableMaxContextMode`false
触发时，服务将：

1. 通过 `ConversationService.generateSummary()` 生成综合摘要
2. 用摘要替换旧消息
3. 保留最近的消息以保持上下文连续性
4. 更新 token 计数并持久化统计信息

### 状态管理

EnhancedAIService 暴露响应式状态流以进行 UI 更新：

```
// Input processing state
val inputProcessingState: StateFlow<InputProcessingState>
// States: Idle, Processing, Connecting, Receiving, Error
 
// Per-request token counts
val perRequestTokenCounts: StateFlow<Pair<Int, Int>?>
// (inputTokens, outputTokens)
```

---

## MultiServiceManager：基于功能的服务路由

`MultiServiceManager` 允许为不同的功能目的使用不同的 AI 模型。例如，你可以使用 GPT-4 进行聊天，但使用 Claude 进行摘要。

### 功能类型映射

**FunctionType 到服务的映射**

```
AI Services

Service Layer

Configuration Layer

Function Types

FunctionType.CHAT

FunctionType.SUMMARY

FunctionType.TRANSLATION

FunctionType.UI_CONTROLLER

FunctionType.GREP

FunctionType.IMAGE_RECOGNITION

FunctionType.AUDIO_RECOGNITION

FunctionType.VIDEO_RECOGNITION

FunctionalConfigManager
(Function→ConfigId mapping)

ModelConfigManager
(ConfigId→ModelConfig)

MultiServiceManager

AIServiceFactory

AIService (Chat Model)

AIService (Summary Model)

AIService (Vision Model)
```

### 服务生命周期

MultiServiceManager 为每个功能类型缓存服务实例并处理：

- 首次使用时的延迟初始化
- 配置更改时的服务刷新
- 每个服务的令牌计数器管理
- 模型参数解析

**关键方法：**
方法用途`getServiceForFunction(FunctionType)`返回缓存的或创建新的 AIService`refreshServiceForFunction(FunctionType)`配置更改后重新创建服务`refreshAllServices()`重新创建所有缓存的服务`getModelParametersForFunction()`解析已启用的模型参数`resetTokenCountersForFunction()`重置使用统计

---

## AI 提供商抽象层

提供商抽象允许 Operit 通过统一接口支持多个 AI API。

### AIServiceFactory

`AIServiceFactory` 根据 `ModelConfigData` 创建特定提供商的实现：

**提供商创建流程**

```
Provider Implementations

Configuration Processing

ModelConfigData
(apiProviderType, endpoint, model, etc.)

AIServiceFactory.createService()

API Key Provider
(Single or Multi-key)

Custom Headers
(JSON parsing)

Feature Flags
(vision, audio, video, toolCall)

OpenAIProvider

OpenAIResponsesProvider

ClaudeProvider

GeminiProvider

MNNProvider

LlamaProvider

Other Providers
(15+ types)
```

### 支持的提供商

提供商类型实现关键特性`OPENAI``OpenAIProvider`GPT 模型、视觉、音频、函数调用`OPENAI_RESPONSES``OpenAIResponsesProvider`结构化输出 API`ANTHROPIC``ClaudeProvider`Claude 模型、原生工具使用`GOOGLE` / `GEMINI_GENERIC``GeminiProvider`Gemini 模型、搜索基础`MNN``MNNProvider`本地推理、MNN 框架`LLAMA_CPP``LlamaProvider`本地推理、llama.cpp`DEEPSEEK``OpenAIProvider`DeepSeek 模型(OpenAI 兼容)`OPENROUTER``OpenAIProvider`多模型网关

### 多 API 密钥支持

工厂支持在多个 API 密钥之间轮换：

```
Rotation Strategies

API Key Providers

false

true

SingleApiKeyProvider
(Fixed key)

MultiApiKeyProvider
(Key rotation)

ROUND_ROBIN
(Sequential)

RANDOM
(Random selection)

useMultipleApiKeys
= true/false
```

### 共享 HTTP 客户端

所有提供者共享一个经过优化的 `OkHttpClient`：
配置值用途连接池10 个连接，5 分钟保活复用连接连接超时60 秒处理慢速网络读写超时1000 秒支持长时间运行的流协议HTTP/2、HTTP/1.1自动协议协商

---

## 系统提示词生成

`SystemPromptConfig` 根据上下文、用户偏好和启用的工具动态生成系统提示词。

### 动态提示词构建

**提示词组装流程**

```
Prompt Sections

Input Sources

PackageManager
(Available packages)

workspacePath
(Web workspace)

safBookmarkNames
(SAF bookmarks)

roleCardId
(Character persona)

User preferences
(via ApiPreferences)

BEGIN_SELF_INTRODUCTION_SECTION
(Character/AI identity)

THINKING_GUIDANCE_SECTION
(Optional thinking tags)

BEHAVIOR_GUIDELINES
(Task completion rules)

WEB_WORKSPACE_GUIDELINES
(Dynamic workspace info)

TOOL_USAGE_GUIDELINES
(Tool format instructions)

PACKAGE_SYSTEM_GUIDELINES
(Package activation)

ACTIVE_PACKAGES_SECTION
(List available packages)

AVAILABLE_TOOLS_SECTION
(Tool descriptions)

Final System Prompt
(String)
```

### 模板部分

基础系统提示词模板包含占位符部分：
章节目的替换为`BEGIN_SELF_INTRODUCTION_SECTION`AI 身份和角色自定义介绍或角色卡`THINKING_GUIDANCE_SECTION``<think>` 标签指令思考引导提示或留空`BEHAVIOR_GUIDELINES`任务完成规则静态行为指令`WEB_WORKSPACE_GUIDELINES_SECTION`工作区特定规则动态工作区信息`TOOL_USAGE_GUIDELINES_SECTION`工具调用格式XML 或 Tool Call API 格式`PACKAGE_SYSTEM_GUIDELINES_SECTION`包激活指令特定语言包指南`ACTIVE_PACKAGES_SECTION`可用包列表动态生成列表`AVAILABLE_TOOLS_SECTION`工具描述从 SystemToolPrompts 生成

### Tool Call API 与 XML 格式对比

SystemPromptConfig 根据提供商是否使用原生工具调用来调整指令：
模式工具格式包指南XML 格式`<tool name="..."><param>...</param></tool>`直接 XML 调用Tool Call API函数调用 JSON`use_package` 函数 + `package_proxy` 用于包工具严格工具调用仅限已注册工具通过 `package_proxy` 代理所有包工具

### 工作区指南

当工作区绑定时，SystemPromptConfig 会注入特定上下文的指导方针：

```
WEB WORKSPACE GUIDELINES:
- Your working directory, `/path/to/workspace` (environment=linux), is automatically
  set up as a web server root.
- Use the `apply_file` tool to create web files (HTML/CSS/JS).
- The main file must be `index.html` for user previews.
- Always use relative paths for file references.
- Best Practice: Use `grep_code` and `grep_context` before modifying files.

```

---

## 对话管理

`ConversationService` 处理对话历史准备、摘要生成和上下文管理。

### 对话历史准备

该服务为 AI 消费准备历史记录：

**历史准备流程**

```
Message Processing

System Prompt Generation

none

Raw Chat History
(List>)

Check for existing
system message

Generate System Prompt
(via SystemPromptConfig)

Apply Character Card
(if roleCardId provided)

Add User Preferences
(if enabled)

Process Tool Results
(Convert to user messages)

Replace Placeholders
({{AI_NAME}}, etc.)

Build Media Links
(via MediaLinkBuilder)

Prepared History
(Ready for AI)
```

### 工具结果处理

工具结果从 XML 转换为结构化消息：

1. **XML 解析**：使用 `splitXmlTag()` 提取 `<tool_result>` 块
2. **结果提取**：解析工具名称和内容
3. **消息构建**：创建包含工具输出的用户消息
4. **历史集成**：为多轮交互维护工具调用上下文

### 摘要生成

该服务实现智能的结构化摘要：

**摘要流程**

```
ToolProgressBus
AIService (SUMMARY)
MultiServiceManager
ConversationService
EnhancedAIService
ToolProgressBus
AIService (SUMMARY)
MultiServiceManager
ConversationService
EnhancedAIService
loop
[Stream summary generation]
generateSummary(messages, previousSummary)
Build summary system prompt
(FunctionalPrompts.buildSummarySystemPrompt)
getServiceForFunction(SUMMARY)
summaryService
getModelParametersForFunction(SUMMARY)
modelParameters
update(0.05f, "Preparing...")
sendMessage(summaryPrompt, history)
content chunk
Detect markers and update progress
update(progress, stage message)
Remove thinking content
update(1.0f, "Completed")
summaryContent
```

### 摘要格式

摘要遵循 `FunctionalPrompts` 中定义的严格格式：

```
==========Conversation Summary==========

【Core Task Status】
[Current step, completed actions, ongoing work, next step]

【Interaction & Scenario】
[Fictional setup, recent interactions, non-technical content]

【Conversation Progress & Overview】
[3+ paragraphs describing evolution with action+intent+result]

【Key Information & Context】
- [Info point 1: requirements, constraints, background]
- [Info point 2: technical elements and their meaning]
- [Info point 3+: exploration paths, decisions, factors]

============================

```

### 进度跟踪

摘要生成通过 `ToolProgressBus` 报告进度：
阶段进度触发器准备5%开始写入标题20%检测标记核心任务40%检测章节标题交互55%检测章节标题进展70%检测章节标题关键信息85%检测章节标题完成95%检测分隔符已完成100%流完成

---

## 文件绑定服务

`FileBindingService` 使用模糊匹配和结构化编辑块处理智能文件补丁操作。

### 结构化编辑格式

该服务处理 AI 生成代码中的编辑块：

**编辑块格式**

```
[START-REPLACE]
<old content to find>
---
<new content to replace with>
[END-REPLACE]

[START-DELETE]
<content to delete>
[END-DELETE]

```

### 模糊匹配算法

该服务使用复杂的模糊匹配来定位代码片段：

**匹配过程**

```
Scoring Factors

Search Phase

Preprocessing

Edit Operation
(old content)

Normalize whitespace
(collapse to single space)

Tokenize lines

Sliding window scan
(various sizes)

LCS-based similarity
(dynamic programming)

Score calculation
(weighted factors)

Size difference penalty

Length difference penalty

LCS similarity score

Boundary alignment bonus

Best match position
(start line, end line)
```

### 并行匹配优化

对于大文件，该服务使用并行处理：
文件大小策略并发< 2000 行顺序单线程≥ 2000 行并行最多 CPU 核心数

### 差异生成

应用补丁后，服务会生成统一差异：

```
Changes: +12 -8 lines
@@ -45,6 +45,8 @@
 context line
-45  |old line to remove
+47  |new line to add
+48  |another new line
 context line

```

---

## 模型配置系统

模型配置系统提供灵活的、按功能划分的 AI 模型管理。

### 配置架构

**配置层级结构**

```
Data Models

Storage Layer

Management Layer

User Interface

deserializes t

list view

maps

keys

ModelConfigScreen
(Edit configs)

FunctionalConfigScreen
(Assign functions)

ModelConfigManager
(CRUD operations)

FunctionalConfigManager
(Function mappings)

DataStore Preferences
(model_configs)

Config JSON
(per config ID)

Mapping JSON
(function→configId)

ModelConfigData
(Full config)

ModelConfigSummary
(List view)

FunctionType
(Enum)

FunctionConfigMapping
(configId + modelIndex)
```

### ModelConfigData 架构

配置数据结构支持广泛的自定义：
类别字段用途**身份标识**`id`, `name`配置标识**API 设置**`apiKey`, `apiEndpoint`, `modelName`, `apiProviderType`提供商连接详情**多密钥**`useMultipleApiKeys`, `apiKeyPool`, `currentKeyIndex`, `keyRotationMode`API 密钥轮换**参数**`maxTokens`, `temperature`, `topP`, `topK`, penalties模型生成参数**参数状态**`maxTokensEnabled`, `temperatureEnabled` 等要发送哪些参数**自定义参数**`hasCustomParameters`, `customParameters` (JSON)提供商特定参数**上下文**`contextLength`, `summaryTokenThreshold`, `enableSummary`对话管理**MNN/Llama**`mnnForwardType`, `mnnThreadCount`, `llamaContextSize`本地模型设置**多模态**`enableDirectImageProcessing`, `enableDirectAudioProcessing`视觉/音频支持**工具调用**`enableToolCall`, `strictToolCall`原生函数调用**Gemini**`enableGoogleSearch`搜索增强**速率限制**`requestLimitPerMinute`, `maxConcurrentRequests`请求节流

### 功能到配置的映射

每个功能类型映射到特定的配置和模型索引：

```
// FunctionalConfigManager stores:
Map<FunctionType, FunctionConfigMapping>
 
// FunctionConfigMapping contains:
data class FunctionConfigMapping(
    val configId: String,      // Which config to use
    val modelIndex: Int = 0    // Which model from comma-separated list
)
```

这允许从同一配置中使用不同的模型(例如 "gpt-4,gpt-4-turbo")用于不同的功能。

### 模型参数

`ModelParameter<T>` 提供类型安全的参数处理：

**参数结构**

```
ModelParameter<T>

+String id

+String name

+String apiName

+String description

+T defaultValue

+T currentValue

+Boolean isEnabled

+ParameterValueType valueType

+Any? minValue

+Any? maxValue

+ParameterCategory category

+Boolean isCustom

«enumeration»

ParameterValueType

INT

FLOAT

STRING

BOOLEAN

OBJECT

«enumeration»

ParameterCategory

GENERATION

CREATIVITY

REPETITION

OTHER
```

### 自定义参数

用户可以通过 JSON 定义任意参数：

```
[
  {
    "id": "uuid",
    "name": "Custom Param",
    "apiName": "custom_param",
    "defaultValue": "value",
    "currentValue": "value",
    "isEnabled": true,
    "valueType": "STRING",
    "category": "OTHER"
  }
]
```

这些参数会被序列化并存储在 `ModelConfigData.customParameters` 中。

---

## Token 管理与统计

核心 AI 服务层跟踪所有 AI 操作的 token 使用情况，以便进行计费感知和优化。

### Token 跟踪流程

**Token 计数器更新**

```
ApiPreferences
EnhancedAIService
AIService
ApiPreferences
EnhancedAIService
AIService
Process AI request
Stream completes
Persist to DataStore
Extract usage from response
(input, cached, output tokens)
onTokensUpdated(input, cached, output)
Update _perRequestTokenCounts
Get inputTokenCount, outputTokenCount
Return cumulative counts
Accumulate to session totals
updateTokensForProviderModel(providerModel, input, output, cached)
incrementRequestCountForProviderModel(providerModel)
```

### 按提供商统计

ApiPreferences 为每个 `providerModel`(例如 "OPENAI:gpt-4")维护独立的统计信息：
统计类型持久化`totalInputTokens`LongDataStore`totalOutputTokens`LongDataStore`totalCachedTokens`LongDataStore`totalRequests`IntDataStore

### Token 计数器重置

Token 计数器可以按函数或全局重置：

```
// Reset specific function
EnhancedAIService.resetTokenCountersForFunction(context, FunctionType.CHAT)
 
// Reset all functions
EnhancedAIService.resetTokenCountersForFunction(context, null)
```

---

## 错误处理和重试逻辑

核心 AI 服务层为网络问题和 API 失败实现了健壮的错误处理。

### 非致命错误传播

非致命错误(速率限制、临时故障)通过回调报告：

```
sendMessage(
    ...,
    onNonFatalError = { error ->
        // Display warning to user but continue
    }
)
```

这些错误不会停止对话，但会通知用户存在问题。

### 流取消

该服务正确处理用户发起的取消操作：

1. **检测**：捕获 `CancellationException` 和 "Socket closed" 消息
2. **清理**：如果不是子任务则停止后台服务
3. **状态重置**：将控制权返回到空闲状态
4. **不报告错误**：用户取消不被视为错误

### 多 API 密钥故障转移

使用多个 API 密钥时，系统在失败时自动轮换：

1. **请求失败**：密钥遇到速率限制或错误
2. **轮换**：`MultiApiKeyProvider` 前进到下一个密钥
3. **索引持久化**：`ModelConfigManager.updateConfigKeyIndex()` 保存位置
4. **重试**：使用新密钥尝试相同请求

---

## 集成点

核心 AI 服务层与多个其他系统集成：
系统集成点用途**聊天系统**`ChatServiceCore` 调用 `EnhancedAIService.sendMessage()`处理用户消息**工具系统**`AIToolHandler` 执行从检测到的 `<tool>` 标签中提取的工具工具调用**包系统**`PackageManager` 向系统提示词提供可用包可扩展性**UI 系统**`StateFlow` 更新驱动 UI 渲染响应式更新**数据库**`ChatHistoryManager` 在 AI 响应后持久化消息历史记录存储**偏好设置**`ApiPreferences` 提供设置并持久化令牌统计配置**终端**`FileSystemProvider` 被文件工具访问跨环境文件

---

这一全面的架构使 Operit 能够提供复杂的 AI 能力，具备广泛的自定义选项、强大的错误处理以及跨应用程序的无缝集成。
