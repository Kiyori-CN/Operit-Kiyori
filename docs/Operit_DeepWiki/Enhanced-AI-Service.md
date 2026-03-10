# 增强型 AI 服务

## 目的与范围

增强型 AI 服务是 Operit 中管理所有 AI 交互的核心编排层。它为与各种 AI 提供商(OpenAI、Claude、Gemini、本地模型)通信提供统一接口，处理会话管理、工具执行、令牌跟踪和动态系统提示生成。该服务充当 UI 层与底层 AI 提供商之间的桥梁，抽象掉提供商特定的细节，同时提供高级功能，如特定功能的模型选择、自动摘要和文件绑定操作。

有关各个 AI 提供商实现的信息，请参阅 [AI Service Providers](/AAswordman/Operit/2.2-ai-service-providers)。有关模型配置详情，请参阅 [Model Configuration](/AAswordman/Operit/2.3-model-configuration)。有关工具执行细节，请参阅 [Tool Architecture](/AAswordman/Operit/5.1-tool-architecture)。

---

## 架构概览

`EnhancedAIService` 实现为单例(可选的每个聊天实例)，协调多个子系统以提供全面的 AI 能力。

### 高层组件结构

```
Data Management

Supporting Services

Core Components

Entry Points

EnhancedAIService.getInstance()

EnhancedAIService.getChatInstance(chatId)

EnhancedAIService

MultiServiceManager

ConversationService

FileBindingService

ToolExecutionManager

SystemPromptConfig

AIServiceFactory

PackageManager

AIToolHandler

ApiPreferences

Token Statistics

InputProcessingState Flow

Per-Request Token Counts
```

---

## 核心类：EnhancedAIService

`EnhancedAIService` 类是位于 的主要编排器

### 实例管理

该服务支持两种实例化模式：
模式方法使用场景全局单例`getInstance(context)`在应用中共享，用于实用功能每个聊天实例`getChatInstance(context, chatId)`每个会话的隔离状态
两种模式共享相同的底层实现，但维护独立的对话上下文。可以通过 `releaseChatInstance(chatId)` 释放聊天实例以释放资源。

### 关键属性

```
// Multi-service manager for different function types
private val multiServiceManager = MultiServiceManager(context)
 
// Conversation and file services
private val conversationService = ConversationService(context, customEmojiRepository)
private val fileBindingService = FileBindingService(context)
 
// Tool execution
private val toolHandler = AIToolHandler.getInstance(context)
private val packageManager = PackageManager.getInstance(context, toolHandler)
 
// State management
private val _inputProcessingState = MutableStateFlow<InputProcessingState>(InputProcessingState.Idle)
private val _perRequestTokenCounts = MutableStateFlow<Pair<Int, Int>?>(null)
```

---

## 消息流架构

### 完整消息处理流水线

```
Finalization

Tool Detection & Execution

Post-Stream Processing

Stream Processing

sendMessage() Orchestration

Threshold exceeded

Complete

User Message Input

InputProcessor.processUserInput()

prepareConversationHistory()

multiServiceManager.getServiceForFunction()

getAvailableToolsForFunction()

aiService.sendMessage() → Stream

First Chunk: Update State to Receiving

Collect and Emit Chunks

roundManager.updateContent()

emit() to UI

Add messages to conversationHistory

Update accumulated token counts

processStreamCompletion()

enhanceToolDetection()

parseToolInvocations()

executeToolsInParallel()

formatToolResults()

Recursive sendMessage() with tool results

Check token threshold

conversationService.generateSummary()

stopAiService()
```

### 消息执行上下文

每次 `sendMessage()` 调用都会创建一个 `MessageExecutionContext` 来维护每个请求的状态：

```
private data class MessageExecutionContext(
    val streamBuffer: StringBuilder = StringBuilder(),
    val roundManager: ConversationRoundManager = ConversationRoundManager(),
    val isConversationActive: AtomicBoolean = AtomicBoolean(true),
    val conversationHistory: MutableList<Pair<String, String>>,
)
```

这种设计使得不同聊天之间可以并发处理消息而不会产生状态冲突。

---

## MultiServiceManager：基于功能的模型选择

`MultiServiceManager` 支持针对不同功能用途(聊天、摘要、翻译等)使用不同的 AI 模型。

### 功能类型

```
enum class FunctionType {
    CHAT,           // Primary conversation
    SUMMARY,        // Conversation summarization
    TRANSLATION,    // Language translation
    UI_CONTROLLER,  // UI automation decisions
    GREP,           // Code search intelligence
    VISION,         // Image analysis
    AUDIO,          // Audio transcription
    VIDEO           // Video analysis
}
```

