# 委托模式架构

## 目的与范围

本页面解释了 Operit 聊天系统中使用的委托模式架构，以实现关注点分离。该模式将聊天功能划分为专门的委托类,每个类负责特定的领域。此架构在 `ChatViewModel`(用于主界面)和 `ChatServiceCore`(用于悬浮窗服务)之间共享,实现了跨不同上下文的代码复用。

有关使用这些委托的 UI 组件的信息,请参阅 [Chat UI Architecture](/AAswordman/Operit/3.1-chat-ui-architecture)。有关消息处理流程的详细信息,请参阅 [Message Processing](/AAswordman/Operit/3.3-message-processing)。有关聊天持久化的具体信息,请参阅 [Chat History Management](/AAswordman/Operit/3.4-chat-history-management)。

## 架构概览

委托模式将单体聊天功能分离为七个核心委托，每个委托处理不同的职责。`ChatViewModel` 和 `ChatServiceCore` 都实例化并协调这些委托，在主应用和浮动窗口中提供一致的聊天体验。

```
External Dependencies

Delegate Layer

Consumer Layer

ChatViewModel
(Main UI)

ChatServiceCore
(Floating Window)

MessageCoordinationDelegate
Message Flow Orchestration

MessageProcessingDelegate
Streaming & Tool Execution

ChatHistoryDelegate
Persistence & CRUD

ApiConfigDelegate
Configuration Management

TokenStatisticsDelegate
Token Tracking

AttachmentDelegate
File Attachments

UiStateDelegate
UI State Management

EnhancedAIService

ChatHistoryManager

AIToolHandler

ModelConfigManager
```

## 核心委托

### MessageCoordinationDelegate

协调消息发送流程、实现自动摘要并管理令牌限制检查的编排委托。

**主要职责：**

- 协调用户输入和 AI 响应之间的消息发送
- 在接近令牌限制时实现自动摘要逻辑
- 管理继续和自动继续流程
- 将特定任务委托给其他专门的委托
- 处理令牌使用阈值管理

**核心状态：**

```
- isSummarizing: StateFlow<Boolean>
- summarizingChatId: StateFlow<String?>
- isSendTriggeredSummarizing: StateFlow<Boolean>

```

**关键方法：**

- `sendUserMessage()` - 发送消息的主入口点
- `handleTokenLimitExceeded()` - 触发自动摘要
- `launchAsyncSummaryForSend()` - 发送期间的异步摘要

### MessageProcessingDelegate

处理流式 AI 响应、工具执行以及基于每个聊天的消息状态管理。

**主要职责：**

- 管理来自 AI 提供商的流式响应
- 在消息生成期间处理工具调用
- 维护每个聊天的加载和处理状态
- 处理消息取消
- 在流式传输期间协调实时滚动事件
- 管理输入处理状态(空闲、处理中、执行工具等)

**核心状态：**

```
- userMessage: StateFlow<TextFieldValue>
- isLoading: StateFlow<Boolean>
- activeStreamingChatIds: StateFlow<Set<String>>
- inputProcessingStateByChatId: StateFlow<Map<String, InputProcessingState>>
- scrollToBottomEvent: SharedFlow<Unit>

```

**关键内部结构：**

- `ChatRuntime` - 每个聊天的运行时状态，包括响应流和作业
- `chatRuntimes: ConcurrentHashMap<String, ChatRuntime>` - 跟踪多个并发聊天

### ChatHistoryDelegate

管理聊天持久化、CRUD 操作以及与角色卡的同步。

**主要职责：**

- 加载和保存聊天消息到数据库
- 创建、切换和删除聊天
- 管理聊天顺序和分组
- 当角色卡变更时同步开场白
- 处理智能消息重载以最小化 UI 重组
- 管理聊天元数据(标题、令牌、时间戳)

**核心状态：**

```
- chatHistory: StateFlow<List<ChatMessage>>
- chatHistories: StateFlow<List<ChatHistory>>
- currentChatId: StateFlow<String?>
- showChatHistorySelector: StateFlow<Boolean>

```

**关键方法：**