### 服务解析流程

```
Function Request
(e.g., FunctionType.SUMMARY)

MultiServiceManager

getConfigMappingForFunction()

ConfigId from
FunctionalConfigManager

getModelParametersForConfig()

ModelConfigData
(provider, model, params)

AIServiceFactory

AIService Instance
(cached)
```

管理器维护一个以功能类型为键的 `AIService` 实例缓存，并在配置更改时自动刷新它们。

**关键方法：**
方法用途`getServiceForFunction(functionType)`返回函数对应的 `AIService``refreshServiceForFunction(functionType)`使服务实例失效并重新创建`refreshAllServices()`重建所有缓存的服务`getModelParametersForFunction(functionType)`检索函数的模型参数

---

## ConversationService：历史记录准备

`ConversationService` 处理复杂的对话历史管理和系统提示词生成。

### 主要职责

```
XML Processing

System Prompt Components

Core Functions

ConversationService

prepareConversationHistory()

generateSummary()

buildPreferencesText()

processChatMessageWithTools()

SystemPromptConfig.getSystemPromptWithCustomPrompts()

CharacterCardManager.combinePrompts()

buildWaifuRulesText()

buildDesktopPetMoodRulesText()

replacePromptPlaceholders()

splitXmlTag()

flattenUiInfo()
```

### 对话历史准备流程

`prepareConversationHistory()` 方法构建发送给 AI 提供商的最终消息列表：

1. **系统提示词构建**

- 从 `SystemPromptConfig` 检索基础系统提示词
- 如果绑定了角色卡，应用角色卡提示词
- 添加工作区指南(如果设置了工作区)
- 注入 waifu 模式规则(如果启用)
- 添加桌面宠物情绪协议(如果处于桌面宠物模式)
- 附加用户偏好描述

2. **消息处理**

- 遍历聊天历史
- 对于助手消息，检测并重构 XML 工具结果
- 合并来自同一角色的连续消息
- 将工具结果转换为单独的用户消息

3. **XML 标签重构**

- 使用 `splitXmlTag()` 配合原生 XML 分割器以提升性能
- 分类标签：`<think>`、`<tool_result>`、`<status>`、纯文本
- 确保对话在用户/助手角色之间交替

### 摘要生成

当超过令牌阈值时，服务会生成结构化的对话摘要：

```
suspend fun generateSummary(
    messages: List<Pair<String, String>>,
    previousSummary: String?,
    multiServiceManager: MultiServiceManager
): String
```

摘要使用专用的 AI 模型(通常配置为 `SUMMARY` 功能类型)并遵循 `FunctionalPrompts` 中定义的严格格式。进度通过 `ToolProgressBus` 报告，包含多个阶段：
阶段进度描述Preparing5%初始设置Writing Title20%生成摘要标题Core Task40%分析主要目标Interaction55%处理用户交互Progress70%记录任务演变Key Info85%提取关键细节Finishing95%完成摘要

---

## SystemPromptConfig：动态提示词生成

`SystemPromptConfig` 负责生成上下文感知的系统提示词，能够适应可用的工具、包和用户设置。

### 提示词模板结构

```
Dynamic Content

Replacement Sections

SYSTEM_PROMPT_TEMPLATE

BEGIN_SELF_INTRODUCTION_SECTION

THINKING_GUIDANCE_SECTION

BEHAVIOR_GUIDELINES

WEB_WORKSPACE_GUIDELINES_SECTION

TOOL_USAGE_GUIDELINES_SECTION

PACKAGE_SYSTEM_GUIDELINES_SECTION

ACTIVE_PACKAGES_SECTION

AVAILABLE_TOOLS_SECTION

Character Card Prompts

Thinking Guidance

Workspace Path + Env

Imported Packages + MCP Servers

Tool Prompt Descriptions
```

### getSystemPrompt() 方法签名

```
fun getSystemPrompt(
    packageManager: PackageManager,
    workspacePath: String? = null,
    workspaceEnv: String? = null,
    safBookmarkNames: List<String> = emptyList(),
    useEnglish: Boolean = false,
    thinkingGuidance: Boolean = false,
    customSystemPromptTemplate: String = "",
    enableTools: Boolean = true,
    enableMemoryQuery: Boolean = true,
    hasImageRecognition: Boolean = false,
    chatModelHasDirectImage: Boolean = false,
    hasAudioRecognition: Boolean = false,
    hasVideoRecognition: Boolean = false,
    chatModelHasDirectAudio: Boolean = false,
    chatModelHasDirectVideo: Boolean = false,
    useToolCallApi: Boolean = false,
    strictToolCall: Boolean = false,
    disableLatexDescription: Boolean = false,
    toolVisibility: Map<String, Boolean> = emptyMap()
): String
```