- `createNewChat()` - 创建新聊天，可选绑定角色卡
- `switchChat()` - 切换活动聊天并加载消息
- `addMessageToChat()` - 向特定聊天添加消息(带互斥锁)
- `reloadChatMessagesSmart()` - 高效重载消息并保留实例
- `syncOpeningStatementIfNoUserMessage()` - 将 AI 开场白与角色卡同步

### ApiConfigDelegate

管理 API 配置、模型选择和功能开关。

**主要职责：**

- 管理 API 密钥、端点和模型名称
- 处理提供商类型切换(OpenAI、Claude、Gemini、本地模型)
- 控制功能开关(思考模式、记忆查询、工具等)
- 管理上下文长度和令牌阈值
- 初始化和更新 `EnhancedAIService` 实例

**核心状态(通过 StateFlow 暴露)：**

```
- apiKey, apiEndpoint, modelName, apiProviderType
- isConfigured, isInitialized
- enableThinkingMode, enableThinkingGuidance, thinkingQualityLevel
- enableMemoryQuery, enableTools, enableAiPlanning
- enableSummary, summaryTokenThreshold
- contextLength, maxContextLengthSetting, enableMaxContextMode
- enableAutoRead, keepScreenOn
- disableStreamOutput, disableUserPreferenceDescription, disableLatexDescription

```

### TokenStatisticsDelegate

跟踪跨聊天的 token 使用情况，并为 UI 显示和摘要逻辑提供统计数据。

**核心职责：**

- 跟踪每个聊天的累计输入/输出 token
- 监控当前窗口大小(已使用的上下文长度)
- 提供每个请求的 token 计数
- 在每次 AI 回合后更新统计信息
- 支持摘要的 token 限制计算

**核心状态：**

```
- currentWindowSizeFlow: StateFlow<Int>
- cumulativeInputTokensFlow: StateFlow<Int>
- cumulativeOutputTokensFlow: StateFlow<Int>
- perRequestTokenCountFlow: StateFlow<Pair<Int, Int>?>

```

**核心方法：**

- `setActiveChatId()` - 切换活动聊天以进行跟踪
- `updateCumulativeStatistics()` - 在 AI 响应后更新
- `getCumulativeTokenCounts()` - 检索总 token 使用量

### AttachmentDelegate

管理文件附件，包括图片、音频、文档和上下文信息。

**核心职责：**

- 添加和移除附件
- 处理不同的附件类型(文件、图片、音频、屏幕内容、通知、位置)
- 生成附件预览
- 管理附件内容加载
- 向 UI 提供附件状态

**核心状态：**

```
- attachments: StateFlow<List<AttachmentInfo>>

```

**核心方法：**

- `addAttachment()` - 添加单个附件
- `addAttachments()` - 添加多个附件
- `removeAttachment()` - 按索引移除
- `clearAttachments()` - 清除所有附件

### UiStateDelegate

管理瞬态 UI 状态，包括错误、提示和权限级别。

**核心职责：**

- 显示错误对话框
- 显示 toast 通知
- 管理弹窗消息
- 跟踪主权限级别(用于工具执行)
- 提供 UI 反馈机制

**核心状态：**

```
- errorMessage: StateFlow<String?>
- popupMessage: StateFlow<String?>
- toastEvent: StateFlow<String?>
- masterPermissionLevel: StateFlow<PermissionLevel>

```

**关键方法：**

- `showErrorMessage()` - 显示错误对话框
- `showToast()` - 显示临时 toast
- `dismissErrorDialog()` - 清除错误状态

## 初始化流程

委托必须按特定顺序初始化以避免循环依赖。初始化模式对具有循环引用的委托使用 `lateinit`，对独立委托使用直接实例化。

### 初始化顺序图

```
Start Initialization

1. UiStateDelegate
(no dependencies)
2. ApiConfigDelegate
(depends on: none)
3. TokenStatisticsDelegate
(depends on: EnhancedAIService)
4. AttachmentDelegate
(depends on: AIToolHandler)
5. ChatHistoryDelegate
(depends on: TokenStats, ApiConfig)
6. MessageProcessingDelegate
(depends on: ChatHistory, TokenStats)
7. MessageCoordinationDelegate
(depends on: all above)

Initialization Complete

ApiConfigDelegate.onConfigChanged
triggers EnhancedAIService update

TokenStatsDelegate.setupCollectors()
called after service ready
```

### 初始化代码模式

初始化在 `ChatViewModel` 和 `ChatServiceCore` 中遵循一致的模式：

```
// Step 1: Independent delegates
val uiStateDelegate = UiStateDelegate()
 
// Step 2: ApiConfigDelegate with callback
apiConfigDelegate = ApiConfigDelegate(
    context = context,
    coroutineScope = viewModelScope,
    onConfigChanged = { service ->
        enhancedAiService = service
        tokenStatsDelegate.setupCollectors()
    }
)
 
// Step 3: TokenStatisticsDelegate (needs service reference)
tokenStatsDelegate = TokenStatisticsDelegate(
    coroutineScope = viewModelScope,
    getEnhancedAiService = { enhancedAiService }
)
 
// Step 4: AttachmentDelegate
attachmentDelegate = AttachmentDelegate(context, toolHandler)
 
// Step 5: ChatHistoryDelegate (needs callbacks from other delegates)
chatHistoryDelegate = ChatHistoryDelegate(
    context = context,
    coroutineScope = viewModelScope,
    onTokenStatisticsLoaded = { chatId, input, output, window ->
        tokenStatsDelegate.setActiveChatId(chatId)
        tokenStatsDelegate.setTokenCounts(chatId, input, output, window)
    },
    getEnhancedAiService = { enhancedAiService },
    getChatStatistics = {
        val (input, output) = tokenStatsDelegate.getCumulativeTokenCounts()
        val window = tokenStatsDelegate.getLastCurrentWindowSize()
        Triple(input, output, window)
    },
    onScrollToBottom = { messageProcessingDelegate.scrollToBottom() }
)
 
// Step 6: MessageProcessingDelegate
messageProcessingDelegate = MessageProcessingDelegate(
    context = context,
    coroutineScope = viewModelScope,
    getEnhancedAiService = { enhancedAiService },
    getChatHistory = { chatId -> chatHistoryDelegate.getChatHistory(chatId) },
    addMessageToChat = { chatId, message ->
        chatHistoryDelegate.addMessageToChat(message, chatId)
    },
    saveCurrentChat = {
        val (input, output) = tokenStatsDelegate.getCumulativeTokenCounts()
        val window = tokenStatsDelegate.getLastCurrentWindowSize()
        chatHistoryDelegate.saveCurrentChat(input, output, window)
    },
    onTurnComplete = { chatId, service ->
        tokenStatsDelegate.updateCumulativeStatistics(chatId, service)
        // ... save chat ...
    }
    // ... other callbacks ...
)
 
// Step 7: MessageCoordinationDelegate (orchestrates all others)
messageCoordinationDelegate = MessageCoordinationDelegate(
    context = context,
    coroutineScope = viewModelScope,
    chatHistoryDelegate = chatHistoryDelegate,
    messageProcessingDelegate = messageProcessingDelegate,
    tokenStatsDelegate = tokenStatsDelegate,
    apiConfigDelegate = apiConfigDelegate,
    attachmentDelegate = attachmentDelegate,
    uiStateDelegate = uiStateDelegate,
    getEnhancedAiService = { enhancedAiService }
    // ... callbacks for UI-specific operations ...
)
```

## 委托流程：消息发送

以下图表展示了用户发送消息时委托之间的交互：

```
"AttachmentDelegate"
"EnhancedAIService"
"MessageProcessingDelegate"
"TokenStatisticsDelegate"
"ChatHistoryDelegate"
"MessageCoordinationDelegate"
"UI Layer"
"AttachmentDelegate"
"EnhancedAIService"
"MessageProcessingDelegate"
"TokenStatisticsDelegate"
"ChatHistoryDelegate"
"MessageCoordinationDelegate"
"UI Layer"
alt
[No active chat]
Async summarization
doesn't block send
alt
[Token limit approaching]
loop
[Streaming]
sendUserMessage()
Check currentChatId
createNewChat()
New chatId
Get chat history
List<ChatMessage>
Get current tokens
currentWindowSize
launchAsyncSummaryForSend()
Get attachments
List<AttachmentInfo>
sendUserMessage(...)
Add user message
streamResponse()
Text chunk
Emit scrollToBottom event
Update via StateFlow
Update statistics
Save chat
onTurnComplete()
clearAttachments()
```