该方法通过以下方式动态构建系统提示词：

1. **检测可用包**

- 查询 `PackageManager` 获取已导入的 JS 包
- 检索可用的 MCP 服务器
- 从 `SkillRepository` 列出技能包
- 构建格式化的可用包列表

2. **选择模板**

- 如果提供了自定义模板则使用自定义模板
- 回退到语言特定的内置模板(英文/中文)

3. **条件内容注入**

- 仅在设置了 `workspacePath` 时添加工作区指南
- 如果 `thinkingGuidance` 为 true，则包含思考指导
- 根据 `useToolCallApi` 调整工具描述(XML 格式 vs 函数调用格式)
- 根据可见性设置过滤工具提示

4. **多模态能力指示器**

- 根据 `chatModelHasDirectImage`、`hasImageRecognition` 调整描述
- 音频和视频能力采用类似逻辑
- 决定使用后端服务还是直接模型支持

### 工作区指南生成

`getWorkspaceGuidelines()` 方法在绑定工作区时提供上下文特定的指令：

```
private fun getWorkspaceGuidelines(
    workspacePath: String?,
    workspaceEnv: String?,
    useEnglish: Boolean
): String
```

如果配置了工作区，指南包括：

- 工作区路径和环境标签(例如 `android`、`linux`)
- 使用 `apply_file` 创建 Web 文件的说明
- 代码组织最佳实践(拆分文件、使用文件夹)
- 文件引用要求(使用相对路径)
- 环境特定说明(Linux 环境需传递 `environment` 参数)
- 用于路径转换的终端挂载信息
- 代码修改最佳实践(编辑前使用 `grep_code` 和 `grep_context`)

---

## FileBindingService：代码补丁系统

`FileBindingService` 使用模糊匹配和结构化编辑操作处理智能文件修改。

### 编辑操作格式

```
data class StructuredEditOperation(
    val action: StructuredEditAction,  // REPLACE or DELETE
    val oldContent: String,            // Content to find
    val newContent: String = ""        // Replacement (empty for DELETE)
)
```

### 补丁应用算法

```
Finalization

Application Phase

Scoring & Selection

Matching Phase

Parsing Phase

Unique match

Multiple matches

AI-generated code with
[START-REPLACE]/[START-DELETE] blocks

parseEditOperations()

Extract [OLD] content

Extract [NEW] content

Normalize line endings

Build N-grams from OLD block

Normalize original file
(remove whitespace)

Compute line start indices

Parallel sliding window search

Calculate N-gram similarity

Compute size difference

Compute length difference

Select best match
(highest score, smallest diff)

Check for multiple perfect matches

Sort operations by start line
(descending order)

Remove old lines

Inherit indentation from original

Insert new lines

Apply all operations bottom-up

generateUnifiedDiff()

Return (modifiedContent, diff)

Return error:
ambiguous replacement
```

### 模糊匹配策略

该服务使用 N-gram 相似度结合大小/长度差异来为每个编辑块找到最佳匹配位置：

**评分公式：**

```
isBetter = (score > bestScore) OR
           (score == bestScore AND (
               sizeDiff < bestSizeDiff OR
               (sizeDiff == bestSizeDiff AND (
                   lengthDiff < bestLengthDiff OR
                   (lengthDiff == bestLengthDiff AND line < bestLine)
               ))
           ))

```

**优化技术：**

- 预归一化：从旧内容和新内容中移除所有空白字符
- N-gram 索引：构建字符 n-gram(大小为 4)以实现快速相似度计算
- 并行处理：使用线程池并发搜索不同片段
- 提前终止：找到完美匹配(100% 相似度，0 差异)时停止
- 进度报告：通过回调以 200ms 间隔发出进度更新

### 公共接口

该服务暴露两个主要方法：

```
// Process AI-generated code with [START-REPLACE]/[START-DELETE] blocks
suspend fun processFileBinding(
    originalContent: String,
    aiGeneratedCode: String,
    onProgress: ((Float, String) -> Unit)? = null
): Pair<String, String>
 
// Process pre-parsed structured operations
suspend fun processFileBindingOperations(
    originalContent: String,
    operations: List<StructuredEditOperation>,
    onProgress: ((Float, String) -> Unit)? = null
): Pair<String, String>
```

两个方法都返回一对(修改后的内容，统一差异)。

---

## 工具执行管理

`EnhancedAIService` 与工具系统紧密集成以实现 AI 驱动的操作。

### 工具调用检测