## StateFlow 暴露模式

委托通过 `StateFlow` 属性暴露其状态，允许 UI 层响应式地观察变化。该模式遵循以下约定：

### 内部可变状态

```
private val _chatHistory = MutableStateFlow<List<ChatMessage>>(emptyList())
```

### 公共不可变状态

```
val chatHistory: StateFlow<List<ChatMessage>> = _chatHistory.asStateFlow()
```

### 循环依赖的延迟初始化

```
val chatHistory: StateFlow<List<ChatMessage>> by lazy {
    chatHistoryDelegate.chatHistory
}
```

此模式在所有委托中一致使用，创建了从委托到 UI 消费者的单向数据流。

## 多聊天支持

`MessageProcessingDelegate` 实现了每个聊天的状态隔离，允许多个聊天并发处理消息(对于通过工具进行后台聊天操作很重要)。

### 每个聊天的状态管理

概念实现**运行时存储**`ConcurrentHashMap<String, ChatRuntime>` 将 `chatId` 映射到运行时状态**聊天键**使用 `chatKey(chatId)` 规范化聊天 ID(null 变为 `"__DEFAULT_CHAT__"`)**加载状态**每个聊天在 `ChatRuntime` 中有 `isLoading: MutableStateFlow<Boolean>`**活跃流式传输**`activeStreamingChatIds: StateFlow<Set<String>>` 跟踪所有流式传输的聊天**处理状态**`inputProcessingStateByChatId: Map<String, InputProcessingState>`**流管理**每个聊天有自己的 `responseStream: SharedStream<String>?`

### ChatRuntime 结构

```
private data class ChatRuntime(
    var responseStream: SharedStream<String>? = null,
    var streamCollectionJob: Job? = null,
    var stateCollectionJob: Job? = null,
    val isLoading: MutableStateFlow<Boolean> = MutableStateFlow(false)
)
```

## Token 管理集成

`MessageCoordinationDelegate` 与 `TokenStatisticsDelegate` 集成以实现自动摘要：

```
Yes

No

Async

User sends message

Check shouldGenerateSummary()

Token limit
approaching?

Launch async summary
(doesn't block)

Increase token threshold
for this request (+0.5)

Proceed with message send

Background: Generate
summary, insert into history

Message sent
```

摘要检查使用 `AIMessageManager.shouldGenerateSummary()`，参数包括：

- 聊天中的当前消息
- 当前 token 计数
- 最大 tokens(上下文长度)
- Token 使用阈值(默认来自配置，触发摘要后增加 0.5)
- 摘要启用标志
- 消息计数阈值(备选触发条件)

## 委托架构的优势

### 1. 关注点分离

每个委托处理单一职责领域，使代码更易于理解和维护。token 跟踪的更改不会影响消息处理逻辑。

### 2. 代码复用

相同的委托在 `ChatViewModel`(主界面)和 `ChatServiceCore`(悬浮窗服务)中使用，避免复杂逻辑的重复。

### 3. 可测试性

委托可以通过模拟依赖项进行隔离测试。通过构造函数参数进行的清晰依赖注入使单元测试变得简单。

### 4. 并发操作

`MessageProcessingDelegate` 中的每个聊天状态隔离允许像 `StandardChatManagerTool` 这样的工具向后台聊天发送消息，而不影响 UI 的活跃聊天。

### 5. 生命周期独立性

`ChatServiceCore` 使用 Service 作用域协程的委托，而 `ChatViewModel` 使用 ViewModel 作用域协程。委托适配不同的生命周期上下文。

### 6. 状态组合

UI 层从多个委托组合状态，创建派生状态如：

```
val currentChatIsLoading: StateFlow<Boolean> = combine(
    chatHistoryDelegate.currentChatId,
    messageProcessingDelegate.activeStreamingChatIds
) { currentId, activeIds ->
    currentId != null && activeIds.contains(currentId)
}
```

## 实现文件位置

委托文件路径`MessageCoordinationDelegate``MessageProcessingDelegate``ChatHistoryDelegate``ApiConfigDelegate``TokenStatisticsDelegate``AttachmentDelegate``UiStateDelegate`**使用者**`ChatViewModel``ChatServiceCore`