```
Result Processing

Execution

Validation

Detection Pipeline

Accumulated stream buffer

enhanceToolDetection()

Stream XML Plugin

normalizeToolXml()

parseToolInvocations()

Validate XML format

Validate parameters

Create ToolInvocation objects

executeToolsInParallel()

AIToolHandler.executeTool()

Check for tool interrupts

formatToolResults()

Wrap in XML

Prepare next round message
```

### 增强的 XML 检测

`enhanceToolDetection()` 方法使用流式 XML 解析来改进工具调用识别：

1. 从内容创建字符流
2. 应用 `StreamXmlPlugin` 按 XML 标签拆分内容
3. 检测 `<tool>` 标签并规范化其格式
4. 返回带有标准化 XML 的增强内容

这种方法比纯正则表达式匹配更健壮，特别是对于格式错误或流式 XML。

### 并行工具执行

当单个响应中调用多个工具时，它们并行执行：

```
private suspend fun executeToolsInParallel(
    toolInvocations: List<ToolInvocation>,
    context: MessageExecutionContext,
    chatId: String?,
    onToolInvocation: (suspend (String) -> Unit)? = null
): List<ToolResult>
```

该方法：

- 为每个工具启动一个协程
- 通过 `AIToolHandler` 并发执行工具
- 收集所有结果
- 处理工具中断(用户取消)
- 通过 `onToolInvocation` 回调通知 UI

### 工具结果格式化

结果被格式化为 XML 用于下一轮 AI 处理：

```
<tool_result>
<result name="tool_name">
{formatted result based on result type}
</result>
</tool_result>
```

不同的结果类型有不同的格式化方式：

- `StringResultData`：直接文本输出
- `DirectoryListingData`：带元数据的格式化文件列表
- `FileContentData`：带行号的文件内容(如适用)
- 带嵌套数据的 `ToolResult`：递归格式化

---

## Token 管理与统计

该服务在多个层级提供全面的 token 跟踪。

### Token 计数器层级

```
Persistent Storage

Accumulated Counters

Per-Request Tracking

Per-Service Counters

AIService.inputTokenCount

AIService.cachedInputTokenCount

AIService.outputTokenCount

_perRequestTokenCounts

Updated on each API call

accumulatedInputTokenCount

accumulatedOutputTokenCount

Total for current conversation turn

apiPreferences.updateTokensForProviderModel()

apiPreferences.incrementRequestCountForProviderModel()
```

### Token 更新流程

每次流式响应完成后：

1. 从 `AIService` 实例读取 token 计数
2. 更新 `_perRequestTokenCounts` 流以供 UI 显示
3. 累积到轮次级别的计数器
4. 使用提供商/模型键持久化到 `ApiPreferences`
5. 递增提供商/模型的请求计数器

**代码示例：**

```
val inputTokens = serviceForFunction.inputTokenCount
val cachedInputTokens = serviceForFunction.cachedInputTokenCount
val outputTokens = serviceForFunction.outputTokenCount
 
accumulatedInputTokenCount += inputTokens
accumulatedOutputTokenCount += outputTokens
 
apiPreferences.updateTokensForProviderModel(
    serviceForFunction.providerModel,
    inputTokens,
    outputTokens,
    cachedInputTokens
)
 
apiPreferences.incrementRequestCountForProviderModel(
    serviceForFunction.providerModel
)
```

### 基于 Token 的摘要

当累积的 token 使用量超过配置的阈值时，会触发自动摘要：

```
val totalTokens = accumulatedInputTokenCount + accumulatedOutputTokenCount
val maxTokens = maxTokens // From function parameter
val threshold = tokenUsageThreshold // Typically 0.6-0.8
 
if (totalTokens > maxTokens * threshold) {
    // Trigger summarization
    val summary = conversationService.generateSummary(
        context.conversationHistory,
        previousSummary,
        multiServiceManager
    )
    // Prepend summary, clear old history
    // Continue conversation
}
```

阈值检查在工具执行完成后的 `processStreamCompletion()` 中进行。

---

## 静态工具方法

`EnhancedAIService` 伴生对象提供了用于常见操作的静态便捷方法：

### 服务和配置检索

```
// Get AI service for a specific function without creating an instance
suspend fun getAIServiceForFunction(
    context: Context,
    functionType: FunctionType
): AIService
 
// Get model configuration for a function
suspend fun getModelConfigForFunction(
    context: Context,
    functionType: FunctionType
): ModelConfigData
 
// Refresh services when configuration changes
suspend fun refreshServiceForFunction(
    context: Context,
    functionType: FunctionType
)
 
suspend fun refreshAllServices(context: Context)
```

### Token 管理工具

```
// Get current token counts for a function
suspend fun getCurrentInputTokenCountForFunction(
    context: Context,
    functionType: FunctionType
): Int
 
suspend fun getCurrentOutputTokenCountForFunction(
    context: Context,
    functionType: FunctionType
): Int
 
// Reset token counters
suspend fun resetTokenCountersForFunction(
    context: Context,
    functionType: FunctionType? = null
)
 
fun resetTokenCounters(context: Context)
```

### 文件绑定操作

```
// Apply file binding with AI-generated patches
suspend fun applyFileBinding(
    context: Context,
    originalContent: String,
    aiGeneratedCode: String,
    onProgress: ((Float, String) -> Unit)? = null
): Pair<String, String>
 
// Apply pre-parsed structured operations
suspend fun applyFileBindingOperations(
    context: Context,
    originalContent: String,
    operations: List<FileBindingService.StructuredEditOperation>,
    onProgress: ((Float, String) -> Unit)? = null
): Pair<String, String>
```

### 包描述生成

```
// Generate description for tool packages
suspend fun generatePackageDescription(
    context: Context,
    pluginName: String,
    toolDescriptions: List<String>
): String
```

这些静态方法允许其他组件在无需直接管理实例的情况下访问 `EnhancedAIService` 功能。

---

## 状态管理和 UI 集成

### 输入处理状态流

该服务暴露了一个用于 UI 状态更新的 `StateFlow`：

```
val inputProcessingState: StateFlow<InputProcessingState>
```

**状态转换：**
状态描述触发器`Idle`无活动处理初始状态或完成后`Processing(message)`正在处理用户输入调用 `processUserInput()``Connecting(message)`正在连接 AI 服务API 调用前`Receiving(message)`正在接收流式响应收到第一个数据块`Error(message)`发生错误捕获异常
UI 层可以收集此流以显示适当的加载指示器和消息。

### 每次请求的 Token 计数

用于实时 token 使用量显示：

```
val perRequestTokenCounts: StateFlow<Pair<Int, Int>?>
```

此流在请求期间每当 token 计数更新时发出 `(inputTokens, outputTokens)` 对。UI 可以使用此功能进行实时 token 消耗反馈。

---

## 与文件系统工具的集成

`EnhancedAIService` 被文件系统工具用于智能操作，如代码搜索和补丁应用。

### 示例：grep_context 集成

`StandardFileSystemTools` 使用 GREP 函数类型进行智能代码搜索：

```
protected suspend fun getGrepService(): AIService {
    return EnhancedAIService.getAIServiceForFunction(context, FunctionType.GREP)
}
 
protected suspend fun runGrepModel(prompt: String): String {
    val service = getGrepService()
    val modelParameters = getGrepModelParameters()
    val sb = StringBuilder()
    val stream = service.sendMessage(
        context = context,
        message = prompt,
        chatHistory = emptyList(),
        modelParameters = modelParameters,
        enableThinking = false,
        stream = false,
        availableTools = null
    )
    stream.collect { chunk -> sb.append(chunk) }
    return sb.toString().trim()
}
```

这使得 `grep_context` 可以使用专门的 AI 模型进行查询优化和结果过滤，独立于主聊天模型。

### 示例：apply_file 集成

`apply_file` 工具使用 `EnhancedAIService.applyFileBinding()`：

```
val (mergedContent, diffString) = EnhancedAIService.applyFileBinding(
    context = context,
    originalContent = originalContent,
    aiGeneratedCode = aiGeneratedCode,
    onProgress = { progress, message ->
        ToolProgressBus.update(tool.name, progress, message)
    }
)
```

这种静态方法访问模式允许工具利用 `FileBindingService`，而无需直接依赖实例管理。

---

## 总结

`EnhancedAIService` 作为 Operit 中所有 AI 交互的中央编排中心。其关键设计原则包括：

1. **提供商抽象**：跨 OpenAI、Claude、Gemini 和本地模型的统一接口
2. **基于函数的路由**：通过 `MultiServiceManager` 为不同目的使用不同模型
3. **有状态的对话管理**：每个聊天实例具有自动摘要功能
4. **智能工具集成**：并行执行与基于 XML 的结果格式化
5. **高级代码补丁**：`FileBindingService` 中的模糊匹配算法
6. **动态提示生成**：通过 `SystemPromptConfig` 实现上下文感知的系统提示
7. **全面的令牌跟踪**：具有持久化存储的多级计数器
8. **响应式状态管理**：基于 `StateFlow` 的 UI 集成

该服务在整个应用程序中被 UI 组件(聊天屏幕、悬浮窗口)和工具实现(文件操作、UI 自动化、代码搜索)广泛使用。
